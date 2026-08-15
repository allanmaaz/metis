import React from 'react';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldCheck,
  Award,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  Coins,
  CheckCircle2,
} from 'lucide-react';

interface TradingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualificationCount?: number;
  startingCapital?: number;
}

export const TradingRulesModal: React.FC<TradingRulesModalProps> = ({
  isOpen,
  onClose,
  qualificationCount = 5,
  startingCapital = 100000000,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Competition Rules & Trading Guidelines"
      subtitle="METIS 2026 — Strategic Virtual Trading Arena"
    >
      <div className="space-y-4 text-xs">
        {/* Starting Capital & Qualification Highlights */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-orange-500 font-extrabold uppercase text-[10px]">
              <Coins className="w-3.5 h-3.5" />
              <span>Initial Capital</span>
            </div>
            <div className="text-base font-black font-mono text-emerald-500">
              ₹10.00 Cr
            </div>
            <span className="text-[10px] text-slate-400">Fixed virtual allocation</span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-orange-500 font-extrabold uppercase text-[10px]">
              <Award className="w-3.5 h-3.5" />
              <span>Qualification Cutoff</span>
            </div>
            <div className="text-base font-black font-mono text-amber-500">
              Top {qualificationCount} Teams
            </div>
            <span className="text-[10px] text-slate-400">Advance to Grand Finals</span>
          </div>
        </div>

        {/* Rule 1: Real-time Execution */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Instant Order Execution
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              All Buy and Sell orders execute immediately at the active market price. There is no partial fulfillment delay.
            </p>
          </div>
        </div>

        {/* Rule 2: Ranking Criteria */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Total Wealth Ranking
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Leaderboard standings are calculated strictly by <strong>Total Wealth = Cash Balance + Current Portfolio Valuation</strong>.
            </p>
          </div>
        </div>

        {/* Rule 3: Circuit Breakers & Session Freeze */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            isDark ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200/70'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Market Halts & Policy Wires
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              The Event Admin can pause or freeze trading at any point during macroeconomic news dispatches. Keep an eye on the <strong>Live News Wire</strong>!
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all mt-2"
        >
          Got it, Return to Trading
        </button>
      </div>
    </Modal>
  );
};

export default TradingRulesModal;
