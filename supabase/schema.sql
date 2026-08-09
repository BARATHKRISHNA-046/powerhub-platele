-- ========================================================
-- POWERHUB SUPABASE DATABASE SCHEMA & REALTIME SETUP
-- Execute this SQL script in your Supabase SQL Editor
-- ========================================================

-- 1. ENABLE REALTIME PUBLICATION FOR ALL SHARED TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE 
  profiles, 
  announcements, 
  teams, 
  submissions, 
  daily_habits, 
  notifications,
  meet_sessions,
  score_audit_logs;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  profile_pic_url TEXT,
  roles TEXT[] NOT NULL DEFAULT '{"student"}',
  domain TEXT NOT NULL DEFAULT 'Fullstack',
  batch TEXT DEFAULT 'Cohort 2026',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete profiles" ON profiles FOR DELETE USING (true);

-- 3. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  bootcamp_id TEXT DEFAULT 'all',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete announcements" ON announcements FOR DELETE USING (true);

-- 4. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji_combo TEXT NOT NULL DEFAULT '🐉🔥',
  lead_student_id TEXT NOT NULL,
  member_ids TEXT[] NOT NULL,
  github_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete teams" ON teams FOR DELETE USING (true);

-- 5. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  github_url TEXT NOT NULL,
  media_url TEXT DEFAULT '',
  round_name TEXT DEFAULT 'Daily Sprint',
  is_project BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending', -- pending, approved, flagged, excused
  skills_rated JSONB DEFAULT '{}'::jsonb, -- e.g. {"React": 4, "TypeScript": 5}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update submissions" ON submissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete submissions" ON submissions FOR DELETE USING (true);

-- 6. DAILY HABITS TABLE
CREATE TABLE IF NOT EXISTS daily_habits (
  id TEXT PRIMARY KEY, -- formatted as `${student_id}_${date_str}`
  student_id TEXT NOT NULL,
  date_str TEXT NOT NULL,
  study_done BOOLEAN DEFAULT FALSE,
  submit_done BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select daily_habits" ON daily_habits FOR SELECT USING (true);
CREATE POLICY "Allow public insert daily_habits" ON daily_habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update daily_habits" ON daily_habits FOR UPDATE USING (true);
CREATE POLICY "Allow public delete daily_habits" ON daily_habits FOR DELETE USING (true);

-- 7. SCORE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS score_audit_logs (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  points_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  component TEXT NOT NULL, -- on_time, team, leadership, project_submitter, first_submitter, penalty, manual_override
  performed_by TEXT DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE score_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select score_audit_logs" ON score_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert score_audit_logs" ON score_audit_logs FOR INSERT WITH CHECK (true);

-- 8. MEET SESSIONS TABLE
CREATE TABLE IF NOT EXISTS meet_sessions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  time_str TEXT NOT NULL,
  meet_url TEXT NOT NULL,
  bootcamp_id TEXT DEFAULT 'all',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE meet_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select meet_sessions" ON meet_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert meet_sessions" ON meet_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update meet_sessions" ON meet_sessions FOR UPDATE USING (true);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notifications" ON notifications FOR UPDATE USING (true);

-- 10. STORAGE BUCKET SETUP (powerhub-media)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('powerhub-media', 'powerhub-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read powerhub-media" ON storage.objects FOR SELECT USING (bucket_id = 'powerhub-media');
CREATE POLICY "Public Insert powerhub-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'powerhub-media');
CREATE POLICY "Public Update powerhub-media" ON storage.objects FOR UPDATE USING (bucket_id = 'powerhub-media');
