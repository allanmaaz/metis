import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getStocks, updateStockPrice, createStock, deleteStock, getActiveGlides } from '../../services/stock';
import { Event, Stock } from '../../types';
import { PriceChangeModal } from '../../components/admin/PriceChangeModal';
import { CreateStockModal } from '../../components/admin/CreateStockModal';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Trash2,
} from 'lucide-react';
import { useRealtimeSubscription } from '../../lib/realtimeBus';

export const AdminStocks: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [activeGlides, setActiveGlides] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [activePriceStock, setActivePriceStock] = useState<Stock | null>(null);
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-orange-500" />
            Stock & Valuation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Pick from real-world companies or custom assets, control simulated market prices, and manage sectors.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm transition-all shadow-sm shadow-orange-500/20 self-start sm:self-auto"
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

      {/* Stocks Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6">Asset / Security</th>
                <th className="py-3.5 px-6">Sector</th>
                <th className="py-3.5 px-6 text-right">Current Price</th>
                <th className="py-3.5 px-6 text-right">Round Change</th>
                <th className="py-3.5 px-6 text-right">Opening Price</th>
                <th className="py-3.5 px-6 text-right">Session High / Low</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-sans font-medium">
                    No stocks found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const priceDiff = stock.current_price - stock.opening_price;
                  const isUp = priceDiff >= 0;
                  const pctChange = stock.opening_price > 0 ? (priceDiff / stock.opening_price) * 100 : 0;

                  return (
                    <tr key={stock.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Asset */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 font-sans">
                          <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-orange-600 font-black text-xs flex items-center justify-center border border-orange-200/60 shadow-xs">
                            {stock.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 block font-mono">
                              {stock.symbol}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {stock.company_name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-4 px-6 font-sans">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Current Price */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-base font-extrabold text-slate-900">
                            {formatCurrency(stock.current_price)}
                          </span>
                          {activeGlides.find((g) => g.stockId === stock.id) && (
                            <span className="text-[10px] text-orange-500 font-bold font-mono animate-pulse flex items-center gap-1 mt-0.5">
                              <span>🌊 Gliding ➔ {formatCurrency(activeGlides.find((g) => g.stockId === stock.id)!.targetPrice)}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Round Change */}
                      <td className="py-4 px-6 text-right font-mono text-xs font-bold">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${
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
                      </td>

                      {/* Open */}
                      <td className="py-4 px-6 text-right font-mono text-xs font-medium text-slate-400">
                        {formatCurrency(stock.opening_price)}
                      </td>

                      {/* High / Low */}
                      <td className="py-4 px-6 text-right font-mono text-xs space-y-0.5">
                        <div className="text-emerald-600 font-bold">
                          H: {formatCurrency(stock.high_price)}
                        </div>
                        <div className="text-rose-600 font-bold">
                          L: {formatCurrency(stock.low_price)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActivePriceStock(stock)}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/80 hover:border-orange-200 transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                            <span>Change Price</span>
                          </button>

                          <button
                            onClick={() => handleDeleteStock(stock)}
                            title="Remove Stock"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 flex items-center justify-center transition-all shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
