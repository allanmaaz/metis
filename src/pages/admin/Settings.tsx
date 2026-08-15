import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent, closeEvent } from '../../services/event';
import { Event } from '../../types';
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-orange-500" />
          Event Lifecycle & Settings
        </h1>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Event Details Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900">
          Active Competition Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">
              Event Name
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              {event?.name || 'METIS 2026'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">
              Competition Round
            </span>
            <span className="text-base font-extrabold text-orange-500 mt-1 block">
              {event?.round_name || 'Round 2 — Virtual Market'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">
              Starting Virtual Capital
            </span>
            <span className="text-base font-extrabold text-emerald-600 font-mono mt-1 block">
              {formatWealth(event?.starting_capital || 100000000)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block">
              Qualification Cutoff
            </span>
            <span className="text-base font-extrabold text-slate-900 mt-1 block">
              Top {event?.qualification_count || 5} Teams
            </span>
          </div>
        </div>
      </div>

      {/* Round Finalization */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Finalize Competition Round
            </h3>
            <p className="text-xs text-slate-500">
              Lock all portfolio valuations, compute final standings, and export official standings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCloseModalOpen(true)}
          disabled={isEnded}
          className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs ${
            isEnded
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-sm shadow-rose-500/20'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{isEnded ? 'Event Already Finalized' : 'Finalize & Lock Round'}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Finalize Competition Round?"
        subtitle="This action is permanent and will permanently freeze all trade operations"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">IRREVERSIBLE ACTION</span>
              Ending the event will snapshot final rankings, close trading permanently, and declare qualified teams.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCloseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isLoading}
              onClick={handleCloseEvent}
            >
              Confirm Finalize
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSettings;
