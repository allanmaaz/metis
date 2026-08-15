import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getPublishedNews, publishNews } from '../../services/news';
import { Event, NewsItem } from '../../types';
import { NewsPublisherModal } from '../../components/admin/NewsPublisherModal';
import { Newspaper, Plus, Radio, Clock } from 'lucide-react';
import { formatClockTime } from '../../lib/formatting';

export const AdminNews: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);

  const loadNews = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const list = await getPublishedNews(activeEvent.id);
      setNewsList(list);
    } catch (err) {
      console.error('Error loading news:', err);
    }
  }, []);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 3000);
    return () => clearInterval(interval);
  }, [loadNews]);

  const handlePublish = async (data: any) => {
    const res = await publishNews(data);
    if (res.success) {
      loadNews();
    }
    return res;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <Newspaper className="w-7 h-7 text-orange-500" />
            Market News Broadcast Wire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Publish market-moving information, industry developments, and policy changes to drive participant strategies.
          </p>
        </div>

        <button
          onClick={() => setIsPublisherOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm transition-all shadow-sm shadow-orange-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Breaking Wire</span>
        </button>
      </div>

      {/* Published News List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Broadcasted Wires ({newsList.length})
          </h3>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-slate-400 text-sm font-medium">No news wires published yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsList.map((item, idx) => {
              const isBreaking = idx === 0;
              return (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono border ${
                          isBreaking
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isBreaking ? '● BREAKING NEWS' : 'MARKET WIRE'}
                      </span>

                      {item.sector && (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 font-mono">
                          {item.sector}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-400 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatClockTime(item.published_at)}</span>
                    </div>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {item.headline}
                  </h4>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Publisher Modal */}
      {event && (
        <NewsPublisherModal
          isOpen={isPublisherOpen}
          onClose={() => setIsPublisherOpen(false)}
          eventId={event.id}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default AdminNews;
