import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Stock, StockPriceHistory } from '../types';
import { getMockDB, saveMockDB } from './mockData';

export async function getStocks(eventId: string): Promise<Stock[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('event_id', eventId)
        .order('symbol', { ascending: true });

      if (!error && data) {
        return data as Stock[];
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  }

  const db = getMockDB();
  return db.stocks.filter((s) => s.event_id === eventId);
}

export async function getStock(stockId: string): Promise<Stock | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('id', stockId)
        .single();

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

export async function updateStockPrice(
  stockId: string,
  newPrice: number,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (newPrice <= 0) {
    return { success: false, error: 'Price must be greater than 0' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('update_stock_price', {
        p_stock_id: stockId,
        p_new_price: newPrice,
        p_reason: reason,
        p_admin_id: adminId || null,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const stock = db.stocks.find((s) => s.id === stockId);
  if (!stock) return { success: false, error: 'Stock not found' };

  const oldPrice = stock.current_price;
  stock.current_price = newPrice;
  stock.high_price = Math.max(stock.high_price, newPrice);
  stock.low_price = Math.min(stock.low_price, newPrice);
  stock.updated_at = new Date().toISOString();

  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: stock.event_id,
    actor_type: 'ADMIN',
    actor_id: adminId || null,
    action: 'PRICE_CHANGE',
    entity_type: 'STOCK',
    entity_id: stock.id,
    old_value: { price: oldPrice, symbol: stock.symbol },
    new_value: { price: newPrice, symbol: stock.symbol, high: stock.high_price, low: stock.low_price },
    reason,
    metadata: null,
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);
  return { success: true, data: stock };
}

export async function createStock(data: {
  event_id: string;
  symbol: string;
  company_name: string;
  sector: string;
  starting_price: number;
}): Promise<{ success: boolean; data?: Stock; error?: string }> {
  const stockSymbol = data.symbol.trim().toUpperCase();

  if (isSupabaseConfigured) {
    try {
      const { data: created, error } = await supabase
        .from('stocks')
        .insert({
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
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: created as Stock };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

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

  db.stocks.push(newStock);
  saveMockDB(db);
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
