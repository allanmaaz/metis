import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { NewsItem } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';

export async function getPublishedNews(eventId?: string): Promise<NewsItem[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (eventId && isValidUuid(eventId)) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data as NewsItem[];
      }
    } catch (err) {
      // Clean fallback to mock data
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

  // Instant Realtime Bus broadcast
  broadcastRealtimeEvent('NEWS_UPDATED', newItem);

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
  // 1. Remove from local DB
  const db = getMockDB();
  db.news = db.news.filter((n) => n.id !== newsId);
  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: db.events[0]?.id || 'e1',
    actor_type: 'ADMIN',
    actor_id: null,
    action: 'NEWS_DELETED',
    entity_type: 'NEWS',
    entity_id: newsId,
    old_value: null,
    new_value: null,
    reason: 'Deleted news broadcast',
    metadata: null,
    created_at: new Date().toISOString(),
  });
  saveMockDB(db);

  // Instant Realtime Bus broadcast
  broadcastRealtimeEvent('NEWS_UPDATED', { deletedId: newsId });

  // 2. Remove from Supabase
  if (isSupabaseConfigured) {
    try {
      await supabase.from('news').delete().eq('id', newsId);
    } catch (err) {
      console.error('Error deleting news from Supabase:', err);
    }
  }

  return { success: true };
}
