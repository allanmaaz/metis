import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { StockLogo } from '../common/StockLogo';

interface StockCardProps {
  stock: Stock;
  ownedQuantity?: number;
  marketOpen?: boolean;
  isTrader?: boolean;
  onBuy: (stock: Stock) => void;
  onSell: (stock: Stock) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  ownedQuantity = 0,
  marketOpen = true,
  isTrader = true,
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
      className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 space-y-3.5 flex flex-col justify-between ${
        isDark
          ? 'bg-gradient-to-b from-[#141C2E]/95 to-[#0E1524]/95 border-white/[0.08] hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5'
          : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="space-y-3">
        {/* Header: Logo + Symbol + Sector + Sparkline */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <StockLogo
              symbol={stock.symbol}
              name={stock.company_name}
              sector={stock.sector}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-black text-base tracking-tight font-display ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {stock.symbol}
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-400 font-mono">
                  {stock.sector}
                </span>
              </div>
              {/* Company Name */}
              <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                {stock.company_name}
              </div>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="w-24 sm:w-28 h-9 shrink-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 36"
              preserveAspectRatio="none"
            >
              <path
                d={
                  isUp
                    ? 'M0,30 L20,26 L35,28 L50,18 L65,22 L80,10 L100,6'
                    : 'M0,8 L20,16 L35,12 L50,24 L65,20 L80,28 L100,32'
                }
                fill="none"
                stroke={isUp ? '#10B981' : '#F43F5E'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy={isUp ? '6' : '32'}
                r="3.5"
                fill={isUp ? '#10B981' : '#F43F5E'}
              />
            </svg>
          </div>
        </div>

        {/* Price + High/Low/Owned */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`text-xl sm:text-2xl font-black font-mono tracking-tight transition-colors duration-1000 ease-out flex items-center gap-1.5 ${
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

              {/* % Change Pill */}
              <div
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black font-mono shrink-0 border ${
                  isUp
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : isDark
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>
                  {isUp ? '+' : '-'}
                  {pct}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5 flex-wrap">
              <span>H: {formatCurrency(stock.high_price)}</span>
              <span>·</span>
              <span>L: {formatCurrency(stock.low_price)}</span>
              {ownedQuantity > 0 && (
                <>
                  <span>·</span>
                  <span className="text-orange-400 font-bold">
                    Owned: {ownedQuantity.toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
        <button
          onClick={() => onBuy(stock)}
          disabled={!marketOpen || !isTrader}
          title={!isTrader ? 'Only your team\'s designated primary trader can execute trades' : undefined}
          className="w-full py-2.5 rounded-xl text-xs font-black font-mono tracking-wide bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-xs shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{isTrader ? 'BUY' : 'BUY (VIEW)'}</span>
        </button>
        <button
          onClick={() => onSell(stock)}
          disabled={!marketOpen || !isTrader || ownedQuantity === 0}
          title={!isTrader ? 'Only your team\'s designated primary trader can execute trades' : undefined}
          className="w-full py-2.5 rounded-xl text-xs font-black font-mono tracking-wide bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500 hover:to-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-transparent transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>{isTrader ? 'SELL' : 'SELL (VIEW)'}</span>
        </button>
      </div>
    </div>
  );
};

export default StockCard;
