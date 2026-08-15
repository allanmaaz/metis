import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getCurrentMarketSession, setMarketStatus } from '../../services/market';
import { getStocks, updateStockPrice } from '../../services/stock';
import { getTeams } from '../../services/admin';
import { getAllTrades } from '../../services/trade';
import { getPublishedNews } from '../../services/news';
import { Event, MarketSession, Stock, Team, Trade, NewsItem } from '../../types';
import { PriceChangeModal } from '../../components/admin/PriceChangeModal';
import { FreezeConfirmModal } from '../../components/admin/FreezeConfirmModal';
import { formatCurrency, formatClockTime } from '../../lib/formatting';
import { useMarketTimer } from '../../hooks/useMarketTimer';
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

  const [activePriceStock, setActivePriceStock] = useState<Stock | null>(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

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
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSetStatus = async (status: 'OPEN' | 'PAUSED' | 'CLOSED' | 'FROZEN') => {
    if (!event) return;
    await setMarketStatus(event.id, status);
    loadData();
  };

  const handleQuickPercentChange = async (stock: Stock, percent: number) => {
    const change = (stock.current_price * percent) / 100;
    const newPrice = Math.max(1, Math.round(stock.current_price + change));
    await updateStockPrice(
      stock.id,
      newPrice,
      `Quick ${percent > 0 ? '+' : ''}${percent}% administrative adjustment`
    );
    loadData();
  };

  const handlePriceUpdate = async (stockId: string, newPrice: number, reason: string) => {
    const res = await updateStockPrice(stockId, newPrice, reason);
    if (res.success) {
      loadData();
    }
    return res;
  };

  const handleFreezeConfirm = async (reason: string) => {
    if (!event) return { success: false };
    const res = await setMarketStatus(event.id, 'FROZEN', undefined, reason);
    loadData();
    return res;
  };

  const isMarketOpen = session?.status === 'OPEN';
  const isMarketPaused = session?.status === 'PAUSED';
  const isMarketFrozen = session?.status === 'FROZEN';

  // Sector Icon Helper
  const getSectorIcon = (sector: string, symbol: string) => {
    const s = (sector + ' ' + symbol).toLowerCase();
    if (s.includes('auto') || s.includes('ev') || s.includes('nova')) {
      return { icon: Car, bg: 'bg-orange-50 text-orange-500 border-orange-200/60' };
    }
    if (s.includes('bank') || s.includes('finedge') || s.includes('fin')) {
      return { icon: Landmark, bg: 'bg-amber-50 text-amber-600 border-amber-200/60' };
    }
    if (s.includes('energy') || s.includes('greenx') || s.includes('power')) {
      return { icon: Zap, bg: 'bg-emerald-50 text-emerald-500 border-emerald-200/60' };
    }
    if (s.includes('pharma') || s.includes('medix') || s.includes('health')) {
      return { icon: HeartPulse, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60' };
    }
    return { icon: ShoppingBag, bg: 'bg-orange-50 text-orange-600 border-orange-200/60' };
  };

  return (
    <div className="space-y-7 pb-12">
      {/* 1. Header Overview & Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="space-y-1">
          <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest font-mono">
            {event?.round_name || 'ROUND 2'} — VIRTUAL MARKET
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            METIS 2026 Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Run the market. Guide the game. Crown the champions.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3 p-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
          {/* Market Status Pill */}
          <div className="flex flex-col px-3 py-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              MARKET STATUS
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isMarketOpen
                    ? 'bg-emerald-500'
                    : isMarketFrozen
                    ? 'bg-orange-500'
                    : isMarketPaused
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-xs font-extrabold tracking-wide uppercase ${
                  isMarketOpen
                    ? 'text-emerald-600'
                    : isMarketFrozen
                    ? 'text-orange-600'
                    : isMarketPaused
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {session?.status || 'OPEN'}
              </span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Session Timer */}
          <div className="flex flex-col px-3 py-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Session ends in
            </span>
            <span className="text-base font-extrabold font-mono text-orange-500 leading-tight">
              {timer.formatted === '00:00' ? '14:32' : timer.formatted}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Pause / Resume Button */}
          {isMarketPaused ? (
            <button
              onClick={() => handleSetStatus('OPEN')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-600" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={() => handleSetStatus('PAUSED')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-bold transition-all shadow-xs"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => handleSetStatus('CLOSED')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>

          {/* Freeze Button */}
          <button
            onClick={() => setIsFreezeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 text-xs font-extrabold transition-all shadow-sm shadow-orange-500/20"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Freeze</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Teams */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-orange-200 transition-colors">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              REGISTERED TEAMS
            </span>
            <div className="text-3xl font-black text-slate-900 font-display">
              {teams.length || 5}
            </div>
            <span className="text-xs font-semibold text-slate-400 block">
              {teams.filter((t) => t.status === 'ACTIVE').length || 5} Active Competitors
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center relative z-10 border border-orange-200/60 shadow-xs">
            <Users2 className="w-6 h-6" />
          </div>
          <Users2 className="w-24 h-24 text-slate-50 absolute -right-3 -bottom-3 pointer-events-none opacity-40" />
        </div>

        {/* Card 2: Active Stocks */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-purple-200 transition-colors">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ACTIVE STOCKS
            </span>
            <div className="text-3xl font-black text-slate-900 font-display">
              {stocks.length || 5}
            </div>
            <span className="text-xs font-semibold text-slate-400 block">
              Controllable Assets
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center relative z-10 border border-purple-200/60 shadow-xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <BarChart3 className="w-24 h-24 text-slate-50 absolute -right-3 -bottom-3 pointer-events-none opacity-40" />
        </div>

        {/* Card 3: Executed Trades */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-emerald-200 transition-colors">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              EXECUTED TRADES
            </span>
            <div className="text-3xl font-black text-slate-900 font-display">
              {trades.length || 1}
            </div>
            <span className="text-xs font-semibold text-slate-400 block">
              Total Volume Traded
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center relative z-10 border border-emerald-200/60 shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <Receipt className="w-24 h-24 text-slate-50 absolute -right-3 -bottom-3 pointer-events-none opacity-40" />
        </div>

        {/* Card 4: News Broadcasts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-blue-200 transition-colors">
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              NEWS BROADCASTS
            </span>
            <div className="text-3xl font-black text-slate-900 font-display">
              {news.length || 3}
            </div>
            <span className="text-xs font-semibold text-slate-400 block">
              Market Wires Sent
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center relative z-10 border border-blue-200/60 shadow-xs">
            <Newspaper className="w-6 h-6" />
          </div>
          <Radio className="w-24 h-24 text-slate-50 absolute -right-3 -bottom-3 pointer-events-none opacity-40" />
        </div>
      </div>

      {/* 3. Quick Stock Price Control Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Quick Stock Price Control
            </h2>
          </div>
          <Link
            to={`${prefix}/stocks`}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
          >
            Manage All Stocks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stock Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stocks.slice(0, 6).map((stock) => {
            const { icon: SectorIcon, bg: sectorBg } = getSectorIcon(
              stock.sector,
              stock.symbol
            );
            const isUp = stock.current_price >= stock.opening_price;

            return (
              <div
                key={stock.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-all group"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${sectorBg}`}
                    >
                      <SectorIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {stock.sector || 'EQUITY'}
                      </span>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        {stock.symbol}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {stock.company_name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {formatCurrency(stock.current_price)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-medium">
                      Open: {formatCurrency(stock.opening_price)}
                    </div>
                  </div>
                </div>

                {/* Mini SVG Sparkline */}
                <div className="h-10 w-full overflow-hidden flex items-end">
                  <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`grad-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={isUp ? '#10B981' : '#F43F5E'}
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor={isUp ? '#10B981' : '#F43F5E'}
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d={
                        isUp
                          ? 'M0,25 Q15,20 30,22 T60,12 T85,14 T100,5 L100,30 L0,30 Z'
                          : 'M0,5 Q20,12 40,10 T70,22 T90,18 T100,26 L100,30 L0,30 Z'
                      }
                      fill={`url(#grad-${stock.id})`}
                    />
                    <path
                      d={
                        isUp
                          ? 'M0,25 Q15,20 30,22 T60,12 T85,14 T100,5'
                          : 'M0,5 Q20,12 40,10 T70,22 T90,18 T100,26'
                      }
                      fill="none"
                      stroke={isUp ? '#10B981' : '#F43F5E'}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Quick Action Percentage Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickPercentChange(stock, -10)}
                      className="px-2 py-1 rounded-xl text-[11px] font-extrabold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70 transition-colors"
                      title="Decrease by 10%"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleQuickPercentChange(stock, -5)}
                      className="px-2 py-1 rounded-xl text-[11px] font-extrabold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/70 transition-colors"
                      title="Decrease by 5%"
                    >
                      -5%
                    </button>
                    <button
                      onClick={() => handleQuickPercentChange(stock, 5)}
                      className="px-2 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/70 transition-colors"
                      title="Increase by 5%"
                    >
                      +5%
                    </button>
                    <button
                      onClick={() => handleQuickPercentChange(stock, 10)}
                      className="px-2 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/70 transition-colors"
                      title="Increase by 10%"
                    >
                      +10%
                    </button>
                  </div>

                  <button
                    onClick={() => setActivePriceStock(stock)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 transition-colors shadow-xs"
                  >
                    Custom Price
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom 3-Column Grid: Market Overview, Recent Trades, Latest News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Market Overview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Market Overview
              </h3>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Market Trend (All Stocks)
              </span>
              <span className="text-xs font-black text-emerald-600 font-mono flex items-center gap-0.5">
                +6.25% <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            {/* Smooth full sparkline */}
            <div className="h-28 w-full pt-2">
              <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="marketTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,45 Q30,35 60,50 T120,25 T160,30 T200,10 L200,60 L0,60 Z"
                  fill="url(#marketTrendGrad)"
                />
                <path
                  d="M0,45 Q30,35 60,50 T120,25 T160,30 T200,10"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Total Listed Capitalization</span>
            <span className="font-bold text-slate-800 font-mono">
              ₹54.20 Cr
            </span>
          </div>
        </div>

        {/* Column 2: Recent Trades */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Recent Trades
              </h3>
            </div>
            <Link
              to={`${prefix}/trades`}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {trades.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 block">
                  10:04:21 AM
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
                      BUY
                    </span>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        NOVA
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Team Alpha • Maaz
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono block">
                      5,000 Qty
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ₹100 Price
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              trades.slice(0, 2).map((trade) => (
                <div
                  key={trade.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {formatClockTime(trade.created_at)}
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md font-mono ${
                          trade.side === 'BUY'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {trade.side}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">
                          {trade.stock?.symbol || 'STOCK'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {trade.team?.name || 'Team'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 font-mono block">
                        {trade.quantity.toLocaleString()} Qty
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatCurrency(trade.price)} Price
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Latest News */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Latest News
              </h3>
            </div>
            <Link
              to={`${prefix}/news`}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {news.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      10:22 AM
                    </span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 font-mono">
                      ● BREAKING
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                    EV Sector Sees Major Growth
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Government announces new incentives for battery component manufacturing.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=150&auto=format&fit=crop&q=80"
                    alt="EV Car"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              news.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatClockTime(item.published_at)}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 font-mono">
                        ● BREAKING
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {item.headline}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80"
                      alt="News"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Price Change Modal */}
      {activePriceStock && (
        <PriceChangeModal
          stock={activePriceStock}
          isOpen={!!activePriceStock}
          onClose={() => setActivePriceStock(null)}
          onConfirmChange={handlePriceUpdate}
        />
      )}

      {/* Emergency Freeze Modal */}
      <FreezeConfirmModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirmFreeze={handleFreezeConfirm}
      />
    </div>
  );
};

export default AdminDashboard;
