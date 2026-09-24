import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * PowerHub Atomic Store (Zustand)
 * High-performance state management replacing AppContext re-render cascades.
 * Uses atomic selectors and idempotent real-time event merging.
 */
export const usePowerHubStore = create((set, get) => ({
  // State Slices
  currentUser: null,
  users: [],
  submissions: [],
  dailyHabits: {},
  manualMentorMarks: {},
  announcements: [],
  teams: [],
  techNews: [],
  notifications: [],
  auditLogs: [],
  realtimeStatus: 'SUBSCRIBED',

  // Actions & Mutators
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users }),
  setSubmissions: (submissions) => set({ submissions }),
  setDailyHabits: (dailyHabits) => set({ dailyHabits }),
  setManualMentorMarks: (manualMentorMarks) => set({ manualMentorMarks }),
  setAnnouncements: (announcements) => set({ announcements }),
  setTechNews: (techNews) => set({ techNews }),

  // Idempotent Realtime Event Merging (Single Realtime Channel Listener)
  handleRealtimeEvent: (table, eventType, record, oldRecord) => {
    console.log(`⚡ [Zustand Store] Realtime Event: ${eventType} on ${table}`, record);
    
    if (table === 'daily_habits') {
      set((state) => {
        const key = `${record.student_id}_${record.business_date || record.date_str}`;
        if (eventType === 'DELETE') {
          const next = { ...state.dailyHabits };
          delete next[key];
          return { dailyHabits: next };
        }
        return {
          dailyHabits: {
            ...state.dailyHabits,
            [key]: {
              studyDone: record.study_done,
              submitDone: record.submit_done,
              updatedAt: record.updated_at
            }
          }
        };
      });
    } else if (table === 'manual_mentor_marks') {
      set((state) => {
        if (!record || !record.student_id) return state;
        return {
          manualMentorMarks: {
            ...state.manualMentorMarks,
            [record.student_id]: record.mark_val
          }
        };
      });
    } else if (table === 'submissions') {
      set((state) => {
        if (eventType === 'DELETE') {
          return { submissions: state.submissions.filter(s => s.id !== oldRecord.id) };
        }
        const existingIdx = state.submissions.findIndex(s => s.id === record.id);
        if (existingIdx >= 0) {
          const updated = [...state.submissions];
          updated[existingIdx] = { ...updated[existingIdx], ...record };
          return { submissions: updated };
        }
        return { submissions: [record, ...state.submissions] };
      });
    } else if (table === 'announcements') {
      set((state) => {
        if (eventType === 'DELETE') {
          return { announcements: state.announcements.filter(a => a.id !== oldRecord.id) };
        }
        return { announcements: [record, ...state.announcements.filter(a => a.id !== record.id)] };
      });
    } else if (table === 'tech_news') {
      set((state) => ({
        techNews: [record, ...state.techNews.filter(n => n.id !== record.id)]
      }));
    }
  },

  // Optimistic Habit Checkbox Toggle Action
  toggleHabitOptimistic: async (studentId, dateStr, habitType, newValue) => {
    const key = `${studentId}_${dateStr}`;
    const previous = get().dailyHabits[key] || { studyDone: false, submitDone: false };
    
    const updated = {
      ...previous,
      [habitType]: newValue,
      updatedAt: new Date().toISOString()
    };

    // 1. Optimistic UI update
    set((state) => ({
      dailyHabits: { ...state.dailyHabits, [key]: updated }
    }));

    // 2. Persist to Supabase PostgreSQL
    try {
      const payload = {
        id: key,
        student_id: studentId,
        business_date: dateStr,
        study_done: habitType === 'studyDone' ? newValue : previous.studyDone,
        submit_done: habitType === 'submitDone' ? newValue : previous.submitDone,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('daily_habits').upsert(payload, { onConflict: 'student_id,business_date' });
      if (error) throw error;
    } catch (err) {
      console.warn('⚠️ [Optimistic Rollback] Habit update failed:', err.message);
      // Rollback on failure
      set((state) => ({
        dailyHabits: { ...state.dailyHabits, [key]: previous }
      }));
    }
  }
}));
