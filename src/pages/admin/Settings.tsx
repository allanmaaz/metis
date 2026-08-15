import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent, closeEvent } from '../../services/event';
import { Event } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Settings, Lock, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import { formatWealth } from '../../lib/formatting';

export const AdminSettings: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    try {
      const active = await getActiveEvent();
      setEvent(active);
    } catch (err) {
      console.error('Error loading event:', err);
    }
  }, []);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleCloseEvent = async () => {
    if (!event) return;
    setIsLoading(true);
    const res = await closeEvent(event.id);
    setIsLoading(false);
    if (res.success) {
      setIsCloseModalOpen(false);
      setMessage('METIS Round has been officially ended and all results are permanently locked.');
      loadEvent();
    }
  };

  const isEnded = event?.status === 'ENDED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-orange-500" />
          Event Lifecycle & Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure event rules, qualification parameters, and finalize competition rounds.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {message}
        </div>
      )}

      {/* Event Details Card */}
      <GlassCard variant="default" className="p-6 space-y-4">
        <h3 className="text-lg font-bold font-display text-white">
          Active Competition Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">
              Event Name
            </span>
            <span className="text-base font-bold text-white mt-1 block">
              {event?.name || 'METIS 2026'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">
              Competition Round
            </span>
            <span className="text-base font-bold text-orange-400 mt-1 block">
              {event?.round_name || 'Round 2 — Virtual Market'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">
              Starting Virtual Capital
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
              {formatWealth(event?.starting_capital || 100000000)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">
              Qualification Cutoff
            </span>
            <span className="text-base font-bold text-amber-400 font-mono mt-1 block">
              Top {event?.qualification_count || 5} Teams Advance
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Finalize Round & Lock Results Card */}
      <GlassCard variant={isEnded ? 'default' : 'danger-glow'} className="p-6 space-y-4 border-rose-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Close Event & Lock Final Results</h3>
            <p className="text-xs text-slate-400">
              Permanently stops trading, locks final rankings, and highlights the qualifying teams.
            </p>
          </div>
        </div>

        {isEnded ? (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
            ✓ Event is marked as ENDED. All final ranks and total wealth numbers are immutable.
          </div>
        ) : (
          <Button
            variant="danger"
            size="lg"
            onClick={() => setIsCloseModalOpen(true)}
            leftIcon={<Lock className="w-5 h-5" />}
          >
            END ROUND & LOCK FINAL RESULTS
          </Button>
        )}
      </GlassCard>

      {/* Close Confirmation Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Confirm Event Round Closure"
        subtitle="This action will finalize the competition round"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <ShieldAlert className="w-4 h-4" />
              PERMANENT ACTION
            </div>
            <p>
              Ending the event will automatically close the market and lock all leaderboard standings. No further buy or sell transactions will be accepted.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isLoading}
              onClick={handleCloseEvent}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Confirm Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
