import { createClient } from '@supabase/supabase-js';

// Comprehensive environment variable fallbacks for Vite, Next.js, and Vercel Supabase integration

const supabaseUrl = 
  import.meta.env?.VITE_SUPABASE_URL || 
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env?.SUPABASE_URL ||
  (typeof process !== 'undefined' ? (process.env?.VITE_SUPABASE_URL || process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL) : '') || 
  '';

const supabaseAnonKey = 
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env?.SUPABASE_ANON_KEY || 
  import.meta.env?.SUPABASE_PUBLISHABLE_KEY || 
  (typeof process !== 'undefined' ? (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY) : '') || 
  '';

const supabaseServiceKey = 
  (typeof process !== 'undefined' ? (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_SECRET_KEY || process.env?.VITE_SUPABASE_SERVICE_ROLE_KEY) : '') || 
  import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  import.meta.env?.VITE_SUPABASE_SECRET_KEY || 
  '';

console.log('[Supabase Client Init] Connecting with URL:', supabaseUrl ? `${supabaseUrl.substring(0, 25)}...` : 'NONE', 'Anon/Publishable Key Present:', Boolean(supabaseAnonKey));

// 1. Browser-safe client using public ANON KEY or PUBLISHABLE KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Server-only admin client using SERVICE ROLE KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);


/**
 * SUPABASE REALTIME REPLICATION & RLS SETUP SQL
 * Copy and execute this script in your Supabase SQL Editor:
 * 
 * -- 1. ENABLE REALTIME PUBLICATION FOR ALL TABLES
 * ALTER PUBLICATION supabase_realtime ADD TABLE profiles, announcements, teams, submissions, daily_habits;
 * 
 * -- 2. CREATE / CONFIGURE PROFILES TABLE & RLS
 * CREATE TABLE IF NOT EXISTS profiles (
 *   id TEXT PRIMARY KEY,
 *   name TEXT,
 *   email TEXT,
 *   avatar_url TEXT,
 *   profile_pic_url TEXT,
 *   roles TEXT[],
 *   domain TEXT,
 *   batch TEXT,
 *   bio TEXT,
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
 * -- 4. CREATE / CONFIGURE TEAMS TABLE & RLS
 * CREATE TABLE IF NOT EXISTS teams (
 *   id TEXT PRIMARY KEY,
 *   name TEXT,
 *   lead_student_id TEXT,
 *   member_ids TEXT[],
 *   github_url TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public select teams" ON teams FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert teams" ON teams FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Allow public update teams" ON teams FOR UPDATE USING (true);

 * -- 5. CREATE / CONFIGURE SUBMISSIONS TABLE & RLS
 * CREATE TABLE IF NOT EXISTS submissions (
 *   id TEXT PRIMARY KEY,
 *   student_id TEXT,
 *   student_name TEXT,
 *   github_url TEXT,
 *   media_url TEXT,
 *   round_name TEXT,
 *   is_project BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public select submissions" ON submissions FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert submissions" ON submissions FOR INSERT WITH CHECK (true);
 * 
 * -- 6. CREATE / CONFIGURE DAILY HABITS TABLE & RLS
 * CREATE TABLE IF NOT EXISTS daily_habits (
 *   key TEXT PRIMARY KEY,
 *   student_id TEXT,
 *   date_str TEXT,
 *   study_done BOOLEAN DEFAULT FALSE,
 *   submit_done BOOLEAN DEFAULT FALSE,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow public select daily_habits" ON daily_habits FOR SELECT USING (true);
 * CREATE POLICY "Allow public insert daily_habits" ON daily_habits FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Allow public update daily_habits" ON daily_habits FOR UPDATE USING (true);
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
      roles: user.roles || ['student'],
      domain: user.domain || 'FULLSTACK',
      batch: user.batch || '',
      bio: user.bio || '',
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

export async function deleteAnnouncementFromSupabase(annId) {
  if (!annId) return;
  console.log('🔄 [Supabase DB Delete] Removing announcement:', annId);
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', annId);
    if (error) console.warn('⚠️ [Supabase DB Delete Announcement Warning]:', error.message);
  } catch (err) {
    console.warn('⚠️ [Supabase DB Delete Announcement Exception]:', err.message);
  }
}


export async function syncTeamToSupabase(team) {
  if (!team || !team.id) return;
  console.log('🔄 [Supabase DB Write] Upserting team:', team.id, team.name);
  try {
    const payload = {
      id: team.id,
      name: team.name,
      lead_student_id: team.leadStudentId,
      member_ids: team.memberIds || [],
      github_url: team.githubUrl || '',
      created_at: team.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('teams').upsert(payload);
    if (error) {
      console.warn('⚠️ [Supabase DB Team Warning]:', error.message);
    } else {
      console.log('✅ [Supabase DB Team Success]:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Team Exception]:', err.message);
  }
}

export async function deleteTeamFromSupabase(teamId) {
  if (!teamId) return;
  console.log('🔄 [Supabase DB Delete] Removing team:', teamId);
  try {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) console.warn('⚠️ [Supabase DB Delete Team Warning]:', error.message);
  } catch (err) {
    console.warn('⚠️ [Supabase DB Delete Team Exception]:', err.message);
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
      is_project: Boolean(submission.isProject),
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

export async function syncDailyHabitToSupabase(studentId, dateStr, habitRecord) {
  if (!studentId || !dateStr) return;
  const key = `${studentId}_${dateStr}`;
  console.log('🔄 [Supabase DB Write] Upserting daily habit:', key);
  try {
    const payload = {
      key,
      student_id: studentId,
      date_str: dateStr,
      study_done: Boolean(habitRecord.studyDone),
      submit_done: Boolean(habitRecord.submitDone),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('daily_habits').upsert(payload);
    if (error) {
      console.warn('⚠️ [Supabase DB Daily Habit Warning]:', error.message);
    } else {
      console.log('✅ [Supabase DB Daily Habit Success]:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Daily Habit Exception]:', err.message);
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

export async function fetchTeamsFromSupabase() {
  try {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) {
      console.warn('⚠️ [Supabase Fetch Teams Notice]:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('⚠️ [Supabase Fetch Teams Exception]:', err.message);
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

export async function fetchDailyHabitsFromSupabase() {
  try {
    const { data, error } = await supabase.from('daily_habits').select('*');
    if (error) {
      console.warn('⚠️ [Supabase Fetch Daily Habits Notice]:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('⚠️ [Supabase Fetch Daily Habits Exception]:', err.message);
    return null;
  }
}



