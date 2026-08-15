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

/**
 * Broadcast an event across all local tabs and windows immediately
 */
export function broadcastRealtimeEvent(type: RealtimeEventType, payload?: any): void {
  const message: RealtimeMessage = {
    type,
    payload,
    timestamp: Date.now(),
  };

  // 1. Same-window event dispatch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('metis_realtime_event', { detail: message }));
    window.dispatchEvent(new CustomEvent(`metis_${type.toLowerCase()}`, { detail: payload }));
  }

  // 2. Cross-tab BroadcastChannel dispatch
  try {
    broadcastChannel?.postMessage(message);
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }
}

/**
 * React hook to subscribe to Realtime updates (Supabase WebSockets + BroadcastChannel + Polling)
 */
export function useRealtimeSubscription(
  eventTypes: RealtimeEventType | RealtimeEventType[],
  callback: () => void,
  pollingIntervalMs: number = 2000
) {
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    // 1. Listen to same-window CustomEvents
    const handleCustomEvent = (e: any) => {
      const detail: RealtimeMessage = e.detail;
      if (detail && types.includes(detail.type)) {
        memoizedCallback();
      }
    };

    // 2. Listen to cross-tab BroadcastChannel
    const handleBroadcastMessage = (event: MessageEvent<RealtimeMessage>) => {
      if (event.data && types.includes(event.data.type)) {
        memoizedCallback();
      }
    };

    // 3. Listen to browser Storage event
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

    // 4. Supabase Postgres WebSockets Subscription
    let supabaseChannel: any = null;
    if (isSupabaseConfigured) {
      try {
        supabaseChannel = supabase
          .channel('metis_postgres_realtime')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            memoizedCallback();
          })
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime subscription failed, falling back to bus:', err);
      }
    }

    // 5. High-frequency fallback polling
    const interval = setInterval(() => {
      memoizedCallback();
    }, pollingIntervalMs);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('metis_realtime_event', handleCustomEvent);
        window.removeEventListener('storage', handleStorageEvent);
        broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
      }
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
      clearInterval(interval);
    };
  }, [memoizedCallback, pollingIntervalMs, types.join(',')]);
}
