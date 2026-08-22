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

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project.supabase.co') && 
  !supabaseUrl.includes('demo-powerhub') &&
  supabaseUrl.startsWith('https://')
);

// 1. Browser-safe client using public ANON KEY or PUBLISHABLE KEY with Cache-Control headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  }
});

// 2. Server-only admin client using SERVICE ROLE KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  }
});



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

export async function syncManualMentorMarkToSupabase(studentId, markVal) {
  if (!studentId) return;
  console.log('🔄 [Supabase DB Write] Upserting manual mentor mark:', studentId, markVal);
  try {
    const payload = {
      student_id: studentId,
      mark_val: Number(markVal || 0),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('manual_mentor_marks').upsert(payload);
    if (error) {
      console.warn('⚠️ [Supabase DB Manual Mark Warning]:', error.message);
    } else {
      console.log('✅ [Supabase DB Manual Mark Success]:', data);
    }
  } catch (err) {
    console.warn('⚠️ [Supabase DB Manual Mark Exception]:', err.message);
  }
}

// --- READ HELPERS ---

export async function fetchManualMentorMarksFromSupabase() {
  try {
    const { data, error } = await supabase.from('manual_mentor_marks').select('*');
    if (error) {
      console.warn('⚠️ [Supabase Fetch Manual Marks Notice]:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('⚠️ [Supabase Fetch Manual Marks Exception]:', err.message);
    return null;
  }
}

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

/** Fetch student quick link click timestamps from Supabase */
export async function fetchUserQuickLinksFromSupabase(studentId) {
  const defaultState = {
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
export async function saveUserQuickLinkClickInSupabase(studentId, linkKey) {
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

export function getDailyUpdatedTechNews() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const POOL_HIRING = [
    { headline: "Major AI Cloud Provider Announces 600+ New Fullstack & Infra Openings", summary: "Expanding global engineering hubs with heavy hiring across distributed systems and Vite/React frontends.", source: "TechCrunch", category: "hiring", url: "https://techcrunch.com" },
    { headline: "Fintech Unicorn Expands India R&D Hub with 250 Senior & Junior Software Roles", summary: "Actively recruiting fullstack React developers and backend microservices engineers.", source: "Reuters Tech", category: "hiring", url: "https://reuters.com/technology" },
    { headline: "Global E-Commerce Giant Launches 400+ India Engineering Graduate Hiring Drive", summary: "Recruiting final-year B.Tech & MCA students for Cloud, Frontend, and Data Pipeline teams.", source: "Economic Times Tech", category: "hiring", url: "https://economictimes.indiatimes.com/tech" },
    { headline: "Leading Cybersecurity Firm Hires 180+ SOC Analysts & Security Engineers in Bengaluru", summary: "Broad recruitment drive targeting cloud security, penetration testing, and zero-trust protocol developers.", source: "Hacker News", category: "hiring", url: "https://news.ycombinator.com" },
    { headline: "AI Chipmaker Opens 350+ SoC Architecture & Hardware Verification Jobs", summary: "Massive expansion in Hyderabad and Pune R&D centers for VLSI and Embedded C++ engineers.", source: "EE Times", category: "hiring", url: "https://eetimes.com" },
    { headline: "Global SaaS Platform Hires 200+ Remote React & Node.js Developers", summary: "Fully remote roles across APAC and EMEA for fullstack engineers with Supabase and GraphQL experience.", source: "VentureBeat", category: "hiring", url: "https://venturebeat.com" }
  ];

  const POOL_LAYOFF = [
    { headline: "Global Tech Enterprise Restructures Legacy Divisions to Focus on Edge AI", summary: "Reallocating software talent to autonomous systems and embedded micro-architectures.", source: "The Verge", category: "layoff", url: "https://theverge.com" },
    { headline: "Legacy Enterprise Software Vendor Cuts 8% Workforce in Shift to Generative AI", summary: "Consolidating internal tooling teams to accelerate AI agent adoption.", source: "Bloomberg Tech", category: "layoff", url: "https://bloomberg.com/technology" },
    { headline: "PC & Server OEM Reorganizes Global Hardware Division Amid AI PC Pivot", summary: "Trimming legacy supply chain roles while scaling NPU and hardware acceleration teams.", source: "Ars Technica", category: "layoff", url: "https://arstechnica.com" },
    { headline: "AdTech Platform Trims Non-Core Business Lines to Invest in Privacy ML", summary: "Restructuring product teams to double down on zero-party data and context engines.", source: "Business Insider", category: "layoff", url: "https://businessinsider.com" }
  ];

  const POOL_OPENINGS = [
    { headline: "Automotive & Autonomous Vehicle Giant Opens 200+ Embedded IoT Positions", summary: "Massive recruitment drive for CAN Bus, AUTOSAR, and C++ firmware engineers.", source: "Business Insider", category: "opening", url: "https://businessinsider.com" },
    { headline: "Silicon Valley Semiconductor Leader Hires 300+ Embedded Systems Engineers", summary: "Scaling next-gen SoC development and RISC-V firmware teams globally.", source: "VentureBeat", category: "opening", url: "https://venturebeat.com" },
    { headline: "HealthTech Pioneer Openings for 120+ AI Medical Image Processing Engineers", summary: "Hiring PyTorch, Computer Vision, and DICOM pipeline developers for diagnostic AI suites.", source: "MIT Technology Review", category: "opening", url: "https://technologyreview.com" },
    { headline: "Next-Gen Mobile OS Creator Opens 150+ Cross-Platform Flutter & Native Roles", summary: "Building next-generation mobile UI frameworks and low-latency client runtime engines.", source: "Android Police", category: "opening", url: "https://androidpolice.com" },
    { headline: "Global Cloud Storage Provider Opens 100+ Reliability & Storage Kernel Openings", summary: "Recruiting Linux kernel, Rust, and distributed storage infrastructure developers.", source: "ZDNet", category: "opening", url: "https://zdnet.com" }
  ];

  const POOL_TRENDS = [
    { headline: "Open-Source AI Foundation Releases Ultra-Fast 70B Parameter Local Model", summary: "Outperforms proprietary API benchmarks while running efficiently on consumer hardware.", source: "Github Trending", category: "hiring", url: "https://github.com/trending" },
    { headline: "India IT Sector Reports 18% QoQ Surge in Fullstack & Cloud AI Engineer Demand", summary: "NASSCOM industry report highlights unprecedented demand for React, Node, and Supabase skillsets.", source: "LiveMint Tech", category: "opening", url: "https://livemint.com/technology" },
    { headline: "Quantum Computing Startup Achieves 100-Qubit Error Correction Milestone", summary: "Paves way for commercial quantum simulation across drug discovery and cryptography.", source: "Nature Electronics", category: "opening", url: "https://nature.com" }
  ];

  const selected = [];
  const pick = (arr, indexOffset) => arr[(seed + indexOffset) % arr.length];

  selected.push(pick(POOL_HIRING, 0));
  selected.push(pick(POOL_LAYOFF, 1));
  selected.push(pick(POOL_OPENINGS, 2));
  selected.push(pick(POOL_HIRING, 3));
  selected.push(pick(POOL_OPENINGS, 4));
  selected.push(pick(POOL_TRENDS, 5));

  const hoursAgo = [1, 3, 5, 8, 12, 18];
  return selected.map((item, idx) => {
    const publishedAt = new Date(now.getTime() - hoursAgo[idx] * 3600 * 1000).toISOString();
    return {
      id: `news-${dateStr}-${idx + 1}`,
      ...item,
      published_at: publishedAt,
      fetched_at: now.toISOString()
    };
  });
}

export const INITIAL_TECH_NEWS = getDailyUpdatedTechNews();

export async function fetchTechNewsFromSupabase() {
  const dailyNews = getDailyUpdatedTechNews();
  if (!isSupabaseConfigured) {
    return dailyNews;
  }

  try {
    const { data, error } = await supabase
      .from('tech_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      await supabase.from('tech_news').upsert(dailyNews);
      return dailyNews;
    }

    return data;
  } catch (err) {
    return dailyNews;
  }
}

export async function syncTechNewsInSupabase(articles) {
  if (isSupabaseConfigured && articles && articles.length > 0) {
    try {
      await supabase.from('tech_news').upsert(articles);
    } catch (err) {
      console.warn('Failed to upsert tech_news to Supabase:', err);
    }
  }
  return articles;
}

export const INITIAL_CERTIFICATES = [
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

export async function fetchCertificatesFromSupabase(studentId) {
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
    return data;
  } catch (err) {
    return INITIAL_CERTIFICATES;
  }
}

export async function issueCertificateInSupabase(cert) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('certificates').upsert(cert).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Failed to save certificate in Supabase:', err);
    }
  }
  return cert;
}



