import React from 'react';
import { Holding } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { formatCurrency, formatQuantity, formatPercent } from '../../lib/formatting';
import { ArrowUpRight, ArrowDownRight, TrendingDown } from 'lucide-react';

interface HoldingCardProps {
  holding: Holding;
  onSell: (holding: Holding) => void;
  marketOpen?: boolean;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({
  holding,
  onSell,
  marketOpen = true,
}) => {
  const stock = holding.stock;
  if (!stock) return null;

  const currentPrice = stock.current_price;
  const investedAmount = holding.quantity * holding.average_cost;
  const currentValue = holding.quantity * currentPrice;
  const unrealizedPnl = currentValue - investedAmount;
  const pnlPct = investedAmount > 0 ? (unrealizedPnl / investedAmount) * 100 : 0;
  const isProfit = unrealizedPnl >= 0;

  return (
    <GlassCard variant="interactive" className="p-4 sm:p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-extrabold font-display text-white tracking-tight">
              {stock.symbol}
            </h4>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
            {stock.company_name}
          </p>
        </div>

        {/* P&L Badge */}
        <div
          className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
            isProfit
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{formatPercent(pnlPct)}</span>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 gap-3 my-3.5 pt-3 border-t border-slate-800/80">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Quantity
          </span>
          <span className="text-base font-bold font-mono text-white">
            {formatQuantity(holding.quantity)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Avg: {formatCurrency(holding.average_cost)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Current Value
          </span>
          <span className="text-base font-bold font-display text-white">
            {formatCurrency(currentValue)}
          </span>
          <span className={`text-[11px] font-bold block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}{formatCurrency(unrealizedPnl)}
          </span>
        </div>
      </div>

      {/* Quick Sell CTA */}
      <Button
        variant="danger"
        size="sm"
        disabled={!marketOpen || holding.quantity <= 0}
        onClick={() => onSell(holding)}
        leftIcon={<TrendingDown className="w-3.5 h-3.5" />}
        className="w-full"
      >
        Sell Position
      </Button>
    </GlassCard>
  );
};
