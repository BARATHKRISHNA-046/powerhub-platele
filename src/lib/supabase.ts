import { createClient } from '@supabase/supabase-js';

// Environment variable resolution following Rule 5 (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || 'https://demo-powerhub.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-key';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project.supabase.co') && 
  !supabaseUrl.includes('demo-powerhub') &&
  supabaseUrl.startsWith('https://')
);

// Supabase client with Cache-Control headers to strictly satisfy Architecture Rule 3 (No stale caching on reads)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  }
});

// TYPES & INTERFACES
export type Role = 'student' | 'mentor';

export type Domain = 'Fullstack' | 'UI/UX' | 'AI' | 'Edge AI' | 'Embedded IoT' | 'Automotive';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile_pic_url: string;
  roles: Role[];
  domain: Domain;
  batch: string;
  bio: string;
  created_at?: string;
  updated_at?: string;
}

export interface Announcement {
  id: string;
  author_id: string;
  author_name: string;
  bootcamp_id: string;
  title: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  emoji_combo: string;
  lead_student_id: string;
  member_ids: string[];
  github_url: string;
  created_at: string;
}

export interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  github_url: string;
  media_url?: string;
  round_name: string;
  is_project: boolean;
  status: 'pending' | 'approved' | 'flagged' | 'excused';
  skills_rated?: Record<string, number>;
  created_at: string;
}

export interface DailyHabit {
  id: string; // `${student_id}_${date_str}`
  student_id: string;
  date_str: string;
  study_done: boolean;
  submit_done: boolean;
  updated_at?: string;
}

export interface ScoreAuditLog {
  id: string;
  student_id: string;
  points_change: number;
  reason: string;
  component: 'on_time' | 'team' | 'leadership' | 'project_submitter' | 'first_submitter' | 'penalty' | 'manual_override';
  performed_by: string;
  created_at: string;
}

export interface MeetSession {
  id: string;
  topic: string;
  time_str: string;
  meet_url: string;
  bootcamp_id: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  student_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// SEED PROFILES (Initial Disney+ Hotstar style cards)
export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr-alex',
    email: 'alex.chen@powerhub.edu',
    name: 'Alex Chen',
    profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    roles: ['student'],
    domain: 'Fullstack',
    batch: 'Cohort 2026',
    bio: 'Fullstack student building reactive Web Apps with Vite & Supabase.'
  },
  {
    id: 'usr-sarah',
    email: 'sarah.jenkins@powerhub.edu',
    name: 'Sarah Jenkins',
    profile_pic_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    roles: ['student', 'mentor'], // Dual Role
    domain: 'UI/UX',
    batch: 'Cohort 2026',
    bio: 'Dual-role designer & peer mentor focused on modern visual design.'
  },
  {
    id: 'usr-marcus',
    email: 'marcus.vane@powerhub.edu',
    name: 'Marcus Vane',
    profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    roles: ['mentor'],
    domain: 'AI',
    batch: 'Mentor Staff',
    bio: 'Lead Mentor for AI & Edge Computing.'
  },
  {
    id: 'usr-priya',
    email: 'priya.sharma@powerhub.edu',
    name: 'Priya Sharma',
    profile_pic_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    roles: ['student'],
    domain: 'Embedded IoT',
    batch: 'Cohort 2026',
    bio: 'Embedded C++ & ESP32 IoT Developer.'
  },
  {
    id: 'usr-david',
    email: 'david.kim@powerhub.edu',
    name: 'David Kim',
    profile_pic_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    roles: ['student'],
    domain: 'Automotive',
    batch: 'Cohort 2026',
    bio: 'Automotive Embedded Systems & CAN Bus student.'
  }
];

// ----------------------------------------------------
// DATABASE API METHODS (Always fetching fresh from Supabase)
// ----------------------------------------------------

/** Upload image to Supabase Storage and return permanent public HTTPS URL (Architecture Rule 2) */
export async function uploadImageToSupabaseStorage(file: File, folder = 'avatars'): Promise<string> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Using object URL fallback for offline mode.');
    return URL.createObjectURL(file);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('powerhub-media')
    .upload(fileName, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('powerhub-media')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/** Fetch all profiles fresh from Supabase DB */
export async function fetchProfilesFromSupabase(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_PROFILES;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Error fetching profiles from Supabase, fallback to initial:', error.message);
    return INITIAL_PROFILES;
  }

  if (!data || data.length === 0) {
    // Seed initial profiles into Supabase
    for (const profile of INITIAL_PROFILES) {
      await supabase.from('profiles').upsert(profile);
    }
    return INITIAL_PROFILES;
  }

  return data as UserProfile[];
}

/** Create or update profile in Supabase DB */
export async function upsertProfileInSupabase(profile: UserProfile): Promise<UserProfile> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...profile, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  }
  return profile;
}

/** Fetch announcements fresh from Supabase */
export async function fetchAnnouncementsFromSupabase(): Promise<Announcement[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'ann-1',
        author_id: 'usr-marcus',
        author_name: 'Marcus Vane (Lead Mentor)',
        bootcamp_id: 'all',
        title: '🚀 Cohort Sprint 4 Launch & Requirements',
        message: 'Welcome to Sprint 4! Ensure all GitHub submissions are uploaded before 11:00 PM today. Live Meet starts at 7:00 PM.',
        is_pinned: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error.message);
    return [];
  }

  return data as Announcement[];
}

/** Create announcement in Supabase */
export async function createAnnouncementInSupabase(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
  const newAnn: Announcement = {
    ...announcement,
    id: `ann-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('announcements')
      .insert(newAnn)
      .select()
      .single();

    if (error) throw error;
    return data as Announcement;
  }

  return newAnn;
}

/** Delete announcement from Supabase */
export async function deleteAnnouncementInSupabase(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

/** Fetch teams fresh from Supabase */
export async function fetchTeamsFromSupabase(): Promise<Team[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'team-cyber',
        name: 'Cyber Dragons',
        emoji_combo: '🐉🔥',
        lead_student_id: 'usr-alex',
        member_ids: ['usr-alex', 'usr-sarah'],
        github_url: 'https://github.com/powerhub-cohort/cyber-dragons-app',
        created_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching teams:', error.message);
    return [];
  }

  return data as Team[];
}

/** Create or update team in Supabase */
export async function upsertTeamInSupabase(team: Team): Promise<Team> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('teams')
      .upsert(team)
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  }
  return team;
}

/** Fetch submissions fresh from Supabase */
export async function fetchSubmissionsFromSupabase(): Promise<Submission[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'sub-1',
        student_id: 'usr-alex',
        student_name: 'Alex Chen',
        github_url: 'https://github.com/alexchen/react-fullstack-kit',
        media_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
        round_name: 'Sprint 3 Deliverable',
        is_project: true,
        status: 'approved',
        skills_rated: { 'React': 5, 'TypeScript': 4, 'Supabase': 4 },
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error.message);
    return [];
  }

  return data as Submission[];
}

/** Submit code or project to Supabase */
export async function createSubmissionInSupabase(submission: Omit<Submission, 'id' | 'created_at' | 'status'>): Promise<Submission> {
  const newSub: Submission = {
    ...submission,
    id: `sub-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('submissions')
      .insert(newSub)
      .select()
      .single();

    if (error) throw error;
    return data as Submission;
  }

  return newSub;
}

/** Update submission review status & skills rating */
export async function updateSubmissionInSupabase(id: string, updates: Partial<Submission>): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('submissions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }
}

/** Fetch daily habits for student */
export async function fetchDailyHabitsFromSupabase(studentId: string): Promise<DailyHabit[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('daily_habits')
    .select('*')
    .eq('student_id', studentId);

  if (error) {
    console.error('Error fetching daily habits:', error.message);
    return [];
  }

  return data as DailyHabit[];
}

/** Toggle daily habit (Study / Submission) */
export async function upsertDailyHabitInSupabase(habit: DailyHabit): Promise<DailyHabit> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('daily_habits')
      .upsert({ ...habit, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data as DailyHabit;
  }

  return habit;
}

/** Fetch score audit logs */
export async function fetchScoreAuditLogsFromSupabase(): Promise<ScoreAuditLog[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('score_audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audit logs:', error.message);
    return [];
  }

  return data as ScoreAuditLog[];
}

/** Insert score audit log */
export async function addScoreAuditLogInSupabase(log: Omit<ScoreAuditLog, 'id' | 'created_at'>): Promise<ScoreAuditLog> {
  const newLog: ScoreAuditLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('score_audit_logs')
      .insert(newLog)
      .select()
      .single();

    if (error) throw error;
    return data as ScoreAuditLog;
  }

  return newLog;
}

/** Fetch meet session info */
export async function fetchMeetSessionFromSupabase(): Promise<MeetSession> {
  const fallback: MeetSession = {
    id: 'meet-main',
    topic: 'Live Architecture & Supabase Realtime Masterclass',
    time_str: 'Today at 7:00 PM IST',
    meet_url: 'https://meet.google.com/abc-defg-hij',
    bootcamp_id: 'all',
    updated_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    return fallback;
  }

  const { data, error } = await supabase
    .from('meet_sessions')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    await supabase.from('meet_sessions').upsert(fallback);
    return fallback;
  }

  return data as MeetSession;
}

/** Update meet session info */
export async function updateMeetSessionInSupabase(session: MeetSession): Promise<MeetSession> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('meet_sessions')
      .upsert({ ...session, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return data as MeetSession;
  }
  return session;
}

/** Fetch student notifications */
export async function fetchNotificationsFromSupabase(studentId: string): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured) {
    return [
      {
        id: 'notif-1',
        student_id: studentId,
        title: '⏰ Study Reminder (7:00 PM)',
        message: 'Time for your daily 7 PM study session!',
        read: false,
        created_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }

  return data as NotificationItem[];
}

export interface UserQuickLinks {
  drive: string | null;
  classroom: string | null;
  community: string | null;
}

/** Fetch student quick link click timestamps from Supabase */
export async function fetchUserQuickLinksFromSupabase(studentId: string): Promise<UserQuickLinks> {
  const defaultState: UserQuickLinks = {
    drive: localStorage.getItem(`ph_ql_drive_${studentId}`) || null,
    classroom: localStorage.getItem(`ph_ql_classroom_${studentId}`) || null,
    community: localStorage.getItem(`ph_ql_community_${studentId}`) || null
  };

  if (!isSupabaseConfigured) {
    return defaultState;
  }

  try {
    const { data, error } = await supabase
      .from('user_quick_links')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !data) {
      return defaultState;
    }

    return {
      drive: data.drive || defaultState.drive,
      classroom: data.classroom || defaultState.classroom,
      community: data.community || defaultState.community
    };
  } catch (err) {
    return defaultState;
  }
}

/** Save student quick link click timestamp in Supabase */
export async function saveUserQuickLinkClickInSupabase(
  studentId: string, 
  linkKey: 'drive' | 'classroom' | 'community'
): Promise<UserQuickLinks> {
  const now = new Date().toISOString();
  
  // Always update localStorage as instant fallback
  localStorage.setItem(`ph_ql_${linkKey}_${studentId}`, now);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('user_quick_links')
        .upsert({
          student_id: studentId,
          [linkKey]: now,
          updated_at: now
        }, { onConflict: 'student_id' })
        .select()
        .single();

      if (!error && data) {
        return {
          drive: data.drive || null,
          classroom: data.classroom || null,
          community: data.community || null
        };
      }
    } catch (err) {
      console.warn('Failed to persist quick link to Supabase:', err);
    }
  }

  const current = await fetchUserQuickLinksFromSupabase(studentId);
  return { ...current, [linkKey]: now };
}

export interface TechNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  category: 'layoff' | 'hiring' | 'opening';
  url: string;
  published_at: string;
  fetched_at: string;
}

export const INITIAL_TECH_NEWS: TechNewsItem[] = [
  {
    id: 'news-1',
    headline: 'Major AI Cloud Provider Announces 500+ New Fullstack & Infra Engineer Openings',
    summary: 'Expanding global engineering hubs with heavy hiring across distributed systems and Vite/React frontends.',
    source: 'TechCrunch',
    category: 'hiring',
    url: 'https://techcrunch.com',
    published_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    fetched_at: new Date().toISOString()
  },
  {
    id: 'news-2',
    headline: 'Global Tech Enterprise Restructures Legacy Divisions to Focus on Edge AI',
    summary: 'Reallocating software talent to autonomous systems and embedded micro-architectures.',
    source: 'The Verge',
    category: 'layoff',
    url: 'https://theverge.com',
    published_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    fetched_at: new Date().toISOString()
  },
  {
    id: 'news-3',
    headline: 'Automotive & Autonomous Vehicle Giant Opens 200+ Embedded IoT Positions',
    summary: 'Massive recruitment drive for CAN Bus, AUTOSAR, and C++ firmware engineers.',
    source: 'Business Insider',
    category: 'opening',
    url: 'https://businessinsider.com',
    published_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    fetched_at: new Date().toISOString()
  },
  {
    id: 'news-4',
    headline: 'Fintech Unicorn Expands India R&D Hub with 150 Senior & Junior Software Roles',
    summary: 'Actively recruiting fullstack React developers and backend microservices engineers.',
    source: 'Reuters Tech',
    category: 'hiring',
    url: 'https://reuters.com/technology',
    published_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    fetched_at: new Date().toISOString()
  },
  {
    id: 'news-5',
    headline: 'Silicon Valley Semiconductor Leader Hires 300+ Embedded Systems Engineers',
    summary: 'Scaling next-gen SoC development and RISC-V firmware teams globally.',
    source: 'VentureBeat',
    category: 'opening',
    url: 'https://venturebeat.com',
    published_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    fetched_at: new Date().toISOString()
  }
];

export async function fetchTechNewsFromSupabase(): Promise<TechNewsItem[]> {
  if (!isSupabaseConfigured) {
    return INITIAL_TECH_NEWS;
  }

  try {
    const { data, error } = await supabase
      .from('tech_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      await supabase.from('tech_news').upsert(INITIAL_TECH_NEWS);
      return INITIAL_TECH_NEWS;
    }

    return data as TechNewsItem[];
  } catch (err) {
    return INITIAL_TECH_NEWS;
  }
}

export async function syncTechNewsInSupabase(articles: TechNewsItem[]): Promise<TechNewsItem[]> {
  if (isSupabaseConfigured && articles && articles.length > 0) {
    try {
      await supabase.from('tech_news').upsert(articles);
    } catch (err) {
      console.warn('Failed to upsert tech_news to Supabase:', err);
    }
  }
  return articles;
}

export interface CertificateItem {
  id: string;
  student_id: string;
  student_name: string;
  domain: string;
  program_title: string;
  issued_at: string;
  mentor_signature: string;
  verification_id: string;
}

export const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert-1',
    student_id: 'user-barath-001',
    student_name: 'Barath Krishna H',
    domain: 'FULLSTACK',
    program_title: 'Fullstack & AI Engineering 7-Month Program Completion',
    issued_at: new Date().toISOString(),
    mentor_signature: 'Barath Krishna (Lead Mentor & Engineering Director)',
    verification_id: 'PH-CERT-2026-X89B2Q'
  }
];

export async function fetchCertificatesFromSupabase(studentId?: string): Promise<CertificateItem[]> {
  if (!isSupabaseConfigured) {
    return studentId ? INITIAL_CERTIFICATES.filter(c => c.student_id === studentId) : INITIAL_CERTIFICATES;
  }

  try {
    let query = supabase.from('certificates').select('*').order('issued_at', { ascending: false });
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return INITIAL_CERTIFICATES;
    }
    return data as CertificateItem[];
  } catch (err) {
    return INITIAL_CERTIFICATES;
  }
}

export async function issueCertificateInSupabase(cert: CertificateItem): Promise<CertificateItem> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('certificates').upsert(cert).select().single();
      if (!error && data) return data as CertificateItem;
    } catch (err) {
      console.warn('Failed to save certificate in Supabase:', err);
    }
  }
  return cert;
}
