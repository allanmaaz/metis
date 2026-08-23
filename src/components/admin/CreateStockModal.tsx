import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import {
  REAL_WORLD_STOCKS,
  REAL_WORLD_CATEGORIES,
  RealWorldStock,
} from '../../data/realWorldStocks';
import { formatCurrency } from '../../lib/formatting';
import { Sparkles, Building2, Search, ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';
import { StockLogo } from '../common/StockLogo';

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

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('All');

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPresetStocks = useMemo(() => {
    return REAL_WORLD_STOCKS.filter((s) => {
      const matchesSearch =
        s.symbol.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        s.sector.toLowerCase().includes(pickerSearch.toLowerCase());

      const matchesSector =
        selectedSectorFilter === 'All' || s.sector === selectedSectorFilter;

      return matchesSearch && matchesSector;
    });
  }, [pickerSearch, selectedSectorFilter]);

  const handleSelectPreset = (preset: RealWorldStock | 'CUSTOM') => {
    if (preset === 'CUSTOM') {
      setSelectedStockSymbol('CUSTOM');
      setSymbol('');
      setCompanyName('');
      setSector('General Market');
      setPriceStr('100');
    } else {
      setSelectedStockSymbol(preset.symbol);
      setSymbol(preset.symbol);
      setCompanyName(preset.name);
      setSector(preset.sector);
      setPriceStr(preset.defaultPrice.toString());
    }
    setIsPickerOpen(false);
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

  const currentSelectedPreset = REAL_WORLD_STOCKS.find(
    (s) => s.symbol === selectedStockSymbol
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <span className="text-white font-black">Add Stock to Market</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Custom Embedded Searchable Preset Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-World Company Preset</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">50+ Marquee Stocks</span>
          </div>

          {/* Trigger Pill */}
          <div
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="w-full rounded-2xl p-3.5 bg-slate-900 border border-slate-700/80 hover:border-orange-500/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              {selectedStockSymbol === 'CUSTOM' ? (
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 font-mono font-black text-xs flex items-center justify-center border border-orange-500/20 shrink-0">
                  +
                </div>
              ) : (
                <StockLogo
                  symbol={symbol}
                  name={companyName}
                  sector={currentSelectedPreset?.sector}
                  size="sm"
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white font-mono truncate">
                    {selectedStockSymbol === 'CUSTOM'
                      ? '✨ Custom Stock (Blank Form)'
                      : `${symbol} — ${companyName}`}
                  </span>
                  {currentSelectedPreset && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 shrink-0">
                      {currentSelectedPreset.sector}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono block">
                  {selectedStockSymbol === 'CUSTOM'
                    ? 'Fill details manually below'
                    : `Preset Starting: ${formatCurrency(parseFloat(priceStr) || 0)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <span className="text-[11px] font-bold hidden sm:inline">
                {isPickerOpen ? 'Hide' : 'Browse'}
              </span>
              {isPickerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {/* Embedded Dropdown Menu */}
          {isPickerOpen && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl space-y-2.5 animate-in fade-in duration-150">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search 50+ companies (e.g. Reliance, HDFC, Tata, Zomato)..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-slate-950 text-white placeholder:text-slate-500 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              {/* Sector Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold font-mono">
                {['All', ...REAL_WORLD_CATEGORIES.filter((c) => c !== 'All Sectors')].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSectorFilter(sec)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
                      selectedSectorFilter === sec
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Scrollable Stocks List */}
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {/* Custom Stock Option */}
                <div
                  onClick={() => handleSelectPreset('CUSTOM')}
                  className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    selectedStockSymbol === 'CUSTOM'
                      ? 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-orange-400" />
                    <span className="font-bold">✨ + Create Custom Stock (Blank)</span>
                  </div>
                  {selectedStockSymbol === 'CUSTOM' && <Check className="w-4 h-4 text-orange-400" />}
                </div>

                {filteredPresetStocks.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No companies match your search.
                  </div>
                ) : (
                  filteredPresetStocks.map((preset) => {
                    const isSelected = selectedStockSymbol === preset.symbol;
                    return (
                      <div
                        key={preset.symbol}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-orange-500/20 border border-orange-500/40 text-white'
                            : 'hover:bg-white/5 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <StockLogo
                            symbol={preset.symbol}
                            name={preset.name}
                            sector={preset.sector}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-white">{preset.symbol}</span>
                              <span className="text-[9px] text-slate-400 font-sans truncate">
                                {preset.name}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500">{preset.sector}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="font-black text-amber-400">
                            ₹{preset.defaultPrice.toLocaleString('en-IN')}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Stock Configuration Fields (Clean 2x2 Grid) */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1.5 font-mono">
              <Building2 className="w-3.5 h-3.5 text-orange-500" />
              <span>Stock Details</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              ● Fully Editable
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
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 border border-slate-700 transition-colors cursor-pointer"
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
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs transition-all shadow-md shadow-orange-500/20 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? 'Adding...' : `Add ${symbol || 'Stock'} (${formatCurrency(parseFloat(priceStr) || 0)})`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStockModal;
