import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getLeaderboard } from '../../services/leaderboard';
import { getActiveEvent } from '../../services/event';
import { getTeamTrades } from '../../services/trade';
import { Event, LeaderboardEntry, Trade } from '../../types';
import {
  Trophy,
  Crown,
  Radio,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
  ShoppingCart,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatWealth, formatPercent, formatQuantity, formatClockTime } from '../../lib/formatting';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import { Link } from 'react-router-dom';

export const Leaderboard: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [event, setEvent] = useState<Event | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const loadData = useCallback(async () => {
    if (!participant) return;
    try {
      const [activeEvent, lbData, tradeList] = await Promise.all([
        getActiveEvent(),
        getLeaderboard(participant.event.id),
        getTeamTrades(participant.team.id),
      ]);
      setEvent(activeEvent);
      setEntries(lbData);
      setTrades(tradeList);
    } catch (err) {
      console.error('Error loading standings or trade history:', err);
    }
  }, [participant]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Universal Real-Time Sync
  useRealtimeSubscription(
    ['TRADE_EXECUTED', 'PORTFOLIO_CHANGED', 'LEADERBOARD_UPDATED', 'TEAM_UPDATED', 'STOCK_PRICE_UPDATED', 'MARKET_SESSION_CHANGED'],
    loadData,
    1500
  );

  const isLeaderboardVisible = event?.is_leaderboard_visible !== false;
  const qualificationCutoff = event?.qualification_count || participant?.event.qualification_count || 5;

  // Filtered trades for history mode
  const filteredTrades = trades.filter((t) => {
    if (tradeFilter === 'BUY') return t.side === 'BUY';
    if (tradeFilter === 'SELL') return t.side === 'SELL';
    return true;
  });

  const totalBuyValue = trades.filter((t) => t.side === 'BUY').reduce((acc, t) => acc + t.total_value, 0);
  const totalSellValue = trades.filter((t) => t.side === 'SELL').reduce((acc, t) => acc + t.total_value, 0);

  // -------------------------------------------------------------
  // MODE 1: TRADE HISTORY MODE (When Admin hides the leaderboard)
  // -------------------------------------------------------------
  if (!isLeaderboardVisible) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto pb-12">
        {/* Admin Freeze Notice Banner */}
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-amber-400 font-display">
              Public Leaderboard Hidden by Host
            </h3>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Competitive rankings are currently obscured by tournament administration for strategy. Below is your team's live <strong>Order Book & Trade Execution History</strong>.
            </p>
          </div>
        </div>

        {/* Header & Stats Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest font-mono">
              AUDIT TRAIL & ORDERS
            </span>
            <h1 className={`text-xl sm:text-2xl font-black font-display tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <History className="w-6 h-6 text-orange-500 shrink-0" />
              <span>Team Trade History</span>
            </h1>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-800/60 border border-slate-700/80 self-start sm:self-auto">
            {(['ALL', 'BUY', 'SELL'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTradeFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                  tradeFilter === f
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'ALL' ? `All (${trades.length})` : f}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats Summary Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#131B2E] border-white/5' : 'bg-white border-slate-200/80'}`}>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono block">
              Total Trades
            </span>
            <div className={`text-lg sm:text-xl font-black font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {trades.length}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#131B2E] border-white/5' : 'bg-white border-slate-200/80'}`}>
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 font-mono block">
              Total Bought
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-0.5 truncate">
              {formatCurrency(totalBuyValue)}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#131B2E] border-white/5' : 'bg-white border-slate-200/80'}`}>
            <span className="text-[10px] font-extrabold uppercase text-rose-400 font-mono block">
              Total Sold
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-rose-400 mt-0.5 truncate">
              {formatCurrency(totalSellValue)}
            </div>
          </div>
        </div>

        {/* Trade Ledger List */}
        <div
          className={`rounded-3xl border overflow-hidden divide-y ${
            isDark
              ? 'bg-[#131B2E] border-white/5 divide-white/5 shadow-md'
              : 'bg-white border-slate-200/80 divide-slate-100 shadow-xs'
          }`}
        >
          {filteredTrades.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
              <History className="w-8 h-8 mx-auto text-slate-500 opacity-40" />
              <p>No {tradeFilter !== 'ALL' ? tradeFilter.toLowerCase() : ''} trades recorded yet.</p>
              <Link
                to="/market"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Visit Market Board</span>
              </Link>
            </div>
          ) : (
            filteredTrades.map((t) => {
              const isBuy = t.side === 'BUY';
              return (
                <div
                  key={t.id}
                  className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left: Side Badge, Symbol & Quantity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isBuy
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isBuy ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-base font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t.stock?.symbol || 'STOCK'}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md font-mono ${
                            isBuy
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                          }`}
                        >
                          {t.side}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatQuantity(t.quantity)} shares @ {formatCurrency(t.price)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Value & Time */}
                  <div className="text-right shrink-0">
                    <div className={`font-black text-sm sm:text-base font-mono ${isBuy ? 'text-slate-200' : 'text-emerald-400'}`}>
                      {isBuy ? '-' : '+'}{formatCurrency(t.total_value)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatClockTime(t.created_at)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODE 2: LIVE COMPETITIVE LEADERBOARD (When Admin enables it)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black font-display tracking-tight flex items-center gap-2 whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <span>Live Standings</span>
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
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-black text-sm tracking-tight truncate whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                      {formatCurrency(entry.total_wealth)}
                    </div>
                    <div
                      className={`text-[10px] font-bold font-mono flex items-center justify-end gap-1 ${
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
                      <span>{formatPercent(entry.today_pnl_pct)} ({formatWealth(entry.total_wealth)})</span>
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

