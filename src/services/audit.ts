import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types';
import { getMockDB } from './mockData';

export async function getAuditLogs(eventId: string): Promise<AuditLog[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data) {
        return data as AuditLog[];
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }

  const db = getMockDB();
  return db.auditLogs
    .filter((a) => a.event_id === eventId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
