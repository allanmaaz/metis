import { useState, useEffect } from 'react';

export function useMarketTimer(endsAt: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    formatted: string;
    isExpired: boolean;
  }>({
    minutes: 0,
    seconds: 0,
    formatted: '--:--',
    isExpired: false,
  });

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft({
        minutes: 0,
        seconds: 0,
        formatted: 'No limit',
        isExpired: false,
      });
      return;
    }

    const calculate = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({
          minutes: 0,
          seconds: 0,
          formatted: '00:00',
          isExpired: true,
        });
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
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return timeLeft;
}
