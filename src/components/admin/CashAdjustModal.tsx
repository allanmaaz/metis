import React, { useState } from 'react';
import { Team } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatWealth } from '../../lib/formatting';
import { DollarSign, AlertCircle } from 'lucide-react';

interface CashAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onConfirmAdjust: (teamId: string, amount: number, reason: string) => Promise<{ success: boolean; error?: string }>;
}

export const CashAdjustModal: React.FC<CashAdjustModalProps> = ({
  isOpen,
  onClose,
  team,
  onConfirmAdjust,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [isDeduction, setIsDeduction] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!team) return null;

  const rawAmount = parseFloat(amountStr) || 0;
  const signedAmount = isDeduction ? -Math.abs(rawAmount) : Math.abs(rawAmount);
  const resultingCash = team.cash_balance + signedAmount;
  const isInvalid = resultingCash < 0 || rawAmount <= 0;

  const handleQuickAdd = (cr: number) => {
    setAmountStr((cr * 10000000).toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      setError('Please enter a valid non-zero adjustment amount.');
      return;
    }
    if (resultingCash < 0) {
      setError('Adjustment would result in negative cash balance.');
      return;
    }
    if (!reason.trim()) {
      setError('A valid audit reason is required for manual cash adjustments.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onConfirmAdjust(team.id, signedAmount, reason.trim());
    setIsLoading(false);

    if (result.success) {
      setAmountStr('');
      setReason('');
      onClose();
    } else {
      setError(result.error || 'Failed to adjust cash.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Cash Adjustment:</span>
          <span className="text-orange-400 font-extrabold">{team.name}</span>
        </div>
      }
      subtitle={`Current Cash: ${formatCurrency(team.cash_balance)} (${formatWealth(team.cash_balance)})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Credit vs Debit */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setIsDeduction(false)}
            className={`py-2 text-xs font-bold rounded-lg transition-colors ${
              !isDeduction
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + Credit (Add Cash)
          </button>
          <button
            type="button"
            onClick={() => setIsDeduction(true)}
            className={`py-2 text-xs font-bold rounded-lg transition-colors ${
              isDeduction
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            - Debit (Deduct Cash)
          </button>
        </div>

        {/* Quick presets in Crores */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[0.5, 1, 2, 5].map((cr) => (
            <button
              key={cr}
              type="button"
              onClick={() => handleQuickAdd(cr)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
            >
              ₹{cr} Cr
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <Input
          label="Adjustment Amount (in Rupees)"
          type="number"
          min="1"
          value={amountStr}
          onChange={(e) => {
            setAmountStr(e.target.value);
            setError(null);
          }}
        />

        {/* Resulting cash preview */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Resulting Cash Balance</span>
          <span
            className={`text-sm font-bold font-mono ${
              resultingCash < 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {formatCurrency(resultingCash)} ({formatWealth(resultingCash)})
          </span>
        </div>

        {/* Reason input */}
        <Input
          label="Reason for Audit Record (Required)"
          type="text"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError(null);
          }}
        />

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isDeduction ? 'danger' : 'primary'}
            isLoading={isLoading}
            disabled={isInvalid || isLoading}
            leftIcon={<DollarSign className="w-4 h-4" />}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
