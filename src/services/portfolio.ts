import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { Holding, PortfolioSummary } from '../types';
import { getMockDB, saveMockDB } from './mockData';

// In-memory cache to prevent momentary network lag from flickering portfolio values
const portfolioSummaryCache = new Map<string, PortfolioSummary>();
const teamHoldingsCache = new Map<string, Holding[]>();

export async function getTeamHoldings(teamId: string): Promise<Holding[]> {
  if (isSupabaseConfigured && isValidUuid(teamId)) {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select(`
          *,
          stock:stocks(*)
        `)
        .eq('team_id', teamId)
        .gt('quantity', 0);

      if (!error && data) {
        const holdings = data as Holding[];
        teamHoldingsCache.set(teamId, holdings);
        return holdings;
      }
    } catch (err) {
      console.warn('Network error fetching holdings, using cached holdings:', err);
    }

    // Return cached holdings if available before falling back
    if (teamHoldingsCache.has(teamId)) {
      return teamHoldingsCache.get(teamId)!;
    }
  }

  const db = getMockDB();
  return db.holdings
    .filter((h) => h.team_id === teamId && h.quantity > 0)
    .map((h) => ({
      ...h,
      stock: db.stocks.find((s) => s.id === h.stock_id),
    }));
}

export async function getTeamPortfolioSummary(
  teamId: string,
  eventId: string
): Promise<PortfolioSummary> {
  let cashBalance = 0;
  let startingWealth = 100000000;
  let holdings: Holding[] = [];
  let foundRemote = false;

  if (isSupabaseConfigured && isValidUuid(teamId)) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('cash_balance, starting_wealth')
        .eq('id', teamId)
        .maybeSingle();

      if (!error && team) {
        cashBalance = Number(team.cash_balance ?? 100000000);
        startingWealth = Number(team.starting_wealth ?? 100000000);
        holdings = await getTeamHoldings(teamId);
        foundRemote = true;
      }
    } catch (err) {
      console.warn('Network error fetching portfolio summary:', err);
    }
  }

  if (!foundRemote) {
    // If we have a cached summary from a previous successful fetch for this team, return it!
    if (portfolioSummaryCache.has(teamId)) {
      return portfolioSummaryCache.get(teamId)!;
    }

    const db = getMockDB();
    let team = db.teams.find((t) => t.id === teamId || t.id.includes(teamId) || teamId.includes(t.id));

    if (!team) {
      const storedSession = localStorage.getItem('metis_participant_session_v1');
      let sessionTeam = null;
      if (storedSession) {
        try {
          sessionTeam = JSON.parse(storedSession)?.team;
        } catch {}
      }
      if (sessionTeam) {
        team = sessionTeam;
        if (!db.teams.some((t) => t.id === sessionTeam.id)) {
          db.teams.push(sessionTeam);
          saveMockDB(db);
        }
      }
    }

    if (team) {
      cashBalance = Number(team.cash_balance ?? 100000000);
      startingWealth = Number(team.starting_wealth ?? 100000000);
    } else {
      cashBalance = 100000000;
      startingWealth = 100000000;
    }
    holdings = await getTeamHoldings(teamId);
  }

  let totalInvested = 0;
  let currentValue = 0;
  let realizedPnl = 0;

  holdings.forEach((h) => {
    const currentPrice = h.stock?.current_price || h.average_cost;
    totalInvested += h.quantity * h.average_cost;
    currentValue += h.quantity * currentPrice;
    realizedPnl += Number(h.realized_pnl || 0);
  });

  const unrealizedPnl = currentValue - totalInvested;
  const unrealizedPnlPct = totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0;
  const totalPnl = unrealizedPnl + realizedPnl;
  const totalWealth = cashBalance + currentValue;
  const todayPnl = totalWealth - startingWealth;
  const todayPnlPct = startingWealth > 0 ? (todayPnl / startingWealth) * 100 : 0;

  const result: PortfolioSummary = {
    total_invested: totalInvested,
    current_value: currentValue,
    unrealized_pnl: unrealizedPnl,
    unrealized_pnl_pct: unrealizedPnlPct,
    realized_pnl: realizedPnl,
    total_pnl: totalPnl,
    total_wealth: totalWealth,
    cash_balance: cashBalance,
    today_pnl: todayPnl,
    today_pnl_pct: todayPnlPct,
  };

  // Cache the valid summary
  portfolioSummaryCache.set(teamId, result);

  return result;
}
