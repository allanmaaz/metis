import React from 'react';
import { NewsItem } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { formatRelativeTime } from '../../lib/formatting';
import { Radio, Clock } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
  isBreaking?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, isBreaking = false }) => {
  return (
    <GlassCard
      variant={isBreaking ? 'orange-glow' : 'default'}
      className="p-4 sm:p-5 relative overflow-hidden transition-all duration-200"
    >
      {/* Top Meta */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {isBreaking ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-orange-500 text-white shadow-md shadow-orange-500/30 animate-pulse">
              <Radio className="w-3 h-3" /> BREAKING NEWS
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              MARKET WIRE
            </span>
          )}

          {news.sector && (
            <span className="text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
              {news.sector}
            </span>
          )}
        </div>

        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(news.published_at)}
        </span>
      </div>

      {/* Headline */}
      <h4 className="text-base sm:text-lg font-bold font-display text-white tracking-tight leading-snug mb-2">
        {news.headline}
      </h4>

      {/* Body */}
      <p className="text-sm text-slate-300 leading-relaxed">
        {news.body}
      </p>
    </GlassCard>
  );
};
