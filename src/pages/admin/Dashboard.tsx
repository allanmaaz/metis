import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getCurrentMarketSession, setMarketStatus } from '../../services/market';
import { getStocks, updateStockPrice } from '../../services/stock';
import { getTeams } from '../../services/admin';
import { getAllTrades } from '../../services/trade';
import { getPublishedNews } from '../../services/news';
import { Event, MarketSession, Stock, Team, Trade, NewsItem, MarketStatus } from '../../types';
import { PriceChangeModal } from '../../components/admin/PriceChangeModal';
import { FreezeConfirmModal } from '../../components/admin/FreezeConfirmModal';
import { formatCurrency, formatClockTime } from '../../lib/formatting';
import { useMarketTimer } from '../../hooks/useMarketTimer';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import {
  Users2,
  BarChart3,
  Receipt,
  Newspaper,
  Pause,
  Play,
  RotateCcw,
  Snowflake,
  Car,
  Landmark,
  Zap,
  HeartPulse,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Radio,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAdminDomain } from '../../App';

export const AdminDashboard: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [activeStockIndex, setActiveStockIndex] = useState(0);
  const [activePriceStock, setActivePriceStock] = useState<Stock | null>(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const timer = useMarketTimer(session?.ends_at);
  const prefix = isAdminDomain ? '' : '/control';

  const loadData = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);

      const [curSession, stockList, teamList, tradeList, newsList] = await Promise.all([
        getCurrentMarketSession(activeEvent.id),
        getStocks(activeEvent.id),
        getTeams(activeEvent.id),
        getAllTrades(activeEvent.id),
        getPublishedNews(activeEvent.id),
      ]);

      setSession(curSession);
      setStocks(stockList);
      setTeams(teamList);
      setTrades(tradeList);
      setNews(newsList);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Automatic slideshow timer (every 4 seconds)
  useEffect(() => {
    if (stocks.length <= 1 || isCarouselPaused || activePriceStock !== null) return;
    const interval = setInterval(() => {
      setActiveStockIndex((prev) => (prev + 1) % stocks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [stocks.length, isCarouselPaused, activePriceStock]);

  // Touch Swipe Gesture Handlers
  const minSwipeDistance = 35;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setIsCarouselPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsCarouselPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Stock
      setActiveStockIndex((prev) => (prev + 1) % stocks.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Stock
      setActiveStockIndex((prev) => (prev - 1 + stocks.length) % stocks.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handlePrevStock = () => {
    setActiveStockIndex((prev) => (prev - 1 + stocks.length) % stocks.length);
  };

  const handleNextStock = () => {
    setActiveStockIndex((prev) => (prev + 1) % stocks.length);
  };

  // Universal Realtime Sync
  useRealtimeSubscription(
    [
      'MARKET_SESSION_CHANGED',
      'STOCK_PRICE_UPDATED',
      'NEWS_UPDATED',
      'TRADE_EXECUTED',
      'PORTFOLIO_CHANGED',
      'LEADERBOARD_UPDATED',
      'TEAM_UPDATED',
    ],
    loadData,
    1500
  );

  const handleSetStatus = async (status: MarketStatus, durationMinutes?: number) => {
    if (!event) return;
    const res = await setMarketStatus(event.id, status, durationMinutes);
    if (res.success) {
      loadData();
    }
  };

  const handleFreezeConfirm = async (freezeReason: string) => {
    if (!event) return { success: false };
    const res = await setMarketStatus(event.id, 'FROZEN', undefined, freezeReason);
    if (res.success) {
      loadData();
    }
    return res;
  };

  const handleQuickPercentChange = async (stock: Stock, percent: number) => {
    const change = (stock.current_price * percent) / 100;
    const newPrice = Math.max(1, Math.round(stock.current_price + change));
    const reason = `Quick shift ${percent > 0 ? '+' : ''}${percent}%`;
    const res = await updateStockPrice(stock.id, newPrice, reason);
    if (res.success) {
      loadData();
    }
  };

  const isMarketOpen = session?.status === 'OPEN';
  const isMarketPaused = session?.status === 'PAUSED';
  const isMarketFrozen = session?.status === 'FROZEN';
  const isMarketClosed = session?.status === 'CLOSED';

  const currentStock = stocks[activeStockIndex] || stocks[0];
  const latestNews = news[0];

  const getSectorIcon = (sector: string = '') => {
    const s = sector.toUpperCase();
    if (s.includes('AUTO') || s.includes('EV')) return Car;
    if (s.includes('BANK') || s.includes('FIN')) return Landmark;
    if (s.includes('ENERGY') || s.includes('GREEN')) return Zap;
    if (s.includes('HEALTH') || s.includes('MED')) return HeartPulse;
    return ShoppingBag;
  };

  const pctChange = currentStock?.opening_price
    ? ((currentStock.current_price - currentStock.opening_price) / currentStock.opening_price) * 100
    : 0;
  const isPositive = pctChange >= 0;

  return (
    <div className="space-y-5 max-w-md lg:max-w-none mx-auto pb-6">
      {/* 1. Title Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
          METIS 2026 Control Center
        </h1>
      </div>

      {/* 2. Market Status & Action Card (Matching Mockup) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Top 3-Column Info Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Column 1: Market Status */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              MARKET STATUS
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isMarketOpen
                    ? 'bg-emerald-500 animate-pulse'
                    : isMarketPaused
                    ? 'bg-amber-500 animate-pulse'
                    : isMarketFrozen
                    ? 'bg-cyan-400'
                    : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-xs font-black uppercase font-mono tracking-wide ${
                  isMarketOpen
                    ? 'text-emerald-600'
                    : isMarketPaused
                    ? 'text-amber-600'
                    : isMarketFrozen
                    ? 'text-cyan-600'
                    : 'text-rose-600'
                }`}
              >
                {session?.status || 'OPEN'}
              </span>
            </div>
          </div>

          {/* Column 2: Session Countdown */}
          <div className="space-y-0.5 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              SESSION ENDS IN
            </span>
            <div className="flex items-center justify-center gap-1 text-orange-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm sm:text-base font-black font-mono leading-none">
                {session?.ends_at
                  ? timer.isExpired
                    ? 'Expired'
                    : timer.formatted
                  : isMarketOpen
                  ? 'No limit'
                  : 'Closed'}
              </span>
            </div>
            {session?.ends_at && !timer.isExpired && (
              <span className="text-[8px] text-slate-400 font-mono block">hrs : mins</span>
            )}
          </div>

          {/* Column 3: Pause / Resume Button */}
          <div>
            {isMarketPaused ? (
              <button
                onClick={() => handleSetStatus('OPEN')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold transition-all shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-600" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={() => handleSetStatus('PAUSED')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-extrabold transition-all shadow-xs"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-slate-100 w-full" />

        {/* Bottom Action Row (Close Market & Freeze Market) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSetStatus(isMarketClosed ? 'OPEN' : 'CLOSED')}
            className={`py-2.5 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              isMarketClosed
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isMarketClosed ? 'Reopen Market' : 'Close Market'}</span>
          </button>

          <button
            onClick={() => setIsFreezeModalOpen(true)}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs shadow-orange-500/20"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Freeze Market</span>
          </button>
        </div>
      </div>

      {/* 3. 4 Quick Metric Cards (2x2 Grid matching mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Registered Teams */}
        <Link
          to={`${prefix}/teams`}
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2 block group"
        >
          <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-200/60 shadow-xs">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">
              REGISTERED TEAMS
            </span>
            <div className="text-2xl font-black text-slate-900 font-display">
              {teams.length}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium pt-1 border-t border-slate-100">
            <span className="truncate">{teams.filter((t) => t.status === 'ACTIVE').length} Active Competitors</span>
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors shrink-0">
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>

        {/* Card 2: Active Stocks */}
        <Link
          to={`${prefix}/stocks`}
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2 block group"
        >
          <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">
              ACTIVE STOCKS
            </span>
            <div className="text-2xl font-black text-slate-900 font-display">
              {stocks.length}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium pt-1 border-t border-slate-100">
            <span className="truncate">Controllable Assets</span>
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors shrink-0">
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>

        {/* Card 3: Executed Trades */}
        <Link
          to={`${prefix}/trades`}
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2 block group"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">
              EXECUTED TRADES
            </span>
            <div className="text-2xl font-black text-slate-900 font-display">
              {trades.length}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium pt-1 border-t border-slate-100">
            <span className="truncate">Total Volume Traded</span>
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors shrink-0">
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>

        {/* Card 4: News Broadcasts */}
        <Link
          to={`${prefix}/news`}
          className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2 block group"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">
              NEWS BROADCASTS
            </span>
            <div className="text-2xl font-black text-slate-900 font-display">
              {news.length}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 font-medium pt-1 border-t border-slate-100">
            <span className="truncate">Market Wires Sent</span>
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors shrink-0">
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </div>

      {/* 4. Latest News Wire Banner (Matching Mockup) */}
      <Link
        to={`${prefix}/news`}
        className="bg-orange-50/70 border border-orange-200/80 p-3.5 rounded-3xl flex items-center justify-between gap-3 shadow-xs hover:bg-orange-50 transition-all block"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-500 text-white font-mono">
                LATEST WIRE
              </span>
              <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-orange-200/60 text-orange-800 font-mono">
                {latestNews?.sector || 'EV & Auto'}
              </span>
            </div>
            <p className="text-xs font-extrabold text-slate-900 truncate">
              {latestNews?.headline || 'Government Announces ₹25,000 Cr Incentive...'}
            </p>
            <span className="text-[9.5px] text-slate-400 font-mono block">
              {latestNews?.published_at ? formatClockTime(latestNews.published_at) : '2m ago'}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-orange-500 shrink-0" />
      </Link>

      {/* 5. Quick Stock Price Control Card with Auto-Slide & Touch-Swipe */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-black tracking-wide uppercase text-slate-900">
              Quick Stock Price Control
            </h3>
            {stocks.length > 1 && (
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {activeStockIndex + 1} / {stocks.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {stocks.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStock}
                  className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  title="Previous Stock"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextStock}
                  className="w-6 h-6 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  title="Next Stock"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <Link
              to={`${prefix}/stocks`}
              className="text-xs font-bold text-orange-500 hover:text-orange-600"
            >
              Manage All Stocks ›
            </Link>
          </div>
        </div>

        {/* Stock Card with Touch Gestures, Sparkline & Action Chips */}
        {currentStock && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs transition-all select-none relative group cursor-grab active:cursor-grabbing overflow-hidden"
          >
            {/* Animated Slide Wrapper */}
            <div
              key={currentStock.id}
              className="space-y-3 animate-in fade-in slide-in-from-right-6 duration-300 fill-mode-both"
            >
              {/* Top row: Sector, Symbol, Company, Price & % Change */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-200/60 shrink-0">
                    {React.createElement(getSectorIcon(currentStock.sector), { className: 'w-4 h-4' })}
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">
                      {currentStock.sector || 'EV & AUTO'}
                    </span>
                    <div className="text-base font-black text-slate-900 tracking-tight">
                      {currentStock.symbol}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                      {currentStock.company_name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {formatCurrency(currentStock.current_price)}
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] font-bold font-mono ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    <span>
                      {isPositive ? '▲ +' : '▼ '}
                      {Math.abs(pctChange).toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    Open: {formatCurrency(currentStock.opening_price)}
                  </div>
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-10 w-full overflow-hidden flex items-end">
                <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`grad_${currentStock.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isPositive ? '#10B981' : '#F43F5E'}
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={isPositive ? '#10B981' : '#F43F5E'}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d={
                      isPositive
                        ? 'M0,25 Q15,20 30,22 T60,12 T85,14 T100,5 L100,30 L0,30 Z'
                        : 'M0,5 Q15,10 30,8 T60,18 T85,16 T100,25 L100,30 L0,30 Z'
                    }
                    fill={`url(#grad_${currentStock.id})`}
                  />
                  <path
                    d={
                      isPositive
                        ? 'M0,25 Q15,20 30,22 T60,12 T85,14 T100,5'
                        : 'M0,5 Q15,10 30,8 T60,18 T85,16 T100,25'
                    }
                    fill="none"
                    stroke={isPositive ? '#10B981' : '#F43F5E'}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Action Chips: -10%, -5%, +5%, +10%, Custom Price */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickPercentChange(currentStock, -10);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer"
                  >
                    -10%
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickPercentChange(currentStock, -5);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70 transition-colors cursor-pointer"
                  >
                    -5%
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickPercentChange(currentStock, 5);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/70 transition-colors cursor-pointer"
                  >
                    +5%
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickPercentChange(currentStock, 10);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/70 transition-colors cursor-pointer"
                  >
                    +10%
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePriceStock(currentStock);
                  }}
                  className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  Custom Price
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Slide Indicators */}
        {stocks.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-1">
            {stocks.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveStockIndex(idx)}
                aria-label={`Show ${s.symbol}`}
                className={`transition-all duration-300 ease-out cursor-pointer ${
                  activeStockIndex === idx
                    ? 'w-7 h-2 rounded-full bg-orange-500 shadow-xs shadow-orange-500/30 scale-105'
                    : 'w-2 h-2 rounded-full bg-slate-200 hover:bg-slate-300 hover:scale-110'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {activePriceStock && (
        <PriceChangeModal
          stock={activePriceStock}
          isOpen={!!activePriceStock}
          onClose={() => setActivePriceStock(null)}
          onConfirmChange={async (stockId, newPrice, reason) => {
            const res = await updateStockPrice(stockId, newPrice, reason);
            if (res.success) loadData();
            return res;
          }}
        />
      )}

      <FreezeConfirmModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirmFreeze={handleFreezeConfirm}
      />
    </div>
  );
};

export default AdminDashboard;
