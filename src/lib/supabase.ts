import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zhwrduoobphnqwqfnhcp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpod3JkdW9vYnBobnF3cWZuaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjMwNzYsImV4cCI6MjA5MDc5OTA3Nn0.XAP_fZMohpXbPsDh3JbNomSoX26wIXR9kKPwwl5wqO0';

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = (): boolean => !!supabase;
