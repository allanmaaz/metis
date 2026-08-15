import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  REAL_WORLD_STOCKS,
  REAL_WORLD_CATEGORIES,
  RealWorldStock,
} from '../../data/realWorldStocks';
import { formatCurrency } from '../../lib/formatting';
import { Search, Sparkles, Building2, Check, TrendingUp } from 'lucide-react';

interface CreateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCreate: (data: {
    symbol: string;
    company_name: string;
    sector: string;
    starting_price: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const CreateStockModal: React.FC<CreateStockModalProps> = ({
  isOpen,
  onClose,
  onConfirmCreate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Sectors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<RealWorldStock | null>(
    REAL_WORLD_STOCKS[0]
  );

  const [symbol, setSymbol] = useState(REAL_WORLD_STOCKS[0].symbol);
  const [companyName, setCompanyName] = useState(REAL_WORLD_STOCKS[0].name);
  const [sector, setSector] = useState(REAL_WORLD_STOCKS[0].sector);
  const [priceStr, setPriceStr] = useState(
    REAL_WORLD_STOCKS[0].defaultPrice.toString()
  );

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter stocks based on category & search query
  const filteredStocks = REAL_WORLD_STOCKS.filter((stock) => {
    const matchesCat =
      selectedCategory === 'All Sectors' || stock.sector === selectedCategory;
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectPreset = (stock: RealWorldStock) => {
    setSelectedStock(stock);
    setSymbol(stock.symbol);
    setCompanyName(stock.name);
    setSector(stock.sector);
    setPriceStr(stock.defaultPrice.toString());
    setError(null);
  };

  const handleSetPricePreset = (presetPrice: number) => {
    setPriceStr(presetPrice.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSymbol = symbol.trim().toUpperCase();
    const cleanName = companyName.trim();
    const cleanSector = sector.trim();
    const numPrice = parseFloat(priceStr);

    if (!cleanSymbol) {
      setError('Please enter a valid stock symbol/ticker.');
      return;
    }
    if (!cleanName) {
      setError('Please enter a company name.');
      return;
    }
    if (!cleanSector) {
      setError('Please enter a sector/category.');
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setError('Starting price must be greater than zero.');
      return;
    }

    setIsCreating(true);
    setError(null);

    const res = await onConfirmCreate({
      symbol: cleanSymbol,
      company_name: cleanName,
      sector: cleanSector,
      starting_price: numPrice,
    });

    setIsCreating(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to create stock.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Real-Life Stock to Market"
      subtitle="Select from marquee real-world companies or create custom assets with your custom starting price."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Category Filter Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Browse Real-World Companies by Category:</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {REAL_WORLD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Quick Search Preset Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search real-life company or ticker (e.g. Reliance, TCS, Apple, Zomato)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* 3. Preset Quick Selector Grid */}
        <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5 rounded-2xl border border-slate-200/70 p-2 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {filteredStocks.map((stock) => {
              const isSelected =
                symbol === stock.symbol && companyName === stock.name;
              return (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleSelectPreset(stock)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500/40 shadow-xs'
                      : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs font-mono text-slate-900">
                        {stock.symbol}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                        {stock.sector}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {stock.name}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black font-mono text-slate-900">
                      {formatCurrency(stock.defaultPrice)}
                    </div>
                    {isSelected && (
                      <span className="text-[9px] text-orange-600 font-extrabold flex items-center justify-end gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Stock Configuration Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-mono">
              <Building2 className="w-3.5 h-3.5 text-orange-500" />
              <span>Stock Details & Custom Pricing</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Fully Editable
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Stock Symbol (Ticker)"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE"
            />

            <Input
              label="Company Name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Reliance Industries Ltd"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Sector / Category"
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="e.g. Energy & Power"
            />

            <div>
              <Input
                label="Starting Price (₹)"
                type="number"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="e.g. 1000"
              />
              {/* Quick Price Buttons */}
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] text-slate-400 font-bold mr-1">
                  Quick:
                </span>
                {[100, 500, 1000, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetPricePreset(preset)}
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors"
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            Add {symbol || 'Stock'} ({formatCurrency(parseFloat(priceStr) || 0)})
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStockModal;
