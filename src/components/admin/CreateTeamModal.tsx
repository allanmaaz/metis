import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Users, Plus, Trash2, ShieldCheck } from 'lucide-react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onConfirmCreate: (data: {
    event_id: string;
    name: string;
    starting_capital: number;
    members: string[];
  }) => Promise<{ success: boolean; error?: string }>;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onConfirmCreate,
}) => {
  const [teamName, setTeamName] = useState('');
  const [capitalStr, setCapitalStr] = useState('100000000'); // ₹10 Cr
  const [members, setMembers] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMemberChange = (index: number, val: string) => {
    const next = [...members];
    next[index] = val;
    setMembers(next);
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index: number) => {
    if (members.length <= 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Team name is required.');
      return;
    }
    const cleanMembers = members.map((m) => m.trim()).filter(Boolean);
    if (cleanMembers.length === 0) {
      setError('Please add at least 1 team member.');
      return;
    }

    const capital = parseFloat(capitalStr) || 100000000;

    setIsLoading(true);
    setError(null);

    const res = await onConfirmCreate({
      event_id: eventId,
      name: teamName.trim(),
      starting_capital: capital,
      members: cleanMembers,
    });
    setIsLoading(false);

    if (res.success) {
      setTeamName('');
      setMembers(['', '', '', '']);
      onClose();
    } else {
      setError(res.error || 'Failed to create team.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-400" />
          <span>Register New Team</span>
        </div>
      }
      subtitle="Creates team, auto-generates Team Code & secure PIN"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name */}
        <Input
          label="Team Name"
          type="text"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            setError(null);
          }}
          autoFocus
        />

        {/* Starting Capital */}
        <Input
          label="Starting Virtual Capital (₹)"
          type="number"
          value={capitalStr}
          onChange={(e) => setCapitalStr(e.target.value)}
        />

        {/* Members List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Registered Team Members (for Participant Login Verification)
            </label>
            <button
              type="button"
              onClick={addMemberField}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Member
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-5">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(idx, e.target.value)}
                  placeholder={`Member ${idx + 1} Full Name`}
                  className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-700/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMemberField(idx)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Team Code and a random 4-digit PIN will be generated automatically upon creation.</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};
