import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Event } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';

export async function getActiveEvent(): Promise<Event> {
  let event: Event | null = null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        event = data as Event;
      }
    } catch (err) {
      console.error('Error fetching active event:', err);
    }
  }

  if (!event) {
    const db = getMockDB();
    event = db.events[0];
  }

  // Parse leaderboard visibility & metric if stored in description
  if (event && event.description) {
    try {
      if (event.description.startsWith('{') && event.description.endsWith('}')) {
        const parsed = JSON.parse(event.description);
        event.is_leaderboard_visible = parsed.leaderboard_visible !== false;
        event.leaderboard_metric = parsed.leaderboard_metric || 'PORTFOLIO_VALUE';
        event.description = parsed.text || parsed.description || event.description;
      }
    } catch {
      // Plain text description, default to visible and portfolio value
      event.is_leaderboard_visible = true;
      event.leaderboard_metric = 'PORTFOLIO_VALUE';
    }
  } else if (event) {
    event.is_leaderboard_visible = true;
    event.leaderboard_metric = 'PORTFOLIO_VALUE';
  }

  return event;
}

export async function setLeaderboardVisibility(
  eventId: string,
  visible: boolean
): Promise<{ success: boolean; is_leaderboard_visible: boolean; error?: string }> {
  const db = getMockDB();
  const event = db.events.find((e) => e.id === eventId || eventId === 'e1') || db.events[0];
  if (event) {
    event.is_leaderboard_visible = visible;
    saveMockDB(db);
  }

  if (isSupabaseConfigured) {
    try {
      const currentDesc = event?.description || 'The Strategic Market Challenge — Live Virtual Stock Trading Arena';
      const meta = JSON.stringify({
        text: currentDesc.startsWith('{') ? (JSON.parse(currentDesc).text || currentDesc) : currentDesc,
        leaderboard_visible: visible,
        leaderboard_metric: event?.leaderboard_metric || 'PORTFOLIO_VALUE',
      });

      await supabase
        .from('events')
        .update({ description: meta })
        .eq('id', eventId);
    } catch (err: any) {
      console.warn('Error setting leaderboard visibility on Supabase:', err);
    }
  }

  broadcastRealtimeEvent('LEADERBOARD_UPDATED', { is_leaderboard_visible: visible, leaderboard_metric: event?.leaderboard_metric || 'PORTFOLIO_VALUE' });
  broadcastRealtimeEvent('MARKET_SESSION_CHANGED', { is_leaderboard_visible: visible });

  return { success: true, is_leaderboard_visible: visible };
}

export async function setLeaderboardMetric(
  eventId: string,
  metric: 'PORTFOLIO_VALUE' | 'TOTAL_WEALTH'
): Promise<{ success: boolean; leaderboard_metric: 'PORTFOLIO_VALUE' | 'TOTAL_WEALTH'; error?: string }> {
  const db = getMockDB();
  const event = db.events.find((e) => e.id === eventId || eventId === 'e1') || db.events[0];
  if (event) {
    event.leaderboard_metric = metric;
    saveMockDB(db);
  }

  if (isSupabaseConfigured) {
    try {
      const currentDesc = event?.description || 'The Strategic Market Challenge — Live Virtual Stock Trading Arena';
      const meta = JSON.stringify({
        text: currentDesc.startsWith('{') ? (JSON.parse(currentDesc).text || currentDesc) : currentDesc,
        leaderboard_visible: event?.is_leaderboard_visible !== false,
        leaderboard_metric: metric,
      });

      await supabase
        .from('events')
        .update({ description: meta })
        .eq('id', eventId);
    } catch (err: any) {
      console.warn('Error setting leaderboard metric on Supabase:', err);
    }
  }

  broadcastRealtimeEvent('LEADERBOARD_UPDATED', { leaderboard_metric: metric });

  return { success: true, leaderboard_metric: metric };
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

export async function updateEventSettings(
  eventId: string,
  updates: {
    name?: string;
    round_name?: string;
    starting_capital?: number;
    qualification_count?: number;
  }
): Promise<{ success: boolean; data?: Event; error?: string }> {
  const db = getMockDB();
  const event = db.events.find((e) => e.id === eventId || eventId === 'e1') || db.events[0];
  if (event) {
    if (updates.name !== undefined) event.name = updates.name.trim();
    if (updates.round_name !== undefined) event.round_name = updates.round_name.trim();
    if (updates.starting_capital !== undefined) event.starting_capital = Number(updates.starting_capital);
    if (updates.qualification_count !== undefined) event.qualification_count = Number(updates.qualification_count);
    saveMockDB(db);
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...(updates.name ? { name: updates.name.trim() } : {}),
          ...(updates.round_name ? { round_name: updates.round_name.trim() } : {}),
          ...(updates.starting_capital ? { starting_capital: Number(updates.starting_capital) } : {}),
          ...(updates.qualification_count ? { qualification_count: Number(updates.qualification_count) } : {}),
        })
        .eq('id', eventId)
        .select()
        .maybeSingle();

      if (!error && data) {
        return { success: true, data: data as Event };
      }
    } catch (err: any) {
      console.warn('Supabase updateEventSettings warning:', err);
    }
  }

  return { success: true, data: event };
}
