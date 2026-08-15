import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getAllTrades } from '../../services/trade';
import { Event, Trade } from '../../types';
import { formatCurrency, formatQuantity, formatClockTime } from '../../lib/formatting';
import { Receipt, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      t.team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stock?.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.team_member?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide = sideFilter === 'ALL' || t.side === sideFilter;
    return matchesSearch && matchesSide;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-orange-500" />
            Trade Flow Monitor
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by team name, member name, or stock symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200/80 self-start sm:self-auto shadow-xs">
          {(['ALL', 'BUY', 'SELL'] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSideFilter(side)}
              className={`text-xs px-4 py-2 rounded-xl font-extrabold transition-all ${
                sideFilter === side
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {side}
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
                <th className="py-3.5 px-6">Time</th>
                <th className="py-3.5 px-6">Team</th>
                <th className="py-3.5 px-6">Trader Member</th>
                <th className="py-3.5 px-6 text-center">Action</th>
                <th className="py-3.5 px-6">Stock</th>
                <th className="py-3.5 px-6 text-right">Quantity</th>
                <th className="py-3.5 px-6 text-right">Price</th>
                <th className="py-3.5 px-6 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No trades executed yet.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Time */}
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-500">
                      {formatClockTime(t.created_at)}
                    </td>

                    {/* Team */}
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      {t.team?.name || 'Unknown Team'}
                    </td>

                    {/* Trader Member */}
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {t.team_member?.full_name || 'Team Action'}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono inline-flex items-center gap-0.5 border ${
                          t.side === 'BUY'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        {t.side === 'BUY' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {t.side}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-6 font-black font-mono text-slate-900">
                      {t.stock?.symbol || 'STOCK'}
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      {formatQuantity(t.quantity)}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(t.price)}
                    </td>

                    {/* Total Value */}
                    <td className="py-4 px-6 text-right font-mono font-black text-slate-900">
                      {formatCurrency(t.total_value)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrades;
