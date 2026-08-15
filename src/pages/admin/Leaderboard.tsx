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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400" />
          Official Event Leaderboard
        </h1>
        <p className="text-xs text-slate-400">
          Computed rankings across all teams. Top {cutoff} teams qualify for the next competition stage.
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Team Name</th>
                <th className="py-3.5 px-4 text-right">Cash Balance</th>
                <th className="py-3.5 px-4 text-right">Portfolio Value</th>
                <th className="py-3.5 px-4 text-right">Total Wealth</th>
                <th className="py-3.5 px-4 text-right">Today's P/L</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {entries.map((entry, index) => {
                const isTop1 = entry.rank === 1;
                const isQualified = index < cutoff;
                const isEliminated = entry.team_status === 'ELIMINATED';

                return (
                  <tr
                    key={entry.team_id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isTop1 ? 'bg-amber-500/5' : ''
                    } ${isEliminated ? 'opacity-60 grayscale' : ''}`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      {isTop1 ? (
                        <span className="text-xl">🥇</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="font-extrabold text-slate-400">#{entry.rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-bold text-white text-base">
                      <div className="flex items-center gap-2">
                        <span>Team {entry.team_name}</span>
                        {isTop1 && (
                          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                            Leader
                          </span>
                        )}
                        {isQualified && !isTop1 && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            Qualified
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {formatCurrency(entry.cash_balance)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {formatCurrency(entry.portfolio_value)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-base text-white">
                      {formatWealth(entry.total_wealth)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-bold ${
                          entry.today_pnl > 0
                            ? 'text-emerald-400'
                            : entry.today_pnl < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {formatPercent(entry.today_pnl_pct)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isEliminated
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {entry.team_status}
                      </span>
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
