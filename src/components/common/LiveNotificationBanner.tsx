import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatting';

export interface MarketNotification {
  id: string;
  type: 'NEWS' | 'STOCK_CREATED' | 'PRICE_HIKE' | 'PRICE_CRASH';
  badge: string;
  title: string;
  subtitle: string;
  targetPath: string;
  actionText: string;
  createdAt: number;
}

// Synthesize a crisp, high-tech market alert chime using Web Audio API
function playAlertChime(type: MarketNotification['type']) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'PRICE_HIKE') {
      // Ascending triumphant chime (587Hz -> 880Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'PRICE_CRASH') {
      // Descending warning chime (659Hz -> 392Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(392, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else {
      // Breaking wire / asset chime (784Hz -> 1046Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // Audio might be blocked by browser autoplay policy until user interacts
  }
}

export const LiveNotificationBanner: React.FC = () => {
  const [currentNotification, setCurrentNotification] =
    useState<MarketNotification | null>(null);
  const navigate = useNavigate();

  const handlePushNotification = useCallback(
    (notif: Omit<MarketNotification, 'id' | 'createdAt'>) => {
      const fullNotif: MarketNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };

      setCurrentNotification(fullNotif);
      playAlertChime(fullNotif.type);
    },
    []
  );

  useEffect(() => {
    // Auto-dismiss after 7 seconds
    if (!currentNotification) return;
    const timer = setTimeout(() => {
      setCurrentNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [currentNotification]);

  useEffect(() => {
    const handleRealtimeEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;

      // 1. Breaking News Flash
      if (detail.type === 'NEWS_UPDATED') {
        const payload = detail.payload;
        if (payload && payload.headline && !payload.deletedId) {
          handlePushNotification({
            type: 'NEWS',
            badge: 'BREAKING WIRE',
            title: payload.headline,
            subtitle: `Category: ${payload.sector || 'Market'} · Just released`,
            targetPath: '/news',
            actionText: 'Read Wire',
          });
        }
      }

      // 2. Stock Creation or Price Changes
      if (detail.type === 'STOCK_PRICE_UPDATED') {
        const payload = detail.payload;
        if (!payload) return;

        // New Stock Listed
        if (payload.type === 'STOCK_CREATED' || (payload.stock && !payload.oldPrice)) {
          const sym = payload.symbol || payload.stock?.symbol || 'ASSET';
          const name = payload.companyName || payload.stock?.company_name || 'New Company';
          const price = payload.price || payload.stock?.current_price || 100;

          handlePushNotification({
            type: 'STOCK_CREATED',
            badge: 'NEW ASSET LISTED',
            title: `${sym} (${name}) is now live!`,
            subtitle: `Starting valuation: ${formatCurrency(price)} · Open for trading`,
            targetPath: '/market',
            actionText: 'Trade Now',
          });
        }

        // Price Surge (Hike) - Only notify on non-tick final jumps or large shifts
        else if (!payload.isTick && (payload.isHike || payload.pctChange > 0)) {
          const sym = payload.symbol || 'STOCK';
          const pct = Math.abs(payload.pctChange || 0).toFixed(1);
          const newPrice = payload.newPrice || payload.stock?.current_price || 0;

          handlePushNotification({
            type: 'PRICE_HIKE',
            badge: 'PRICE SURGE ALERT',
            title: `🚀 ${sym} surged +${pct}% to ${formatCurrency(newPrice)}!`,
            subtitle: payload.reason
              ? `Catalyst: ${payload.reason}`
              : 'Heavy buying volume detected in the order book.',
            targetPath: '/market',
            actionText: 'View Market',
          });
        }

        // Price Crash (Reduction) - Only notify on non-tick final jumps or large shifts
        else if (!payload.isTick && (payload.isCrash || payload.pctChange < 0)) {
          const sym = payload.symbol || 'STOCK';
          const pct = Math.abs(payload.pctChange || 0).toFixed(1);
          const newPrice = payload.newPrice || payload.stock?.current_price || 0;

          handlePushNotification({
            type: 'PRICE_CRASH',
            badge: 'PRICE CRASH ALERT',
            title: `📉 ${sym} dropped -${pct}% to ${formatCurrency(newPrice)}!`,
            subtitle: payload.reason
              ? `Catalyst: ${payload.reason}`
              : 'Significant selling pressure registered in the market.',
            targetPath: '/market',
            actionText: 'View Market',
          });
        }
      }
    };

    window.addEventListener('metis_realtime_event', handleRealtimeEvent);
    return () => {
      window.removeEventListener('metis_realtime_event', handleRealtimeEvent);
    };
  }, [handlePushNotification]);

  if (!currentNotification) return null;

  const getThemeConfig = () => {
    switch (currentNotification.type) {
      case 'NEWS':
        return {
          icon: <Newspaper className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />,
          bg: 'bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-900/90',
          border: 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
          badgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
        };
      case 'STOCK_CREATED':
        return {
          icon: <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce" />,
          bg: 'bg-gradient-to-r from-indigo-950/95 via-slate-900/95 to-purple-950/90',
          border: 'border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.25)]',
          badgeBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40',
          btnBg: 'bg-indigo-500 hover:bg-indigo-400 text-white font-black',
        };
      case 'PRICE_HIKE':
        return {
          icon: <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />,
          bg: 'bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-teal-950/90',
          border: 'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
        };
      case 'PRICE_CRASH':
        return {
          icon: <TrendingDown className="w-5 h-5 text-rose-400 shrink-0" />,
          bg: 'bg-gradient-to-r from-rose-950/95 via-slate-900/95 to-red-950/90',
          border: 'border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)]',
          badgeBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
          btnBg: 'bg-rose-500 hover:bg-rose-400 text-white font-black',
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[94vw] max-w-xl transition-all duration-300 transform translate-y-0 opacity-100">
      <div
        className={`rounded-2xl p-3.5 sm:p-4 backdrop-blur-xl border ${theme.bg} ${theme.border} text-white shadow-2xl flex items-center justify-between gap-3`}
      >
        {/* Left: Animated Icon + Content */}
        <div
          className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
          onClick={() => {
            navigate(currentNotification.targetPath);
            setCurrentNotification(null);
          }}
        >
          <div className="p-2 rounded-xl bg-white/10 shrink-0 mt-0.5">
            {theme.icon}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono tracking-wider ${theme.badgeBg}`}
              >
                {currentNotification.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Just now
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
              {currentNotification.title}
            </h4>

            <p className="text-[11px] text-slate-300 font-medium truncate">
              {currentNotification.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Action Button & Close (X) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigate(currentNotification.targetPath);
              setCurrentNotification(null);
            }}
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs shadow-sm transition-transform active:scale-95 ${theme.btnBg}`}
          >
            <span>{currentNotification.actionText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setCurrentNotification(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveNotificationBanner;
