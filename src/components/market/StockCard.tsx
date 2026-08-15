import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

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

  const [tickFlash, setTickFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef(stock.current_price);

  useEffect(() => {
    if (stock.current_price !== prevPriceRef.current) {
      if (stock.current_price > prevPriceRef.current) {
        setTickFlash('up');
      } else if (stock.current_price < prevPriceRef.current) {
        setTickFlash('down');
      }
      prevPriceRef.current = stock.current_price;

      const timer = setTimeout(() => setTickFlash(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [stock.current_price]);

  const priceDiff = stock.current_price - stock.opening_price;
  const pctChange =
    stock.opening_price > 0 ? (priceDiff / stock.opening_price) * 100 : 0;
  const isUp = priceDiff >= 0;
  const pct = Math.abs(pctChange).toFixed(1);

  const formattedPrice =
    stock.current_price % 1 !== 0
      ? `₹${stock.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : formatCurrency(stock.current_price);

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-colors space-y-3.5 flex flex-col justify-between ${
        isDark
          ? 'bg-[#131B2E] border-white/5 shadow-md'
          : 'bg-white border-slate-200/80 shadow-xs'
      }`}
    >
      <div className="space-y-2">
        {/* Header: Symbol + Sector + Change % Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-base tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {stock.symbol}
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
              {stock.sector}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono ${
              isUp
                ? isDark
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : isDark
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            {isUp ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>
              {isUp ? '+' : '-'}
              {pct}%
            </span>
          </div>
        </div>

        {/* Company Name */}
        <div className="text-xs text-slate-400 font-medium truncate">
          {stock.company_name}
        </div>

        {/* Price + High/Low/Owned + Sparkline Chart */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <div
              className={`text-2xl font-black font-mono tracking-tight transition-colors duration-1000 ease-out flex items-center gap-2 ${
                tickFlash === 'up'
                  ? 'text-emerald-400'
                  : tickFlash === 'down'
                  ? 'text-rose-400'
                  : isDark
                  ? 'text-white'
                  : 'text-slate-900'
              }`}
            >
              <span>{formatCurrency(Math.round(stock.current_price))}</span>
              {marketOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 inline-block shrink-0" title="Live Market Active" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5 flex-wrap">
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

          {/* Jagged Sparkline */}
          <div className="w-24 sm:w-28 h-10 shrink-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
            >
              <path
                d={
                  isUp
                    ? 'M0,35 L20,30 L35,33 L50,22 L65,26 L80,14 L100,8'
                    : 'M0,10 L20,18 L35,14 L50,26 L65,22 L80,32 L100,36'
                }
                fill="none"
                stroke={isUp ? '#10B981' : '#F43F5E'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy={isUp ? '8' : '36'}
                r="3.5"
                fill={isUp ? '#10B981' : '#F43F5E'}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button
          onClick={() => onBuy(stock)}
          disabled={!marketOpen}
          className="w-full py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>BUY</span>
        </button>
        <button
          onClick={() => onSell(stock)}
          disabled={!marketOpen || ownedQuantity === 0}
          className="w-full py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>SELL</span>
        </button>
      </div>
    </div>
  );
};

export default StockCard;
