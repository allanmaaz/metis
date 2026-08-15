import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { Stock, StockPriceHistory } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';
import { publishNews } from './news';

export async function getStocks(eventId?: string): Promise<Stock[]> {
  const db = getMockDB();

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('stocks').select('*').order('created_at', { ascending: false });
      if (eventId && isValidUuid(eventId)) {
        query = query.eq('event_id', eventId);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const remoteStocks = data as Stock[];
        // Sync remote stocks into local DB so offline matches Supabase
        db.stocks = remoteStocks;
        saveMockDB(db);
        return remoteStocks;
      }
    } catch (err) {
      // Fallback to local database
    }
  }

  const list = db.stocks;
  return [...list].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id.localeCompare(a.id);
  });
}

export async function getStock(stockId: string): Promise<Stock | null> {
  if (isSupabaseConfigured && isValidUuid(stockId)) {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('id', stockId)
        .maybeSingle();

      if (!error && data) {
        return data as Stock;
      }
    } catch (err) {
      // Fallback to local database
    }
  }

  const db = getMockDB();
  return db.stocks.find((s) => s.id === stockId) || null;
}

import { startPriceGlide, updateStockPriceInstant, getActiveGlides, cancelGlide } from './stockPriceEngine';

export { getActiveGlides, cancelGlide };

export async function updateStockPrice(
  stockId: string,
  newPrice: number,
  reason: string,
  adminId?: string,
  transitionDurationSec: number = 15
): Promise<{ success: boolean; data?: any; error?: string }> {
  return startPriceGlide(stockId, newPrice, transitionDurationSec, reason, adminId);
}

export async function createStock(data: {
  event_id: string;
  symbol: string;
  company_name: string;
  sector: string;
  starting_price: number;
}): Promise<{ success: boolean; data?: Stock; error?: string }> {
  const stockSymbol = data.symbol.trim().toUpperCase();

  const db = getMockDB();
  const newStock: Stock = {
    id: `s_${Date.now()}`,
    event_id: data.event_id,
    symbol: stockSymbol,
    company_name: data.company_name.trim(),
    sector: data.sector.trim(),
    starting_price: data.starting_price,
    current_price: data.starting_price,
    opening_price: data.starting_price,
    high_price: data.starting_price,
    low_price: data.starting_price,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.stocks.unshift(newStock);
  saveMockDB(db);

  broadcastRealtimeEvent('STOCK_PRICE_UPDATED', {
    type: 'STOCK_CREATED',
    stock: newStock,
    symbol: newStock.symbol,
    companyName: newStock.company_name,
    price: newStock.current_price,
    sector: newStock.sector,
  });

  // Automatically broadcast breaking IPO wire to News feed
  publishNews({
    event_id: data.event_id,
    headline: `🚀 NEW LISTING: ${newStock.company_name} (${newStock.symbol}) Debuts at ₹${newStock.starting_price.toLocaleString('en-IN')}`,
    body: `${newStock.company_name} (${newStock.symbol}) has officially commenced live trading in the ${newStock.sector} sector. Buy and sell orders are now active across the exchange floor.`,
    sector: newStock.sector,
  }).catch(() => {});

  if (isSupabaseConfigured) {
    try {
      const targetEventId = data.event_id === 'e1' ? (db.events[0]?.id || data.event_id) : data.event_id;
      const { data: existing } = await supabase
        .from('stocks')
        .select('*')
        .eq('event_id', targetEventId)
        .eq('symbol', stockSymbol)
        .maybeSingle();

      if (existing) {
        const { data: updated } = await supabase
          .from('stocks')
          .update({
            company_name: data.company_name.trim(),
            sector: data.sector.trim(),
            current_price: data.starting_price,
            is_active: true,
          })
          .eq('id', existing.id)
          .select()
          .maybeSingle();

        if (updated) {
          const idx = db.stocks.findIndex((s) => s.symbol === stockSymbol);
          if (idx >= 0) db.stocks[idx] = updated as Stock;
          saveMockDB(db);
          return { success: true, data: updated as Stock };
        }
      } else {
        const { data: created } = await supabase
          .from('stocks')
          .insert({
            event_id: targetEventId,
            symbol: stockSymbol,
            company_name: data.company_name.trim(),
            sector: data.sector.trim(),
            starting_price: data.starting_price,
            current_price: data.starting_price,
            opening_price: data.starting_price,
            high_price: data.starting_price,
            low_price: data.starting_price,
            is_active: true,
          })
          .select()
          .maybeSingle();

        if (created) {
          const idx = db.stocks.findIndex((s) => s.symbol === stockSymbol);
          if (idx >= 0) db.stocks[idx] = created as Stock;
          saveMockDB(db);
          return { success: true, data: created as Stock };
        }
      }
    } catch (err: any) {
      console.warn('Supabase createStock warning (saved locally):', err);
    }
  }

  return { success: true, data: newStock };
}

export async function getStockPriceHistory(stockId: string): Promise<StockPriceHistory[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('stock_price_history')
        .select('*')
        .eq('stock_id', stockId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as StockPriceHistory[];
      }
    } catch (err) {
      console.error('Error fetching stock price history:', err);
    }
  }

  return [];
}

export async function deleteStock(stockId: string): Promise<{ success: boolean; error?: string }> {
  const db = getMockDB();
  db.stocks = db.stocks.filter((s) => s.id !== stockId);
  saveMockDB(db);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('stocks').delete().eq('id', stockId);
    } catch (err) {
      console.warn('Supabase deleteStock warning:', err);
    }
  }

  broadcastRealtimeEvent('STOCK_PRICE_UPDATED', {});
  return { success: true };
}

export interface StockHoldingTeam {
  team_id: string;
  team_name: string;
  team_code?: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  current_value: number;
  total_invested: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  holding_pct: number;
}

export interface StockHoldingDistribution {
  stock_id: string;
  symbol: string;
  company_name: string;
  current_price: number;
  total_quantity: number;
  total_value: number;
  teams_count: number;
  teams: StockHoldingTeam[];
}

export async function getStockHoldingDistribution(stockId: string): Promise<StockHoldingDistribution> {
  const stock = await getStock(stockId);
  const currentPrice = stock?.current_price || 0;
  const symbol = stock?.symbol || 'STOCK';
  const companyName = stock?.company_name || 'Asset';

  let rawHoldings: any[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select(`
          *,
          team:teams(id, name, team_code)
        `)
        .eq('stock_id', stockId)
        .gt('quantity', 0);

      if (!error && data && data.length > 0) {
        rawHoldings = data;
      }
    } catch (err) {
      console.warn('Supabase getStockHoldingDistribution error:', err);
    }
  }

  if (rawHoldings.length === 0) {
    const db = getMockDB();
    rawHoldings = db.holdings
      .filter((h) => h.stock_id === stockId && h.quantity > 0)
      .map((h) => ({
        ...h,
        team: db.teams.find((t) => t.id === h.team_id) || { id: h.team_id, name: 'Team', team_code: 'T' },
      }));
  }

  const totalQuantity = rawHoldings.reduce((sum, h) => sum + Number(h.quantity || 0), 0);
  const totalValue = totalQuantity * currentPrice;

  const teams: StockHoldingTeam[] = rawHoldings
    .map((h) => {
      const qty = Number(h.quantity || 0);
      const avgCost = Number(h.average_cost || 0);
      const val = qty * currentPrice;
      const invested = qty * avgCost;
      const pnl = val - invested;
      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
      const holdingPct = totalQuantity > 0 ? (qty / totalQuantity) * 100 : 0;

      return {
        team_id: h.team?.id || h.team_id,
        team_name: h.team?.name || 'Unknown Team',
        team_code: h.team?.team_code,
        quantity: qty,
        average_cost: avgCost,
        current_price: currentPrice,
        current_value: val,
        total_invested: invested,
        unrealized_pnl: pnl,
        unrealized_pnl_pct: pnlPct,
        holding_pct: holdingPct,
      };
    })
    .sort((a, b) => b.quantity - a.quantity);

  return {
    stock_id: stockId,
    symbol,
    company_name: companyName,
    current_price: currentPrice,
    total_quantity: totalQuantity,
    total_value: totalValue,
    teams_count: teams.length,
    teams,
  };
}
