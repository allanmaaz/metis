import React from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeValue?: string;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'orange-glow' | 'profit-glow' | 'danger-glow';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  changeValue,
  subtext,
  icon,
  variant = 'default',
  className = '',
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <GlassCard variant={variant} className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
          {value}
        </span>

        {change !== undefined && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : isNegative
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {(changeValue || subtext) && (
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          {changeValue && (
            <span className={isPositive ? 'text-emerald-400 font-medium' : isNegative ? 'text-rose-400 font-medium' : 'text-slate-400'}>
              {changeValue}
            </span>
          )}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </GlassCard>
  );
};
