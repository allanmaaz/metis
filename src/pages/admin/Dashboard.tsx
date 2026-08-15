import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getCurrentMarketSession, setMarketStatus } from '../../services/market';
import { getStocks, updateStockPrice } from '../../services/stock';
import { getTeams } from '../../services/admin';
import { getAllTrades } from '../../services/trade';
import { getPublishedNews } from '../../services/news';
import { Event, MarketSession, Stock, Team, Trade, NewsItem } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { MarketStatusBadge } from '../../components/ui/MarketStatusBadge';
import { PriceChangeModal } from '../../components/admin/PriceChangeModal';
import { FreezeConfirmModal } from '../../components/admin/FreezeConfirmModal';
import { formatCurrency, formatWealth, formatClockTime } from '../../lib/formatting';
import { useMarketTimer } from '../../hooks/useMarketTimer';
import {
  Users2,
  BarChart3,
  Receipt,
  Newspaper,
  Power,
  PauseCircle,
  PlayCircle,
  AlertOctagon,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const isMarketFrozen = session?.status === 'FROZEN';

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
            {event?.round_name || 'Round 2'}
          </span>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            {event?.name || 'METIS 2026'} Control Center
          </h1>
        </div>

        {/* Live Market Control Pill */}
        <div className="flex items-center gap-2 p-2 rounded-2xl glass-panel border-white/10">
          <MarketStatusBadge status={session?.status || 'OPEN'} size="md" />

          {isMarketOpen ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSetStatus('PAUSED')}
              leftIcon={<PauseCircle className="w-4 h-4 text-amber-400" />}
            >
              Pause
            </Button>
          ) : (
            <Button
              variant="profit"
              size="sm"
              onClick={() => handleSetStatus('OPEN')}
              leftIcon={<PlayCircle className="w-4 h-4" />}
            >
              Open Market
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsFreezeModalOpen(true)}
            leftIcon={<AlertOctagon className="w-4 h-4" />}
          >
            Freeze
          </Button>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Teams"
          value={teams.length}
          subtext={`${teams.filter((t) => t.status === 'ACTIVE').length} Active Competitors`}
          icon={<Users2 className="w-5 h-5 text-orange-400" />}
        />
        <StatCard
          label="Active Stocks"
          value={stocks.length}
          subtext="Controllable Assets"
          icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          label="Executed Trades"
          value={trades.length}
          subtext="Total Volume Traded"
          icon={<Receipt className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          label="News Broadcasts"
          value={news.length}
          subtext="Market Wires Sent"
          icon={<Newspaper className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Stock Live Control & Price Manager Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Quick Stock Price Control
          </h3>
          <Link
            to="/control/stocks"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            Manage All Stocks <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {stocks.map((stock) => (
            <GlassCard key={stock.id} variant="default" className="p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {stock.sector}
                  </span>
                  <h4 className="text-lg font-extrabold font-display text-white">
                    {stock.symbol}
                  </h4>
                  <span className="text-xs text-slate-400 truncate block max-w-[160px]">
                    {stock.company_name}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-extrabold text-white">
                    {formatCurrency(stock.current_price)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Open: {formatCurrency(stock.opening_price)}
                  </span>
                </div>
              </div>

              {/* Price Change Button */}
              <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePriceUpdate(stock.id, Math.round(stock.current_price * 0.95), 'Quick -5% step')}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => handlePriceUpdate(stock.id, Math.round(stock.current_price * 1.05), 'Quick +5% step')}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                  >
                    +5%
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePriceStock(stock)}
                  className="text-xs"
                >
                  Custom Price
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-400" />
            Live Incoming Trade Feed
          </h3>
          <Link
            to="/control/trades"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            Full Trade Log <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-slate-800">
          {trades.slice(0, 5).map((trade) => {
            const isBuy = trade.side === 'BUY';
            return (
              <div key={trade.id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase font-mono ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {trade.side}
                  </span>
                  <div>
                    <span className="font-bold text-white">Team {trade.team?.name || '---'}</span>
                    <span className="text-slate-400 ml-2">
                      traded {trade.quantity.toLocaleString('en-IN')} {trade.stock?.symbol} @ {formatCurrency(trade.price)}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="font-bold text-white block">
                    {formatCurrency(trade.total_value)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatClockTime(trade.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <PriceChangeModal
        isOpen={Boolean(activePriceStock)}
        onClose={() => setActivePriceStock(null)}
        stock={activePriceStock}
        onConfirmChange={handlePriceUpdate}
      />

      <FreezeConfirmModal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        onConfirmFreeze={handleFreezeConfirm}
      />
    </div>
  );
};
