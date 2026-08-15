import React, { useState } from 'react';
import { Stock } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatQuantity } from '../../lib/formatting';
import { AlertCircle, Wallet, ShoppingCart } from 'lucide-react';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  availableCash: number;
  onConfirmBuy: (stockId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  stock,
  availableCash,
  onConfirmBuy,
}) => {
  const [quantity, setQuantity] = useState<string>('5000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!stock) return null;

  const numQty = parseInt(quantity, 10) || 0;
  const estimatedCost = numQty * stock.current_price;
  const isAffordable = estimatedCost <= availableCash && numQty > 0;
  const maxAffordableShares = Math.floor(availableCash / stock.current_price);

  const handleQuickSelect = (qty: number) => {
    setQuantity(qty.toString());
    setError(null);
  };

  const handleMax = () => {
    setQuantity(Math.max(0, maxAffordableShares).toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAffordable) {
      setError('Insufficient cash or invalid quantity.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onConfirmBuy(stock.id, numQty);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to complete transaction.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-extrabold">BUY</span>
          <span>{stock.symbol}</span>
        </div>
      }
      subtitle={stock.company_name}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Market Price & Available Cash Summary */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current Price
            </span>
            <div className="text-lg font-bold font-display text-white mt-0.5">
              {formatCurrency(stock.current_price)}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3 h-3 text-orange-400" /> Available Cash
            </span>
            <div className="text-lg font-bold font-display text-orange-400 mt-0.5">
              {formatCurrency(availableCash, true)}
            </div>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <Input
            label="Order Quantity (Shares)"
            type="number"
            min="1"
            max={maxAffordableShares}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError(null);
            }}
            placeholder="Enter number of shares"
            autoFocus
          />

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {[1000, 5000, 10000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickSelect(preset)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  numQty === preset
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                +{formatQuantity(preset)}
              </button>
            ))}
            <button
              type="button"
              onClick={handleMax}
              className="text-xs px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-300 font-bold hover:bg-amber-500/25 transition-colors ml-auto"
            >
              MAX ({formatQuantity(maxAffordableShares)})
            </button>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Total Cost</span>
            <span className="font-mono text-slate-300">
              {formatQuantity(numQty)} × {formatCurrency(stock.current_price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Total Amount</span>
            <span className="text-xl font-extrabold font-display text-emerald-400">
              {formatCurrency(estimatedCost)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/10 text-slate-400">
            <span>Remaining Cash After Trade</span>
            <span className={estimatedCost > availableCash ? 'text-rose-400 font-bold' : 'text-slate-300 font-mono'}>
              {formatCurrency(availableCash - estimatedCost, true)}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Solvency Warning */}
        {estimatedCost > availableCash && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Cost exceeds available cash balance by {formatCurrency(estimatedCost - availableCash)}.</span>
          </div>
        )}

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="profit"
            isLoading={isLoading}
            disabled={!isAffordable || isLoading}
            leftIcon={<ShoppingCart className="w-4 h-4" />}
          >
            Confirm Buy
          </Button>
        </div>
      </form>
    </Modal>
  );
};
