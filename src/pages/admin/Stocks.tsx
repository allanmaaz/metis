import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getStocks, updateStockPrice, createStock } from '../../services/stock';
import { Event, Stock } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PriceChangeModal } from '../../components/admin/PriceChangeModal';
import { formatCurrency, formatPercent } from '../../lib/formatting';
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
} from 'lucide-react';

export const AdminStocks: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [activePriceStock, setActivePriceStock] = useState<Stock | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New stock form state
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('EV & Auto');
  const [priceStr, setPriceStr] = useState('100');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  useEffect(() => {
    loadStocks();
    const interval = setInterval(loadStocks, 3000);
    return () => clearInterval(interval);
  }, [loadStocks]);

  const handlePriceUpdate = async (stockId: string, newPrice: number, reason: string) => {
    const res = await updateStockPrice(stockId, newPrice, reason);
    if (res.success) {
      loadStocks();
    }
    return res;
  };

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!symbol.trim() || !companyName.trim()) {
      setCreateError('Symbol and Company Name are required.');
      return;
    }
    const price = parseFloat(priceStr) || 100;

    setIsCreating(true);
    setCreateError(null);

    const res = await createStock({
      event_id: event.id,
      symbol: symbol.trim().toUpperCase(),
      company_name: companyName.trim(),
      sector: sector.trim(),
      starting_price: price,
    });

    setIsCreating(false);

    if (res.success) {
      setSymbol('');
      setCompanyName('');
      setIsCreateModalOpen(false);
      loadStocks();
    } else {
      setCreateError(res.error || 'Failed to create stock.');
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
            Control simulated asset prices, high/low tracking, and register new securities.
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
          placeholder="Filter stocks by symbol, name or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
        />
      </div>

      {/* Stocks Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6">Symbol</th>
                <th className="py-3.5 px-6">Company Name</th>
                <th className="py-3.5 px-6">Sector</th>
                <th className="py-3.5 px-6 text-right">Current Price</th>
                <th className="py-3.5 px-6 text-right">Open</th>
                <th className="py-3.5 px-6 text-right">High / Low</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No stocks matching query.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const pct = (
                    ((stock.current_price - stock.opening_price) / (stock.opening_price || 1)) *
                    100
                  );
                  const isUp = pct >= 0;

                  return (
                    <tr key={stock.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Symbol */}
                      <td className="py-4 px-6 font-black font-mono text-base text-slate-900">
                        {stock.symbol}
                      </td>

                      {/* Company Name */}
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {stock.company_name}
                      </td>

                      {/* Sector */}
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Current Price */}
                      <td className="py-4 px-6 text-right">
                        <div className="font-mono font-black text-base text-slate-900">
                          {formatCurrency(stock.current_price)}
                        </div>
                        <div
                          className={`text-xs font-mono font-bold flex items-center justify-end gap-0.5 ${
                            isUp ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isUp ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {formatPercent(pct)}
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
                        <button
                          onClick={() => setActivePriceStock(stock)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200/80 hover:border-orange-200 transition-all flex items-center gap-1.5 mx-auto shadow-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                          <span>Change Price</span>
                        </button>
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

      {/* Add Stock Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Stock to Market"
        subtitle="Create an asset that teams can trade"
      >
        <form onSubmit={handleCreateStock} className="space-y-4">
          <Input
            label="Stock Symbol (Ticker)"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            autoFocus
          />

          <Input
            label="Company Name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <Input
            label="Sector / Industry"
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          />

          <Input
            label="Starting Price (₹)"
            type="number"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
          />

          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
              Create Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStocks;
