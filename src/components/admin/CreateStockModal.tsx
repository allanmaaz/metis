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
import { Sparkles, Building2, Search, ArrowRight } from 'lucide-react';

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
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(
    REAL_WORLD_STOCKS[0].symbol
  );

  const [symbol, setSymbol] = useState(REAL_WORLD_STOCKS[0].symbol);
  const [companyName, setCompanyName] = useState(REAL_WORLD_STOCKS[0].name);
  const [sector, setSector] = useState(REAL_WORLD_STOCKS[0].sector);
  const [priceStr, setPriceStr] = useState(
    REAL_WORLD_STOCKS[0].defaultPrice.toString()
  );

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStockSymbol(val);

    if (val === 'CUSTOM') {
      setSymbol('');
      setCompanyName('');
      setSector('General Market');
      setPriceStr('100');
      setError(null);
      return;
    }

    const matched = REAL_WORLD_STOCKS.find((s) => s.symbol === val);
    if (matched) {
      setSymbol(matched.symbol);
      setCompanyName(matched.name);
      setSector(matched.sector);
      setPriceStr(matched.defaultPrice.toString());
      setError(null);
    }
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

  const selectedStockData = REAL_WORLD_STOCKS.find((s) => s.symbol === symbol);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Stock to Market"
      subtitle="Choose a real-world company or create a custom asset, then set your custom starting price."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Real-World Stock Quick Selector Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5 text-orange-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-World Company Preset</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              50+ Marquee Stocks
            </span>
          </label>

          <select
            value={selectedStockSymbol}
            onChange={handleDropdownSelect}
            className="w-full rounded-2xl px-4 py-3 text-sm font-bold bg-slate-800/80 dark:bg-[#1E293B] text-white border border-slate-700 dark:border-white/10 focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
          >
            <option value="CUSTOM">✨ + Create Custom Stock...</option>
            {REAL_WORLD_CATEGORIES.filter((c) => c !== 'All Sectors').map((cat) => {
              const stocksInCat = REAL_WORLD_STOCKS.filter((s) => s.sector === cat);
              if (stocksInCat.length === 0) return null;
              return (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {stocksInCat.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} — {stock.name} (Default: ₹{stock.defaultPrice.toLocaleString('en-IN')})
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* 2. Stock Configuration Fields (Clean 2x2 Grid) */}
        <div className="p-4 rounded-2xl bg-slate-900/60 dark:bg-[#182235] border border-slate-800 dark:border-white/5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 dark:border-white/5 pb-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-mono">
              <Building2 className="w-3.5 h-3.5 text-orange-500" />
              <span>Stock Details & Custom Price</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              ✓ Fully Editable
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Stock Symbol (Ticker)"
              type="text"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value.toUpperCase());
                setSelectedStockSymbol('CUSTOM');
              }}
              placeholder="e.g. RELIANCE"
            />

            <Input
              label="Company Name"
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setSelectedStockSymbol('CUSTOM');
              }}
              placeholder="e.g. Reliance Industries Ltd"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Sector / Industry"
              type="text"
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setSelectedStockSymbol('CUSTOM');
              }}
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
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold mr-0.5">
                  Presets:
                </span>
                {[100, 500, 1000, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetPricePreset(preset)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 border border-slate-700 transition-colors"
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
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
