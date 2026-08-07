import { createClient } from '@supabase/supabase-js';

// Environment variables fallback for both Vite and Node server contexts
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// 1. Browser-safe client using public ANON KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Server-only admin client using SERVICE ROLE KEY (Never expose service role key to client bundle)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
