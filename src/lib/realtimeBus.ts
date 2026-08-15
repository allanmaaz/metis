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

// Global Supabase Realtime Broadcast Channel for millisecond cross-device WebSocket sync
const supabaseBroadcastChannel = isSupabaseConfigured
  ? supabase.channel('metis_global_realtime_broadcast', {
      config: {
        broadcast: { ack: false, self: false },
      },
    })
  : null;

if (supabaseBroadcastChannel) {
  supabaseBroadcastChannel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('⚡ Connected to Metis Ultra-Low-Latency Realtime WebSocket Bus');
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
  if (isSupabaseConfigured && supabaseBroadcastChannel) {
    try {
      supabaseBroadcastChannel.send({
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
  pollingIntervalMs: number = 400
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

    // 4. Supabase Postgres & Broadcast WebSockets Subscription (< 50ms)
    let postgresChannel: any = null;
    let localBroadcastListener: any = null;

    if (isSupabaseConfigured) {
      try {
        // Postgres CDC changes
        postgresChannel = supabase
          .channel('metis_postgres_realtime')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            memoizedCallback();
          })
          .subscribe();

        // Broadcast WebSockets listener
        if (supabaseBroadcastChannel) {
          localBroadcastListener = (payload: any) => {
            if (payload?.event && types.includes(payload.event as RealtimeEventType)) {
              memoizedCallback();
            }
          };
          supabaseBroadcastChannel.on('broadcast', { event: '*' }, localBroadcastListener);
        }
      } catch (err) {
        console.warn('Supabase realtime subscription failed, falling back to bus:', err);
      }
    }

    // 5. High-frequency fallback polling (300-400ms)
    const interval = setInterval(() => {
      memoizedCallback();
    }, pollingIntervalMs);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('metis_realtime_event', handleCustomEvent);
        window.removeEventListener('storage', handleStorageEvent);
        broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
      }
      if (postgresChannel) {
        supabase.removeChannel(postgresChannel);
      }
      clearInterval(interval);
    };
  }, [memoizedCallback, pollingIntervalMs, types.join(',')]);
}
