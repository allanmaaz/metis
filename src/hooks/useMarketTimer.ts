import { useState, useEffect, useRef } from 'react';

export interface MarketTimerState {
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
  isNoLimit: boolean;
}

export function useMarketTimer(
  endsAt: string | null | undefined,
  onExpire?: () => void
): MarketTimerState {
  const [timeLeft, setTimeLeft] = useState<MarketTimerState>({
    minutes: 0,
    seconds: 0,
    formatted: endsAt ? '--:--' : 'No limit',
    isExpired: false,
    isNoLimit: !endsAt,
  });

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft({
        minutes: 0,
        seconds: 0,
        formatted: 'No limit',
        isExpired: false,
        isNoLimit: true,
      });
      return;
    }

    let hasFiredExpire = false;

    const calculate = () => {
      const now = Date.now();
      const end = new Date(endsAt).getTime();

      if (isNaN(end)) {
        setTimeLeft({
          minutes: 0,
          seconds: 0,
          formatted: 'No limit',
          isExpired: false,
          isNoLimit: true,
        });
        return;
      }

      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({
          minutes: 0,
          seconds: 0,
          formatted: '00:00',
          isExpired: true,
          isNoLimit: false,
        });

        if (!hasFiredExpire) {
          hasFiredExpire = true;
          if (onExpireRef.current) {
            onExpireRef.current();
          }
        }
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

      setTimeLeft({
        minutes: m,
        seconds: s,
        formatted,
        isExpired: false,
        isNoLimit: false,
      });
    };

    calculate();
    const interval = setInterval(calculate, 250);
    return () => clearInterval(interval);
  }, [endsAt]);

  return timeLeft;
}

