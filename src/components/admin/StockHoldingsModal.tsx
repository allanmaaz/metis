import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Stock } from '../../types';
import { getStockHoldingDistribution, StockHoldingDistribution } from '../../services/stock';
import { formatCurrency, formatPercent, formatWealth } from '../../lib/formatting';
import { PieChart, Users, TrendingUp, TrendingDown, Minus, Briefcase, Layers, RefreshCw } from 'lucide-react';
import { StockLogo } from '../common/StockLogo';

interface StockHoldingsModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockHoldingsModal: React.FC<StockHoldingsModalProps> = ({
  stock,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<StockHoldingDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!stock) return;
    setIsLoading(true);
    try {
      const dist = await getStockHoldingDistribution(stock.id);
      setData(dist);
    } catch (err) {
      console.error('Failed to load stock holdings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stock) {
      loadData();
    }
  }, [isOpen, stock]);

  if (!stock) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center justify-between gap-3 pr-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <StockLogo
              symbol={stock.symbol}
              name={stock.company_name}
              sector={stock.sector}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white font-mono">{stock.symbol}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {stock.sector}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium truncate block">
                {stock.company_name}
              </span>
            </div>
          </div>

          <button
            onClick={loadData}
            title="Refresh Holdings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 1. Key Metrics Summary Grid (3 Columns) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Total Shares Held */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-orange-400" />
              <span>Total Shares</span>
            </span>
            <span className="text-base sm:text-lg font-black text-white font-mono mt-1">
              {(data?.total_quantity || 0).toLocaleString()}
            </span>
          </div>

          {/* Total Market Value */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Total Valuation</span>
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono mt-1">
              {formatWealth(data?.total_value || 0)}
            </span>
          </div>

          {/* Holding Teams Count */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Holding Teams</span>
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1">
              {data?.teams_count || 0} Teams
            </span>
          </div>
        </div>

        {/* 2. Breakdown Section Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-orange-500" />
            <span>Team Ownership Distribution</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Sorted by quantity
          </span>
        </div>

        {/* 3. Team Holdings List */}
        <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              Loading active portfolio holdings...
            </div>
          ) : !data || data.teams.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center text-slate-400 text-xs font-medium">
              No teams currently hold <span className="font-bold text-white">{stock.symbol}</span> in their portfolios.
            </div>
          ) : (
            data.teams.map((item, index) => {
              const isPnlPositive = item.unrealized_pnl >= 0;

              return (
                <div
                  key={item.team_id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all space-y-2.5"
                >
                  {/* Top Row: Team Name + Quantity */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-white/10 text-slate-300 text-[11px] font-black font-mono flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-black text-sm text-white truncate block">
                          {item.team_name}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Ownership % */}
                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-white font-mono">
                        {item.quantity.toLocaleString()} Shares
                      </span>
                      <span className="text-[10px] font-bold text-orange-400 font-mono block">
                        {item.holding_pct.toFixed(1)}% of total held
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar for Ownership Share */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, item.holding_pct))}%` }}
                    />
                  </div>

                  {/* Bottom Stats: Avg Cost, Value & Unrealized PnL */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Avg Buy</span>
                      <span className="font-bold text-slate-300">
                        {formatCurrency(item.average_cost)}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase block">Valuation</span>
                      <span className="font-bold text-slate-200">
                        {formatCurrency(item.current_value)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase block">Unrealized P&L</span>
                      <div
                        className={`font-black flex items-center justify-end gap-0.5 ${
                          isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPnlPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>
                          {isPnlPositive ? '+' : ''}
                          {formatPercent(item.unrealized_pnl_pct)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs transition-colors cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StockHoldingsModal;
