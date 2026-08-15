import React from 'react';
import { Stock } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  ownedQuantity?: number;
  marketOpen?: boolean;
  onBuy: (stock: Stock) => void;
  onSell: (stock: Stock) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  ownedQuantity = 0,
  marketOpen = true,
  onBuy,
  onSell,
}) => {
  const priceDiff = stock.current_price - stock.opening_price;
  const pctChange = stock.opening_price > 0 ? (priceDiff / stock.opening_price) * 100 : 0;
  const isPositive = priceDiff > 0;
  const isNegative = priceDiff < 0;

  return (
    <GlassCard variant="interactive" className="flex flex-col justify-between h-full p-4 sm:p-5">
      {/* Header: Symbol & Sector */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg sm:text-xl font-extrabold font-display text-white tracking-tight">
                {stock.symbol}
              </h4>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
              {stock.company_name}
            </p>
          </div>

          {/* Change Indicator Pill */}
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : isNegative
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{formatPercent(pctChange)}</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="my-3">
          <div className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {formatCurrency(stock.current_price)}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
            <span>H: {formatCurrency(stock.high_price)}</span>
            <span>·</span>
            <span>L: {formatCurrency(stock.low_price)}</span>
            {ownedQuantity > 0 && (
              <>
                <span>·</span>
                <span className="text-orange-400 font-semibold">
                  Owned: {ownedQuantity.toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 mt-2">
        <Button
          variant="profit"
          size="sm"
          disabled={!marketOpen || !stock.is_active}
          onClick={() => onBuy(stock)}
          leftIcon={<TrendingUp className="w-4 h-4" />}
        >
          BUY
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={!marketOpen || !stock.is_active || ownedQuantity <= 0}
          onClick={() => onSell(stock)}
          leftIcon={<TrendingDown className="w-4 h-4" />}
        >
          SELL
        </Button>
      </div>
    </GlassCard>
  );
};
