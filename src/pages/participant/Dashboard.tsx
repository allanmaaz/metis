import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getStocks } from '../../services/stock';
import { getCurrentMarketSession } from '../../services/market';
import { getTeamPortfolioSummary, getTeamHoldings } from '../../services/portfolio';
import { getPublishedNews } from '../../services/news';
import { buyStock, sellStock } from '../../services/trade';
import { Stock, MarketSession, PortfolioSummary, NewsItem, Holding } from '../../types';
import { BuyModal } from '../../components/market/BuyModal';
import { SellModal } from '../../components/market/SellModal';
import { formatWealth, formatCurrency, formatPercent, formatClockTime } from '../../lib/formatting';
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

export const Dashboard: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);

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
  const totalWealth = summary?.total_wealth || participant?.team.cash_balance || 56242000;
  const cashBalance = summary ? totalWealth - summary.current_value : (participant?.team.cash_balance || 42000000);
  const portfolioVal = summary?.current_value || 14200000;
  const pnlVal = summary?.total_pnl || -43800000;
  const pnlPct = summary?.unrealized_pnl_pct || -43.8;
  const isLoss = pnlVal < 0;

  return (
    <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
      {/* LEFT COLUMN: Team, Market Status, Total Wealth & Breaking Wire */}
      <div className="md:col-span-5 space-y-3.5">
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

      {/* 1. Team Profile Pill Card */}
      <div
        className={`p-3 rounded-2xl flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-[#131B2E] border border-white/5 shadow-xs'
            : 'bg-white border border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {participant?.team.name.charAt(0) || 'A'}
          </div>
          <div>
            <span className={`font-extrabold text-xs block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Team {participant?.team.name || 'Alpha'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {participant?.member.full_name || 'Mohammed Maaz'}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      {/* 2. Market Status & Session Countdown Card (2-Column Pill) */}
      <div
        className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
          isDark
            ? 'bg-[#131B2E] border border-white/5 shadow-xs'
            : 'bg-white border border-slate-200/80 shadow-xs'
        }`}
      >
        {/* Left: Dynamic Market Status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              session?.status === 'OPEN'
                ? 'bg-emerald-500 animate-pulse'
                : session?.status === 'PAUSED'
                ? 'bg-amber-500 animate-pulse'
                : session?.status === 'FROZEN'
                ? 'bg-cyan-400'
                : 'bg-rose-500'
            }`}
          />
          <span
            className={`text-xs font-black uppercase tracking-wide font-mono ${
              session?.status === 'OPEN'
                ? 'text-emerald-500'
                : session?.status === 'PAUSED'
                ? 'text-amber-500'
                : session?.status === 'FROZEN'
                ? 'text-cyan-400'
                : 'text-rose-500'
            }`}
          >
            MARKET {session?.status || 'OPEN'}
          </span>
        </div>

        {/* Right: Session Countdown / Status */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-400 font-medium">
              {session?.status === 'OPEN' ? 'Session closes in' : 'Session Status'}
            </span>
            <span className="text-xs font-black font-mono text-orange-500">
              {session?.ends_at
                ? timer.isExpired
                  ? 'Expired'
                  : timer.formatted
                : session?.status === 'OPEN'
                ? 'No limit'
                : session?.status || 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Hero Total Wealth Card */}
      <div
        className={`p-5 rounded-3xl space-y-4 relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#131B2E] border border-white/5 shadow-lg'
            : 'bg-white border border-slate-200/80 shadow-sm'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              TOTAL WEALTH
            </span>
            <button
              onClick={() => setIsWealthMasked(!isWealthMasked)}
              className="text-slate-400 hover:text-slate-600 ml-0.5"
            >
              {isWealthMasked ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>

          <span className="text-xs font-bold text-orange-500">
            Team {participant?.team.name || 'Alpha'}
          </span>
        </div>

        {/* Value + Sparkline */}
        <div className="flex items-center justify-between gap-2 relative">
          <div className="space-y-1.5 z-10">
            <div className={`text-3xl sm:text-4xl font-black font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isWealthMasked ? '••••••••' : formatWealth(totalWealth)}
            </div>

            {/* P/L Pill */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold font-mono ${
                isLoss
                  ? isDark
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                  : isDark
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}
            >
              {isLoss ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              <span>{formatWealth(Math.abs(pnlVal))} ({Number(pnlPct).toFixed(1)}%)</span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              Exact Value: {formatCurrency(totalWealth)}
            </div>
          </div>

          {/* Glowing Wave Sparkline */}
          <div className="w-36 sm:w-44 h-16 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 160 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isLoss ? '#F43F5E' : '#FF6B00'}
                    stopOpacity={isDark ? 0.35 : 0.25}
                  />
                  <stop offset="100%" stopColor={isLoss ? '#F43F5E' : '#FF6B00'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,45 L15,40 L30,48 L45,35 L60,42 L75,28 L90,34 L105,22 L120,28 L135,16 L150,10 L160,8 L160,60 L0,60 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M0,45 L15,40 L30,48 L45,35 L60,42 L75,28 L90,34 L105,22 L120,28 L135,16 L150,10 L160,8"
                fill="none"
                stroke={isLoss ? '#F43F5E' : '#FF6B00'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="160" cy="8" r="3.5" fill={isLoss ? '#F43F5E' : '#FF6B00'} />
            </svg>
          </div>
        </div>

        {/* 2-Column Available Cash & Portfolio Value */}
        <div
          className={`grid grid-cols-2 gap-3 pt-3 border-t ${
            isDark ? 'border-white/5' : 'border-slate-100'
          }`}
        >
          {/* Cash */}
          <div
            className={`p-3 rounded-2xl border transition-colors ${
              isDark
                ? 'bg-[#1E293B]/60 border-white/5'
                : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
              <Wallet className="w-3.5 h-3.5 text-orange-500" />
              <span>Available Cash</span>
            </div>
            <div className={`text-sm font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isWealthMasked ? '••••' : formatWealth(cashBalance)}
            </div>
          </div>

          {/* Portfolio Value */}
          <div
            className={`p-3 rounded-2xl border transition-colors ${
              isDark
                ? 'bg-[#1E293B]/60 border-white/5'
                : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Portfolio Value</span>
            </div>
            <div className={`text-sm font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isWealthMasked ? '••••' : formatWealth(portfolioVal)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Latest News Wire Banner */}
      <Link
        to="/news"
        className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 border transition-colors ${
          isDark
            ? 'bg-[#131B2E] border-white/5 hover:bg-[#1E293B]'
            : 'bg-white border-slate-200/80 hover:bg-slate-50 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-orange-500 text-white font-mono">
                LATEST WIRE
              </span>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-400 font-mono">
                {latestNews?.sector || 'EV & Auto'}
              </span>
            </div>
            <p className={`text-xs font-extrabold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {latestNews?.headline || 'Government Announces ₹25,000 Cr Incentive...'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </Link>
    </div>

    {/* RIGHT COLUMN: Market Watchlist */}
    <div className="md:col-span-7 space-y-3.5">
      {/* 5. Market Watchlist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h3 className={`text-xs font-black tracking-wide uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Market Watchlist
            </h3>
          </div>
          <Link to="/market" className="text-xs font-bold text-orange-500 hover:text-orange-400">
            View All ({stocks.length || 5}) ›
          </Link>
        </div>

        {/* Stock Cards List */}
        <div className="space-y-3">
          {stocks.slice(0, 5).map((stock) => {
            const holding = holdings.find((h) => h.stock_id === stock.id);
            const ownedQty = holding?.quantity || (stock.symbol === 'NOVA' ? 50000 : 0);
            const priceDiff = stock.current_price - stock.opening_price;
            const isUp = priceDiff >= 0;
            const pct = (
              ((stock.current_price - stock.opening_price) / (stock.opening_price || 1)) *
              100
            ).toFixed(1);

            return (
              <div
                key={stock.id}
                className={`p-4 rounded-3xl border transition-colors space-y-3 ${
                  isDark
                    ? 'bg-[#131B2E] border-white/5 shadow-md'
                    : 'bg-white border-slate-200/80 shadow-xs'
                }`}
              >
                {/* Header: Symbol + Sector + Change % */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stock.symbol}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-mono">
                      {stock.sector}
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                      isUp
                        ? isDark
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-emerald-50 text-emerald-600'
                        : isDark
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isUp ? '↗' : '↘'} {pct}%
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 -mt-1 font-medium truncate">
                  {stock.company_name}
                </div>

                {/* Price + High/Low/Owned + Jagged Mini Sparkline */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className={`text-xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{Math.round(stock.current_price)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>H: ₹{Math.round(stock.high_price)}</span>
                      <span>·</span>
                      <span>L: ₹{Math.round(stock.low_price)}</span>
                      {ownedQty > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-orange-500 font-bold">
                            Owned: {ownedQty.toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Jagged Sparkline */}
                  <div className="w-24 h-10">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path
                        d={
                          isUp
                            ? 'M0,35 L20,30 L35,33 L50,22 L65,26 L80,14 L100,8'
                            : 'M0,10 L20,18 L35,14 L50,26 L65,22 L80,32 L100,36'
                        }
                        fill="none"
                        stroke={isUp ? '#10B981' : '#F43F5E'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="100"
                        cy={isUp ? '8' : '36'}
                        r="3"
                        fill={isUp ? '#10B981' : '#F43F5E'}
                      />
                    </svg>
                  </div>
                </div>

                {/* BUY / SELL Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleBuy(stock)}
                    disabled={!isMarketOpen}
                    className={`py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all ${
                      isDark
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs shadow-emerald-600/20'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <span>↗ BUY</span>
                  </button>
                  <button
                    onClick={() => handleSell(stock)}
                    disabled={!isMarketOpen || ownedQty === 0}
                    className={`py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all ${
                      isDark
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs shadow-rose-600/20 disabled:opacity-40'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-40'
                    }`}
                  >
                    <span>↘ SELL</span>
                  </button>
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
