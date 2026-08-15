import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getCurrentMarketSession, setMarketStatus } from '../../services/market';
import { Event, MarketSession, MarketStatus } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MarketStatusBadge } from '../../components/ui/MarketStatusBadge';
import { FreezeConfirmModal } from '../../components/admin/FreezeConfirmModal';
import { useMarketTimer } from '../../hooks/useMarketTimer';
import {
  Power,
  Play,
  Pause,
  StopCircle,
  AlertOctagon,
  RotateCcw,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

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
    const interval = setInterval(loadSession, 3000);
    return () => clearInterval(interval);
  }, [loadSession]);

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

  const isMarketOpen = session?.status === 'OPEN';
  const isMarketPaused = session?.status === 'PAUSED';
  const isMarketClosed = session?.status === 'CLOSED';
  const isMarketFrozen = session?.status === 'FROZEN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          <Power className="w-8 h-8 text-orange-500" />
          Master Market Control
        </h1>
        <p className="text-xs text-slate-400">
          Manual master switches for trading sessions, timers, pause, and emergency freezes.
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          {feedback}
        </div>
      )}

      {/* Current State Big Banner */}
      <GlassCard variant={isMarketFrozen ? 'danger-glow' : isMarketOpen ? 'profit-glow' : 'default'} className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            CURRENT MARKET STATUS
          </span>
          <span className="text-xs font-mono text-slate-400">
            Authoritative Server State
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-4xl sm:text-5xl font-extrabold font-display text-white">
            {session?.status || 'CLOSED'}
          </div>
          <MarketStatusBadge status={session?.status || 'CLOSED'} size="md" />
        </div>

        {session?.ends_at && isMarketOpen && (
          <div className="flex items-center gap-2 text-sm font-mono text-amber-300 pt-2 border-t border-slate-800">
            <Clock className="w-4 h-4" />
            <span>Time Remaining in Current Session: <strong>{timer.formatted}</strong></span>
          </div>
        )}
      </GlassCard>

      {/* Action Switch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open Market Session */}
        <GlassCard variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Play className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Open Market Session</h3>
              <p className="text-xs text-slate-400">
                Enables buying and selling across all active stocks for authorized teams.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Duration (Minutes) — Optional
              </label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {['15', '30', '45', '60'].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      durationMinutes === mins
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Leave blank for unlimited duration"
              />
            </div>

            <Button
              variant="profit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={isMarketOpen}
              onClick={() => handleSetState('OPEN', parseInt(durationMinutes, 10) || undefined)}
              leftIcon={<Play className="w-5 h-5" />}
            >
              {isMarketOpen ? 'Market is Already Open' : 'OPEN MARKET'}
            </Button>
          </div>
        </GlassCard>

        {/* Pause / Resume Controls */}
        <GlassCard variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Pause className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pause / Resume</h3>
              <p className="text-xs text-slate-400">
                Temporarily suspend order execution without ending the market session.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-300">
              When paused, participants can still view their portfolio and browse market quotes, but cannot place new trades.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="lg"
                disabled={isMarketPaused || !isMarketOpen}
                onClick={() => handleSetState('PAUSED')}
                leftIcon={<Pause className="w-5 h-5 text-amber-400" />}
              >
                Pause Market
              </Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!isMarketPaused && !isMarketFrozen}
                onClick={() => handleSetState('OPEN')}
                leftIcon={<RotateCcw className="w-5 h-5" />}
              >
                Resume Market
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Normal Market Close */}
        <GlassCard variant="default" className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800 text-slate-400">
              <StopCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Close Market Session</h3>
              <p className="text-xs text-slate-400">
                End the active trading round. Trading is disabled until manually opened again.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={isMarketClosed}
            onClick={() => handleSetState('CLOSED')}
            leftIcon={<StopCircle className="w-5 h-5 text-rose-400" />}
          >
            {isMarketClosed ? 'Market is Closed' : 'CLOSE MARKET SESSION'}
          </Button>
        </GlassCard>

        {/* Emergency Freeze */}
        <GlassCard variant="danger-glow" className="p-6 space-y-4 border-rose-500/40">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-rose-400">Emergency Market Freeze</h3>
              <p className="text-xs text-rose-300">
                Immediate system-wide halt. Stops all orders instantly.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="lg"
            className="w-full font-bold"
            onClick={() => setIsFreezeModalOpen(true)}
            leftIcon={<AlertOctagon className="w-5 h-5" />}
          >
            🚨 TRIGGER EMERGENCY FREEZE
          </Button>
        </GlassCard>
      </div>

      <FreezeConfirmModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirmFreeze={async (r) => {
          const res = await setMarketStatus(event!.id, 'FROZEN', undefined, r);
          loadSession();
          return res;
        }}
      />
    </div>
  );
};
