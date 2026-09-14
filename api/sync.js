import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Sync Endpoint
let memoryStore = {
  submissions: [],
  announcements: [],
  teams: [],
  dailyHabitStates: {},
  manualMentorMarks: {},
  deletedAnnIds: [],
  certificates: [],
  updatedAt: new Date().toISOString()
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabase = null;
  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
      console.warn('Supabase serverless initialization warning:', e);
    }
  }

  if (req.method === 'GET') {
    if (supabase) {
      try {
        const [{ data: marks }, { data: habits }] = await Promise.all([
          supabase.from('manual_mentor_marks').select('*'),
          supabase.from('daily_habits').select('*')
        ]);
        if (marks) {
          const marksObj = {};
          marks.forEach(m => { if (m.student_id) marksObj[m.student_id] = m.mark_val; });
          memoryStore.manualMentorMarks = marksObj;
        }
        if (habits) {
          const habitsObj = {};
          habits.forEach(h => {
            if (h.student_id && h.date) {
              habitsObj[`${h.student_id}_${h.date}`] = { studyDone: h.study_done, submitDone: h.submit_done };
            }
          });
          memoryStore.dailyHabitStates = habitsObj;
        }
      } catch (err) {
        console.warn('Supabase fetch in Vercel API error:', err);
      }
    }
    return res.status(200).json({ success: true, data: memoryStore });
  }

  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      memoryStore = { ...memoryStore, ...payload, updatedAt: new Date().toISOString() };

      if (supabase && payload.manualMentorMarks) {
        const upserts = Object.entries(payload.manualMentorMarks).map(([studentId, val]) => ({
          student_id: studentId,
          mark_val: Number(val) || 0,
          updated_at: new Date().toISOString()
        }));
        await supabase.from('manual_mentor_marks').upsert(upserts, { onConflict: 'student_id' });
      }

      return res.status(200).json({ success: true, data: memoryStore });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
