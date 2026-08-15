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

export const Market: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
  }, [loadMarket]);

  // Universal Real-Time Sync
  useRealtimeSubscription(
    ['MARKET_SESSION_CHANGED', 'STOCK_PRICE_UPDATED', 'TRADE_EXECUTED', 'PORTFOLIO_CHANGED'],
    loadMarket,
    1500
  );

  const sectors = ['ALL', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const isMarketOpen = session?.status === 'OPEN';
  const cashBalance = participant?.team.cash_balance || 42000000;

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
      setTradeMessage({ type: 'success', text: `Order executed! Bought ${quantity.toLocaleString('en-IN')} shares.` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadMarket();
    }
    return res;
  };

  const handleConfirmSell = async (stockId: string, quantity: number) => {
    if (!participant) return { success: false, error: 'No active session' };
    const res = await sellStock(participant.team.id, stockId, quantity, participant.member.id);
    if (res.success) {
      setTradeMessage({ type: 'success', text: `Order executed! Sold ${quantity.toLocaleString('en-IN')} shares.` });
      setTimeout(() => setTradeMessage(null), 4000);
      loadMarket();
    }
    return res;
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-black font-display tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <BarChart2 className="w-6 h-6 text-orange-500" />
          Market Board
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Browse listed equities, track live prices, and execute buy/sell orders.
        </p>
      </div>

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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setSelectedSector(sector)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSector === sector
                ? 'bg-orange-500 text-white shadow-xs'
                : isDark
                ? 'bg-[#131B2E] text-slate-400 border border-white/5 hover:bg-[#1E293B]'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
