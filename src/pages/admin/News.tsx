import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getPublishedNews, publishNews, deleteNews } from '../../services/news';
import { Event, NewsItem } from '../../types';
import { NewsPublisherModal } from '../../components/admin/NewsPublisherModal';
import { useRealtimeSubscription } from '../../lib/realtimeBus';
import { Newspaper, Plus, Radio, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { formatClockTime } from '../../lib/formatting';

export const AdminNews: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  }, [loadNews]);

  // Realtime subscription: updates on news publish or delete instantly
  useRealtimeSubscription(['NEWS_UPDATED'], loadNews, 1500);

  const handlePublish = async (data: any) => {
    const res = await publishNews(data);
    if (res.success) {
      loadNews();
    }
    return res;
  };

  const handleDelete = async (newsId: string) => {
    if (confirm('Are you sure you want to delete this broadcasted news wire? It will be removed from all participant feeds immediately.')) {
      setDeletingId(newsId);
      await deleteNews(newsId);
      setDeletingId(null);
      loadNews();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5 whitespace-nowrap">
            <Newspaper className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
            <span>Market News Broadcast Wire</span>
          </h1>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Broadcasted Wires ({newsList.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Real-time synchronized</span>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <p className="text-slate-400 text-sm font-medium">No news wires published yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsList.map((item, idx) => {
              const isBreaking = idx === 0;
              const isDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all relative overflow-hidden group"
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

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-mono font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatClockTime(item.published_at)}</span>
                      </div>

                      {/* Delete News Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        title="Delete this wire broadcast"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
