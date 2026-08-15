import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NewsItem } from '../types';
import { getMockDB, saveMockDB } from './mockData';

export async function getPublishedNews(eventId: string): Promise<NewsItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (!error && data) {
        return data as NewsItem[];
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    }
  }

  const db = getMockDB();
  return db.news
    .filter((n) => n.event_id === eventId && n.is_published)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

export async function publishNews(data: {
  event_id: string;
  headline: string;
  body: string;
  sector: string;
  admin_id?: string;
}): Promise<{ success: boolean; data?: NewsItem; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { data: created, error } = await supabase
        .from('news')
        .insert({
          event_id: data.event_id,
          headline: data.headline.trim(),
          body: data.body.trim(),
          sector: data.sector.trim(),
          published_by: data.admin_id || null,
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      // Audit log
      await supabase.from('audit_logs').insert({
        event_id: data.event_id,
        actor_type: 'ADMIN',
        actor_id: data.admin_id || null,
        action: 'NEWS_PUBLISHED',
        entity_type: 'NEWS',
        entity_id: created.id,
        new_value: { headline: data.headline, sector: data.sector },
        reason: 'Published market breaking news',
      });

      return { success: true, data: created as NewsItem };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
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
  return { success: true, data: newItem };
}
