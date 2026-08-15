import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zalkwaancxdsicpcstyc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbGt3YWFuY3hkc2ljcGNzdHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzY5MzIsImV4cCI6MjEwMjM1MjkzMn0.SWpLuRQLvOBzLqOWWxMcQz3BNbJy72hu2j1dhPxbJ14';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://')
);

// Initialize Supabase Client with full realtime WebSocket capabilities
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  }
);
