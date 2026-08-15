import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getStocks, updateStockPrice, createStock } from '../../services/stock';
import { Event, Stock } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
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
  Edit2,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            Stock & Valuation Management
          </h1>
          <p className="text-xs text-slate-400">
            Control simulated asset prices, high/low tracking, and register new securities.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Add New Stock
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Filter stocks by symbol, name or sector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Stocks Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Open</th>
                <th className="py-3 px-4 text-right">High / Low</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredStocks.map((stock) => {
                const diff = stock.current_price - stock.opening_price;
                const pct = stock.opening_price > 0 ? (diff / stock.opening_price) * 100 : 0;
                const isPositive = diff > 0;

                return (
                  <tr key={stock.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white text-base">
                      {stock.symbol}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300 font-medium">
                      {stock.company_name}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-base text-white">
                      {formatCurrency(stock.current_price)}
                      <span
                        className={`text-[10px] block ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatPercent(pct)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {formatCurrency(stock.opening_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 text-xs">
                      <span className="text-emerald-400">H: {formatCurrency(stock.high_price)}</span>
                      <br />
                      <span className="text-rose-400">L: {formatCurrency(stock.low_price)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActivePriceStock(stock)}
                        leftIcon={<DollarSign className="w-3.5 h-3.5 text-orange-400" />}
                      >
                        Change Price
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Stock Modal */}
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
            placeholder="e.g. VALKYRIE, CYBER"
            autoFocus
          />

          <Input
            label="Company Name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Valkyrie Aerospace Technologies"
          />

          <Input
            label="Sector / Industry"
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="e.g. Defence & Aerospace"
          />

          <Input
            label="Starting Price (₹)"
            type="number"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            placeholder="100"
          />

          {createError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
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

      {/* Price Change Modal */}
      <PriceChangeModal
        isOpen={Boolean(activePriceStock)}
        onClose={() => setActivePriceStock(null)}
        stock={activePriceStock}
        onConfirmChange={handlePriceUpdate}
      />
    </div>
  );
};
