import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export type RealtimeEventType =
  | 'MARKET_SESSION_CHANGED'
  | 'STOCK_PRICE_UPDATED'
  | 'NEWS_UPDATED'
  | 'TRADE_EXECUTED'
  | 'PORTFOLIO_CHANGED'
  | 'TEAM_UPDATED'
  | 'LEADERBOARD_UPDATED';

interface RealtimeMessage {
  type: RealtimeEventType;
  payload?: any;
  timestamp: number;
}

// Native Browser BroadcastChannel for instant 0ms cross-tab & cross-window sync
const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('metis_universal_realtime_bus')
    : null;

// Global Supabase Realtime Channel for millisecond cross-device WebSocket sync & Postgres CDC
let globalSupabaseChannel: any = null;

if (isSupabaseConfigured) {
  try {
    globalSupabaseChannel = supabase
      .channel('metis_global_realtime_bus', {
        config: {
          broadcast: { ack: false, self: false },
        },
      })
      .on('broadcast', { event: '*' }, (payload: any) => {
        if (payload?.payload && typeof window !== 'undefined') {
          const msg = payload.payload as RealtimeMessage;
          window.dispatchEvent(new CustomEvent('metis_realtime_event', { detail: msg }));
          if (msg.type) {
            window.dispatchEvent(new CustomEvent(`metis_${msg.type.toLowerCase()}`, { detail: msg.payload }));
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
        if (typeof window !== 'undefined') {
          let changeType: RealtimeEventType = 'LEADERBOARD_UPDATED';
          if (payload?.table === 'stocks') changeType = 'STOCK_PRICE_UPDATED';
          else if (payload?.table === 'market_sessions') changeType = 'MARKET_SESSION_CHANGED';
          else if (payload?.table === 'news') changeType = 'NEWS_UPDATED';
          else if (payload?.table === 'trades') changeType = 'TRADE_EXECUTED';
          else if (payload?.table === 'holdings') changeType = 'PORTFOLIO_CHANGED';
          else if (payload?.table === 'teams') changeType = 'TEAM_UPDATED';

          const msgPayload = payload.new || payload;
          window.dispatchEvent(new CustomEvent('metis_realtime_event', { detail: { type: changeType, payload: msgPayload } }));
          window.dispatchEvent(new CustomEvent(`metis_${changeType.toLowerCase()}`, { detail: msgPayload }));
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ Connected to Metis Ultra-Low-Latency Realtime WebSocket Bus');
        }
      });
  } catch (err) {
    console.warn('Supabase global channel init warning:', err);
  }
}

if (broadcastChannel && typeof window !== 'undefined') {
  broadcastChannel.addEventListener('message', (event: MessageEvent<RealtimeMessage>) => {
    if (event.data) {
      window.dispatchEvent(new CustomEvent('metis_realtime_event', { detail: event.data }));
      if (event.data.type) {
        window.dispatchEvent(new CustomEvent(`metis_${event.data.type.toLowerCase()}`, { detail: event.data.payload }));
      }
    }
  });
}

/**
 * Broadcast an event across all local tabs, windows, and cross-device WebSockets immediately (< 50ms)
 */
export function broadcastRealtimeEvent(type: RealtimeEventType, payload?: any): void {
  const message: RealtimeMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. Same-window event dispatch (0ms)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('metis_realtime_event', { detail: message }));
    window.dispatchEvent(new CustomEvent(`metis_${type.toLowerCase()}`, { detail: payload }));
  }

  // 2. Cross-tab BroadcastChannel dispatch (< 5ms)
  try {
    broadcastChannel?.postMessage(message);
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }

  // 3. Supabase WebSocket Broadcast (< 50ms across all internet devices)
  if (isSupabaseConfigured && globalSupabaseChannel) {
    try {
      globalSupabaseChannel.send({
        type: 'broadcast',
        event: type,
        payload: message,
      });
    } catch (err) {
      console.warn('Supabase BroadcastChannel error:', err);
    }
  }
}

/**
 * React hook to subscribe to Realtime updates (Supabase WebSockets + BroadcastChannel + Low Latency Polling)
 */
export function useRealtimeSubscription(
  eventTypes: RealtimeEventType | RealtimeEventType[],
  callback: () => void,
  pollingIntervalMs: number = 500
) {
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    // 1. Listen to same-window CustomEvents (0ms)
    const handleCustomEvent = (e: any) => {
      const detail: RealtimeMessage = e.detail;
      if (detail && types.includes(detail.type)) {
        memoizedCallback();
      }
    };

    // 2. Listen to cross-tab BroadcastChannel (< 5ms)
    const handleBroadcastMessage = (event: MessageEvent<RealtimeMessage>) => {
      if (event.data && types.includes(event.data.type)) {
        memoizedCallback();
      }
    };

    // 3. Listen to browser Storage event (< 5ms)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key?.startsWith('metis_')) {
        memoizedCallback();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('metis_realtime_event', handleCustomEvent);
      window.addEventListener('storage', handleStorageEvent);
      broadcastChannel?.addEventListener('message', handleBroadcastMessage);
    }

    // 4. Fallback Polling
    const interval = setInterval(() => {
      memoizedCallback();
    }, pollingIntervalMs);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('metis_realtime_event', handleCustomEvent);
        window.removeEventListener('storage', handleStorageEvent);
        broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
      }
      clearInterval(interval);
    };
  }, [memoizedCallback, pollingIntervalMs, types.join(',')]);
}
