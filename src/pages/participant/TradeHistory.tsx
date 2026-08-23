import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTeamTrades } from '../../services/trade';
import { Trade } from '../../types';
import {
  History,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
} from 'lucide-react';
import { formatCurrency, formatWealth, formatQuantity, formatClockTime } from '../../lib/formatting';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import { Link } from 'react-router-dom';

export const TradeHistory: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTrades = useCallback(async () => {
    if (!participant) return;
    try {
      const tradeList = await getTeamTrades(participant.team.id);
      setTrades(tradeList);
    } catch (err) {
      console.error('Error loading trade history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [participant]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  // Universal Real-Time Sync on trade execution
  useRealtimeSubscription(['TRADE_EXECUTED', 'PORTFOLIO_CHANGED'], loadTrades, 1500);

  // Filtered trades based on selection
  const filteredTrades = trades.filter((t) => {
    if (tradeFilter === 'BUY') return t.side === 'BUY';
    if (tradeFilter === 'SELL') return t.side === 'SELL';
    return true;
  });

  const totalBuyValue = trades.filter((t) => t.side === 'BUY').reduce((acc, t) => acc + t.total_value, 0);
  const totalSellValue = trades.filter((t) => t.side === 'SELL').reduce((acc, t) => acc + t.total_value, 0);

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Header & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest font-mono">
            AUDIT TRAIL & ORDERS
          </span>
          <h1 className={`text-xl sm:text-2xl font-black font-display tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <History className="w-6 h-6 text-orange-500 shrink-0" />
            <span>Team Trade History</span>
          </h1>
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border self-start sm:self-auto ${isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-100 border-slate-200/80'}`}>
          {(['ALL', 'BUY', 'SELL'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTradeFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                tradeFilter === f
                  ? 'bg-orange-500 text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? `All (${trades.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Summary Grid with Responsive Numbers */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Total Trades */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border ${isDark ? 'bg-[#131B2E] border-white/5 shadow-md' : 'bg-white border-slate-200/80 shadow-xs'}`}>
          <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">
            Total Trades
          </span>
          <div className={`text-lg sm:text-2xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {trades.length}
          </div>
        </div>

        {/* Total Bought */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border ${isDark ? 'bg-[#131B2E] border-white/5 shadow-md' : 'bg-white border-slate-200/80 shadow-xs'}`}>
          <span className="text-[10px] font-extrabold uppercase text-emerald-400 font-mono block">
            Total Bought
          </span>
          <div className="text-base sm:text-2xl font-black font-mono text-emerald-400 mt-1 whitespace-nowrap">
            {formatWealth(totalBuyValue)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono font-medium truncate mt-0.5">
            {formatCurrency(totalBuyValue)}
          </div>
        </div>

        {/* Total Sold */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border ${isDark ? 'bg-[#131B2E] border-white/5 shadow-md' : 'bg-white border-slate-200/80 shadow-xs'}`}>
          <span className="text-[10px] font-extrabold uppercase text-rose-400 font-mono block">
            Total Sold
          </span>
          <div className="text-base sm:text-2xl font-black font-mono text-rose-400 mt-1 whitespace-nowrap">
            {formatWealth(totalSellValue)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono font-medium truncate mt-0.5">
            {formatCurrency(totalSellValue)}
          </div>
        </div>
      </div>

      {/* Trade Ledger List */}
      <div
        className={`rounded-3xl border overflow-hidden divide-y ${
          isDark
            ? 'bg-[#131B2E] border-white/5 divide-white/5 shadow-md'
            : 'bg-white border-slate-200/80 divide-slate-100 shadow-xs'
        }`}
      >
        {filteredTrades.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
            <History className="w-8 h-8 mx-auto text-slate-500 opacity-40" />
            <p>No {tradeFilter !== 'ALL' ? tradeFilter.toLowerCase() : ''} trades recorded yet.</p>
            <Link
              to="/market"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Visit Market Board</span>
            </Link>
          </div>
        ) : (
          filteredTrades.map((t) => {
            const isBuy = t.side === 'BUY';
            return (
              <div
                key={t.id}
                className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Left: Side Badge, Symbol & Quantity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      isBuy
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isBuy ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-base font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t.stock?.symbol || 'STOCK'}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md font-mono ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                        }`}
                      >
                        {t.side}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 whitespace-nowrap">
                      {formatQuantity(t.quantity)} shares @ {formatCurrency(t.price)}
                    </div>
                  </div>
                </div>

                {/* Right: Total Value & Time */}
                <div className="text-right shrink-0">
                  <div className={`font-black text-sm sm:text-base font-mono whitespace-nowrap ${isBuy ? (isDark ? 'text-slate-200' : 'text-slate-800') : 'text-emerald-500'}`}>
                    {isBuy ? '-' : '+'}{formatCurrency(t.total_value)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {formatClockTime(t.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
