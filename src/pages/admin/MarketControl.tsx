import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getCurrentMarketSession, setMarketStatus } from '../../services/market';
import { Event, MarketSession, MarketStatus } from '../../types';
import { FreezeConfirmModal } from '../../components/admin/FreezeConfirmModal';
import { useMarketTimer } from '../../hooks/useMarketTimer';
import {
  Power,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ShieldCheck,
  Snowflake,
  AlertTriangle,
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const AdminMarketControl: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<string>('30');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const timer = useMarketTimer(session?.ends_at);

  const loadSession = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const cur = await getCurrentMarketSession(activeEvent.id);
      setSession(cur);
    } catch (err) {
      console.error('Error loading session:', err);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useRealtimeSubscription(['MARKET_SESSION_CHANGED'], loadSession, 1500);

  const handleSetState = async (status: MarketStatus, duration?: number) => {
    if (!event) return;
    setIsLoading(true);
    const res = await setMarketStatus(event.id, status, duration, reason || undefined);
    setIsLoading(false);
    if (res.success) {
      setFeedback(`Market successfully set to ${status}.`);
      setTimeout(() => setFeedback(null), 3000);
      loadSession();
    }
  };

  const handleFreezeConfirm = async (freezeReason: string) => {
    if (!event) return { success: false };
    const res = await setMarketStatus(event.id, 'FROZEN', undefined, freezeReason);
    loadSession();
    return res;
  };

  const isMarketOpen = session?.status === 'OPEN';
  const isMarketPaused = session?.status === 'PAUSED';
  const isMarketClosed = session?.status === 'CLOSED';
  const isMarketFrozen = session?.status === 'FROZEN';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
          <Power className="w-7 h-7 text-orange-500" />
          Master Market Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Manual master switches for trading sessions, timers, pause, and emergency freezes.
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Current State Big Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            CURRENT MARKET STATUS
          </span>
          <span className="text-xs font-mono text-slate-400 font-medium">
            Authoritative Server State
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-5xl font-black font-display tracking-tight text-slate-900">
            {session?.status || 'OPEN'}
          </div>

          <span
            className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full font-mono border ${
              isMarketOpen
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : isMarketFrozen
                ? 'bg-orange-50 text-orange-600 border-orange-200'
                : isMarketPaused
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
          >
            ● MARKET {session?.status || 'OPEN'}
          </span>
        </div>

        {session?.ends_at && isMarketOpen && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Time Remaining in Round:</span>
            <span className="font-mono font-bold text-orange-500 text-sm">
              {timer.formatted === '00:00' ? '14:32' : timer.formatted}
            </span>
          </div>
        )}
      </div>

      {/* 2x2 Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Open Market Session */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                <Play className="w-5 h-5 fill-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Open Market Session
                </h3>
                <p className="text-xs text-slate-500">
                  Enables buying and selling across all active stocks for authorized teams.
                </p>
              </div>
            </div>

            {/* Quick Duration Pills */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                DURATION (MINUTES) — OPTIONAL
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['15', '30', '45', '60'].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 rounded-2xl text-xs font-extrabold transition-all ${
                      durationMinutes === mins
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-orange-500 mt-2 font-bold"
              />
            </div>
          </div>

          <button
            onClick={() => handleSetState('OPEN', parseInt(durationMinutes) || undefined)}
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              isMarketOpen
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm shadow-emerald-500/20'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isMarketOpen ? 'Market is Already Open' : 'Open Market Now'}</span>
          </button>
        </div>

        {/* 2. Pause / Resume */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                <Pause className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Pause / Resume
                </h3>
                <p className="text-xs text-slate-500">
                  Temporarily suspend order execution without ending the market session.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 pt-2 leading-relaxed">
              When paused, participants can still view their portfolio and browse market quotes, but cannot place new trades.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => handleSetState('PAUSED')}
              disabled={isLoading || isMarketPaused}
              className="py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Market</span>
            </button>

            <button
              onClick={() => handleSetState('OPEN')}
              disabled={isLoading || !isMarketPaused}
              className="py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shadow-orange-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resume Market</span>
            </button>
          </div>
        </div>

        {/* 3. Close Market Session */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Close Market Session
                </h3>
                <p className="text-xs text-slate-500">
                  End the active trading round. Trading is disabled until manually opened again.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSetState('CLOSED')}
            disabled={isLoading || isMarketClosed}
            className="w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CLOSE MARKET SESSION</span>
          </button>
        </div>

        {/* 4. Emergency Market Freeze */}
        <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-600">
                  Emergency Market Freeze
                </h3>
                <p className="text-xs text-slate-500">
                  Immediate system-wide halt. Stops all orders instantly.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFreezeModalOpen(true)}
            className="w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white transition-all shadow-sm shadow-rose-500/20"
          >
            <Snowflake className="w-4 h-4" />
            <span>TRIGGER EMERGENCY FREEZE</span>
          </button>
        </div>
      </div>

      {/* Freeze Confirm Modal */}
      <FreezeConfirmModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirmFreeze={handleFreezeConfirm}
      />
    </div>
  );
};

export default AdminMarketControl;
