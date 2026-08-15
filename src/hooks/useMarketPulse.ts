import { useState, useEffect, useRef } from 'react';
import { Stock, MarketSession } from '../types';

/**
 * useMarketPulse provides smooth, realistic 4-second micro-fluctuations (0.01% to 0.02%)
 * around each stock's base price when the market is OPEN.
 * When the market is CLOSED or FROZEN, prices immediately stay locked to their base price.
 */
export function useMarketPulse(stocks: Stock[], session: MarketSession | null) {
  const isMarketOpen = session?.status === 'OPEN';
  const [pulseDeltas, setPulseDeltas] = useState<Record<string, number>>({});
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});

  const stocksRef = useRef(stocks);
  useEffect(() => {
    stocksRef.current = stocks;
  }, [stocks]);

  useEffect(() => {
    if (!isMarketOpen) {
      setPulseDeltas({});
      setFlashStates({});
      return;
    }

    // Perfectly stable 4-second rhythm
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      const currentStocks = stocksRef.current;
      const newDeltas: Record<string, number> = {};
      const newFlashes: Record<string, 'up' | 'down' | null> = {};

      currentStocks.forEach((stock, idx) => {
        // Deterministic gentle harmonic wave per stock + tiny noise
        const phase = stepCount + idx * 1.7;
        const wave = Math.sin(phase) * 0.00018; // ±0.018%
        
        // Compute delta in currency units (rounded cleanly so integer prices don't jitter with decimal jumping)
        const rawDelta = stock.current_price * wave;
        const cleanDelta = Math.abs(rawDelta) >= 0.5 
          ? Math.round(rawDelta) 
          : (Math.sin(phase) > 0 ? 1 : -1);

        newDeltas[stock.id] = cleanDelta;

        if (cleanDelta > 0) {
          newFlashes[stock.id] = 'up';
        } else if (cleanDelta < 0) {
          newFlashes[stock.id] = 'down';
        }
      });

      setPulseDeltas(newDeltas);
      setFlashStates(newFlashes);

      // Smoothly fade highlight over 2.5s
      const timer = setTimeout(() => {
        setFlashStates({});
      }, 2500);

      return () => clearTimeout(timer);
    }, 4000);

    return () => clearInterval(interval);
  }, [isMarketOpen]);

  // Merge stocks with their smooth micro-pulsed prices
  const pulsedStocks: Stock[] = stocks.map((s) => {
    const delta = isMarketOpen ? (pulseDeltas[s.id] || 0) : 0;
    const pulsedPrice = Math.max(1, s.current_price + delta);

    return {
      ...s,
      current_price: pulsedPrice,
    };
  });

  return { pulsedStocks, flashStates, isMarketOpen };
}

