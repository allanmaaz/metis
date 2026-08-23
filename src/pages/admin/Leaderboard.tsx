import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent, setLeaderboardVisibility } from '../../services/event';
import { getLeaderboard } from '../../services/leaderboard';
import { Event, LeaderboardEntry } from '../../types';
import { formatCurrency, formatWealth, formatPercent, formatTeamName } from '../../lib/formatting';
import { Trophy, Crown, TrendingUp, TrendingDown, Minus, Eye, EyeOff } from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const AdminLeaderboard: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isToggling, setIsToggling] = useState(false);

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

  // Instant sub-second real-time sync
  useRealtimeSubscription(
    ['TRADE_EXECUTED', 'PORTFOLIO_CHANGED', 'TEAM_UPDATED', 'STOCK_PRICE_UPDATED', 'LEADERBOARD_UPDATED', 'MARKET_SESSION_CHANGED'],
    loadLeaderboard,
    800
  );

  const isVisibleForParticipants = event?.is_leaderboard_visible !== false;

  const handleToggleVisibility = async () => {
    if (!event || isToggling) return;
    setIsToggling(true);
    try {
      const newVisibility = !isVisibleForParticipants;
      await setLeaderboardVisibility(event.id, newVisibility);
      setEvent((prev) => prev ? { ...prev, is_leaderboard_visible: newVisibility } : prev);
    } catch (err) {
      console.error('Error toggling leaderboard visibility:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const cutoff = event?.qualification_count || 5;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Participant Visibility Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5 whitespace-nowrap">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
            <span>Official Event Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time standings across all competing teams in {event?.name || 'METIS'}.
          </p>
        </div>

        {/* Visibility Toggle Control Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={isToggling}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 border transition-all shadow-xs cursor-pointer ${
              isVisibleForParticipants
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100/80'
            }`}
          >
            {isVisibleForParticipants ? (
              <>
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Participants: LEADERBOARD VISIBLE</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-rose-600" />
                <span>Participants: HIDDEN (Trade History Mode)</span>
              </>
            )}
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-lg bg-white/80 border border-current shadow-xs">
              {isVisibleForParticipants ? 'Click to Hide' : 'Click to Show'}
            </span>
          </button>
        </div>
      </div>

      {/* 1. Mobile Cards View (Visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {entries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-sm font-medium border border-slate-200/80 shadow-sm">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
            No leaderboard standings yet.
          </div>
        ) : (
          entries.map((entry, index) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;
            const isQualified = entry.rank <= cutoff;
            const isEliminated = entry.team_status === 'ELIMINATED';
            const isCutoffLine = entry.rank === cutoff && index < entries.length - 1;
            const isPositive = entry.today_pnl_pct >= 0;

            return (
              <React.Fragment key={entry.team_id}>
                <div
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                    isEliminated
                      ? 'opacity-50 border-slate-200 bg-slate-50'
                      : isTop1
                      ? 'border-amber-400/80 bg-gradient-to-r from-amber-50/40 via-white to-white'
                      : isTop2
                      ? 'border-slate-300 bg-gradient-to-r from-slate-50/60 via-white to-white'
                      : isTop3
                      ? 'border-amber-600/30 bg-gradient-to-r from-amber-900/5 via-white to-white'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Rank & Team Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {isTop1 ? (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-amber-500/25">
                            <Crown className="w-5 h-5" />
                          </div>
                        ) : isTop2 ? (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            <span className="font-mono font-black text-slate-800">#2</span>
                          </div>
                        ) : isTop3 ? (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            <span className="font-mono font-black text-amber-100">#3</span>
                          </div>
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                              isQualified
                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            #{entry.rank}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-base text-slate-900 truncate whitespace-nowrap">
                          {formatTeamName(entry.team_name)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isEliminated ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Eliminated
                            </span>
                          ) : isQualified ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Qualifying Top {cutoff}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                              Active Trader
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Net Worth & Return */}
                    <div className="text-right shrink-0">
                      <div className="font-black text-base font-mono text-slate-900 tracking-tight whitespace-nowrap">
                        {formatWealth(entry.total_wealth)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-bold font-mono mt-0.5 whitespace-nowrap ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{formatPercent(entry.today_pnl_pct)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash & Portfolio breakdown pills */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 text-[10px] block font-medium">Cash Balance</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px] whitespace-nowrap">
                        {formatWealth(entry.cash_balance)}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-right">
                      <span className="text-slate-400 text-[10px] block font-medium">Portfolio Assets</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px] whitespace-nowrap">
                        {formatWealth(entry.portfolio_value)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qualification Cutoff Indicator */}
                {isCutoffLine && (
                  <div className="flex items-center gap-3 py-1 my-1">
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1" />
                    <span className="text-[10px] font-black font-mono text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                      Qualification Cutoff (Top {cutoff})
                    </span>
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1" />
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table View (Visible on screens ≥ md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">Rank</th>
                <th className="py-3.5 px-6 whitespace-nowrap min-w-[140px]">Team Name</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Cash Balance</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Portfolio Value</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Total Wealth</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Today's P/L</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">Status</th>
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
                        <td className="py-4 px-6 text-center whitespace-nowrap">
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
                        <td className="py-4 px-6 font-sans whitespace-nowrap">
                          <div className="font-extrabold text-base text-slate-900">
                            {formatTeamName(entry.team_name)}
                          </div>
                        </td>

                        {/* Cash */}
                        <td className="py-4 px-6 text-right font-bold text-slate-700 whitespace-nowrap font-mono">
                          {formatCurrency(entry.cash_balance)}
                        </td>

                        {/* Portfolio Value */}
                        <td className="py-4 px-6 text-right font-bold text-slate-700 whitespace-nowrap font-mono">
                          {formatCurrency(entry.portfolio_value)}
                        </td>

                        {/* Total Wealth */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="font-black text-base text-slate-900 font-mono">
                            {formatCurrency(entry.total_wealth)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            ({formatWealth(entry.total_wealth)})
                          </div>
                        </td>

                        {/* Return % */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div
                            className={`font-black text-sm inline-flex items-center gap-1 ${
                              entry.today_pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {entry.today_pnl > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : entry.today_pnl < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <Minus className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>{formatPercent(entry.today_pnl_pct)}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center font-sans whitespace-nowrap">
                          {isEliminated ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-600 border border-rose-200/80 whitespace-nowrap">
                              Eliminated
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200/80 whitespace-nowrap">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Qualification Cutoff Separator */}
                      {isCutoffLine && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-60" />
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
