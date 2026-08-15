import { useState, useEffect, useRef } from 'react';
import { Stock, MarketSession } from '../types';

/**
 * useMarketPulse provides realistic 4-second micro-fluctuations (0.01% to 0.02%)
 * around each stock's base price when the market is OPEN.
 * When the market is CLOSED or FROZEN, all prices immediately revert to their exact canonical base price.
 */
export function useMarketPulse(stocks: Stock[], session: MarketSession | null) {
  const isMarketOpen = session?.status === 'OPEN';
  const [pulseOffsets, setPulseOffsets] = useState<Record<string, number>>({});
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!isMarketOpen) {
      // Market is closed/frozen: reset all offsets immediately to 0
      setPulseOffsets({});
      setFlashStates({});
      return;
    }

    // Every 4 seconds, introduce natural ±0.01% to ±0.02% micro-jitter
    const interval = setInterval(() => {
      const newOffsets: Record<string, number> = {};
      const newFlashes: Record<string, 'up' | 'down' | null> = {};

      stocks.forEach((stock) => {
        // Random micro-offset between -0.0002 (-0.02%) and +0.0002 (+0.02%)
        const jitterPct = (Math.random() * 0.0003 - 0.00015);
        newOffsets[stock.id] = jitterPct;

        const effectivePrice = Math.round((stock.current_price * (1 + jitterPct)) * 100) / 100;
        const prev = prevPricesRef.current[stock.id] || stock.current_price;

        if (effectivePrice > prev) {
          newFlashes[stock.id] = 'up';
        } else if (effectivePrice < prev) {
          newFlashes[stock.id] = 'down';
        }

        prevPricesRef.current[stock.id] = effectivePrice;
      });

      setPulseOffsets(newOffsets);
      setFlashStates(newFlashes);

      // Clear flash highlight after 1.2s
      const flashTimer = setTimeout(() => {
        setFlashStates({});
      }, 1200);

      return () => clearTimeout(flashTimer);
    }, 4000);

    return () => clearInterval(interval);
  }, [isMarketOpen, stocks]);

  // Merge stocks with their current micro-pulsed prices
  const pulsedStocks: Stock[] = stocks.map((s) => {
    const offset = isMarketOpen ? (pulseOffsets[s.id] || 0) : 0;
    const pulsedPrice = offset !== 0 
      ? Math.round((s.current_price * (1 + offset)) * 100) / 100
      : s.current_price;

    return {
      ...s,
      current_price: pulsedPrice,
    };
  });

  return { pulsedStocks, flashStates, isMarketOpen };
}
