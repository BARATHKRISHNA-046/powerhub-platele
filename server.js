import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { initAutomationCronScheduler } from './src/server/automationCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client initialization for server routes
const supabaseUrl = 
  process.env.VITE_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  '';

const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  '';

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Middleware
app.use(express.json());

// Serve built frontend static assets from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'PowerHub Production Server'
  });
});

// Persistent In-Memory Server Store Fallback for Cross-Device Sync
let serverMemoryStore = {
  announcements: [],
  teams: [],
  submissions: [],
  dailyHabitStates: {},
  manualMentorMarks: {},
  certificates: [],
  notifications: [],
  updatedAt: new Date().toISOString()
};

// Persistent API Sync Proxy Routes (/api/sync)
app.get('/api/sync', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (supabase) {
    try {
      const [
        { data: announcements },
        { data: teams },
        { data: submissions },
        { data: dailyHabits },
        { data: manualMentorMarks },
        { data: certificates }
      ] = await Promise.all([
        supabase.from('announcements').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('submissions').select('*'),
        supabase.from('daily_habits').select('*'),
        supabase.from('manual_mentor_marks').select('*'),
        supabase.from('certificates').select('*')
      ]);

      const marksMap = {};
      if (manualMentorMarks) {
        manualMentorMarks.forEach(m => {
          if (m.student_id) marksMap[m.student_id] = Number(m.mark_val || 0);
        });
      }

      if (announcements && announcements.length > 0) serverMemoryStore.announcements = announcements;
      if (teams && teams.length > 0) serverMemoryStore.teams = teams;
      if (submissions && submissions.length > 0) serverMemoryStore.submissions = submissions;
      if (certificates && certificates.length > 0) serverMemoryStore.certificates = certificates;
      if (manualMentorMarks && manualMentorMarks.length > 0) serverMemoryStore.manualMentorMarks = marksMap;
    } catch (err) {
      console.warn('⚠️ [Server /api/sync GET Supabase Warning]:', err.message);
    }
  }

  return res.status(200).json({
    success: true,
    data: serverMemoryStore
  });
});

app.post('/api/sync', async (req, res) => {
  try {
    const payload = req.body || {};

    // 1. Update server memory store for cross-device LAN relay
    if (payload.announcements && Array.isArray(payload.announcements)) {
      serverMemoryStore.announcements = payload.announcements;
    }
    if (payload.teams && Array.isArray(payload.teams)) {
      serverMemoryStore.teams = payload.teams;
    }
    if (payload.submissions && Array.isArray(payload.submissions)) {
      serverMemoryStore.submissions = payload.submissions;
    }
    if (payload.dailyHabitStates && typeof payload.dailyHabitStates === 'object') {
      serverMemoryStore.dailyHabitStates = { ...serverMemoryStore.dailyHabitStates, ...payload.dailyHabitStates };
    }
    if (payload.manualMentorMarks && typeof payload.manualMentorMarks === 'object') {
      serverMemoryStore.manualMentorMarks = { ...serverMemoryStore.manualMentorMarks, ...payload.manualMentorMarks };
    }
    if (payload.certificates && Array.isArray(payload.certificates)) {
      serverMemoryStore.certificates = payload.certificates;
    }
    serverMemoryStore.updatedAt = new Date().toISOString();

    // 2. Persist to Supabase database if configured
    if (supabase) {
      if (payload.manualMentorMarks && typeof payload.manualMentorMarks === 'object') {
        const rows = Object.entries(payload.manualMentorMarks).map(([student_id, mark_val]) => ({
          student_id,
          mark_val: Number(mark_val || 0),
          updated_at: new Date().toISOString()
        }));
        if (rows.length > 0) {
          await supabase.from('manual_mentor_marks').upsert(rows);
        }
      }

      if (payload.announcements && Array.isArray(payload.announcements) && payload.announcements.length > 0) {
        const dbAnnouncements = payload.announcements.map(a => ({
          id: a.id,
          author_id: a.authorId || a.author_id || 'user-barath',
          author_name: a.authorName || a.author_name || 'BARATHKRISHNA H (Mentor)',
          bootcamp_id: a.bootcampId || a.bootcamp_id || 'all',
          title: a.title,
          message: a.message,
          is_pinned: a.isPinned ?? true,
          created_at: a.createdAt || new Date().toISOString()
        }));
        await supabase.from('announcements').upsert(dbAnnouncements);
      }
    }

    return res.status(200).json({ success: true, message: 'Persisted to server store & Supabase successfully', data: serverMemoryStore });
  } catch (e) {
    return res.status(400).json({ success: false, error: e.message });
  }
});

// Single Page Application (SPA) Client Fallback Route
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send('PowerHub: Build folder dist/ not found. Run npm run build first.');
    }
  });
});

// Start Persistent Server & Initialize 24/7 Node-Cron Scheduler
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`⚡ PowerHub Production Server Running on Port ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);

  // Initialize node-cron automation jobs once on process boot
  try {
    initAutomationCronScheduler();
  } catch (err) {
    console.error('⚠️ [Cron Scheduler Exception]:', err.message);
  }
});
