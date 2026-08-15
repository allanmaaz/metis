import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStocks } from '../../services/stock';
import { getCurrentMarketSession } from '../../services/market';
import { getTeamPortfolioSummary, getTeamHoldings } from '../../services/portfolio';
import { getPublishedNews } from '../../services/news';
import { buyStock, sellStock } from '../../services/trade';
import { Stock, MarketSession, PortfolioSummary, NewsItem, Holding } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCard } from '../../components/ui/StatCard';
import { MarketStatusBadge } from '../../components/ui/MarketStatusBadge';
import { StockCard } from '../../components/market/StockCard';
import { BuyModal } from '../../components/market/BuyModal';
import { SellModal } from '../../components/market/SellModal';
import { formatWealth, formatCurrency, formatPercent } from '../../lib/formatting';
import { useMarketTimer } from '../../hooks/useMarketTimer';
import {
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Radio,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { participant } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);

  const [activeBuyStock, setActiveBuyStock] = useState<Stock | null>(null);
  const [activeSellStock, setActiveSellStock] = useState<Stock | null>(null);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const timer = useMarketTimer(session?.ends_at);

  const loadDashboardData = useCallback(async () => {
    if (!participant) return;
    const eventId = participant.event.id;
    const teamId = participant.team.id;

    try {
      const [stkList, curSession, portSummary, newsList, holdList] = await Promise.all([
        getStocks(eventId),
        getCurrentMarketSession(eventId),
        getTeamPortfolioSummary(teamId, eventId),
        getPublishedNews(eventId),
        getTeamHoldings(teamId),
      ]);

      setStocks(stkList);
      setSession(curSession);
      setSummary(portSummary);
      setLatestNews(newsList[0] || null);
      setHoldings(holdList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, [participant]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 3000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const handleBuy = (stock: Stock) => {
    setActiveBuyStock(stock);
  };

  const handleSell = (stock: Stock) => {
    setActiveSellStock(stock);
  };

  const handleConfirmBuy = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await buyStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully bought ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadDashboardData();
    }
    return res;
  };

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully sold ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadDashboardData();
    }
    return res;
  };

  const isMarketOpen = session?.status === 'OPEN';
  const totalWealth = summary?.total_wealth ?? participant?.team.cash_balance ?? 100000000;
  const todayPnl = summary?.today_pnl ?? 0;
  const todayPnlPct = summary?.today_pnl_pct ?? 0;
  const isProfit = todayPnl >= 0;

  return (
    <div className="space-y-5 pb-6">
      {/* Toast Notification */}
      {tradeMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 text-sm font-bold animate-slide-up backdrop-blur-xl ${
            tradeMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20'
          }`}
        >
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{tradeMessage.text}</span>
        </div>
      )}

      {/* Market Status & Timer Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel-subtle border-white/10">
        <div className="flex items-center gap-2">
          <MarketStatusBadge status={session?.status || 'OPEN'} size="sm" />
          {isMarketOpen && (
            <span className="text-xs text-slate-300 font-mono hidden sm:inline">
              Active Trading Session
            </span>
          )}
        </div>

        {session?.ends_at && isMarketOpen && (
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            <span>Session closes in: {timer.formatted}</span>
          </div>
        )}
      </div>

      {/* Primary Total Wealth Hero Card */}
      <GlassCard variant="orange-glow" className="p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            TOTAL WEALTH
          </span>
          <span className="text-xs font-mono text-orange-400 font-semibold">
            Team {participant?.team.name}
          </span>
        </div>

        {/* Big Financial Number */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <div className="text-4xl sm:text-6xl font-extrabold font-display text-white tracking-tight">
            {formatWealth(totalWealth)}
          </div>

          <div
            className={`flex items-center gap-1 text-sm sm:text-base font-bold font-mono px-3 py-1 rounded-full ${
              isProfit
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{isProfit ? '+' : ''}{formatCurrency(todayPnl, true)}</span>
            <span>({formatPercent(todayPnlPct)})</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Exact Value: {formatCurrency(totalWealth)}
        </p>

        {/* Secondary Cash & Portfolio Cards */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
              <span>Available Cash</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-display text-white">
              {formatWealth(summary?.cash_balance ?? participant?.team.cash_balance ?? 0)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portfolio Value</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-display text-white">
              {formatWealth(summary?.current_value ?? 0)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Breaking News Wire Strip */}
      {latestNews && (
        <Link to="/news" className="block group">
          <div className="p-4 rounded-2xl glass-panel-interactive border-orange-500/30 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 shrink-0 mt-0.5">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-500 text-white">
                    LATEST WIRE
                  </span>
                  {latestNews.sector && (
                    <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                      {latestNews.sector}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-1 group-hover:text-orange-400 transition-colors">
                  {latestNews.headline}
                </h4>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0" />
          </div>
        </Link>
      )}

      {/* Active Market Watchlist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            Market Watchlist
          </h3>
          <Link
            to="/market"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            View All ({stocks.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {stocks.slice(0, 6).map((stock) => {
            const holding = holdings.find((h) => h.stock_id === stock.id);
            return (
              <StockCard
                key={stock.id}
                stock={stock}
                ownedQuantity={holding?.quantity || 0}
                marketOpen={isMarketOpen}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            );
          })}
        </div>
      </div>

      {/* Buy & Sell Modals */}
      <BuyModal
        isOpen={Boolean(activeBuyStock)}
        onClose={() => setActiveBuyStock(null)}
        stock={activeBuyStock}
        availableCash={summary?.cash_balance ?? participant?.team.cash_balance ?? 0}
        onConfirmBuy={handleConfirmBuy}
      />

      <SellModal
        isOpen={Boolean(activeSellStock)}
        onClose={() => setActiveSellStock(null)}
        stock={activeSellStock}
        ownedQuantity={holdings.find((h) => h.stock_id === activeSellStock?.id)?.quantity || 0}
        averageCost={holdings.find((h) => h.stock_id === activeSellStock?.id)?.average_cost || 0}
        onConfirmSell={handleConfirmSell}
      />
    </div>
  );
};
