import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStocks } from '../../services/stock';
import { getCurrentMarketSession } from '../../services/market';
import { getTeamHoldings, getTeamPortfolioSummary } from '../../services/portfolio';
import { buyStock, sellStock } from '../../services/trade';
import { Stock, MarketSession, Holding, PortfolioSummary } from '../../types';
import { StockCard } from '../../components/market/StockCard';
import { BuyModal } from '../../components/market/BuyModal';
import { SellModal } from '../../components/market/SellModal';
import { MarketStatusBadge } from '../../components/ui/MarketStatusBadge';
import { formatWealth } from '../../lib/formatting';
import { Search, Filter, Sparkles, TrendingUp } from 'lucide-react';

export const Market: React.FC = () => {
  const { participant } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [session, setSession] = useState<MarketSession | null>(null);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

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
    const interval = setInterval(loadMarket, 3000);
    return () => clearInterval(interval);
  }, [loadMarket]);

  const sectors = ['ALL', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const handleConfirmBuy = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await buyStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully bought ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadMarket();
    }
    return res;
  };

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Successfully sold ${quantity.toLocaleString('en-IN')} shares!` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadMarket();
    }
    return res;
  };

  const isMarketOpen = session?.status === 'OPEN';

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

      {/* Header with Market Status & Team Cash */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-orange-500" />
            Live Market
          </h2>
          <p className="text-xs text-slate-400">
            Real-time simulated stock exchange for college challenge
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <MarketStatusBadge status={session?.status || 'OPEN'} size="md" />
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Available Cash
            </span>
            <span className="text-sm font-extrabold font-display text-orange-400">
              {formatWealth(summary?.cash_balance ?? participant?.team.cash_balance ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Sector Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search companies by name or ticker (e.g. NOVA, FINEDGE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Sector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      {filteredStocks.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-2">
          <p className="text-slate-400 text-sm">No stocks found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => {
            const holding = holdings.find((h) => h.stock_id === stock.id);
            return (
              <StockCard
                key={stock.id}
                stock={stock}
                ownedQuantity={holding?.quantity || 0}
                marketOpen={isMarketOpen}
                onBuy={() => setActiveBuyStock(stock)}
                onSell={() => setActiveSellStock(stock)}
              />
            );
          })}
        </div>
      )}

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
