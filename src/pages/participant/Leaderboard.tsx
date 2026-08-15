import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getLeaderboard } from '../../services/leaderboard';
import { LeaderboardEntry } from '../../types';
import { Trophy, Crown, Radio, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatWealth, formatPercent } from '../../lib/formatting';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const Leaderboard: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const loadLeaderboard = useCallback(async () => {
    if (!participant) return;
    try {
      const data = await getLeaderboard(participant.event.id);
      setEntries(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  }, [participant]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Universal Real-Time Sync
  useRealtimeSubscription(
    ['TRADE_EXECUTED', 'PORTFOLIO_CHANGED', 'LEADERBOARD_UPDATED', 'TEAM_UPDATED', 'STOCK_PRICE_UPDATED'],
    loadLeaderboard,
    1500
  );

  const qualificationCutoff = participant?.event.qualification_count || 5;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black font-display tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Trophy className="w-6 h-6 text-amber-500" />
            Live Standings
          </h2>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div
        className={`rounded-3xl border overflow-hidden divide-y ${
          isDark
            ? 'bg-[#131B2E] border-white/5 divide-white/5 shadow-md'
            : 'bg-white border-slate-200/80 divide-slate-100 shadow-xs'
        }`}
      >
        {entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No rankings available yet.
          </div>
        ) : (
          entries.map((entry, index) => {
            const isTop1 = entry.rank === 1;
            const isQualified = entry.rank <= qualificationCutoff;
            const isMyTeam = entry.team_id === participant?.team.id;
            const isEliminated = entry.team_status === 'ELIMINATED';
            const isCutoffLine = entry.rank === qualificationCutoff && index < entries.length - 1;

            return (
              <React.Fragment key={entry.team_id}>
                <div
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isMyTeam
                      ? isDark
                        ? 'bg-orange-500/10 border-l-4 border-l-orange-500'
                        : 'bg-orange-50/70 border-l-4 border-l-orange-500'
                      : isEliminated
                      ? 'opacity-40 bg-slate-500/5'
                      : isDark
                      ? 'hover:bg-white/5'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Rank & Team Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center shrink-0">
                      {isTop1 ? (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Crown className="w-4 h-4" />
                        </div>
                      ) : (
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono ${
                            isQualified
                              ? isDark
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-orange-50 text-orange-600 border border-orange-200'
                              : isDark
                              ? 'text-slate-400 bg-white/5'
                              : 'text-slate-400 bg-slate-100'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black text-sm tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {entry.team_name}
                        </span>
                        {isMyTeam && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-orange-500 text-white font-mono shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wealth & Return */}
                  <div className="text-right shrink-0">
                    <div className={`font-black text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formatWealth(entry.total_wealth)}
                    </div>
                    <div
                      className={`text-[10px] font-bold font-mono flex items-center justify-end gap-0.5 ${
                        entry.today_pnl_pct > 0
                          ? 'text-emerald-500'
                          : entry.today_pnl_pct < 0
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {entry.today_pnl_pct > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : entry.today_pnl_pct < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>{formatPercent(entry.today_pnl_pct)}</span>
                    </div>
                  </div>
                </div>

                {/* Qualification Cutoff Marker */}
                {isCutoffLine && (
                  <div
                    className={`px-4 py-1.5 flex items-center justify-between text-[10px] font-extrabold uppercase font-mono ${
                      isDark
                        ? 'bg-amber-500/10 border-y border-amber-500/20 text-amber-400'
                        : 'bg-amber-50 border-y border-amber-200 text-amber-700'
                    }`}
                  >
                    <span>--- TOP {qualificationCutoff} ADVANCE TO FINALS ---</span>
                    <span>CUTOFF</span>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
