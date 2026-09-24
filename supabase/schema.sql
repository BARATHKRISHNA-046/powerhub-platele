-- ============================================================================
-- POWERHUB SUPABASE DATABASE SCHEMA (ENTERPRISE ARCHITECTURE V2)
-- PostgreSQL + pg_cron + Idempotent Ledger + IST Timezone Enforcement
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ----------------------------------------------------------------------------
-- 1. REALTIME PUBLICATION SETUP
-- ----------------------------------------------------------------------------
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  profiles, 
  announcements, 
  teams, 
  submissions, 
  daily_habits, 
  notifications,
  meet_sessions,
  score_audit_logs,
  manual_mentor_marks,
  certificates,
  tech_news;

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
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
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Upsert Profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON profiles FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 3. DAILY HABITS TABLE (STRICT IST TIMEZONE & BUSINESS DATE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_habits (
  id TEXT PRIMARY KEY, -- Format: `${student_id}_${business_date}`
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata'),
  study_done BOOLEAN NOT NULL DEFAULT FALSE,
  submit_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_business_date UNIQUE (student_id, business_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_habits_student_date ON daily_habits(student_id, business_date);

ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Daily Habits" ON daily_habits FOR SELECT USING (true);
CREATE POLICY "Public Write Daily Habits" ON daily_habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Daily Habits" ON daily_habits FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 4. IDEMPOTENT SCORE AUDIT LEDGER TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS score_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata'),
  points_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  component TEXT NOT NULL, -- 'penalty_study', 'penalty_submit', 'manual_mentor', 'project_bonus'
  performed_by TEXT DEFAULT 'System',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Idempotency constraint prevents duplicate penalties for the same student, date & component
  CONSTRAINT unique_penalty_record UNIQUE (student_id, business_date, component)
);

CREATE INDEX IF NOT EXISTS idx_score_audit_student ON score_audit_logs(student_id);

ALTER TABLE score_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Audit Logs" ON score_audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Audit Logs" ON score_audit_logs FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. MANUAL MENTOR MARKS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS manual_mentor_marks (
  student_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  mark_val INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE manual_mentor_marks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Mentor Marks" ON manual_mentor_marks FOR SELECT USING (true);
CREATE POLICY "Public Write Mentor Marks" ON manual_mentor_marks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Mentor Marks" ON manual_mentor_marks FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 6. TECH NEWS TABLE (AUTOMATED LIVE TECH PULSE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tech_news (
  id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hiring', 'layoff', 'opening', 'ai_trend')),
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tech_news_published ON tech_news(published_at DESC);

ALTER TABLE tech_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Tech News" ON tech_news FOR SELECT USING (true);
CREATE POLICY "Public Write Tech News" ON tech_news FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Tech News" ON tech_news FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 7. SUBMISSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  github_url TEXT NOT NULL,
  media_url TEXT DEFAULT '',
  round_name TEXT DEFAULT 'Daily Sprint',
  is_project BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  skills_rated JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Public Write Submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Submissions" ON submissions FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 8. ANNOUNCEMENTS TABLE
-- ----------------------------------------------------------------------------
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
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public Write Announcements" ON announcements FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 9. TEAMS TABLE
-- ----------------------------------------------------------------------------
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
CREATE POLICY "Public Read Teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public Write Teams" ON teams FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 10. MEET SESSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meet_sessions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  time_str TEXT NOT NULL,
  meet_url TEXT NOT NULL,
  bootcamp_id TEXT DEFAULT 'all',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meet_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Meet Sessions" ON meet_sessions FOR SELECT USING (true);
CREATE POLICY "Public Write Meet Sessions" ON meet_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Meet Sessions" ON meet_sessions FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public Write Notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Notifications" ON notifications FOR UPDATE USING (true);

-- ----------------------------------------------------------------------------
-- 12. CERTIFICATES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  program_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  verification_id TEXT UNIQUE NOT NULL,
  pdf_url TEXT DEFAULT ''
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public Write Certificates" ON certificates FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 13. STORED PROCEDURE: IDEMPOTENT DAILY HABIT PENALTY EVALUATOR
-- Evaluates habit compliance at 23:00 IST with a 10-minute grace period
-- Uses transactional advisory locking to prevent duplicate runs across nodes
-- ============================================================================
CREATE OR REPLACE FUNCTION process_daily_habit_penalties_ist(
  target_date DATE DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_lock_acquired BOOLEAN;
  v_student RECORD;
  v_habit RECORD;
  v_penalties_applied INT := 0;
BEGIN
  -- 1. Try to acquire transaction advisory lock (Lock Key ID: 884920)
  SELECT pg_try_advisory_xact_lock(884920) INTO v_lock_acquired;
  IF NOT v_lock_acquired THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Penalty calculation lock currently held by another worker instance.'
    );
  END IF;

  -- 2. Iterate through all student profiles
  FOR v_student IN 
    SELECT p.id, p.name FROM profiles p WHERE 'student' = ANY(p.roles)
  LOOP
    -- Fetch habit row for target business date
    SELECT * INTO v_habit FROM daily_habits dh 
    WHERE dh.student_id = v_student.id AND dh.business_date = target_date;

    -- A. Check Study Habit Compliance (Deduct -5 points if uncompleted)
    IF v_habit IS NULL OR v_habit.study_done = FALSE THEN
      INSERT INTO score_audit_logs (student_id, business_date, points_change, reason, component, performed_by)
      VALUES (
        v_student.id, 
        target_date, 
        -5, 
        'Automated Penalty: Missed 11:00 PM IST Study Check-in (' || target_date || ')', 
        'penalty_study', 
        'System Cron'
      )
      ON CONFLICT (student_id, business_date, component) DO NOTHING;
      v_penalties_applied := v_penalties_applied + 1;
    END IF;

    -- B. Check Submission Habit Compliance (Deduct -5 points if uncompleted)
    IF v_habit IS NULL OR v_habit.submit_done = FALSE THEN
      INSERT INTO score_audit_logs (student_id, business_date, points_change, reason, component, performed_by)
      VALUES (
        v_student.id, 
        target_date, 
        -5, 
        'Automated Penalty: Missed 11:00 PM IST Deliverable Submission Check-in (' || target_date || ')', 
        'penalty_submit', 
        'System Cron'
      )
      ON CONFLICT (student_id, business_date, component) DO NOTHING;
      v_penalties_applied := v_penalties_applied + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true, 
    'target_date', target_date, 
    'penalties_logged', v_penalties_applied,
    'executed_at', NOW()
  );
END;
$$;

-- ============================================================================
-- 14. CRON JOB SCHEDULE (pg_cron)
-- Triggers stored procedure every night at 23:10 IST (17:40 UTC)
-- (Includes 10-minute grace period after 11:00 PM IST cutoff)
-- ============================================================================
SELECT cron.unschedule('powerhub-daily-habit-penalty-ist');
SELECT cron.schedule(
  'powerhub-daily-habit-penalty-ist',
  '40 17 * * *', -- 17:40 UTC = 23:10 IST
  $$ SELECT process_daily_habit_penalties_ist((CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')); $$
);
