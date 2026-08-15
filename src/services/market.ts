import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MarketSession, MarketStatus } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';

export async function getCurrentMarketSession(eventId: string): Promise<MarketSession> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('market_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data as MarketSession;
      }
    } catch (err) {
      console.error('Error fetching market session:', err);
    }
  }

  const db = getMockDB();
  const session = db.marketSessions
    .filter((s) => s.event_id === eventId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    session || {
      id: 'ms_default',
      event_id: eventId,
      status: 'OPEN',
      started_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 30 * 60000).toISOString(),
      started_by: null,
      ended_by: null,
      created_at: new Date().toISOString(),
    }
  );
}

export async function setMarketStatus(
  eventId: string,
  status: MarketStatus,
  durationMinutes?: number,
  reason?: string,
  adminId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const ends_at =
    durationMinutes && durationMinutes > 0
      ? new Date(Date.now() + durationMinutes * 60000).toISOString()
      : null;

  // 1. Always update local mock DB and broadcast immediately
  const db = getMockDB();
  const newSession: MarketSession = {
    id: `ms_${Date.now()}`,
    event_id: eventId,
    status,
    started_at: new Date().toISOString(),
    ends_at,
    started_by: adminId || null,
    ended_by: null,
    created_at: new Date().toISOString(),
  };

  db.marketSessions.push(newSession);

  if (status === 'OPEN') {
    db.teams.forEach((t) => {
      const teamHoldings = db.holdings.filter((h) => h.team_id === t.id);
      const holdingsVal = teamHoldings.reduce((sum, h) => {
        const stk = db.stocks.find((s) => s.id === h.stock_id);
        return sum + h.quantity * (stk?.current_price || 0);
      }, 0);
      t.starting_wealth = t.cash_balance + holdingsVal;
    });
  }

  db.auditLogs.unshift({
    id: `al_${Date.now()}`,
    event_id: eventId,
    actor_type: 'ADMIN',
    actor_id: adminId || null,
    action: `MARKET_STATUS_${status}`,
    entity_type: 'MARKET',
    entity_id: newSession.id,
    old_value: null,
    new_value: { status, ends_at, durationMinutes },
    reason: reason || `Market status changed to ${status}`,
    metadata: null,
    created_at: new Date().toISOString(),
  });

  saveMockDB(db);

  // Broadcast to all participant tabs and windows immediately
  broadcastRealtimeEvent('MARKET_SESSION_CHANGED', { status, ends_at });

  // 2. Also execute on remote Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('set_market_status', {
        p_event_id: eventId === 'e1' ? (db.events[0]?.id || eventId) : eventId,
        p_status: status,
        p_duration_minutes: durationMinutes || null,
        p_admin_id: adminId || null,
        p_reason: reason || `Admin set status to ${status}`,
      });

      if (!error) {
        return { success: true, data };
      }
    } catch (err: any) {
      console.warn('Supabase set_market_status warning (saved locally):', err);
    }
  }

  return { success: true, data: newSession };
}
