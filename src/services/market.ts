import { supabase, isSupabaseConfigured, isValidUuid } from '../lib/supabase';
import { MarketSession, MarketStatus } from '../types';
import { getMockDB, saveMockDB } from './mockData';
import { broadcastRealtimeEvent } from '../lib/realtimeBus';

export async function getCurrentMarketSession(eventId?: string): Promise<MarketSession> {
  const db = getMockDB();

  if (isSupabaseConfigured) {
    try {
      let sessionData: any = null;

      if (eventId && isValidUuid(eventId)) {
        const { data, error } = await supabase
          .from('market_sessions')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          sessionData = data;
        }
      }

      if (!sessionData) {
        const { data: latestData, error: latestErr } = await supabase
          .from('market_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!latestErr && latestData) {
          sessionData = latestData;
        }
      }

      if (sessionData) {
        const remoteSession = sessionData as MarketSession;
        // Sync into local DB
        const existingIdx = db.marketSessions.findIndex((s) => s.id === remoteSession.id);
        if (existingIdx >= 0) {
          db.marketSessions[existingIdx] = remoteSession;
        } else {
          db.marketSessions.push(remoteSession);
        }
        saveMockDB(db);
        return remoteSession;
      }
    } catch (err) {
      // Fallback to local database
    }
  }

  const sortedSessions = [...db.marketSessions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const matched = eventId
    ? sortedSessions.find((s) => s.event_id === eventId || s.event_id === 'e1' || eventId === 'e1')
    : sortedSessions[0];

  return (
    matched ||
    sortedSessions[0] || {
      id: 'ms_default',
      event_id: eventId || 'e1',
      status: 'OPEN',
      started_at: new Date().toISOString(),
      ends_at: null,
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
  broadcastRealtimeEvent('MARKET_SESSION_CHANGED', { status, ends_at, session: newSession });

  // 2. Also execute on remote Supabase if configured
  if (isSupabaseConfigured) {
    const targetEventId = isValidUuid(eventId) ? eventId : (db.events[0]?.id || 'e1111111-1111-1111-1111-111111111111');
    try {
      await supabase.from('market_sessions').insert({
        event_id: targetEventId,
        status,
        started_at: newSession.started_at,
        ends_at,
      });
    } catch (err: any) {
      console.warn('Supabase set_market_status warning (saved locally):', err);
    }
  }

  return { success: true, data: newSession };
}
