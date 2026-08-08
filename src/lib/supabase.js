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
 * SUPABASE REALTIME REPLICATION & RLS SETUP SQL
 * Copy and execute this script in your Supabase SQL Editor:
 * 
 * -- 1. ENABLE REALTIME PUBLICATION
 * ALTER PUBLICATION supabase_realtime ADD TABLE profiles, announcements, submissions;
 * 
 * -- 2. CREATE / CONFIGURE PROFILES TABLE & RLS
 * CREATE TABLE IF NOT EXISTS profiles (
 *   id TEXT PRIMARY KEY,
 *   name TEXT,
 *   email TEXT,
 *   avatar_url TEXT,
 *   profile_pic_url TEXT,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public select profiles" ON profiles FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Allow public update profiles" ON profiles FOR UPDATE USING (true);
 * 
 * -- 3. CREATE / CONFIGURE ANNOUNCEMENTS TABLE & RLS
 * CREATE TABLE IF NOT EXISTS announcements (
 *   id TEXT PRIMARY KEY,
 *   author_id TEXT,
 *   author_name TEXT,
 *   bootcamp_id TEXT,
 *   title TEXT,
 *   message TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   is_pinned BOOLEAN DEFAULT TRUE
 * );
 * ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public select announcements" ON announcements FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert announcements" ON announcements FOR INSERT WITH CHECK (true);
 * 
 * -- 4. CREATE / CONFIGURE SUBMISSIONS TABLE & RLS
 * CREATE TABLE IF NOT EXISTS submissions (
 *   id TEXT PRIMARY KEY,
 *   student_id TEXT,
 *   student_name TEXT,
 *   github_url TEXT,
 *   media_url TEXT,
 *   round_name TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public select submissions" ON submissions FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert submissions" ON submissions FOR INSERT WITH CHECK (true);
 */

// --- WRITE HELPERS ---

export async function syncProfileToSupabase(user) {
  if (!user || !user.id) return;
  console.log('🔄 [Supabase DB Write] Upserting profile for user:', user.id, user.name);
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
      console.warn('⚠️ [Supabase DB Profile Warning]:', error.message);
    } else {
      console.log('✅ [Supabase DB Profile Success]:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Profile Exception]:', err.message);
  }
}

export async function syncAnnouncementToSupabase(announcement) {
  if (!announcement) return;
  console.log('🔄 [Supabase DB Write] Inserting announcement:', announcement.id, announcement.title);
  try {
    const payload = {
      id: announcement.id,
      author_id: announcement.authorId,
      author_name: announcement.authorName,
      bootcamp_id: announcement.bootcampId || 'all',
      title: announcement.title,
      message: announcement.message,
      created_at: announcement.createdAt || new Date().toISOString(),
      is_pinned: announcement.isPinned ?? true
    };
    const { data, error } = await supabase.from('announcements').upsert(payload);
    if (error) {
      console.warn('⚠️ [Supabase DB Announcement Warning]:', error.message);
    } else {
      console.log('✅ [Supabase DB Announcement Success]:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Announcement Exception]:', err.message);
  }
}

export async function syncSubmissionToSupabase(submission) {
  if (!submission) return;
  console.log('🔄 [Supabase DB Write] Upserting submission:', submission.id);
  try {
    const payload = {
      id: submission.id || `sub-${Date.now()}`,
      student_id: submission.studentId,
      student_name: submission.studentName,
      github_url: submission.githubUrl,
      media_url: submission.imageAttachment || (submission.mediaFiles && submission.mediaFiles[0]) || '',
      round_name: submission.roundName || 'Sprint Deliverable',
      created_at: submission.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('submissions').upsert(payload);
    if (error) {
      console.warn('⚠️ [Supabase DB Submission Warning]:', error.message);
    } else {
      console.log('✅ [Supabase DB Submission Success]:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Submission Exception]:', err.message);
  }
}

// --- READ HELPERS ---

export async function fetchProfilesFromSupabase() {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.warn('⚠️ [Supabase Fetch Profiles Notice]:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('⚠️ [Supabase Fetch Profiles Exception]:', err.message);
    return null;
  }
}

export async function fetchAnnouncementsFromSupabase() {
  try {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('⚠️ [Supabase Fetch Announcements Notice]:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('⚠️ [Supabase Fetch Announcements Exception]:', err.message);
    return null;
  }
}

export async function fetchSubmissionsFromSupabase() {
  try {
    const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('⚠️ [Supabase Fetch Submissions Notice]:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('⚠️ [Supabase Fetch Submissions Exception]:', err.message);
    return null;
  }
}


