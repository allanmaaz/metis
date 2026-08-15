import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPublishedNews } from '../../services/news';
import { NewsItem } from '../../types';
import { formatClockTime } from '../../lib/formatting';
import { Newspaper, Radio, Filter, FileText } from 'lucide-react';

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
    <div className="space-y-4 max-w-lg mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            Market News & Wires
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time macroeconomic flashes, regulatory policies & sector catalysts.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
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
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs font-medium">
            No breaking market news published yet. Check back soon!
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-mono">
                  ● BREAKING
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatClockTime(item.published_at)}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                {item.headline}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.body}
              </p>

              {item.sector && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase font-mono">
                  <span>Sector: {item.sector}</span>
                  <span className="text-slate-300">METIS Official Dispatch</span>
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
