import React, { useState } from 'react';
import { Stock } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatQuantity } from '../../lib/formatting';
import { AlertCircle, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  ownedQuantity: number;
  averageCost?: number;
  onConfirmSell: (stockId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  stock,
  ownedQuantity,
  averageCost = 0,
  onConfirmSell,
}) => {
  const [quantity, setQuantity] = useState<string>(ownedQuantity.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!stock) return null;

  const numQty = parseInt(quantity, 10) || 0;
  const isValidQuantity = numQty > 0 && numQty <= ownedQuantity;
  const estimatedProceeds = numQty * stock.current_price;
  const unitProfit = stock.current_price - averageCost;
  const estimatedProfit = unitProfit * numQty;
  const isProfit = estimatedProfit >= 0;

  const handlePercentage = (pct: number) => {
    const qty = Math.floor((ownedQuantity * pct) / 100);
    setQuantity(qty.toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidQuantity) {
      setError('Please enter a valid share quantity to sell.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onConfirmSell(stock.id, numQty);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to complete sell order.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-rose-400 font-extrabold">SELL</span>
          <span>{stock.symbol}</span>
        </div>
      }
      subtitle={stock.company_name}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Price & Holdings Summary */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Price
            </span>
            <div className="text-lg font-bold font-display text-white mt-0.5">
              {formatCurrency(stock.current_price)}
            </div>
            {averageCost > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">
                Avg Cost: {formatCurrency(averageCost)}
              </span>
            )}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Owned Shares
            </span>
            <div className="text-lg font-bold font-display text-white mt-0.5">
              {formatQuantity(ownedQuantity)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Valued at {formatCurrency(ownedQuantity * stock.current_price, true)}
            </span>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <Input
            label="Quantity to Sell"
            type="number"
            min="1"
            max={ownedQuantity}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError(null);
            }}
            placeholder="Enter shares to sell"
            autoFocus
          />

          {/* Quick % chips */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className="text-xs py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 font-mono text-slate-200 font-semibold transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Proceeds & Realized P/L Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Cash Proceeds</span>
            <span className="text-base font-bold font-display text-white">
              +{formatCurrency(estimatedProceeds)}
            </span>
          </div>

          {averageCost > 0 && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
              <span className="flex items-center gap-1 text-slate-400">
                Estimated Realized P/L
              </span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {formatCurrency(estimatedProfit)}
              </span>
            </div>
          )}
        </div>

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
            variant="danger"
            isLoading={isLoading}
            disabled={!isValidQuantity || isLoading}
            leftIcon={<TrendingDown className="w-4 h-4" />}
          >
            Confirm Sell
          </Button>
        </div>
      </form>
    </Modal>
  );
};
