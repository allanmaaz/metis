import React from 'react';
import { Stock } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const priceDiff = stock.current_price - stock.opening_price;
  const pctChange = stock.opening_price > 0 ? (priceDiff / stock.opening_price) * 100 : 0;
  const isPositive = priceDiff > 0;
  const isNegative = priceDiff < 0;

  return (
    <div
      className={`rounded-3xl p-5 transition-all flex flex-col justify-between h-full border ${
        isDark
          ? 'bg-[#131B2E] border-white/5 shadow-md'
          : 'bg-white border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Header: Symbol & Sector */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-lg font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stock.symbol}
              </h4>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
              {stock.company_name}
            </p>
          </div>

          {/* Change Indicator Pill */}
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-xl border ${
              isPositive
                ? isDark
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : isNegative
                ? isDark
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
            <span>{formatPercent(pctChange)}</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="my-3">
          <div className={`text-2xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(stock.current_price)}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
            <span>H: {formatCurrency(stock.high_price)}</span>
            <span>·</span>
            <span>L: {formatCurrency(stock.low_price)}</span>
            {ownedQuantity > 0 && (
              <>
                <span>·</span>
                <span className="text-orange-500 font-bold">
                  Owned: {ownedQuantity.toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`grid grid-cols-2 gap-2 pt-3 border-t mt-2 ${
          isDark ? 'border-white/5' : 'border-slate-100'
        }`}
      >
        <button
          onClick={() => onBuy(stock)}
          disabled={!marketOpen}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-colors disabled:opacity-50 ${
            isDark
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => onSell(stock)}
          disabled={!marketOpen || ownedQuantity === 0}
          className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-colors disabled:opacity-50 ${
            isDark
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
          }`}
        >
          SELL
        </button>
      </div>
    </div>
  );
};

export default StockCard;
