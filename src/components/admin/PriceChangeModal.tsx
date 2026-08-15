import React, { useState } from 'react';
import { Stock } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

interface PriceChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onConfirmChange: (stockId: string, newPrice: number, reason: string) => Promise<{ success: boolean; error?: string }>;
}

export const PriceChangeModal: React.FC<PriceChangeModalProps> = ({
  isOpen,
  onClose,
  stock,
  onConfirmChange,
}) => {
  const [newPrice, setNewPrice] = useState<string>('');
  const [reason, setReason] = useState<string>('Market news adjustment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (stock) {
      setNewPrice(stock.current_price.toString());
      setReason('Market dynamics adjustment');
      setError(null);
    }
  }, [stock]);

  if (!stock) return null;

  const currentPrice = stock.current_price;
  const numPrice = parseFloat(newPrice) || 0;
  const priceDiff = numPrice - currentPrice;
  const pctChange = currentPrice > 0 ? (priceDiff / currentPrice) * 100 : 0;
  const isLargeChange = Math.abs(pctChange) >= 50;

  const applyDeltaPercent = (pct: number) => {
    const calculated = Math.round(currentPrice * (1 + pct / 100));
    setNewPrice(calculated.toString());
    setReason(`Adjusted ${pct > 0 ? '+' : ''}${pct}% following sector trends`);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numPrice <= 0) {
      setError('Price must be greater than zero.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the audit log.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onConfirmChange(stock.id, numPrice, reason.trim());
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to update stock price.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Adjust Price:</span>
          <span className="text-orange-400 font-extrabold">{stock.symbol}</span>
        </div>
      }
      subtitle={stock.company_name}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs New Price Comparison */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Price
            </span>
            <div className="text-xl font-bold font-display text-slate-300 mt-0.5">
              {formatCurrency(currentPrice)}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              New Price
            </span>
            <div className="text-xl font-extrabold font-display text-white mt-0.5 flex items-center gap-1.5">
              {formatCurrency(numPrice)}
              {pctChange !== 0 && (
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                    pctChange > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {formatPercent(pctChange)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Percent Multipliers */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Quick Multipliers
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[-10, -5, 5, 10, 25].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => applyDeltaPercent(pct)}
                className={`text-xs py-1.5 rounded-lg border font-mono font-bold transition-colors ${
                  pct < 0
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {pct > 0 ? `+${pct}%` : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Price Input */}
        <div>
          <Input
            label="Custom Stock Price (₹)"
            type="number"
            step="any"
            min="0.01"
            value={newPrice}
            onChange={(e) => {
              setNewPrice(e.target.value);
              setError(null);
            }}
            placeholder="Enter target price"
          />
        </div>

        {/* Reason Input */}
        <div>
          <Input
            label="Reason (Recorded in Audit Log)"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Large Change Safety Warning */}
        {isLargeChange && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">⚠️ LARGE PRICE CHANGE DETECTED</span>
              <span>
                You are adjusting the stock price by {formatPercent(pctChange)}. This will immediately alter the total wealth and leaderboard ranking of all teams holding this stock.
              </span>
            </div>
          </div>
        )}

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
            variant={isLargeChange ? 'danger' : 'primary'}
            isLoading={isLoading}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            {isLargeChange ? 'Confirm Large Change' : 'Apply Price'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
