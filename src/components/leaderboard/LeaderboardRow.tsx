import React from 'react';
import { LeaderboardEntry } from '../../types';
import { formatWealth, formatPercent } from '../../lib/formatting';
import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentTeam?: boolean;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  isCurrentTeam = false,
}) => {
  const isTop1 = entry.rank === 1;
  const isTop2 = entry.rank === 2;
  const isTop3 = entry.rank === 3;
  const isEliminated = entry.team_status === 'ELIMINATED';

  const isProfit = entry.today_pnl > 0;
  const isLoss = entry.today_pnl < 0;

  const rankDisplay = () => {
    if (isTop1) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">🥇</span>;
    if (isTop2) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]">🥈</span>;
    if (isTop3) return <span className="text-2xl drop-shadow-[0_0_10px_rgba(217,119,6,0.4)]">🥉</span>;
    return (
      <span className="text-sm font-extrabold font-mono text-slate-400 w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
        #{entry.rank}
      </span>
    );
  };

  return (
    <div
      className={`flex items-center justify-between p-3.5 sm:p-4.5 rounded-2xl transition-all duration-200 ${
        isCurrentTeam
          ? 'bg-gradient-to-r from-orange-500/20 via-slate-900/90 to-amber-500/10 border-2 border-orange-500/60 shadow-lg shadow-orange-500/15'
          : isTop1
          ? 'glass-panel border-amber-500/40 bg-amber-500/5'
          : 'glass-panel hover:bg-slate-800/50'
      } ${isEliminated ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Rank & Team Name */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center justify-center shrink-0 w-8">
          {rankDisplay()}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
              {entry.team_name}
            </span>

            {isCurrentTeam && (
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-orange-500 text-white shadow-sm shadow-orange-500/40">
                YOU
              </span>
            )}

            {isTop1 && !isEliminated && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Crown className="w-3 h-3 text-amber-400" /> Leader
              </span>
            )}

            {isEliminated && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Eliminated
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono mt-0.5">
            <span>Cash: {formatWealth(entry.cash_balance)}</span>
            <span>·</span>
            <span>Port: {formatWealth(entry.portfolio_value)}</span>
          </div>
        </div>
      </div>

      {/* Total Wealth & Trend */}
      <div className="text-right">
        <div className="text-lg sm:text-xl font-extrabold font-display text-white tracking-tight">
          {formatWealth(entry.total_wealth)}
        </div>

        <div
          className={`flex items-center justify-end gap-1 text-xs font-bold font-mono mt-0.5 ${
            isProfit
              ? 'text-emerald-400'
              : isLoss
              ? 'text-rose-400'
              : 'text-slate-400'
          }`}
        >
          {isProfit && <TrendingUp className="w-3 h-3" />}
          {isLoss && <TrendingDown className="w-3 h-3" />}
          {!isProfit && !isLoss && <Minus className="w-3 h-3" />}
          <span>{formatPercent(entry.today_pnl_pct)}</span>
        </div>
      </div>
    </div>
  );
};
