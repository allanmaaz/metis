import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Event } from '../types';
import { getMockDB, saveMockDB } from './mockData';

export async function getActiveEvent(): Promise<Event> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return data as Event;
      }
    } catch (err) {
      console.error('Error fetching active event:', err);
    }
  }

  const db = getMockDB();
  return db.events[0];
}

export async function closeEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'ENDED', ended_at: new Date().toISOString() })
        .eq('id', eventId);

      if (error) return { success: false, error: error.message };

      // Also set market to CLOSED
      await supabase.from('market_sessions').insert({
        event_id: eventId,
        status: 'CLOSED',
        started_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const db = getMockDB();
  const event = db.events.find((e) => e.id === eventId);
  if (event) {
    event.status = 'ENDED';
    event.ended_at = new Date().toISOString();
    db.marketSessions.push({
      id: `ms_${Date.now()}`,
      event_id: eventId,
      status: 'CLOSED',
      started_at: new Date().toISOString(),
      ends_at: null,
      started_by: null,
      ended_by: null,
      created_at: new Date().toISOString(),
    });
    saveMockDB(db);
    return { success: true };
  }
  return { success: false, error: 'Event not found' };
}
