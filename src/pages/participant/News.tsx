import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPublishedNews } from '../../services/news';
import { NewsItem } from '../../types';
import { formatClockTime } from '../../lib/formatting';
import { Radio, FileText } from 'lucide-react';

export const News: React.FC = () => {
  const { participant } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const loadNews = useCallback(async () => {
    try {
      const eventId = participant?.event?.id;
      const items = await getPublishedNews(eventId);
      setNews(items);
    } catch (err) {
      console.error('Error fetching news:', err);
    }
  }, [participant?.event?.id]);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 2000);

    const handleNewsUpdate = () => {
      loadNews();
    };

    window.addEventListener('metis_news_updated', handleNewsUpdate);
    window.addEventListener('storage', handleNewsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('metis_news_updated', handleNewsUpdate);
      window.removeEventListener('storage', handleNewsUpdate);
    };
  }, [loadNews]);

  const sectors = ['ALL', ...Array.from(new Set(news.map((n) => n.sector).filter(Boolean) as string[]))];

  const filteredNews = news.filter((item) => {
    if (selectedSector === 'ALL') return true;
    return item.sector === selectedSector;
  });

  return (
    <div className="space-y-4 max-w-md mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black font-display tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <FileText className="w-6 h-6 text-orange-500" />
            Market News & Wires
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Real-time macroeconomic flashes, regulatory policies & sector catalysts.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Sector Filter Chips */}
      {sectors.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-orange-500 text-white shadow-xs'
                  : isDark
                  ? 'bg-[#131B2E] text-slate-400 border border-white/5 hover:bg-[#1E293B]'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      )}

      {/* News Feed Cards */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div
            className={`rounded-3xl p-12 text-center text-xs font-medium border ${
              isDark
                ? 'bg-[#131B2E] text-slate-400 border-white/5'
                : 'bg-white text-slate-400 border-slate-200/80'
            }`}
          >
            No breaking market news published yet. Check back soon!
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border space-y-2 transition-shadow ${
                isDark
                  ? 'bg-[#131B2E] border-white/5 shadow-md'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
                  ● BREAKING
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatClockTime(item.published_at)}
                </span>
              </div>

              <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.headline}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {item.body}
              </p>

              {item.sector && (
                <div
                  className={`pt-2 border-t flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono ${
                    isDark ? 'border-white/5' : 'border-slate-100'
                  }`}
                >
                  <span>Sector: {item.sector}</span>
                  <span className="text-slate-500">METIS Dispatch</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default News;
