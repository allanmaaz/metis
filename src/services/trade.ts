import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Trade } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';

export async function buyStock(
  teamId: string,
  stockId: string,
  quantity: number,
  memberId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (quantity <= 0) {
    return { success: false, error: 'Quantity must be greater than zero.' };
  }

  // 1. Supabase RPC if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('execute_buy', {
        p_team_id: teamId,
        p_stock_id: stockId,
        p_quantity: quantity,
        p_member_id: memberId || null,
      });

      if (!error && data && data.success) {
        broadcastRealtimeEvent('TRADE_EXECUTED', { teamId, stockId, side: 'BUY', quantity });
        broadcastRealtimeEvent('PORTFOLIO_CHANGED', { teamId });
        broadcastRealtimeEvent('LEADERBOARD_UPDATED');
        return { success: true, data };
      }
    } catch (err: any) {
      console.warn('Supabase buyStock warning (falling back to mock):', err);
    }
  }

  // 2. Fallback Mock execution
  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);
  const stock = db.stocks.find((s) => s.id === stockId);
  const session = db.marketSessions
    .filter((s) => s.event_id === team?.event_id || team?.event_id === 'e1')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!team) return { success: false, error: 'Team not found.' };
  if (!stock || !stock.is_active) return { success: false, error: 'Stock is inactive.' };
  if (team.status === 'ELIMINATED') return { success: false, error: 'Team has been eliminated.' };
  if (team.status !== 'ACTIVE') return { success: false, error: 'Team trading is disabled.' };
  if (!session || session.status !== 'OPEN') return { success: false, error: `Market is currently ${session?.status || 'CLOSED'}.` };

  const totalCost = quantity * stock.current_price;
  if (team.cash_balance < totalCost) {
    return {
      success: false,
      error: `Insufficient cash balance. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${team.cash_balance.toLocaleString('en-IN')}`,
    };
  }

  // Deduct cash
  team.cash_balance -= totalCost;
  team.updated_at = new Date().toISOString();

  // Update or create holding
  const existingHolding = db.holdings.find((h) => h.team_id === teamId && h.stock_id === stockId);
  if (existingHolding) {
    const totalExistingCost = existingHolding.quantity * existingHolding.average_cost;
    existingHolding.quantity += quantity;
    existingHolding.average_cost = (totalExistingCost + totalCost) / existingHolding.quantity;
    existingHolding.updated_at = new Date().toISOString();
  } else {
    db.holdings.push({
      id: `h_${Date.now()}`,
      team_id: teamId,
      stock_id: stockId,
      quantity,
      average_cost: stock.current_price,
      realized_pnl: 0,
      updated_at: new Date().toISOString(),
    });
  }

  // Record trade
  const trade: Trade = {
    id: `tr_${Date.now()}`,
    event_id: team.event_id,
    team_id: teamId,
    team_member_id: memberId || null,
    stock_id: stockId,
    side: 'BUY',
    quantity,
    price: stock.current_price,
    total_value: totalCost,
    created_at: new Date().toISOString(),
  };
  db.trades.unshift(trade);

  // Record audit log
  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: team.event_id,
    actor_type: 'PARTICIPANT',
    actor_id: teamId,
    action: 'BUY',
    entity_type: 'HOLDING',
    entity_id: stockId,
    old_value: null,
    new_value: { stock: stock.symbol, quantity, price: stock.current_price, remainingCash: team.cash_balance },
    reason: `Bought ${quantity} ${stock.symbol} @ ₹${stock.current_price}`,
    metadata: null,
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);

  // Broadcast realtime events across all clients
  broadcastRealtimeEvent('TRADE_EXECUTED', { teamId, stockId, side: 'BUY', quantity });
  broadcastRealtimeEvent('PORTFOLIO_CHANGED', { teamId });
  broadcastRealtimeEvent('LEADERBOARD_UPDATED');

  return {
    success: true,
    data: {
      stock: stock.symbol,
      quantity,
      price: stock.current_price,
      total_cost: totalCost,
      remaining_cash: team.cash_balance,
    },
  };
}

export async function sellStock(
  teamId: string,
  stockId: string,
  quantity: number,
  memberId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (quantity <= 0) {
    return { success: false, error: 'Quantity must be greater than zero.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('execute_sell', {
        p_team_id: teamId,
        p_stock_id: stockId,
        p_quantity: quantity,
        p_member_id: memberId || null,
      });

      if (!error && data && data.success) {
        broadcastRealtimeEvent('TRADE_EXECUTED', { teamId, stockId, side: 'SELL', quantity });
        broadcastRealtimeEvent('PORTFOLIO_CHANGED', { teamId });
        broadcastRealtimeEvent('LEADERBOARD_UPDATED');
        return { success: true, data };
      }
    } catch (err: any) {
      console.warn('Supabase sellStock warning (falling back to mock):', err);
    }
  }

  // Fallback Mock execution
  const db = getMockDB();
  const team = db.teams.find((t) => t.id === teamId);
  const stock = db.stocks.find((s) => s.id === stockId);
  const session = db.marketSessions
    .filter((s) => s.event_id === team?.event_id || team?.event_id === 'e1')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!team) return { success: false, error: 'Team not found.' };
  if (!stock || !stock.is_active) return { success: false, error: 'Stock is inactive.' };
  if (team.status === 'ELIMINATED') return { success: false, error: 'Team has been eliminated.' };
  if (team.status !== 'ACTIVE') return { success: false, error: 'Team trading is disabled.' };
  if (!session || session.status !== 'OPEN') return { success: false, error: `Market is currently ${session?.status || 'CLOSED'}.` };

  const holding = db.holdings.find((h) => h.team_id === teamId && h.stock_id === stockId);
  if (!holding || holding.quantity < quantity) {
    return {
      success: false,
      error: `You do not own enough shares. Owned: ${holding?.quantity || 0}, Requested: ${quantity}`,
    };
  }

  const proceeds = quantity * stock.current_price;
  const realizedProfit = (stock.current_price - holding.average_cost) * quantity;

  holding.quantity -= quantity;
  holding.realized_pnl += realizedProfit;
  holding.updated_at = new Date().toISOString();

  team.cash_balance += proceeds;
  team.updated_at = new Date().toISOString();

  const trade: Trade = {
    id: `tr_${Date.now()}`,
    event_id: team.event_id,
    team_id: teamId,
    team_member_id: memberId || null,
    stock_id: stockId,
    side: 'SELL',
    quantity,
    price: stock.current_price,
    total_value: proceeds,
    created_at: new Date().toISOString(),
  };
  db.trades.unshift(trade);

  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: team.event_id,
    actor_type: 'PARTICIPANT',
    actor_id: teamId,
    action: 'SELL',
    entity_type: 'HOLDING',
    entity_id: stockId,
    old_value: null,
    new_value: { stock: stock.symbol, quantity, price: stock.current_price, proceeds, profit: realizedProfit },
    reason: `Sold ${quantity} ${stock.symbol} @ ₹${stock.current_price}`,
    metadata: null,
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);

  // Broadcast realtime events across all clients
  broadcastRealtimeEvent('TRADE_EXECUTED', { teamId, stockId, side: 'SELL', quantity });
  broadcastRealtimeEvent('PORTFOLIO_CHANGED', { teamId });
  broadcastRealtimeEvent('LEADERBOARD_UPDATED');

  return {
    success: true,
    data: {
      stock: stock.symbol,
      quantity,
      price: stock.current_price,
      proceeds,
      realized_profit: realizedProfit,
      remaining_cash: team.cash_balance,
    },
  };
}

export async function getTeamTrades(teamId: string): Promise<Trade[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          stock:stocks(*),
          team_member:team_members(*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Trade[];
      }
    } catch (err) {
      console.error('Error fetching team trades:', err);
    }
  }

  const db = getMockDB();
  return db.trades
    .filter((t) => t.team_id === teamId)
    .map((t) => {
      const stock = db.stocks.find((s) => s.id === t.stock_id);
      const member = db.teamMembers.find((m) => m.id === t.team_member_id);
      return {
        ...t,
        stock,
        team_member: member,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAllTrades(eventId?: string): Promise<Trade[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('trades')
        .select(`
          *,
          team:teams(*),
          stock:stocks(*),
          team_member:team_members(*)
        `)
        .order('created_at', { ascending: false });

      if (eventId && eventId !== 'e1') {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data as Trade[];
      }
    } catch (err) {
      console.error('Error fetching all trades:', err);
    }
  }

  const db = getMockDB();
  return db.trades
    .filter((t) => !eventId || eventId === 'e1' || t.event_id === eventId || t.event_id === 'e1')
    .map((t) => {
      const team = db.teams.find((tm) => tm.id === t.team_id);
      const stock = db.stocks.find((s) => s.id === t.stock_id);
      const member = db.teamMembers.find((m) => m.id === t.team_member_id);
      return {
        ...t,
        team,
        stock,
        team_member: member,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
