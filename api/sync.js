import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
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

      return res.status(200).json({
        success: true,
        data: {
          announcements: announcements || [],
          teams: teams || [],
          submissions: submissions || [],
          dailyHabits: dailyHabits || [],
          manualMentorMarks: marksMap,
          certificates: certificates || [],
          updatedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      
      // Persist manualMentorMarks directly to Supabase table
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

      return res.status(200).json({ success: true, message: 'Persisted to Supabase successfully' });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
