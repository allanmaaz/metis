import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getAllTrades } from '../../services/trade';
import { Event, Trade } from '../../types';
import { formatCurrency, formatWealth, formatQuantity, formatClockTime, formatTeamName } from '../../lib/formatting';
import {
  Receipt,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  User,
  Building2,
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const AdminTrades: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const loadTrades = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const list = await getAllTrades(activeEvent.id);
      setTrades(list);
    } catch (err) {
      console.error('Error loading trades:', err);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  useRealtimeSubscription(['TRADE_EXECUTED', 'PORTFOLIO_CHANGED'], loadTrades, 1500);

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      (t.team?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.stock?.symbol || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.team_member?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide = sideFilter === 'ALL' || t.side === sideFilter;
    return matchesSearch && matchesSide;
  });

  // Analytics Metrics
  const totalVolume = trades.reduce((acc, t) => acc + t.total_value, 0);
  const totalBuyVolume = trades.filter((t) => t.side === 'BUY').reduce((acc, t) => acc + t.total_value, 0);
  const totalSellVolume = trades.filter((t) => t.side === 'SELL').reduce((acc, t) => acc + t.total_value, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest font-mono">
            ADMIN AUDIT LOG
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5 whitespace-nowrap">
            <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
            <span>Trade Flow Monitor</span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black font-mono border border-emerald-200 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Order Stream</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Trades Executed */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">
            Total Trades Executed
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {trades.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Across all participating teams
          </div>
        </div>

        {/* Total Buy Orders Flow */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-emerald-600 font-mono block">
            Total Buy Volume
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 whitespace-nowrap">
            {formatWealth(totalBuyVolume)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono font-medium truncate">
            {formatCurrency(totalBuyVolume)}
          </div>
        </div>

        {/* Total Sell Orders Flow */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-rose-600 font-mono block">
            Total Sell Volume
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600 whitespace-nowrap">
            {formatWealth(totalSellVolume)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono font-medium truncate">
            {formatCurrency(totalSellVolume)}
          </div>
        </div>
      </div>

      {/* Search & Side Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by team, trader, or stock symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/80 self-start sm:self-auto shadow-xs">
          {(['ALL', 'BUY', 'SELL'] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSideFilter(side)}
              className={`text-xs px-4 py-2 rounded-xl font-black font-mono transition-all cursor-pointer ${
                sideFilter === side
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {side} {side === 'ALL' && `(${trades.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6 whitespace-nowrap">Time</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[130px]">Team</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Trader Member</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">Action</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Stock</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Quantity</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Price</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-sm font-medium">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                    No trade executions matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => {
                  const isBuy = t.side === 'BUY';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Time */}
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500 whitespace-nowrap">
                        {formatClockTime(t.created_at)}
                      </td>

                      {/* Team */}
                      <td className="py-4 px-6 font-sans whitespace-nowrap">
                        <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/70 font-mono">
                          {formatTeamName(t.team?.name)}
                        </span>
                      </td>

                      {/* Trader Member */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-xs">
                            {(t.team_member?.full_name || 'T')[0]}
                          </div>
                          <span className="text-slate-700 font-semibold text-xs">
                            {t.team_member?.full_name || 'Team Action'}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg font-mono inline-flex items-center gap-1 border ${
                            isBuy
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-2xs'
                              : 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                          }`}
                        >
                          {isBuy ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {t.side}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-black text-[10px] shadow-xs">
                            {(t.stock?.symbol || 'STK').slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-black text-sm text-slate-900 font-display">
                              {t.stock?.symbol || 'STOCK'}
                            </div>
                            {t.stock?.company_name && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {t.stock.company_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                        {formatQuantity(t.quantity)} <span className="text-[10px] text-slate-400 font-sans">shares</span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                        {formatCurrency(t.price)}
                      </td>

                      {/* Total Value */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className={`font-mono font-black text-sm ${isBuy ? 'text-slate-900' : 'text-emerald-600'}`}>
                          {isBuy ? '-' : '+'}{formatCurrency(t.total_value)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          ({formatWealth(t.total_value)})
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrades;

