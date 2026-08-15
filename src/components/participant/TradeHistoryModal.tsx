import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../context/ThemeContext';
import { getTeamTrades } from '../../services/trade';
import { Trade } from '../../types';
import { formatCurrency, formatClockTime } from '../../lib/formatting';
import { Receipt, ArrowUpRight, ArrowDownRight, Clock, User, CheckCircle2 } from 'lucide-react';

interface TradeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  teamName?: string;
}

export const TradeHistoryModal: React.FC<TradeHistoryModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [trades, setTrades] = useState<Trade[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  useEffect(() => {
    if (isOpen && teamId) {
      getTeamTrades(teamId).then(setTrades);
    }
  }, [isOpen, teamId]);

  const filteredTrades = trades.filter((t) => {
    if (filter === 'ALL') return true;
    return t.side === filter;
  });

  const buyCount = trades.filter((t) => t.side === 'BUY').length;
  const sellCount = trades.filter((t) => t.side === 'SELL').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trade & Order History"
      subtitle={`Complete execution audit trail for Team ${teamName || 'Alpha'}`}
    >
      <div className="space-y-4 text-xs">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Orders</span>
            <span className="text-base font-black font-mono text-orange-500 mt-0.5 block">
              {trades.length}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Buy Orders</span>
            <span className="text-base font-black font-mono text-emerald-500 mt-0.5 block">
              {buyCount}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-2xl border text-center ${
              isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Sell Orders</span>
            <span className="text-base font-black font-mono text-rose-500 mt-0.5 block">
              {sellCount}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1">
          {(['ALL', 'BUY', 'SELL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-orange-500 text-white shadow-xs'
                  : isDark
                  ? 'bg-[#1E293B] text-slate-400 border border-white/5 hover:bg-white/5'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Trades List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic font-medium">
              No trade executions found.
            </div>
          ) : (
            filteredTrades.map((trade) => {
              const isBuy = trade.side === 'BUY';
              return (
                <div
                  key={trade.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border shrink-0 ${
                        isBuy
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {trade.side}
                    </span>

                    <div className="min-w-0">
                      <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {trade.stock?.symbol || 'STOCK'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatClockTime(trade.created_at)}
                        </span>
                        {trade.team_member?.full_name && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[90px]">
                              {trade.team_member.full_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {trade.quantity.toLocaleString('en-IN')} @ {formatCurrency(trade.price)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {formatCurrency(trade.total_value)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-colors"
        >
          Close History
        </button>
      </div>
    </Modal>
  );
};

export default TradeHistoryModal;
