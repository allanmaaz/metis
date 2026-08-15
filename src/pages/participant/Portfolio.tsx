import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeamHoldings, getTeamPortfolioSummary } from '../../services/portfolio';
import { getTeamTrades, sellStock } from '../../services/trade';
import { getCurrentMarketSession } from '../../services/market';
import { Holding, PortfolioSummary, Trade, MarketSession } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { HoldingCard } from '../../components/portfolio/HoldingCard';
import { SellModal } from '../../components/market/SellModal';
import { formatCurrency, formatWealth, formatPercent, formatQuantity, formatClockTime } from '../../lib/formatting';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Coins,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const Portfolio: React.FC = () => {
  const { participant } = useAuth();
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
    const interval = setInterval(loadPortfolio, 3000);
    return () => clearInterval(interval);
  }, [loadPortfolio]);

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully sold ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadPortfolio();
    }
    return res;
  };

  const isMarketOpen = session?.status === 'OPEN';
  const isProfit = (summary?.total_pnl ?? 0) >= 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Toast Notification */}
      {tradeMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-2xl bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-3 text-sm font-bold animate-slide-up backdrop-blur-xl">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{tradeMessage.text}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-orange-500" />
          Team Portfolio
        </h2>
        <p className="text-xs text-slate-400">
          Holdings, live valuations, and realized returns for Team {participant?.team.name}
        </p>
      </div>

      {/* Main Portfolio Value Card */}
      <GlassCard variant="profit-glow" className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            CURRENT PORTFOLIO VALUE
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            {holdings.length} Active Positions
          </span>
        </div>

        <div className="flex items-baseline gap-3 flex-wrap">
          <div className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            {formatWealth(summary?.current_value ?? 0)}
          </div>

          <div
            className={`flex items-center gap-1 text-sm font-bold font-mono px-3 py-1 rounded-full ${
              isProfit
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>Total P/L: {isProfit ? '+' : ''}{formatCurrency(summary?.total_pnl ?? 0, true)}</span>
          </div>
        </div>

        {/* 4 Summary Mini Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Total Invested
            </span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">
              {formatWealth(summary?.total_invested ?? 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Unrealized P/L
            </span>
            <span
              className={`text-sm font-bold font-mono mt-0.5 block ${
                (summary?.unrealized_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(summary?.unrealized_pnl ?? 0) >= 0 ? '+' : ''}
              {formatWealth(summary?.unrealized_pnl ?? 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Realized P/L
            </span>
            <span
              className={`text-sm font-bold font-mono mt-0.5 block ${
                (summary?.realized_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(summary?.realized_pnl ?? 0) >= 0 ? '+' : ''}
              {formatWealth(summary?.realized_pnl ?? 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Cash Balance
            </span>
            <span className="text-sm font-bold font-mono text-orange-400 mt-0.5 block">
              {formatWealth(summary?.cash_balance ?? 0)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Active Holdings Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-orange-400" />
          Active Holdings ({holdings.length})
        </h3>

        {holdings.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-3xl space-y-3">
            <p className="text-slate-400 text-sm">You currently hold no stocks.</p>
            <a
              href="/market"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
            >
              Explore Market & Buy Stocks
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holdings.map((holding) => (
              <HoldingCard
                key={holding.id}
                holding={holding}
                onSell={() => setActiveSellHolding(holding)}
                marketOpen={isMarketOpen}
              />
            ))}
          </div>
        )}
      </div>

      {/* Trade History Log */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-orange-400" />
          Transaction Audit History ({trades.length})
        </h3>

        {trades.length === 0 ? (
          <div className="text-center py-8 glass-panel rounded-2xl">
            <p className="text-slate-400 text-xs">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-slate-800">
            {trades.map((trade) => {
              const isBuy = trade.side === 'BUY';
              return (
                <div key={trade.id} className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {trade.side}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {trade.stock?.symbol || 'STOCK'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatQuantity(trade.quantity)} shares @ {formatCurrency(trade.price)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Executed by {trade.team_member?.full_name || 'Team Member'} · {formatClockTime(trade.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className={`text-sm font-bold block ${isBuy ? 'text-slate-200' : 'text-emerald-400'}`}>
                      {isBuy ? '-' : '+'}{formatCurrency(trade.total_value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {activeSellHolding && (
        <SellModal
          isOpen={Boolean(activeSellHolding)}
          onClose={() => setActiveSellHolding(null)}
          stock={activeSellHolding.stock || null}
          ownedQuantity={activeSellHolding.quantity}
          averageCost={activeSellHolding.average_cost}
          onConfirmSell={handleConfirmSell}
        />
      )}
    </div>
  );
};
