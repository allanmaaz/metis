import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getLeaderboard } from '../../services/leaderboard';
import { Event, LeaderboardEntry } from '../../types';
import { formatCurrency, formatWealth, formatPercent } from '../../lib/formatting';
import { Trophy, Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const AdminLeaderboard: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const list = await getLeaderboard(activeEvent.id);
      setEntries(list);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  const cutoff = event?.qualification_count || 5;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5 whitespace-nowrap">
          <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
          <span>Official Event Leaderboard</span>
        </h1>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6 text-center">Rank</th>
                <th className="py-3.5 px-6">Team Name</th>
                <th className="py-3.5 px-6 text-right">Cash Balance</th>
                <th className="py-3.5 px-6 text-right">Portfolio Value</th>
                <th className="py-3.5 px-6 text-right">Total Wealth</th>
                <th className="py-3.5 px-6 text-right">Today's P/L</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center font-sans">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-base text-slate-800">
                        No Leaderboard Standings Yet
                      </h3>
                      <p className="text-xs text-slate-400">
                        Rankings will calculate automatically once competing teams are registered and begin placing trades.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => {
                const isTop1 = entry.rank === 1;
                const isQualified = entry.rank <= cutoff;
                const isEliminated = entry.team_status === 'ELIMINATED';
                const isCutoffLine = entry.rank === cutoff && index < entries.length - 1;

                return (
                  <React.Fragment key={entry.team_id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isEliminated
                          ? 'opacity-40 bg-slate-50/40'
                          : isTop1
                          ? 'bg-amber-50/30'
                          : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isTop1 ? (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-amber-500/20">
                              <Crown className="w-4 h-4" />
                            </div>
                          ) : (
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                isQualified
                                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                  : 'text-slate-400 bg-slate-100'
                              }`}
                            >
                              {entry.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Name */}
                      <td className="py-4 px-6 font-sans">
                        <div className="font-extrabold text-base text-slate-900">
                          {entry.team_name}
                        </div>
                      </td>

                      {/* Cash */}
                      <td className="py-4 px-6 text-right font-bold text-slate-700">
                        {formatCurrency(entry.cash_balance)}
                      </td>

                      {/* Portfolio Value */}
                      <td className="py-4 px-6 text-right font-bold text-slate-700">
                        {formatCurrency(entry.portfolio_value)}
                      </td>

                      {/* Total Wealth */}
                      <td className="py-4 px-6 text-right">
                        <div className="font-black text-base text-slate-900">
                          {formatCurrency(entry.total_wealth)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          ({formatWealth(entry.total_wealth)})
                        </div>
                      </td>

                      {/* Return % */}
                      <td className="py-4 px-6 text-right">
                        <div
                          className={`text-xs font-bold flex items-center justify-end gap-1 ${
                            entry.today_pnl_pct > 0
                              ? 'text-emerald-600'
                              : entry.today_pnl_pct < 0
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {entry.today_pnl_pct > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : entry.today_pnl_pct < 0 ? (
                            <TrendingDown className="w-3.5 h-3.5" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                          <span>{formatPercent(entry.today_pnl_pct)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center font-sans">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full font-mono border ${
                            isEliminated
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : isQualified
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isEliminated ? 'ELIMINATED' : isQualified ? 'QUALIFIED' : 'PENDING'}
                        </span>
                      </td>
                    </tr>

                    {/* Qualification Cutoff Demarcation Line */}
                    {isCutoffLine && (
                      <tr className="bg-amber-50/60 border-y-2 border-amber-300">
                        <td colSpan={7} className="py-2 px-6 text-center text-xs font-bold text-amber-700 uppercase tracking-widest font-mono">
                          ▲ Top {cutoff} Teams Advance to Next Round ▲
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

export default AdminLeaderboard;
