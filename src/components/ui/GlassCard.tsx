import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive' | 'orange-glow' | 'profit-glow' | 'danger-glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'glass-panel rounded-2xl',
    subtle: 'glass-panel-subtle rounded-2xl',
    interactive: 'glass-panel-interactive rounded-2xl cursor-pointer',
    'orange-glow': 'glass-panel rounded-2xl border-orange-500/30 glow-orange',
    'profit-glow': 'glass-panel rounded-2xl border-emerald-500/30 glow-profit',
    'danger-glow': 'glass-panel rounded-2xl border-rose-500/30 glow-loss',
  };

  return (
    <div
      className={twMerge(clsx(variantStyles[variant], paddingStyles[padding], className))}
      {...props}
    >
      {children}
    </div>
  );
};
