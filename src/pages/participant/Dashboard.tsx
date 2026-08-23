import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getStocks } from '../../services/stock';
import { getCurrentMarketSession, isSessionOpen } from '../../services/market';
import { getTeamPortfolioSummary, getTeamHoldings } from '../../services/portfolio';
import { getPublishedNews } from '../../services/news';
import { buyStock, sellStock } from '../../services/trade';
import { Stock, MarketSession, PortfolioSummary, NewsItem, Holding } from '../../types';
import { BuyModal } from '../../components/market/BuyModal';
import { SellModal } from '../../components/market/SellModal';
import { StockLogo } from '../../components/common/StockLogo';
import { formatWealth, formatCurrency, formatPercent, formatClockTime, formatTeamName } from '../../lib/formatting';
import { useMarketTimer } from '../../hooks/useMarketTimer';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import {
  Wallet,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ChevronDown,
  Radio,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketPulse } from '../../hooks/useMarketPulse';

export const Dashboard: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);

  // Live 4-second market pulse micro-fluctuation hook (0.01% - 0.02% around base price when open)
  const { pulsedStocks, flashStates, isMarketOpen } = useMarketPulse(stocks, session);

  const [activeBuyStock, setActiveBuyStock] = useState<Stock | null>(null);
  const [activeSellStock, setActiveSellStock] = useState<Stock | null>(null);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isWealthMasked, setIsWealthMasked] = useState(false);

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
  }, [loadDashboardData]);

  // Universal Real-Time Sync (WebSocket + BroadcastChannel + Polling)
  useRealtimeSubscription(
    [
      'MARKET_SESSION_CHANGED',
      'STOCK_PRICE_UPDATED',
      'NEWS_UPDATED',
      'TRADE_EXECUTED',
      'PORTFOLIO_CHANGED',
      'LEADERBOARD_UPDATED',
    ],
    loadDashboardData,
    1500
  );

  // Instant 0ms reactive listener for live price glides & micro-ticks
  useEffect(() => {
    const handlePriceUpdate = (e: any) => {
      const payload = e.detail;
      if (payload && (payload.stockId || payload.symbol) && payload.newPrice !== undefined) {
        setStocks((prev) =>
          prev.map((s) =>
            s.id === payload.stockId || s.symbol === payload.symbol
              ? {
                  ...s,
                  current_price: payload.newPrice,
                  high_price: Math.max(s.high_price, payload.newPrice),
                  low_price: Math.min(s.low_price, payload.newPrice),
                }
              : s
          )
        );
      }
    };

    window.addEventListener('metis_stock_price_updated', handlePriceUpdate);
    return () => window.removeEventListener('metis_stock_price_updated', handlePriceUpdate);
  }, []);

  // Instant 0ms reactive listener for market session changes
  useEffect(() => {
    const handleMarketChange = (e: any) => {
      const payload = e.detail;
      if (payload?.status) {
        setSession((prev) =>
          prev
            ? { ...prev, status: payload.status, ends_at: payload.ends_at ?? prev.ends_at }
            : {
                id: `ms_${Date.now()}`,
                event_id: participant?.event.id || 'e1',
                status: payload.status,
                started_at: new Date().toISOString(),
                ends_at: payload.ends_at || null,
                started_by: null,
                ended_by: null,
                created_at: new Date().toISOString(),
              }
        );
      }
      loadDashboardData();
    };

    window.addEventListener('metis_market_session_changed', handleMarketChange);
    return () => window.removeEventListener('metis_market_session_changed', handleMarketChange);
  }, [loadDashboardData, participant]);

  const isTrader = participant?.member?.is_trader ?? true;

  const handleBuy = (stock: Stock) => {
    if (!isTrader) {
      setTradeMessage({ type: 'error', text: 'Trading restricted to your team\'s designated primary trader.' });
      setTimeout(() => setTradeMessage(null), 4000);
      return;
    }
    setActiveBuyStock(stock);
  };

  const handleSell = (stock: Stock) => {
    if (!isTrader) {
      setTradeMessage({ type: 'error', text: 'Trading restricted to your team\'s designated primary trader.' });
      setTimeout(() => setTradeMessage(null), 4000);
      return;
    }
    setActiveSellStock(stock);
  };

  const handleConfirmBuy = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    if (!isTrader) return { success: false, error: 'Trading restricted to designated primary trader.' };
    const res = await buyStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully bought ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      await loadDashboardData();
    }
    return res;
  };

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    if (!isTrader) return { success: false, error: 'Trading restricted to designated primary trader.' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully sold ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      await loadDashboardData();
    }
    return res;
  };

  const teamDisplayName = formatTeamName(participant?.team?.name);

  const totalWealth = summary?.total_wealth ?? (participant?.team?.cash_balance ?? 100000000);
  const cashBalance = summary?.cash_balance ?? (participant?.team?.cash_balance ?? 100000000);
  const portfolioVal = summary?.current_value ?? 0;
  const pnlVal = summary?.today_pnl ?? 0;
  const pnlPct = summary?.today_pnl_pct ?? 0;
  const isLoss = pnlVal < 0;

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      {/* Trade Success / Error Feedback Toast */}
      {tradeMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
            tradeMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{tradeMessage.text}</span>
        </div>
      )}

      {/* 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Hero Portfolio & Status (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
        {/* 1. Market Session Status Card */}
        <div
          className={`p-4 rounded-3xl border backdrop-blur-xl transition-all relative overflow-hidden ${
            isSessionOpen(session)
              ? isDark
                ? 'bg-gradient-to-r from-emerald-950/40 via-[#131B2E] to-[#131B2E] border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                : 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 shadow-xs'
              : isDark
              ? 'bg-gradient-to-r from-rose-950/30 via-[#131B2E] to-[#131B2E] border-rose-500/20 shadow-md'
              : 'bg-gradient-to-r from-rose-50/70 to-white border-rose-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center shrink-0">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isSessionOpen(session)
                      ? 'bg-emerald-400 animate-ping opacity-75'
                      : session?.status === 'PAUSED'
                      ? 'bg-amber-400 animate-ping opacity-75'
                      : 'bg-rose-500'
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full absolute ${
                    isSessionOpen(session)
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-400'
                      : session?.status === 'PAUSED'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-xs font-mono tracking-wider uppercase ${
                      isSessionOpen(session)
                        ? 'text-emerald-400'
                        : session?.status === 'PAUSED'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    MARKET {isSessionOpen(session) ? 'OPEN' : (session?.status === 'PAUSED' ? 'PAUSED' : (session?.status === 'FROZEN' ? 'FROZEN' : 'CLOSED'))}
                  </span>
                  {isSessionOpen(session) && (
                    <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE TRADING
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                  {isSessionOpen(session) ? 'Instant order matching enabled' : 'Orders paused until next session'}
                </div>
              </div>
            </div>

            {/* Right: Session Countdown / Status */}
            <div className="flex items-center gap-2.5 shrink-0 pl-2 border-l border-white/5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-right font-mono">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {isSessionOpen(session) ? (session?.ends_at ? 'Round Closes' : 'Duration') : 'Status'}
                </span>
                <span className={`text-xs font-black ${isSessionOpen(session) ? 'text-orange-400' : 'text-slate-300'}`}>
                  {isSessionOpen(session)
                    ? (session?.ends_at ? timer.formatted : '∞ Unlimited')
                    : (session?.status === 'PAUSED' ? 'Paused' : (session?.status === 'FROZEN' ? 'Frozen' : 'Closed'))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Hero Total Wealth Card */}
        <div
          className={`p-5 sm:p-6 rounded-3xl space-y-4 relative overflow-hidden transition-all backdrop-blur-xl ${
            isDark
              ? 'bg-gradient-to-b from-[#162036]/90 to-[#0F1728]/95 border border-white/10 shadow-2xl'
              : 'bg-white border border-slate-200/80 shadow-md'
          }`}
        >
          {/* Ambient Glow Aura */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Header */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                TOTAL PORTFOLIO WEALTH
              </span>
              <button
                onClick={() => setIsWealthMasked(!isWealthMasked)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title={isWealthMasked ? 'Show Balance' : 'Hide Balance'}
              >
                {isWealthMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono font-black text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{teamDisplayName}</span>
            </div>
          </div>

          {/* Main Balance & Area Sparkline */}
          <div className="relative pt-1 z-10">
            {/* Smooth Glowing Background Sparkline */}
            <div className="absolute right-0 bottom-0 w-40 sm:w-56 h-20 pointer-events-none opacity-80">
              <svg className="w-full h-full" viewBox="0 0 160 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroWealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isLoss ? '#F43F5E' : '#FF6B00'}
                      stopOpacity={0.4}
                    />
                    <stop offset="100%" stopColor={isLoss ? '#F43F5E' : '#FF6B00'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,45 L15,40 L30,48 L45,35 L60,42 L75,28 L90,34 L105,22 L120,28 L135,16 L150,10 L160,8 L160,60 L0,60 Z"
                  fill="url(#heroWealthGrad)"
                />
                <path
                  d="M0,45 L15,40 L30,48 L45,35 L60,42 L75,28 L90,34 L105,22 L120,28 L135,16 L150,10 L160,8"
                  fill="none"
                  stroke={isLoss ? '#F43F5E' : '#FF6B00'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="160" cy="8" r="4" fill={isLoss ? '#F43F5E' : '#FF6B00'} />
              </svg>
            </div>

            <div className="space-y-2 relative z-10">
              <div className={`text-3xl sm:text-4xl lg:text-[42px] font-black font-display tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isWealthMasked ? '••••••••' : formatCurrency(totalWealth)}
              </div>

              {/* P/L Badge + Equivalent */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black font-mono shrink-0 border shadow-xs ${
                    isLoss
                      ? isDark
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                      : isDark
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}
                >
                  {isLoss ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  <span>
                    {isLoss ? '-' : '+'}{formatCurrency(Math.abs(pnlVal))} ({formatPercent(pnlPct)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Available Cash & Portfolio Assets */}
          <div
            className={`grid grid-cols-2 gap-3 pt-4 border-t relative z-10 ${
              isDark ? 'border-white/10' : 'border-slate-100'
            }`}
          >
            {/* Cash Balance */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-[#18233C]/70 border-white/5 hover:border-white/15'
                  : 'bg-slate-50 border-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 font-mono">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                <span>Liquid Cash</span>
              </div>
              <div className={`text-base sm:text-lg font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isWealthMasked ? '••••••' : formatCurrency(cashBalance)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                {formatWealth(cashBalance)}
              </div>
            </div>

            {/* Portfolio Value */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-[#18233C]/70 border-white/5 hover:border-white/15'
                  : 'bg-slate-50 border-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 font-mono">
                <BarChart2 className="w-3.5 h-3.5 text-orange-500" />
                <span>Stock Assets</span>
              </div>
              <div className={`text-base sm:text-lg font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isWealthMasked ? '••••••' : formatCurrency(portfolioVal)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                {formatWealth(portfolioVal)}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Latest News Wire Ticker */}
        <Link
          to="/news"
          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border transition-all backdrop-blur-md ${
            isDark
              ? 'bg-[#131B2E]/90 border-white/5 hover:bg-[#1A253E] hover:border-orange-500/30'
              : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-orange-500 text-white font-mono">
                  LATEST WIRE
                </span>
                {latestNews && (
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-500/15 text-slate-300 font-mono">
                    {latestNews.sector}
                  </span>
                )}
              </div>
              <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {latestNews ? latestNews.headline : 'No breaking market events published yet.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </Link>
      </div>

      {/* RIGHT COLUMN: Market Watchlist (7 Cols) */}
      <div className="md:col-span-7 space-y-3.5">
        {/* Watchlist Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h3 className={`text-xs font-black tracking-wider uppercase font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Market Watchlist
            </h3>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {stocks.length} Assets
            </span>
          </div>
          <Link
            to="/market"
            className="text-xs font-black text-orange-500 hover:text-orange-400 flex items-center gap-1 font-mono transition-colors"
          >
            <span>View All Market Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Luxury Stock Cards List */}
        <div className="space-y-3">
          {pulsedStocks.slice(0, 5).map((stock) => {
            const holding = holdings.find((h) => h.stock_id === stock.id);
            const ownedQty = holding?.quantity ?? 0;
            const priceDiff = stock.current_price - stock.opening_price;
            const isUp = priceDiff >= 0;
            const pct = (
              ((stock.current_price - stock.opening_price) / (stock.opening_price || 1)) *
              100
            ).toFixed(1);

            const flash = flashStates[stock.id];
            const formattedPrice =
              stock.current_price % 1 !== 0
                ? `₹${stock.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `₹${stock.current_price.toLocaleString('en-IN')}`;

            return (
              <div
                key={stock.id}
                className={`p-4 sm:p-4.5 rounded-3xl border transition-all duration-300 hover:-translate-y-0.5 space-y-3.5 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#141C2E]/95 to-[#0E1524]/95 border-white/[0.08] hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5'
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Top Row: Logo + Symbol + Sector + Sparkline */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <StockLogo
                      symbol={stock.symbol}
                      name={stock.company_name}
                      sector={stock.sector}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-base tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {stock.symbol}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400 font-mono">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                        {stock.company_name}
                      </div>
                    </div>
                  </div>

                  {/* Sparkline Graph with Glowing End Point */}
                  <div className="w-24 sm:w-28 h-9 shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 100 36" preserveAspectRatio="none">
                      <path
                        d={
                          isUp
                            ? 'M0,30 L20,26 L35,28 L50,18 L65,22 L80,10 L100,6'
                            : 'M0,8 L20,16 L35,12 L50,24 L65,20 L80,28 L100,32'
                        }
                        fill="none"
                        stroke={isUp ? '#10B981' : '#F43F5E'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="100"
                        cy={isUp ? '6' : '32'}
                        r="3.5"
                        fill={isUp ? '#10B981' : '#F43F5E'}
                      />
                    </svg>
                  </div>
                </div>

                {/* Bottom Row: Price & Owned + Tactile Buy / Sell Pill Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-xl sm:text-2xl font-black font-mono tracking-tight transition-colors duration-1000 ease-out flex items-center gap-1.5 ${
                          flash === 'up'
                            ? 'text-emerald-400'
                            : flash === 'down'
                            ? 'text-rose-400'
                            : isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        <span>{formattedPrice}</span>
                        {isMarketOpen && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 inline-block shrink-0" title="Live Active" />
                        )}
                      </div>

                      {/* % Change Pill */}
                      <div
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black font-mono shrink-0 border ${
                          isUp
                            ? isDark
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : isDark
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        {isUp ? '↗ +' : '↘ '}{pct}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5 flex-wrap">
                      <span>H: ₹{Math.round(stock.high_price).toLocaleString('en-IN')}</span>
                      <span>·</span>
                      <span>L: ₹{Math.round(stock.low_price).toLocaleString('en-IN')}</span>
                      {ownedQty > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-orange-400 font-bold">
                            Owned: {ownedQty.toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tactile Buy / Sell Pill Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleBuy(stock)}
                      disabled={!isMarketOpen || !isTrader}
                      title={!isTrader ? 'Only your team\'s designated primary trader can execute trades' : undefined}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs font-mono tracking-wide bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-xs shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>BUY</span>
                    </button>

                    <button
                      onClick={() => handleSell(stock)}
                      disabled={!isMarketOpen || !isTrader || ownedQty === 0}
                      title={!isTrader ? 'Only your team\'s designated primary trader can execute trades' : undefined}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs font-mono tracking-wide bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500 hover:to-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-transparent active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>SELL</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* Buy Modal */}
      {activeBuyStock && participant && (
        <BuyModal
          stock={activeBuyStock}
          availableCash={cashBalance}
          isOpen={!!activeBuyStock}
          onClose={() => setActiveBuyStock(null)}
          onConfirmBuy={handleConfirmBuy}
        />
      )}

      {/* Sell Modal */}
      {activeSellStock && participant && (
        <SellModal
          stock={activeSellStock}
          ownedQuantity={
            holdings.find((h) => h.stock_id === activeSellStock.id)?.quantity || 0
          }
          isOpen={!!activeSellStock}
          onClose={() => setActiveSellStock(null)}
          onConfirmSell={handleConfirmSell}
        />
      )}
    </div>
  );
};

export default Dashboard;
