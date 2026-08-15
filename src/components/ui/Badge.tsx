import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'orange' | 'green' | 'red' | 'yellow' | 'purple' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}) => {
  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    red: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const dotColor = {
    default: 'bg-slate-400',
    orange: 'bg-orange-400 animate-pulse',
    green: 'bg-emerald-400 animate-pulse',
    red: 'bg-rose-400 animate-pulse',
    yellow: 'bg-amber-400 animate-pulse',
    purple: 'bg-purple-400 animate-pulse',
    blue: 'bg-blue-400 animate-pulse',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs sm:text-sm',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-md',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[variant]}`} />}
      {children}
    </span>
  );
};
