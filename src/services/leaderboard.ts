import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { LeaderboardEntry } from '../types';
import { getMockDB } from './mockData';

export async function getLeaderboard(eventId: string): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured && isValidUuid(eventId)) {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        p_event_id: eventId,
      });

      if (!error && data && data.length > 0) {
        return (data as any[])
          .filter((row) => row.team_status !== 'ELIMINATED')
          .map((row) => ({
            team_id: row.team_id,
            team_name: row.team_name,
            team_status: row.team_status,
            cash_balance: Number(row.cash_balance),
            portfolio_value: Number(row.portfolio_value),
            total_wealth: Number(row.total_wealth),
            starting_wealth: Number(row.starting_wealth),
            today_pnl: Number(row.today_pnl),
            today_pnl_pct: Number(row.today_pnl_pct),
            rank: Number(row.rank),
          }));
      }
    } catch (err) {
      // Fallback to local database
    }
  }

  // Fallback Dynamic Calculation - Match all valid active teams (deduplicated)
  const db = getMockDB();
  const seenCodes = new Set<string>();
  const seenNames = new Set<string>();
  const uniqueTeams = [];

  for (const t of db.teams) {
    if (
      !eventId ||
      eventId === 'e1' ||
      t.event_id === eventId ||
      t.event_id === 'e1' ||
      t.event_id === 'e1111111-1111-1111-1111-111111111111'
    ) {
      const codeKey = (t.team_code || '').trim().toUpperCase();
      const nameKey = (t.name || '').trim().toLowerCase();
      if (!seenCodes.has(codeKey) && !seenNames.has(nameKey)) {
        if (codeKey) seenCodes.add(codeKey);
        if (nameKey) seenNames.add(nameKey);
        uniqueTeams.push(t);
      }
    }
  }

  const calculated = uniqueTeams.map((team) => {
    const teamHoldings = db.holdings.filter((h) => h.team_id === team.id);
    const portfolioVal = teamHoldings.reduce((sum, h) => {
      const stock = db.stocks.find((s) => s.id === h.stock_id && s.is_active);
      return sum + h.quantity * (stock?.current_price || 0);
    }, 0);

    const totalWealth = team.cash_balance + portfolioVal;
    const startWealth = team.starting_wealth || 100000000;
    const todayPnl = totalWealth - startWealth;
    const todayPnlPct = startWealth > 0 ? (todayPnl / startWealth) * 100 : 0;

    return {
      team_id: team.id,
      team_name: team.name,
      team_status: team.status,
      cash_balance: team.cash_balance,
      portfolio_value: portfolioVal,
      total_wealth: totalWealth,
      starting_wealth: startWealth,
      today_pnl: todayPnl,
      today_pnl_pct: todayPnlPct,
      rank: 1,
    };
  });

  // Sort DESC by total wealth
  calculated.sort((a, b) => b.total_wealth - a.total_wealth);

  // Assign ranks
  calculated.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return calculated;
}
