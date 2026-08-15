import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent, closeEvent, updateEventSettings } from '../../services/event';
import { Event } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Settings, Lock, CheckCircle, ShieldAlert, Award, Edit2, Save, X, Sparkles } from 'lucide-react';
import { formatWealth, formatCurrency } from '../../lib/formatting';

export const AdminSettings: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRoundName, setEditRoundName] = useState('');
  const [editStartingCapital, setEditStartingCapital] = useState(100000000);
  const [editQualificationCount, setEditQualificationCount] = useState(5);

  const loadEvent = useCallback(async () => {
    try {
      const active = await getActiveEvent();
      setEvent(active);
      setEditName(active.name);
      setEditRoundName(active.round_name || 'Round 2 — Virtual Market');
      setEditStartingCapital(active.starting_capital || 100000000);
      setEditQualificationCount(active.qualification_count || 5);
    } catch (err) {
      console.error('Error loading event:', err);
    }
  }, []);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleStartEdit = () => {
    if (!event) return;
    setEditName(event.name);
    setEditRoundName(event.round_name || 'Round 2 — Virtual Market');
    setEditStartingCapital(event.starting_capital || 100000000);
    setEditQualificationCount(event.qualification_count || 5);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!event) return;
    setEditName(event.name);
    setEditRoundName(event.round_name || 'Round 2 — Virtual Market');
    setEditStartingCapital(event.starting_capital || 100000000);
    setEditQualificationCount(event.qualification_count || 5);
    setIsEditing(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!editName.trim()) {
      alert('Event name cannot be empty.');
      return;
    }
    if (!editRoundName.trim()) {
      alert('Competition round name cannot be empty.');
      return;
    }
    if (editStartingCapital <= 0) {
      alert('Starting virtual capital must be greater than zero.');
      return;
    }
    if (editQualificationCount <= 0) {
      alert('Qualification cutoff count must be at least 1.');
      return;
    }

    setIsSaving(true);
    const res = await updateEventSettings(event.id, {
      name: editName,
      round_name: editRoundName,
      starting_capital: editStartingCapital,
      qualification_count: editQualificationCount,
    });
    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      setMessage('Event competition details updated successfully!');
      setTimeout(() => setMessage(null), 4000);
      loadEvent();
    } else {
      alert(res.error || 'Failed to update event settings.');
    }
  };

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
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Event Details Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Active Competition Details
            </h3>
          </div>

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold text-xs border border-orange-200/80 transition-all shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs transition-all shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block font-mono">
                Event Name
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {event?.name || 'METIS 2026'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block font-mono">
                Competition Round
              </span>
              <span className="text-base font-extrabold text-orange-500 mt-1 block">
                {event?.round_name || 'Round 2 — Virtual Market'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block font-mono">
                Starting Virtual Capital
              </span>
              <span className="text-base font-extrabold text-emerald-600 font-mono mt-1 block">
                {formatWealth(event?.starting_capital || 100000000)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider block font-mono">
                Qualification Cutoff
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                Top {event?.qualification_count || 5} Teams
              </span>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Name */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <label className="text-[11px] text-slate-500 uppercase font-extrabold tracking-wider block font-mono">
                  Event Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. METIS 2026"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Competition Round */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <label className="text-[11px] text-slate-500 uppercase font-extrabold tracking-wider block font-mono">
                  Competition Round
                </label>
                <input
                  type="text"
                  value={editRoundName}
                  onChange={(e) => setEditRoundName(e.target.value)}
                  placeholder="e.g. Round 2 — Virtual Market"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-orange-600 focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Starting Capital */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-500 uppercase font-extrabold tracking-wider font-mono">
                    Starting Virtual Capital (₹)
                  </label>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {formatWealth(editStartingCapital)}
                  </span>
                </div>
                <input
                  type="number"
                  value={editStartingCapital}
                  onChange={(e) => setEditStartingCapital(Number(e.target.value) || 0)}
                  placeholder="e.g. 100000000"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold font-mono focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                />
                {/* Presets */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap font-mono">
                  <span className="text-[10px] text-slate-400 font-bold">Presets:</span>
                  {[
                    { label: '₹1 Cr', value: 10000000 },
                    { label: '₹5 Cr', value: 50000000 },
                    { label: '₹10 Cr', value: 100000000 },
                    { label: '₹25 Cr', value: 250000000 },
                    { label: '₹50 Cr', value: 500000000 },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setEditStartingCapital(p.value)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        editStartingCapital === p.value
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualification Cutoff */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-500 uppercase font-extrabold tracking-wider font-mono">
                    Qualification Cutoff (Teams)
                  </label>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    Top {editQualificationCount} Advance
                  </span>
                </div>
                <input
                  type="number"
                  value={editQualificationCount}
                  onChange={(e) => setEditQualificationCount(Number(e.target.value) || 1)}
                  placeholder="e.g. 5"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold font-mono focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                />
                {/* Presets */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap font-mono">
                  <span className="text-[10px] text-slate-400 font-bold">Presets:</span>
                  {[3, 5, 8, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setEditQualificationCount(count)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        editQualificationCount === count
                          ? 'bg-orange-500 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Top {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>
        )}
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
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-sm shadow-rose-500/20 cursor-pointer'
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
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Administrative Freeze Notice</span>
            </div>
            <p>
              Once finalized, the current stage of METIS 2026 will end. Trade executions, price fluctuations, and cash updates will be locked.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCloseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isLoading}
              onClick={handleCloseEvent}
            >
              Confirm & Lock Round
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSettings;
