import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPublishedNews } from '../../services/news';
import { NewsItem } from '../../types';
import { NewsCard } from '../../components/news/NewsCard';
import { Newspaper, Radio, Filter } from 'lucide-react';

export const News: React.FC = () => {
  const { participant } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const loadNews = useCallback(async () => {
    if (!participant) return;
    try {
      const items = await getPublishedNews(participant.event.id);
      setNews(items);
    } catch (err) {
      console.error('Error fetching news:', err);
    }
  }, [participant]);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 4000);
    return () => clearInterval(interval);
  }, [loadNews]);

  const sectors = ['ALL', ...Array.from(new Set(news.map((n) => n.sector).filter(Boolean) as string[]))];

  const filteredNews = news.filter((item) => {
    if (selectedSector === 'ALL') return true;
    return item.sector === selectedSector;
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-orange-500" />
            Market Wire & News
          </h2>
          <p className="text-xs text-slate-400">
            Real-time macroeconomic updates, regulatory policies & sector reports
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>LIVE FEED</span>
        </div>
      </div>

      {/* Sector Filter Chips */}
      {sectors.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      )}

      {/* News Feed Stream */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl space-y-2">
          <p className="text-slate-400 text-sm">No market news published yet.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNews.map((item, index) => (
            <NewsCard key={item.id} news={item} isBreaking={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
};
