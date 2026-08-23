import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getStocks, updateStockPrice, createStock, deleteStock, getActiveGlides } from '../../services/stock';
import { Event, Stock } from '../../types';
import { PriceChangeModal } from '../../components/admin/PriceChangeModal';
import { CreateStockModal } from '../../components/admin/CreateStockModal';
import { StockHoldingsModal } from '../../components/admin/StockHoldingsModal';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  PieChart,
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import { StockLogo } from '../../components/common/StockLogo';

export const AdminStocks: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [activeGlides, setActiveGlides] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [activePriceStock, setActivePriceStock] = useState<Stock | null>(null);
  const [activeHoldingsStock, setActiveHoldingsStock] = useState<Stock | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadStocks = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const list = await getStocks(activeEvent.id);
      setStocks(list);
    } catch (err) {
      console.error('Error loading stocks:', err);
    }
  }, []);

  const refreshGlides = useCallback(() => {
    setActiveGlides(getActiveGlides());
  }, []);

  useEffect(() => {
    loadStocks();
    refreshGlides();
  }, [loadStocks, refreshGlides]);

  useEffect(() => {
    const interval = setInterval(refreshGlides, 800);
    return () => clearInterval(interval);
  }, [refreshGlides]);

  // Universal Real-Time Sync
  useRealtimeSubscription(['STOCK_PRICE_UPDATED'], () => {
    loadStocks();
    refreshGlides();
  }, 1000);

  const handlePriceUpdate = async (
    stockId: string,
    newPrice: number,
    reason: string,
    durationSec?: number
  ) => {
    const res = await updateStockPrice(
      stockId,
      newPrice,
      reason,
      undefined,
      durationSec ?? 15
    );
    if (res.success) {
      loadStocks();
      refreshGlides();
    }
    return res;
  };

  const handleCreateStock = async (data: {
    symbol: string;
    company_name: string;
    sector: string;
    starting_price: number;
  }) => {
    if (!event) return { success: false, error: 'No active event found' };

    const res = await createStock({
      event_id: event.id,
      symbol: data.symbol,
      company_name: data.company_name,
      sector: data.sector,
      starting_price: data.starting_price,
    });

    if (res.success) {
      loadStocks();
    }
    return res;
  };

  const handleDeleteStock = async (stock: Stock) => {
    if (window.confirm(`Are you sure you want to remove "${stock.symbol} - ${stock.company_name}" from the market?`)) {
      await deleteStock(stock.id);
      loadStocks();
    }
  };

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5 whitespace-nowrap">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
            <span>Stock & Valuation Management</span>
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm shadow-orange-500/20 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stock</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search stocks by symbol, company name, or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
        />
      </div>

      {/* 1. Mobile Cards View (Visible on screens < md) */}
      <div className="block md:hidden space-y-3">
        {filteredStocks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-sm font-medium border border-slate-200/80">
            No stocks found matching your search.
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const priceDiff = stock.current_price - stock.opening_price;
            const isUp = priceDiff >= 0;
            const pctChange = stock.opening_price > 0 ? (priceDiff / stock.opening_price) * 100 : 0;
            const glide = activeGlides.find((g) => g.stockId === stock.id);

            return (
              <div
                key={stock.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                {/* Top Row: Asset + Current Price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StockLogo
                      symbol={stock.symbol}
                      name={stock.company_name}
                      sector={stock.sector}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-base text-slate-900 font-mono">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 truncate">
                          {stock.sector}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium truncate block">
                        {stock.company_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {formatCurrency(stock.current_price)}
                    </span>
                    <div
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono mt-0.5 ${
                        isUp
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>
                        {isUp ? '+' : ''}
                        {formatPercent(pctChange)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gliding Status Indicator */}
                {glide && (
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-600 font-bold font-mono flex items-center gap-1.5 animate-pulse">
                    <span>🌊 Gliding to {formatCurrency(glide.targetPrice)}</span>
                  </div>
                )}

                {/* Middle Row: Session Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center font-mono">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Open</span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatCurrency(stock.opening_price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-emerald-600 block">High</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {formatCurrency(stock.high_price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-rose-600 block">Low</span>
                    <span className="text-xs font-bold text-rose-600">
                      {formatCurrency(stock.low_price)}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setActivePriceStock(stock)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <span>Adjust Price</span>
                  </button>

                  <button
                    onClick={() => setActiveHoldingsStock(stock)}
                    title="View Team Holdings & Ownership"
                    className="w-10 h-10 rounded-xl bg-white hover:bg-orange-50 text-slate-500 hover:text-orange-600 border border-slate-200 hover:border-orange-200 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                  >
                    <PieChart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop Table View (Visible on screens >= md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
            <tr>
              <th className="py-3.5 px-4 w-[38%]">Asset & Sector</th>
              <th className="py-3.5 px-4 text-right w-[20%]">Price & 24h Trend</th>
              <th className="py-3.5 px-4 text-right w-[20%]">Session Range</th>
              <th className="py-3.5 px-4 text-right w-[22%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-slate-400 text-sm font-sans font-medium">
                  No stocks found matching your search.
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock) => {
                const priceDiff = stock.current_price - stock.opening_price;
                const isUp = priceDiff >= 0;
                const pctChange = stock.opening_price > 0 ? (priceDiff / stock.opening_price) * 100 : 0;
                const glide = activeGlides.find((g) => g.stockId === stock.id);

                return (
                  <tr key={stock.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Asset & Sector */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-2.5 font-sans min-w-0">
                        <StockLogo
                          symbol={stock.symbol}
                          name={stock.company_name}
                          sector={stock.sector}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900 font-mono">
                              {stock.symbol}
                            </span>
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 truncate">
                              {stock.sector}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium truncate block">
                            {stock.company_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Current Price & 24h Trend */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-slate-900 font-mono">
                          {formatCurrency(stock.current_price)}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              isUp
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>
                              {isUp ? '+' : ''}
                              {formatPercent(pctChange)}
                            </span>
                          </div>
                        </div>
                        {glide && (
                          <span className="text-[9.5px] text-orange-500 font-bold font-mono animate-pulse mt-0.5">
                            🌊 Gliding ➔ {formatCurrency(glide.targetPrice)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Session Range */}
                    <td className="py-3.5 px-4 align-middle text-right font-mono">
                      <div className="flex flex-col items-end space-y-0.5">
                        <div className="text-emerald-600 font-bold text-xs">
                          H: {formatCurrency(stock.high_price)}
                        </div>
                        <div className="text-rose-600 font-bold text-xs">
                          L: {formatCurrency(stock.low_price)}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Open: {formatCurrency(stock.opening_price)}
                        </div>
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActivePriceStock(stock)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 hover:border-orange-300 transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                          <span>Adjust Price</span>
                        </button>

                        <button
                          onClick={() => setActiveHoldingsStock(stock)}
                          title="View Team Holdings & Ownership"
                          className="w-8 h-8 rounded-xl bg-white hover:bg-orange-50 text-slate-500 hover:text-orange-600 border border-slate-200 hover:border-orange-200 flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
                        >
                          <PieChart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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

      {/* Stock Holdings Breakdown Modal */}
      {activeHoldingsStock && (
        <StockHoldingsModal
          stock={activeHoldingsStock}
          isOpen={!!activeHoldingsStock}
          onClose={() => setActiveHoldingsStock(null)}
        />
      )}

      {/* Add Real-Life Stock Modal */}
      <CreateStockModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirmCreate={handleCreateStock}
      />
    </div>
  );
};

export default AdminStocks;
