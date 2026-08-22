import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getStocks } from '../../services/stock';
import { getCurrentMarketSession } from '../../services/market';
import { getTeamHoldings, getTeamPortfolioSummary } from '../../services/portfolio';
import { buyStock, sellStock } from '../../services/trade';
import { Stock, MarketSession, Holding, PortfolioSummary } from '../../types';
import { StockCard } from '../../components/market/StockCard';
import { BuyModal } from '../../components/market/BuyModal';
import { SellModal } from '../../components/market/SellModal';
import { Search, BarChart2, ShieldCheck } from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import { useMarketPulse } from '../../hooks/useMarketPulse';

export const Market: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

  // Live 4-second market pulse micro-fluctuation hook (0.01% - 0.02% around base price when open)
  const { pulsedStocks, isMarketOpen } = useMarketPulse(stocks, session);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const [activeBuyStock, setActiveBuyStock] = useState<Stock | null>(null);
  const [activeSellStock, setActiveSellStock] = useState<Stock | null>(null);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMarket = useCallback(async () => {
    if (!participant) return;
    const eventId = participant.event.id;
    const teamId = participant.team.id;

    try {
      const [stkList, curSession, holdList, portSummary] = await Promise.all([
        getStocks(eventId),
        getCurrentMarketSession(eventId),
        getTeamHoldings(teamId),
        getTeamPortfolioSummary(teamId, eventId),
      ]);

      setStocks(stkList);
      setSession(curSession);
      setHoldings(holdList);
      setSummary(portSummary);
    } catch (err) {
      console.error('Error loading market:', err);
    }
  }, [participant]);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  // Universal Real-Time Sync
  useRealtimeSubscription(
    ['MARKET_SESSION_CHANGED', 'STOCK_PRICE_UPDATED', 'TRADE_EXECUTED', 'PORTFOLIO_CHANGED'],
    loadMarket,
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
      loadMarket();
    };

    window.addEventListener('metis_market_session_changed', handleMarketChange);
    return () => window.removeEventListener('metis_market_session_changed', handleMarketChange);
  }, [loadMarket, participant]);

  const sectors = ['ALL', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  const filteredStocks = pulsedStocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const cashBalance =
    summary?.cash_balance !== undefined
      ? summary.cash_balance
      : (participant?.team.cash_balance ?? 100000000);

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
      setTradeMessage({ type: 'success', text: `Order executed! Bought ${quantity.toLocaleString('en-IN')} shares.` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadMarket();
    }
    return res;
  };

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    if (!isTrader) return { success: false, error: 'Trading restricted to designated primary trader.' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Order executed! Sold ${quantity.toLocaleString('en-IN')} shares.` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadMarket();
    }
    return res;
  };

  return (
    <div className="space-y-5 w-full max-w-5xl mx-auto pb-8">
      {/* Header & Role Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className={`text-xl sm:text-2xl font-black font-display tracking-tight flex items-center gap-2 whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 shrink-0" />
          <span>Market Board</span>
        </h1>

        <div className="flex items-center gap-2">
          {isTrader ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ⭐ Primary Trader (Full Access)
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              👁️ Team Viewer / Analyst Mode
            </span>
          )}
        </div>
      </div>

      {/* Viewer Mode Guidance Banner */}
      {!isTrader && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <span className="text-base">👁️</span>
          <span>
            You are logged in as a <strong>Team Analyst</strong>. You have full live view of real-time market movements, charts, and news. Only your team's designated <strong>Primary Trader</strong> can execute Buy/Sell orders.
          </span>
        </div>
      )}

      {/* Trade Feedback */}
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

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search by ticker symbol or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs ${
            isDark
              ? 'bg-[#131B2E] text-white placeholder:text-slate-500 border border-white/5'
              : 'bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80'
          }`}
        />
      </div>

      {/* Sector Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setSelectedSector(sector)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSector === sector
                ? 'bg-orange-500 text-white shadow-xs'
                : isDark
                ? 'bg-[#131B2E] text-slate-400 border border-white/5 hover:bg-[#1E293B] hover:text-white'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStocks.length === 0 ? (
          <div
            className={`rounded-3xl p-12 text-center text-xs font-medium border ${
              isDark
                ? 'bg-[#131B2E] text-slate-400 border-white/5'
                : 'bg-white text-slate-400 border-slate-200/80'
            }`}
          >
            No stocks found matching your filters.
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const holding = holdings.find((h) => h.stock_id === stock.id);
            return (
              <StockCard
                key={stock.id}
                stock={stock}
                ownedQuantity={holding?.quantity || 0}
                marketOpen={isMarketOpen}
                isTrader={isTrader}
                onBuy={handleBuy}
                onSell={handleSell}
              />
            );
          })
        )}
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

export default Market;
