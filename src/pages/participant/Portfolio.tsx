import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTeamHoldings, getTeamPortfolioSummary } from '../../services/portfolio';
import { getTeamTrades, sellStock } from '../../services/trade';
import { getCurrentMarketSession } from '../../services/market';
import { Holding, PortfolioSummary, Trade, MarketSession } from '../../types';
import { SellModal } from '../../components/market/SellModal';
import { formatCurrency, formatWealth, formatPercent, formatClockTime } from '../../lib/formatting';
import {
  Briefcase,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const Portfolio: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [session, setSession] = useState<MarketSession | null>(null);

  const [activeSellHolding, setActiveSellHolding] = useState<Holding | null>(null);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!participant) return;
    const teamId = participant.team.id;
    const eventId = participant.event.id;

    try {
      const [holdList, portSummary, tradeList, curSession] = await Promise.all([
        getTeamHoldings(teamId),
        getTeamPortfolioSummary(teamId, eventId),
        getTeamTrades(teamId),
        getCurrentMarketSession(eventId),
      ]);

      setHoldings(holdList);
      setSummary(portSummary);
      setTrades(tradeList);
      setSession(curSession);
    } catch (err) {
      console.error('Error loading portfolio:', err);
    }
  }, [participant]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Universal Real-Time Sync
  useRealtimeSubscription(
    ['TRADE_EXECUTED', 'PORTFOLIO_CHANGED', 'STOCK_PRICE_UPDATED', 'TEAM_UPDATED', 'MARKET_SESSION_CHANGED'],
    loadPortfolio,
    1500
  );

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully liquidated ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadPortfolio();
    }
    return res;
  };

  const isMarketOpen = session?.status === 'OPEN';
  const cashBalance = participant?.team.cash_balance || 42000000;
  const portfolioVal = summary?.current_value || 0;
  const totalWealth = summary?.total_wealth || cashBalance + portfolioVal;
  const totalPnL = summary?.total_pnl || 0;
  const pnlPct = summary?.unrealized_pnl_pct || 0;
  const isProfitable = totalPnL >= 0;

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-black font-display tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Briefcase className="w-6 h-6 text-orange-500" />
          Team Portfolio
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Live equity holdings, cost-basis valuations, and completed trade execution history.
        </p>
      </div>

      {tradeMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs ${
            tradeMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{tradeMessage.text}</span>
        </div>
      )}

      {/* Summary Wealth Card */}
      <div
        className={`p-5 rounded-3xl space-y-4 border ${
          isDark
            ? 'bg-[#131B2E] border-white/5 shadow-md'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Total Team Wealth
            </span>
            <div className={`text-2xl sm:text-3xl font-black font-display mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatWealth(totalWealth)}
            </div>
          </div>

          {/* P&L Badge */}
          <div
            className={`flex items-center gap-1 text-xs font-black px-3 py-1 rounded-xl border ${
              isProfitable
                ? isDark
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : isDark
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
          >
            {isProfitable ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{formatPercent(pnlPct)}</span>
          </div>
        </div>

        {/* 2-Column Cash & Portfolio Grid */}
        <div className={`grid grid-cols-2 gap-3 pt-2 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#1E293B]/60 border-white/5' : 'bg-slate-50 border-slate-200/70'}`}>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
              <Wallet className="w-3.5 h-3.5 text-orange-500" />
              <span>Available Cash</span>
            </div>
            <div className={`text-sm font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatWealth(cashBalance)}
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#1E293B]/60 border-white/5' : 'bg-slate-50 border-slate-200/70'}`}>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
              <Coins className="w-3.5 h-3.5 text-orange-500" />
              <span>Invested Value</span>
            </div>
            <div className={`text-sm font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatWealth(portfolioVal)}
            </div>
          </div>
        </div>
      </div>

      {/* Active Holdings */}
      <div
        className={`p-5 rounded-3xl space-y-3 border ${
          isDark
            ? 'bg-[#131B2E] border-white/5 shadow-md'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Coins className="w-4 h-4 text-orange-500" />
            <span>Active Holdings ({holdings.length})</span>
          </h3>
        </div>

        {holdings.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No stock holdings yet. Visit the Market tab to place your first trade!
          </div>
        ) : (
          <div className="space-y-2.5">
            {holdings.map((holding) => {
              if (!holding.stock) return null;
              const curValue = holding.quantity * holding.stock.current_price;
              const totalCost = holding.quantity * holding.average_cost;
              const pnl = curValue - totalCost;
              const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
              const isUp = pnl >= 0;

              return (
                <div
                  key={holding.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
                    isDark ? 'bg-[#1E293B]/60 border-white/5' : 'bg-slate-50/70 border-slate-200/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {holding.stock.symbol}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {holding.quantity.toLocaleString('en-IN')} shares
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Avg: {formatCurrency(holding.average_cost)} · Cur: {formatCurrency(holding.stock.current_price)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(curValue)}
                    </div>
                    <div
                      className={`text-[10px] font-bold font-mono ${
                        isUp ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isUp ? '+' : ''}{formatCurrency(pnl)} ({formatPercent(pnlPct)})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade Execution History */}
      <div
        className={`p-5 rounded-3xl space-y-3 border ${
          isDark
            ? 'bg-[#131B2E] border-white/5 shadow-md'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <History className="w-4 h-4 text-orange-500" />
            <span>Recent Trades ({trades.length})</span>
          </h3>
        </div>

        {trades.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No trades executed in this session.
          </div>
        ) : (
          <div className="space-y-2">
            {trades.slice(0, 5).map((trade) => {
              const isBuy = trade.side === 'BUY';
              return (
                <div
                  key={trade.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                    isDark ? 'bg-[#1E293B]/60 border-white/5' : 'bg-slate-50/70 border-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                        isBuy
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {trade.side}
                    </span>
                    <div className="font-sans">
                      <span className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {trade.stock?.symbol || 'STOCK'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {formatClockTime(trade.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {trade.quantity.toLocaleString('en-IN')} @ {formatCurrency(trade.price)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatCurrency(trade.total_value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Liquidate Modal */}
      {activeSellHolding && activeSellHolding.stock && participant && (
        <SellModal
          stock={activeSellHolding.stock}
          ownedQuantity={activeSellHolding.quantity}
          isOpen={!!activeSellHolding}
          onClose={() => setActiveSellHolding(null)}
          onConfirmSell={handleConfirmSell}
        />
      )}
    </div>
  );
};

export default Portfolio;
