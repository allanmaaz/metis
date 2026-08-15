import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getAllTrades } from '../../services/trade';
import { Event, Trade } from '../../types';
import { formatCurrency, formatQuantity, formatClockTime } from '../../lib/formatting';
import { Receipt, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
    const interval = setInterval(loadTrades, 3000);
    return () => clearInterval(interval);
  }, [loadTrades]);

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stock?.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.team_member?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide = sideFilter === 'ALL' || t.side === sideFilter;
    return matchesSearch && matchesSide;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-8 h-8 text-orange-500" />
            Trade Flow Monitor
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log of all executed participant transactions with execution prices & timestamps.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by team name, member name, or stock symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {(['ALL', 'BUY', 'SELL'] as const).map((side) => (
            <button
              key={side}
              onClick={() => setSideFilter(side)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sideFilter === side
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {side}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Trader Member</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredTrades.map((trade) => {
                const isBuy = trade.side === 'BUY';
                return (
                  <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatClockTime(trade.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white">
                      Team {trade.team?.name || '---'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {trade.team_member?.full_name || 'Team Member'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {trade.stock?.symbol || 'STOCK'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-200">
                      {formatQuantity(trade.quantity)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {formatCurrency(trade.total_value)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
