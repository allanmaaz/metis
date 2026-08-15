import React, { useState, useEffect } from 'react';
import { Stock } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import {
  AlertTriangle,
  Activity,
  Zap,
  Waves,
  Clock,
} from 'lucide-react';

interface PriceChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onConfirmChange: (
    stockId: string,
    newPrice: number,
    reason: string,
    durationSec?: number
  ) => Promise<{ success: boolean; error?: string }>;
}

export const PriceChangeModal: React.FC<PriceChangeModalProps> = ({
  isOpen,
  onClose,
  stock,
  onConfirmChange,
}) => {
  const [newPrice, setNewPrice] = useState<string>('');
  const [reason, setReason] = useState<string>('Market news adjustment');
  const [durationSec, setDurationSec] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stock) {
      setNewPrice(stock.current_price.toString());
      setReason('Market dynamics adjustment');
      setDurationSec(15);
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

    const result = await onConfirmChange(
      stock.id,
      numPrice,
      reason.trim(),
      durationSec
    );
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to update stock price.');
    }
  };

  const estimatedTicks = durationSec > 0 ? Math.max(4, Math.round((durationSec * 1000) / 800)) : 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Adjust Price:</span>
          <span className="text-orange-400 font-extrabold font-mono">
            {stock.symbol}
          </span>
        </div>
      }
      subtitle={`${stock.company_name} · ${stock.sector}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs Target Price Comparison */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
              Current Price
            </span>
            <div className="text-xl font-black font-mono text-slate-300 mt-0.5">
              {formatCurrency(currentPrice)}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
              Target Price
            </span>
            <div className="text-xl font-black font-mono text-white mt-0.5 flex items-center gap-1.5">
              {formatCurrency(numPrice)}
              {pctChange !== 0 && (
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                    pctChange > 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
            Quick Multipliers
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[-10, -5, 5, 10, 25].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => applyDeltaPercent(pct)}
                className={`text-xs py-1.5 rounded-xl border font-mono font-black transition-all active:scale-95 cursor-pointer ${
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
            label="Target Stock Price (₹)"
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

        {/* Dynamic Transition Duration Control */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              <span>Transition Speed</span>
            </label>
            <span className="text-xs text-orange-400 font-mono font-bold">
              {durationSec === 0 ? '⚡ 0s Instant' : `🌊 ${durationSec}s Glide (~${estimatedTicks} ticks)`}
            </span>
          </div>

          {/* Clean 4-Preset Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '⚡ Instant', sec: 0 },
              { label: '5s Fast', sec: 5 },
              { label: '15s Default', sec: 15 },
              { label: '30s Smooth', sec: 30 },
            ].map((p) => (
              <button
                key={p.sec}
                type="button"
                onClick={() => setDurationSec(p.sec)}
                className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all text-center cursor-pointer ${
                  durationSec === p.sec
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm font-black'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Duration Slider + Input */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min="0"
                max="300"
                value={durationSec}
                onChange={(e) => setDurationSec(Math.max(0, Number(e.target.value)))}
                className="w-14 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs text-center focus:outline-none focus:border-orange-500"
              />
              <span className="text-[11px] text-slate-400 font-mono">sec</span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
            {durationSec === 0 ? (
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Price will update immediately on all screens with zero delay.</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-slate-300">
                <Waves className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  Price will gradually glide from <b>{formatCurrency(currentPrice)}</b> to <b>{formatCurrency(numPrice)}</b> with realistic micro-fluctuations over <b>{durationSec} seconds</b> (~{estimatedTicks} live ticks).
                </span>
              </div>
            )}
          </div>
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
                You are adjusting the stock price by {formatPercent(pctChange)}. This will alter the portfolio valuations and leaderboard ranks of all teams holding this stock.
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Modal Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Applying...' : durationSec === 0 ? 'Apply Instant Price' : `Start ${durationSec}s Glide`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PriceChangeModal;
