import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Stock, StockPriceHistory } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';

export async function getStocks(eventId: string): Promise<Stock[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Stock[];
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  }

  const db = getMockDB();
  const list = db.stocks.filter((s) => s.event_id === eventId || eventId === 'e1');
  return [...list].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return b.id.localeCompare(a.id);
  });
}

export async function getStock(stockId: string): Promise<Stock | null> {
  if (isSupabaseConfigured) {
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
      console.error('Error fetching stock:', err);
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

  if (isSupabaseConfigured) {
    try {
      const { data: created, error } = await supabase
        .from('stocks')
        .insert({
          event_id: data.event_id === 'e1' ? (db.events[0]?.id || data.event_id) : data.event_id,
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

      if (!error && created) return { success: true, data: created as Stock };
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
