import { getMockDB, saveMockDB } from './mockData';
import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';
import { Stock } from '../types';
import { publishNews } from './news';

export interface ActiveGlide {
  stockId: string;
  symbol: string;
  startPrice: number;
  currentPrice: number;
  targetPrice: number;
  startedAt: number;
  durationSec: number;
  reason: string;
  step: number;
  totalSteps: number;
}

// In-memory active glide tracker
const activeTransitions = new Map<string, { timerId: any; glide: ActiveGlide }>();

/**
 * Get list of all currently gliding stocks
 */
export function getActiveGlides(): ActiveGlide[] {
  return Array.from(activeTransitions.values()).map((v) => v.glide);
}

/**
 * Cancel any ongoing price glide for a stock
 */
export function cancelGlide(stockId: string): void {
  const active = activeTransitions.get(stockId);
  if (active) {
    if (active.timerId) clearTimeout(active.timerId);
    activeTransitions.delete(stockId);
  }
}

/**
 * Execute immediate instant price change
 */
export async function updateStockPriceInstant(
  stockId: string,
  newPrice: number,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; data?: Stock; error?: string }> {
  cancelGlide(stockId);

  const db = getMockDB();
  const stock = db.stocks.find((s) => s.id === stockId);
  if (!stock) return { success: false, error: 'Stock not found' };

  const oldPrice = stock.current_price;
  const priceDiff = newPrice - oldPrice;
  const pctChange = oldPrice > 0 ? (priceDiff / oldPrice) * 100 : 0;

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
    metadata: { transition: 'INSTANT' },
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);

  broadcastRealtimeEvent('STOCK_PRICE_UPDATED', {
    type: 'STOCK_PRICE_CHANGED',
    stockId,
    symbol: stock.symbol,
    companyName: stock.company_name,
    oldPrice,
    newPrice,
    pctChange,
    isHike: newPrice > oldPrice,
    isCrash: newPrice < oldPrice,
    isTick: false,
    reason,
    stock,
  });

  // Automatically broadcast Breaking Wire on price hikes or drops
  if (Math.abs(pctChange) >= 2 || (reason && !reason.includes('micro-noise'))) {
    const isSurge = pctChange > 0;
    const sign = isSurge ? '+' : '';
    const headline = isSurge
      ? `📈 SURGE ALERT: ${stock.symbol} Rallies ${sign}${pctChange.toFixed(1)}% to ₹${newPrice.toLocaleString('en-IN')}`
      : `📉 PLUNGE ALERT: ${stock.symbol} Drops ${pctChange.toFixed(1)}% to ₹${newPrice.toLocaleString('en-IN')}`;

    const body = `${stock.company_name} (${stock.symbol}) moved from ₹${oldPrice.toLocaleString('en-IN')} to ₹${newPrice.toLocaleString('en-IN')} (${sign}${pctChange.toFixed(1)}%). ${reason ? `Market Driver: ${reason}` : (isSurge ? 'Heavy buying demand observed.' : 'Intense market selloff recorded.')}`;

    publishNews({
      event_id: stock.event_id,
      headline,
      body,
      sector: stock.sector,
      admin_id: adminId,
    }).catch(() => {});
  }

  if (isSupabaseConfigured && isValidUuid(stockId)) {
    try {
      const { error: rpcErr } = await supabase.rpc('update_stock_price', {
        p_stock_id: stockId,
        p_new_price: newPrice,
        p_reason: reason,
        p_admin_id: adminId || null,
      });

      if (rpcErr) {
        await supabase
          .from('stocks')
          .update({
            current_price: newPrice,
            high_price: stock.high_price,
            low_price: stock.low_price,
            updated_at: stock.updated_at,
          })
          .eq('id', stockId);
      }
    } catch (err) {
      console.warn('Supabase instant update warning:', err);
    }
  }

  return { success: true, data: stock };
}

/**
 * Execute dynamic realistic price transition with micro-fluctuations over specified duration
 */
export async function startPriceGlide(
  stockId: string,
  targetPrice: number,
  durationSec: number = 15,
  reason: string = 'Dynamic market adjustment',
  adminId?: string
): Promise<{ success: boolean; data?: Stock; error?: string }> {
  if (targetPrice <= 0) return { success: false, error: 'Price must be > 0' };

  if (durationSec <= 0) {
    return updateStockPriceInstant(stockId, targetPrice, reason, adminId);
  }

  // Cancel existing glide if any
  cancelGlide(stockId);

  const db = getMockDB();
  const stock = db.stocks.find((s) => s.id === stockId);
  if (!stock) return { success: false, error: 'Stock not found' };

  const startPrice = stock.current_price;
  if (startPrice === targetPrice) return { success: true, data: stock };

  // Calculate ticks: approximately 1 tick every 800ms
  const tickIntervalMs = 800;
  const totalSteps = Math.max(4, Math.round((durationSec * 1000) / tickIntervalMs));
  const overallDiff = targetPrice - startPrice;

  let currentStep = 0;
  let runningPrice = startPrice;

  const glideInfo: ActiveGlide = {
    stockId,
    symbol: stock.symbol,
    startPrice,
    currentPrice: startPrice,
    targetPrice,
    startedAt: Date.now(),
    durationSec,
    reason,
    step: 0,
    totalSteps,
  };

  const scheduleNextTick = () => {
    currentStep++;
    glideInfo.step = currentStep;

    if (currentStep >= totalSteps) {
      // Final tick: lock precisely to target price
      runningPrice = targetPrice;
      updateStockPriceInstant(stockId, targetPrice, reason, adminId);
      activeTransitions.delete(stockId);
      return;
    }

    // Progression ratio: from 0 to 1
    const progress = currentStep / totalSteps;
    // Base trend towards target
    const basePrice = startPrice + overallDiff * progress;

    // Realistic market micro-noise (fluctuates up and down realistically)
    // Noise amplitude scales with stock volatility (approx 0.8% of price)
    const maxNoise = Math.max(0.5, Math.abs(overallDiff) * 0.25, startPrice * 0.008);
    const noiseDirection = (Math.random() - 0.48); // slight drift bias
    const noise = noiseDirection * maxNoise * Math.sin(progress * Math.PI); // tapering at start & end

    // Intermediate calculated price (rounded to clean number or 1 decimal)
    let tickPrice = Math.round((basePrice + noise) * 10) / 10;
    if (tickPrice <= 0) tickPrice = 1;

    runningPrice = tickPrice;
    glideInfo.currentPrice = tickPrice;

    // 1. Update in local mock DB
    const currentDb = getMockDB();
    const currentStock = currentDb.stocks.find((s) => s.id === stockId);
    if (currentStock) {
      currentStock.current_price = tickPrice;
      currentStock.high_price = Math.max(currentStock.high_price, tickPrice);
      currentStock.low_price = Math.min(currentStock.low_price, tickPrice);
      currentStock.updated_at = new Date().toISOString();
      saveMockDB(currentDb);
    }

    // 2. Broadcast live micro-tick to all screens
    const tickPriceDiff = tickPrice - startPrice;
    const tickPct = startPrice > 0 ? (tickPriceDiff / startPrice) * 100 : 0;

    broadcastRealtimeEvent('STOCK_PRICE_UPDATED', {
      type: 'STOCK_PRICE_CHANGED',
      stockId,
      symbol: stock.symbol,
      companyName: stock.company_name,
      oldPrice: startPrice,
      newPrice: tickPrice,
      targetPrice,
      pctChange: tickPct,
      isHike: overallDiff > 0,
      isCrash: overallDiff < 0,
      isTick: true,
      step: currentStep,
      totalSteps,
      reason,
      stock: currentStock || stock,
    });

    // Schedule subsequent step
    const timer = setTimeout(scheduleNextTick, tickIntervalMs);
    activeTransitions.set(stockId, { timerId: timer, glide: glideInfo });
  };

  // Start first tick
  const initialTimer = setTimeout(scheduleNextTick, 200);
  activeTransitions.set(stockId, { timerId: initialTimer, glide: glideInfo });

  return { success: true, data: stock };
}
