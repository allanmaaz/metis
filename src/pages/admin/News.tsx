import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getPublishedNews, publishNews } from '../../services/news';
import { Event, NewsItem } from '../../types';
import { NewsPublisherModal } from '../../components/admin/NewsPublisherModal';
import { NewsCard } from '../../components/news/NewsCard';
import { Button } from '../../components/ui/Button';
import { Newspaper, Plus, Radio, Send } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-orange-500" />
            Market News Broadcast Wire
          </h1>
          <p className="text-xs text-slate-400">
            Publish market-moving information, industry developments, and policy changes to drive participant strategies.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsPublisherOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Publish Breaking Wire
        </Button>
      </div>

      {/* Published News List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-orange-400 animate-pulse" />
          Broadcasted Wires ({newsList.length})
        </h3>

        {newsList.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <p className="text-slate-400 text-sm">No news wires published yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {newsList.map((item, idx) => (
              <NewsCard key={item.id} news={item} isBreaking={idx === 0} />
            ))}
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
