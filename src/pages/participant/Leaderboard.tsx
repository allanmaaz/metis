import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard } from '../../services/leaderboard';
import { LeaderboardEntry } from '../../types';
import { LeaderboardRow } from '../../components/leaderboard/LeaderboardRow';
import { Trophy, Award, Radio, Crown, ShieldAlert } from 'lucide-react';
import { formatWealth } from '../../lib/formatting';

export const Leaderboard: React.FC = () => {
  const { participant } = useAuth();
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
    const interval = setInterval(loadLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];
  const qualificationCutoff = participant?.event.qualification_count || 5;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            Live Rankings
          </h2>
          <p className="text-xs text-slate-400">
            Ranked strictly by Total Wealth (Cash Balance + Live Portfolio Valuation)
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>REALTIME</span>
        </div>
      </div>

      {/* Top 3 Podium Cards (on medium+ screens) */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 pb-2 items-end">
          {/* #2 Silver */}
          <div className="glass-panel p-3.5 sm:p-5 rounded-2xl text-center space-y-2 border-slate-400/30 bg-slate-800/40 order-1">
            <span className="text-3xl sm:text-4xl block">🥈</span>
            <div className="font-extrabold text-sm sm:text-base font-display text-white truncate">
              {top2.team_name}
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">
              {formatWealth(top2.total_wealth)}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Rank #2
            </span>
          </div>

          {/* #1 Gold Crown */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl text-center space-y-2.5 border-amber-500/50 bg-gradient-to-b from-amber-500/15 to-slate-900 shadow-xl shadow-amber-500/10 order-2 -translate-y-2 sm:-translate-y-4">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-4xl sm:text-5xl block drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              🥇
            </span>
            <div className="font-extrabold text-base sm:text-lg font-display text-amber-300 truncate">
              {top1.team_name}
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-white">
              {formatWealth(top1.total_wealth)}
            </div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 inline-block">
              Market Leader
            </span>
          </div>

          {/* #3 Bronze */}
          <div className="glass-panel p-3.5 sm:p-5 rounded-2xl text-center space-y-2 border-amber-700/30 bg-slate-900/40 order-3">
            <span className="text-3xl sm:text-4xl block">🥉</span>
            <div className="font-extrabold text-sm sm:text-base font-display text-white truncate">
              {top3.team_name}
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-slate-200">
              {formatWealth(top3.total_wealth)}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 block">
              Rank #3
            </span>
          </div>
        </div>
      )}

      {/* Qualification Line Indicator */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
        <Award className="w-4 h-4 text-orange-400 shrink-0" />
        <span>
          <strong>QUALIFICATION CUTOFF:</strong> Top {qualificationCutoff} teams at the end of the round advance to the Final Round.
        </span>
      </div>

      {/* Leaderboard Table / Rows */}
      <div className="space-y-2.5">
        {entries.map((entry, index) => (
          <React.Fragment key={entry.team_id}>
            <LeaderboardRow
              entry={entry}
              isCurrentTeam={entry.team_id === participant?.team.id}
            />
            {index === qualificationCutoff - 1 && index < entries.length - 1 && (
              <div className="flex items-center gap-2 my-3 text-[11px] font-bold uppercase tracking-wider text-amber-400 px-2">
                <div className="flex-1 border-t border-dashed border-amber-500/40" />
                <span>▲ QUALIFIED ZONE (TOP {qualificationCutoff}) ▲</span>
                <div className="flex-1 border-t border-dashed border-amber-500/40" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
