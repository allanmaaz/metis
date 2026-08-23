import React, { useState } from 'react';
import { Stock } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, formatQuantity } from '../../lib/formatting';
import { AlertCircle, Wallet, ShoppingCart } from 'lucide-react';
import { StockLogo } from '../common/StockLogo';

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
        <div className="flex items-center gap-2.5">
          <StockLogo symbol={stock.symbol} name={stock.company_name} sector={stock.sector} size="md" />
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-extrabold font-mono">BUY</span>
            <span className="font-black font-display text-white">{stock.symbol}</span>
          </div>
        </div>
      }
      subtitle={stock.company_name}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Market Price & Available Cash Summary */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Current Price
            </span>
            <div className="text-base sm:text-lg font-black font-display text-white mt-0.5">
              {formatCurrency(stock.current_price)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <Wallet className="w-3 h-3 text-orange-400" /> Available Cash
            </span>
            <div className="text-base sm:text-lg font-black font-display text-orange-400 mt-0.5 truncate">
              {formatCurrency(availableCash)}
            </div>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300">
              Order Quantity (Shares)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Max: {formatQuantity(maxAffordableShares)}
            </span>
          </div>

          <input
            type="number"
            min="1"
            max={maxAffordableShares.toString()}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setError(null);
            }}
            placeholder="Enter number of shares"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-base sm:text-lg font-mono font-bold focus:outline-none focus:border-orange-500 transition-colors"
          />

          {/* Responsive Quick Quantity Select Pills */}
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[1000, 5000, 10000, 50000].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => handleQuickSelect(qty)}
                className={`text-[11px] sm:text-xs py-1.5 px-0.5 rounded-lg border font-mono text-center transition-colors ${
                  numQty === qty
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                +{qty >= 1000 ? `${qty / 1000}k` : qty}
              </button>
            ))}
            <button
              type="button"
              onClick={handleMax}
              className="text-[11px] sm:text-xs py-1.5 px-0.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold text-center hover:bg-orange-500/25 transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Order Preview & Financials */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Estimated Total Cost</span>
            <span className="font-mono text-slate-300">
              {formatQuantity(numQty)} × {formatCurrency(stock.current_price)}
            </span>
          </div>
          <div className="flex justify-between items-center font-bold text-sm text-slate-100 pt-1.5 border-t border-slate-800">
            <span>Total Amount</span>
            <span className="font-mono text-emerald-400 text-base">
              {formatCurrency(estimatedCost)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
            <span>Remaining Cash</span>
            <span className="font-mono text-slate-400">
              {formatCurrency(availableCash - estimatedCost)}
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
