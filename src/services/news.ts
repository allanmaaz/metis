import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NewsItem } from '../types';
import { getMockDB, saveMockDB } from './mockData';

export async function getPublishedNews(eventId?: string): Promise<NewsItem[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (eventId && eventId !== 'e1') {
        // If specific UUID event is provided
        query = query.or(`event_id.eq.${eventId},event_id.eq.e1`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data as NewsItem[];
      }
    } catch (err) {
      console.error('Error fetching news from Supabase:', err);
    }
  }

  // Fallback to local database
  const db = getMockDB();
  return db.news
    .filter((n) => n.is_published)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

export async function publishNews(data: {
  event_id: string;
  headline: string;
  body: string;
  sector: string;
  admin_id?: string;
}): Promise<{ success: boolean; data?: NewsItem; error?: string }> {
  const newItem: NewsItem = {
    id: `n_${Date.now()}`,
    event_id: data.event_id,
    headline: data.headline.trim(),
    body: data.body.trim(),
    sector: data.sector.trim(),
    published_by: data.admin_id || null,
    published_at: new Date().toISOString(),
    is_published: true,
  };

  // 1. Always save to local mock DB for instant offline & cross-tab sync
  const db = getMockDB();
  db.news.unshift(newItem);
  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: data.event_id,
    actor_type: 'ADMIN',
    actor_id: data.admin_id || null,
    action: 'NEWS_PUBLISHED',
    entity_type: 'NEWS',
    entity_id: newItem.id,
    old_value: null,
    new_value: { headline: data.headline, sector: data.sector },
    reason: 'Published market breaking news',
    metadata: null,
    created_at: new Date().toISOString(),
  });
  saveMockDB(db);

  // Trigger browser storage and custom sync events
  window.dispatchEvent(new CustomEvent('metis_news_updated', { detail: newItem }));

  // 2. Also insert into remote Supabase database if configured
  if (isSupabaseConfigured) {
    try {
      const { data: created, error } = await supabase
        .from('news')
        .insert({
          event_id: data.event_id === 'e1' ? (db.events[0]?.id || data.event_id) : data.event_id,
          headline: data.headline.trim(),
          body: data.body.trim(),
          sector: data.sector.trim(),
          published_by: data.admin_id || null,
          is_published: true,
          published_at: newItem.published_at,
        })
        .select()
        .maybeSingle();

      if (!error && created) {
        return { success: true, data: created as NewsItem };
      }
    } catch (err: any) {
      console.warn('Supabase news insert warning (saved to local sync):', err);
    }
  }

  return { success: true, data: newItem };
}

export async function deleteNews(newsId: string): Promise<{ success: boolean; error?: string }> {
  const db = getMockDB();
  db.news = db.news.filter((n) => n.id !== newsId);
  saveMockDB(db);
  window.dispatchEvent(new CustomEvent('metis_news_updated'));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('news').delete().eq('id', newsId);
    } catch (err) {
      console.error('Error deleting news from Supabase:', err);
    }
  }

  return { success: true };
}
