import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
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
import {
  Wallet,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Car,
  Landmark,
  Zap,
  HeartPulse,
  ShoppingBag,
  Eye,
  EyeOff,
  ChevronDown,
  FileText,
  BarChart2,
  Pause,
  Snowflake,
  ShieldCheck,
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

  // Sector Icon & Badge Helper
  const getStockSectorBadge = (sector: string, symbol: string) => {
    const s = (sector + ' ' + symbol).toLowerCase();
    if (s.includes('auto') || s.includes('ev') || s.includes('nova')) {
      return { icon: Car, bg: 'bg-orange-50 text-orange-500 border-orange-200/80' };
    }
    if (s.includes('bank') || s.includes('finedge') || s.includes('fin')) {
      return { icon: Landmark, bg: 'bg-indigo-50 text-indigo-500 border-indigo-200/80' };
    }
    if (s.includes('energy') || s.includes('greenx') || s.includes('power')) {
      return { icon: Zap, bg: 'bg-emerald-50 text-emerald-500 border-emerald-200/80' };
    }
    if (s.includes('pharma') || s.includes('medix') || s.includes('health')) {
      return { icon: HeartPulse, bg: 'bg-blue-50 text-blue-500 border-blue-200/80' };
    }
    return { icon: ShoppingBag, bg: 'bg-orange-50 text-orange-600 border-orange-200/80' };
  };

  const isMarketOpen = session?.status === 'OPEN';
  const totalWealth = summary?.total_wealth || participant?.team.cash_balance || 184200000;
  const cashBalance = summary ? totalWealth - summary.current_value : (participant?.team.cash_balance || 42000000);
  const portfolioVal = summary?.current_value || 142200000;
  const pnlVal = summary?.total_pnl || 24200000;
  const pnlPct = summary?.unrealized_pnl_pct || 15.12;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Trade Success / Error Feedback Toast */}
      {tradeMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
            tradeMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{tradeMessage.text}</span>
        </div>
      )}

      {/* 1. Top Market Status & Timer Bar */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
        <div className="flex flex-col pl-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider font-mono">
              MARKET OPEN
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Session ends in</span>
            <span className="text-sm font-black font-mono text-orange-500">
              {timer.formatted === '00:00' ? '14:32' : timer.formatted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>
          <button
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold shadow-xs transition-colors"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Freeze</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Total Wealth Card */}
      <div className="bg-white p-5 rounded-3xl border border-orange-200/70 shadow-sm space-y-4 relative overflow-hidden">
        {/* Top title & Today selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              TOTAL WEALTH
            </span>
            <button
              onClick={() => setIsWealthMasked(!isWealthMasked)}
              className="text-slate-400 hover:text-slate-600"
            >
              {isWealthMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600">
            <span>Today</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {/* Wealth Value + Sparkline Area */}
        <div className="flex items-center justify-between gap-2 relative">
          <div className="space-y-1 z-10">
            <div className="text-3xl sm:text-4xl font-black font-display text-orange-500 tracking-tight">
              {isWealthMasked ? '••••••••' : formatWealth(totalWealth)}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <span>▲ {formatWealth(pnlVal)} ({pnlPct}%)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              Today's P/L
            </span>
          </div>

          {/* Right Wave Sparkline */}
          <div className="w-40 h-16 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 160 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,50 Q20,40 40,48 T80,30 T120,32 T160,10 L160,60 L0,60 Z"
                fill="url(#wealthGrad)"
              />
              <path
                d="M0,50 Q20,40 40,48 T80,30 T120,32 T160,10"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Cash & Portfolio Value 2-Column Subcards */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          {/* Cash */}
          <Link
            to="/portfolio"
            className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 flex items-center justify-between transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
                <Wallet className="w-3.5 h-3.5 text-orange-500" />
                <span>CASH</span>
              </div>
              <div className="text-sm font-black font-mono text-slate-900">
                {isWealthMasked ? '••••' : formatWealth(cashBalance)}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </Link>

          {/* Portfolio Value */}
          <Link
            to="/portfolio"
            className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 flex items-center justify-between transition-colors"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span>PORTFOLIO VALUE</span>
              </div>
              <div className="text-sm font-black font-mono text-slate-900">
                {isWealthMasked ? '••••' : formatWealth(portfolioVal)}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </Link>
        </div>
      </div>

      {/* 3. Latest Market News Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              LATEST MARKET NEWS
            </h3>
          </div>
          <Link
            to="/news"
            className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All
          </Link>
        </div>

        <Link
          to="/news"
          className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/60 transition-colors"
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-mono">
                ● BREAKING
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
              {latestNews?.headline || 'EV Sector Sees Major Growth'}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {latestNews?.body || 'Government announces major incentives for electric vehicle manufacturers.'}
            </p>
            <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
              {latestNews ? formatClockTime(latestNews.published_at) : '10:22 AM'}
            </span>
          </div>

          <div className="w-20 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=160&auto=format&fit=crop&q=80"
              alt="EV Car"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>

      {/* 4. Market Watch List Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              MARKET WATCH
            </h3>
          </div>
          <Link
            to="/market"
            className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Stock Rows */}
        <div className="divide-y divide-slate-100">
          {stocks.slice(0, 5).map((stock) => {
            const { icon: SectorIcon, bg: sectorBg } = getStockSectorBadge(
              stock.sector,
              stock.symbol
            );
            const isUp = stock.current_price >= stock.opening_price;
            const pct = (
              ((stock.current_price - stock.opening_price) / (stock.opening_price || 1)) *
              100
            ).toFixed(2);

            return (
              <div
                key={stock.id}
                className="py-3 flex items-center justify-between gap-2 hover:bg-slate-50/50 transition-colors rounded-xl px-1"
              >
                {/* Left: Icon + Symbol + Company */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${sectorBg}`}
                  >
                    <SectorIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-sm text-slate-900 tracking-tight">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[100px] sm:max-w-[130px]">
                      {stock.company_name}
                    </span>
                  </div>
                </div>

                {/* Middle: Price + % Change */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-black font-mono text-slate-900">
                    {formatCurrency(stock.current_price)}
                  </div>
                  <div
                    className={`text-[10px] font-bold font-mono flex items-center justify-end gap-0.5 ${
                      isUp ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isUp ? '▲' : '▼'} {pct}%
                  </div>
                </div>

                {/* Right: BUY / SELL Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <button
                    onClick={() => handleBuy(stock)}
                    disabled={!isMarketOpen}
                    className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors disabled:opacity-50"
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => handleSell(stock)}
                    disabled={!isMarketOpen}
                    className="px-3 py-1 rounded-xl text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    SELL
                  </button>
                </div>
              </div>
            );
          })}
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
