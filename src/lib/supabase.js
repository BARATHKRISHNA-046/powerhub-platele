import { createClient } from '@supabase/supabase-js';

// Environment variables fallback for both Vite and Node server contexts
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// 1. Browser-safe client using public ANON KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Server-only admin client using SERVICE ROLE KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

/**
 * RLS POLICY CHECKLIST FOR SUPABASE (Run in Supabase SQL Editor if tables are blocked):
 * 
 * 1. Profiles Table RLS (Read by All, Update by Owner):
 *    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 *    CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
 *    CREATE POLICY "User Update Profiles" ON profiles FOR UPDATE USING (auth.uid() = id);
 * 
 * 2. Announcements Table RLS (Read by All, Insert by Mentors/Admins):
 *    ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
 *    CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);
 *    CREATE POLICY "Mentors Insert Announcements" ON announcements FOR INSERT WITH CHECK (true);
 * 
 * 3. Submissions Table RLS (Read by All, Insert by Students):
 *    ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
 *    CREATE POLICY "Public Read Submissions" ON submissions FOR SELECT USING (true);
 *    CREATE POLICY "Students Insert Submissions" ON submissions FOR INSERT WITH CHECK (true);
 */

// Helper to sync user profile picture and details directly to Supabase table
export async function syncProfileToSupabase(user) {
  if (!user || !user.id) return;
  console.log('🔄 [Supabase DB Write] Sending profile update to Supabase for user:', user.id, user.name);
  try {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.profilePicUrl || user.profilePic || user.avatarUrl,
      profile_pic_url: user.profilePicUrl || user.profilePic || user.avatarUrl,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('profiles').upsert(payload);
    if (error) {
      console.warn('⚠️ [Supabase DB Profile Notice] Table not provisioned or RLS block:', error.message);
    } else {
      console.log('✅ [Supabase DB Write Success] Profile row updated in database:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Profile Exception]:', err.message);
  }
}

// Helper to sync announcement directly to Supabase table
export async function syncAnnouncementToSupabase(announcement) {
  if (!announcement) return;
  console.log('🔄 [Supabase DB Write] Sending announcement to Supabase:', announcement.id, announcement.title);
  try {
    const { data, error } = await supabase.from('announcements').insert([{
      id: announcement.id,
      author_id: announcement.authorId,
      author_name: announcement.authorName,
      bootcamp_id: announcement.bootcampId,
      title: announcement.title,
      message: announcement.message,
      created_at: announcement.createdAt,
      is_pinned: announcement.isPinned
    }]);
    if (error) {
      console.warn('⚠️ [Supabase DB Announcement Notice] Table not provisioned or RLS block:', error.message);
    } else {
      console.log('✅ [Supabase DB Write Success] Announcement inserted into database:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Announcement Exception]:', err.message);
  }
}

