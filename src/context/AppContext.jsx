import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_TEAMS,
  INITIAL_BOOTCAMPS,
  INITIAL_SUBMISSIONS,
  INITIAL_SKILL_RATINGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GOOGLE_MEET_CONFIG,
  INITIAL_GOOGLE_DRIVE_URL,
  INITIAL_GOOGLE_CLASSROOM_URL,
  INITIAL_COMMUNITY_HUB_URL,
  INITIAL_RESUME_PROFILES,
  SCHEDULE_MONTHS,
  MONTHLY_DAILY_SCHEDULES,
  AI_TEAM_AVATARS,
  EMOJI_COMBOS,
  DOMAIN_ROADMAPS,
  getISTDateDetails,
  generateCalendarDays,
  BATCHES,
  MILESTONE_BADGES
} from '../data/mockData';
import { INITIAL_INTERVIEW_QUESTIONS } from '../data/interviewQuestions';
import {
  logAutomationAction,
  autoTickSubmissionCalendar,
  recordPointsLedgerEntry,
  calculateTotalPointsFromLedger,
  recalculateStudentStreak,
  checkAndAwardMilestoneBadges,
  checkConsecutiveMissesAndAlertMentor,
  createMentorFeedbackNotification,
  checkAndNotifyRankChange,
  validateAndFlagDuplicateGithub
} from '../lib/automationEngine';
import { 
  supabase, 
  syncProfileToSupabase, 
  syncAnnouncementToSupabase,
  deleteAnnouncementFromSupabase,
  syncTeamToSupabase,
  deleteTeamFromSupabase,
  syncSubmissionToSupabase,
  syncDailyHabitToSupabase,
  fetchProfilesFromSupabase,
  fetchAnnouncementsFromSupabase,
  fetchTeamsFromSupabase,
  fetchSubmissionsFromSupabase,
  fetchDailyHabitsFromSupabase,
  fetchUserQuickLinksFromSupabase,
  saveUserQuickLinkClickInSupabase,
  fetchTechNewsFromSupabase,
  syncTechNewsInSupabase,
  fetchCertificatesFromSupabase,
  issueCertificateInSupabase,
  isSupabaseConfigured
} from '../lib/supabase';
import { isMentorEmail, fetchOrCreateUserProfile, signOutUser } from '../lib/authService';






const AppContext = createContext({});

const DB_STORAGE_KEY = 'POWERHUB_PERMANENT_DB_V11';


// Helper to load persistent DB state from LocalStorage with fallback merging
const loadSavedDatabase = () => {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse persistent storage DB:', err);
    return null;
  }
};

// Helper function to compress high-res gallery images to lightweight Data URLs (<30KB)
export const compressImageFile = (file, maxWidth = 280, maxHeight = 280, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const AppProvider = ({ children }) => {
  const savedDb = loadSavedDatabase();

  // Primary State declarations with localStorage initialization fallback
  const [users, setUsers] = useState(() => (savedDb?.users || INITIAL_USERS));
  const [teams, setTeams] = useState(() => (savedDb?.teams || INITIAL_TEAMS));
  const [submissions, setSubmissions] = useState(() => {
    const mergedMap = new Map();
    INITIAL_SUBMISSIONS.forEach(s => { if (s && s.id) mergedMap.set(s.id, s); });
    (savedDb?.submissions || []).forEach(s => { if (s && s.id) mergedMap.set(s.id, s); });
    return Array.from(mergedMap.values());
  });
  const [skillRatings, setSkillRatings] = useState(() => (savedDb?.skillRatings || INITIAL_SKILL_RATINGS));
  const [announcements, setAnnouncements] = useState(() => (savedDb?.announcements || INITIAL_ANNOUNCEMENTS));
  const [auditLogs, setAuditLogs] = useState(() => (savedDb?.auditLogs || INITIAL_AUDIT_LOGS));
  const [deletedAnnIds, setDeletedAnnIds] = useState(() => new Set(savedDb?.deletedAnnIds || []));

  // Resume Profiles State
  const [resumeProfiles, setResumeProfiles] = useState(() => {
    if (savedDb && savedDb.resumeProfiles && typeof savedDb.resumeProfiles === 'object') {
      return { ...INITIAL_RESUME_PROFILES, ...savedDb.resumeProfiles };
    }
    return INITIAL_RESUME_PROFILES;
  });

  // Manual Mentor Assigned Marks State (Overrides automated score when set)
  const [manualMentorMarks, setManualMentorMarks] = useState(() => {
    if (savedDb && savedDb.manualMentorMarks) return savedDb.manualMentorMarks;
    return {};
  });

  // Google Meet Config State
  const [googleMeetConfig, setGoogleMeetConfig] = useState(() => {
    if (savedDb && savedDb.googleMeetConfig) return savedDb.googleMeetConfig;
    return INITIAL_GOOGLE_MEET_CONFIG;
  });

  // Google Drive URL State
  const [googleDriveUrl, setGoogleDriveUrl] = useState(() => {
    if (savedDb && savedDb.googleDriveUrl) return savedDb.googleDriveUrl;
    return INITIAL_GOOGLE_DRIVE_URL;
  });

  // Google Classroom URL State
  const [googleClassroomUrl, setGoogleClassroomUrl] = useState(() => {
    if (savedDb && savedDb.googleClassroomUrl) return savedDb.googleClassroomUrl;
    return INITIAL_GOOGLE_CLASSROOM_URL;
  });

  // Community Hub (WhatsApp Group/Chat URL) State
  const [communityHubUrl, setCommunityHubUrl] = useState(() => {
    if (savedDb && savedDb.communityHubUrl) return savedDb.communityHubUrl;
    return INITIAL_COMMUNITY_HUB_URL;
  });

  // Monthly Habits Persistence State keyed by YYYY-MM-DD
  const [selectedScheduleMonth, setSelectedScheduleMonth] = useState(() => {
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const SCHEDULE_MONTHS = [
      'August 2026', 'September 2026', 'October 2026', 'November 2026',
      'December 2026', 'January 2027', 'February 2027', 'March 2027'
    ];
    return SCHEDULE_MONTHS.includes(monthName) ? monthName : 'August 2026';
  });

  const [dailyHabitStates, setDailyHabitStates] = useState(() => {
    if (savedDb && savedDb.dailyHabitStates) return savedDb.dailyHabitStates;
    return {
      '2026-08-03': { studyDone: true, submitDone: false },
      '2026-08-04': { studyDone: true, submitDone: false },
      '2026-08-05': { studyDone: true, submitDone: false },
      '2026-08-06': { studyDone: false, submitDone: false },
      '2026-08-07': { studyDone: true, submitDone: false }
    };
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem('ph_active_user_id') || 'user-barath';
  });
  const [authScreen, setAuthScreen] = useState('profile_picker');
  const [currentRoleView, setCurrentRoleView] = useState('student');

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Don\'t forget to submit your work! ⏰',
      message: '11:00 PM Night deadline cutoff countdown is active for today.',
      timestamp: 'Today, 11:00 PM',
      type: 'submit_reminder',
      isRead: false
    }
  ]);

  // Automation Engine States (Points Ledger & System Audit Logs)
  const [pointsLedger, setPointsLedger] = useState(() => (savedDb?.pointsLedger || []));
  const [automationLogs, setAutomationLogs] = useState(() => (savedDb?.automationLogs || []));
  const [pushSubscriptions, setPushSubscriptions] = useState(() => (savedDb?.pushSubscriptions || []));
  const [notificationLogs, setNotificationLogs] = useState(() => (savedDb?.notificationLogs || []));

  // BroadcastChannel Ref for zero-delay cross-tab/window real-time synchronization
  const broadcastRef = React.useRef(null);

  const saveAndBroadcastState = React.useCallback(async (stateChunk) => {
    try {
      const currentStorage = loadSavedDatabase() || {};
      const updated = {
        ...currentStorage,
        ...stateChunk,
        deletedAnnIds: stateChunk.deletedAnnIds ? Array.from(stateChunk.deletedAnnIds) : (currentStorage.deletedAnnIds || [])
      };
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(updated));

      if (broadcastRef.current) {
        broadcastRef.current.postMessage({ type: 'POWERHUB_REALTIME_SYNC', payload: stateChunk });
      }

      // Sync to Server Relay / API endpoint (/api/sync) for cross-device & cross-origin sync
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (err) {}

    } catch (e) {
      console.warn('Failed to broadcast realtime state update:', e);
    }
  }, []);

  useEffect(() => {
    try {
      broadcastRef.current = new BroadcastChannel('powerhub_realtime_sync_v4');
      broadcastRef.current.onmessage = (event) => {
        if (event.data && event.data.type === 'POWERHUB_REALTIME_SYNC') {
          const p = event.data.payload;
          if (p.announcements) setAnnouncements(p.announcements);
          if (p.teams) setTeams(p.teams);
          if (p.submissions) setSubmissions(p.submissions);
          if (p.users) setUsers(p.users);
          if (p.dailyHabitStates) setDailyHabitStates(p.dailyHabitStates);
          if (p.mentorFeedbacks) setMentorFeedbacks(p.mentorFeedbacks);
          if (p.manualMentorMarks) setManualMentorMarks(p.manualMentorMarks);
          if (p.certificates && Array.isArray(p.certificates)) setCertificates(p.certificates);
          if (p.mockInterviews && Array.isArray(p.mockInterviews)) setMockInterviews(p.mockInterviews);
          if (p.peerReviews && Array.isArray(p.peerReviews)) setPeerReviews(p.peerReviews);
          if (p.resumeProfiles) setResumeProfiles(p.resumeProfiles);
          if (p.userQuickLinks) setUserQuickLinks(p.userQuickLinks);
          if (p.pointsLedger) setPointsLedger(p.pointsLedger);
          if (p.automationLogs) setAutomationLogs(p.automationLogs);
          if (p.deletedAnnIds) setDeletedAnnIds(new Set(p.deletedAnnIds));
          if (p.problemStatements) setProblemStatements(p.problemStatements);
          if (p.hackathonTeams) setHackathonTeams(p.hackathonTeams);
          if (p.teamMembers) setTeamMembers(p.teamMembers);
          if (p.ideaSubmissions) setIdeaSubmissions(p.ideaSubmissions);
          if (p.isSihLocked !== undefined) setIsSihLocked(p.isSihLocked);
        }
      };
    } catch (err) {}

    const handleStorageChange = (e) => {
      if (e.key === DB_STORAGE_KEY && e.newValue) {
        try {
          const p = JSON.parse(e.newValue);
          if (p.announcements) setAnnouncements(p.announcements);
          if (p.teams) setTeams(p.teams);
          if (p.submissions) setSubmissions(p.submissions);
          if (p.users) setUsers(p.users);
          if (p.dailyHabitStates) setDailyHabitStates(p.dailyHabitStates);
          if (p.mentorFeedbacks) setMentorFeedbacks(p.mentorFeedbacks);
          if (p.manualMentorMarks) setManualMentorMarks(p.manualMentorMarks);
          if (p.certificates && Array.isArray(p.certificates)) setCertificates(p.certificates);
          if (p.mockInterviews && Array.isArray(p.mockInterviews)) setMockInterviews(p.mockInterviews);
          if (p.peerReviews && Array.isArray(p.peerReviews)) setPeerReviews(p.peerReviews);
          if (p.resumeProfiles) setResumeProfiles(p.resumeProfiles);
          if (p.userQuickLinks) setUserQuickLinks(p.userQuickLinks);
          if (p.pointsLedger) setPointsLedger(p.pointsLedger);
          if (p.automationLogs) setAutomationLogs(p.automationLogs);
          if (p.deletedAnnIds) setDeletedAnnIds(new Set(p.deletedAnnIds));
          if (p.problemStatements) setProblemStatements(p.problemStatements);
          if (p.hackathonTeams) setHackathonTeams(p.hackathonTeams);
          if (p.teamMembers) setTeamMembers(p.teamMembers);
          if (p.ideaSubmissions) setIdeaSubmissions(p.ideaSubmissions);
          if (p.isSihLocked !== undefined) setIsSihLocked(p.isSihLocked);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastRef.current) broadcastRef.current.close();
    };
  }, []);

  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // SUPABASE REALTIME MULTI-DEVICE CROSS-DEVICE EVENT HANDLER
  const handleSupabaseRealtimeEvent = React.useCallback((payload) => {
    if (!payload) return;
    const { table, eventType, new: newRow, old: oldRow } = payload;
    console.log(`⚡ [Supabase Realtime Event] ${table} -> ${eventType}`, payload);

    if (table === 'submissions' || table === 'deliverables') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        const item = {
          id: newRow.id,
          studentId: newRow.student_id || newRow.studentId || newRow.user_id,
          studentName: newRow.student_name || newRow.studentName,
          projectTitle: newRow.project_title || newRow.projectTitle || newRow.round_name,
          githubUrl: newRow.github_url || newRow.githubUrl,
          demoUrl: newRow.demo_url || newRow.demoUrl || newRow.demo_link,
          imageAttachment: newRow.image_attachment || newRow.imageAttachment || newRow.media_url,
          status: newRow.status || 'approved',
          submittedAt: newRow.submitted_at || newRow.submittedAt || newRow.created_at,
          score: newRow.score || 0
        };

        setSubmissions(prev => {
          const map = new Map(prev.map(s => [s.id, s]));
          map.set(item.id, { ...(map.get(item.id) || {}), ...item });
          return Array.from(map.values()).sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
        });
      } else if (eventType === 'DELETE' && oldRow?.id) {
        setSubmissions(prev => prev.filter(s => s.id !== oldRow.id));
      }
    } else if (table === 'profiles' || table === 'users') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        setUsers(prev => {
          const map = new Map(prev.map(u => [u.id, u]));
          const existing = map.get(newRow.id) || {};
          map.set(newRow.id, {
            ...existing,
            ...newRow,
            id: newRow.id,
            name: newRow.name || newRow.full_name || existing.name,
            email: newRow.email || existing.email,
            role: newRow.role || existing.role,
            domain: newRow.domain || existing.domain
          });
          return Array.from(map.values());
        });
      } else if (eventType === 'DELETE' && oldRow?.id) {
        setUsers(prev => prev.filter(u => u.id !== oldRow.id));
      }
    } else if (table === 'daily_habit_states') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        const studentId = newRow.student_id || newRow.studentId;
        const dateStr = newRow.date_str || newRow.dateStr;
        const key = `${studentId}_${dateStr}`;
        setDailyHabitStates(prev => ({
          ...prev,
          [key]: {
            studyDone: Boolean(newRow.study_done || newRow.studyDone),
            submitDone: Boolean(newRow.submit_done || newRow.submitDone),
            updatedAt: newRow.updated_at || new Date().toISOString()
          }
        }));
      } else if (eventType === 'DELETE' && oldRow) {
        const key = `${oldRow.student_id}_${oldRow.date_str}`;
        setDailyHabitStates(prev => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      }
    } else if (table === 'manual_mentor_marks') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        const studentId = newRow.student_id || newRow.studentId;
        const markVal = Number(newRow.mark_val || newRow.markVal || 0);
        setManualMentorMarks(prev => ({
          ...prev,
          [studentId]: markVal
        }));
      }
    } else if (table === 'certificates') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        setCertificates(prev => {
          const map = new Map(prev.map(c => [c.id, c]));
          map.set(newRow.id, { ...(map.get(newRow.id) || {}), ...newRow });
          return Array.from(map.values());
        });
      } else if (eventType === 'DELETE' && oldRow?.id) {
        setCertificates(prev => prev.filter(c => c.id !== oldRow.id));
      }
    } else if (table === 'announcements') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        setAnnouncements(prev => {
          const map = new Map(prev.map(a => [a.id, a]));
          map.set(newRow.id, { ...(map.get(newRow.id) || {}), ...newRow });
          return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        });
      } else if (eventType === 'DELETE' && oldRow?.id) {
        setAnnouncements(prev => prev.filter(a => a.id !== oldRow.id));
      }
    } else if (table === 'teams' || table === 'hackathon_teams') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        if (!newRow) return;
        setTeams(prev => {
          const map = new Map(prev.map(t => [t.id, t]));
          map.set(newRow.id, { ...(map.get(newRow.id) || {}), ...newRow });
          return Array.from(map.values());
        });
      } else if (eventType === 'DELETE' && oldRow?.id) {
        setTeams(prev => prev.filter(t => t.id !== oldRow.id));
      }
    }
  }, []);

  // SUPABASE REALTIME SUBSCRIPTION EFFECT FOR TRUE CROSS-DEVICE SYNC
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    console.log('📡 [Supabase Realtime] Initializing cross-device live subscription...');

    const channel = supabase
      .channel('powerhub-global-realtime-v1')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          handleSupabaseRealtimeEvent(payload);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeConnected(true);
          console.log('⚡ [Supabase Realtime] SUBSCRIBED: Listening to live changes across all devices!');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsRealtimeConnected(false);
          console.warn(`⚠️ [Supabase Realtime] Channel status: ${status}. Triggering cloud sync fallback...`);
          fetchLatestCloudDb();
        }
      });

    return () => {
      console.log('🧹 [Supabase Realtime] Unsubscribing channel listener...');
      supabase.removeChannel(channel);
    };
  }, [handleSupabaseRealtimeEvent]);

  // DIRECT SUPABASE DATABASE READ & LIVE SYNC FUNCTION WITH SMART MERGE & SERVER RELAY
  const fetchLatestCloudDb = async () => {
    try {
      // 0. Query Server Relay API (/api/sync) for cross-origin / cross-device live sync
      try {
        const syncRes = await fetch('/api/sync');
        if (syncRes.ok) {
          const syncJson = await syncRes.json();
          if (syncJson.success && syncJson.data) {
            const serverData = syncJson.data;
            if (serverData.announcements && Array.isArray(serverData.announcements)) {
              setAnnouncements(prevLocal => {
                const mergedMap = new Map();
                prevLocal.forEach(a => { if (!deletedAnnIds.has(a.id)) mergedMap.set(a.id, a); });
                serverData.announcements.forEach(a => { if (!deletedAnnIds.has(a.id)) mergedMap.set(a.id, a); });
                return Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              });
            }
            if (serverData.teams && Array.isArray(serverData.teams)) {
              setTeams(prevLocal => {
                const mergedMap = new Map();
                prevLocal.forEach(t => mergedMap.set(t.id, t));
                serverData.teams.forEach(t => mergedMap.set(t.id, t));
                return Array.from(mergedMap.values());
              });
            }
            if (serverData.submissions && Array.isArray(serverData.submissions)) {
              setSubmissions(prevLocal => {
                const mergedMap = new Map();
                INITIAL_SUBMISSIONS.forEach(s => { if (s && s.id) mergedMap.set(s.id, s); });
                prevLocal.forEach(s => { if (s && s.id) mergedMap.set(s.id, s); });
                serverData.submissions.forEach(s => {
                  if (s && s.id) {
                    const existing = mergedMap.get(s.id);
                    if (!existing) {
                      mergedMap.set(s.id, s);
                    } else {
                      const localTime = new Date(existing.updatedAt || existing.submittedAt || existing.createdAt || 0).getTime();
                      const serverTime = new Date(s.updatedAt || s.submittedAt || s.createdAt || 0).getTime();
                      if (serverTime >= localTime || (s.status && s.status !== existing.status)) {
                        mergedMap.set(s.id, { ...existing, ...s });
                      }
                    }
                  }
                });
                return Array.from(mergedMap.values()).sort((a, b) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime());
              });
            }
            if (serverData.dailyHabitStates) {
              setDailyHabitStates(prev => ({ ...prev, ...serverData.dailyHabitStates }));
            }
            if (serverData.mentorFeedbacks) {
              setMentorFeedbacks(prev => ({ ...prev, ...serverData.mentorFeedbacks }));
            }
            if (serverData.manualMentorMarks) {
              setManualMentorMarks(prev => ({ ...prev, ...serverData.manualMentorMarks }));
            }
            if (serverData.certificates && Array.isArray(serverData.certificates)) {
              setCertificates(prevLocal => {
                const mergedMap = new Map();
                prevLocal.forEach(c => mergedMap.set(c.id, c));
                serverData.certificates.forEach(c => mergedMap.set(c.id, c));
                return Array.from(mergedMap.values());
              });
            }
            if (serverData.mockInterviews && Array.isArray(serverData.mockInterviews)) {
              setMockInterviews(prevLocal => {
                const mergedMap = new Map();
                prevLocal.forEach(m => mergedMap.set(m.id, m));
                serverData.mockInterviews.forEach(m => mergedMap.set(m.id, m));
                return Array.from(mergedMap.values());
              });
            }
            if (serverData.peerReviews && Array.isArray(serverData.peerReviews)) {
              setPeerReviews(prevLocal => {
                const mergedMap = new Map();
                prevLocal.forEach(pr => mergedMap.set(pr.id, pr));
                serverData.peerReviews.forEach(pr => mergedMap.set(pr.id, pr));
                return Array.from(mergedMap.values());
              });
            }
            if (serverData.resumeProfiles) {
              setResumeProfiles(prev => ({ ...prev, ...serverData.resumeProfiles }));
            }
            if (serverData.userQuickLinks) {
              setUserQuickLinks(prev => ({ ...prev, ...serverData.userQuickLinks }));
            }
            if (serverData.pointsLedger && Array.isArray(serverData.pointsLedger)) {
              setPointsLedger(serverData.pointsLedger);
            }
            if (serverData.automationLogs && Array.isArray(serverData.automationLogs)) {
              setAutomationLogs(serverData.automationLogs);
            }
            if (serverData.deletedAnnIds) {
              setDeletedAnnIds(new Set(serverData.deletedAnnIds));
            }
            if (serverData.users && Array.isArray(serverData.users)) {
              setUsers(prev => {
                const updatedUsers = [...prev];
                serverData.users.forEach(u => {
                  const idx = updatedUsers.findIndex(existing => existing.id === u.id);
                  if (idx !== -1) {
                    updatedUsers[idx] = { ...updatedUsers[idx], ...u };
                  } else {
                    updatedUsers.push(u);
                  }
                });
                return updatedUsers;
              });
            }
            if (serverData.problemStatements && Array.isArray(serverData.problemStatements)) {
              setProblemStatements(serverData.problemStatements);
            }
            if (serverData.hackathonTeams && Array.isArray(serverData.hackathonTeams)) {
              setHackathonTeams(serverData.hackathonTeams);
            }
            if (serverData.teamMembers && Array.isArray(serverData.teamMembers)) {
              setTeamMembers(serverData.teamMembers);
            }
            if (serverData.ideaSubmissions && Array.isArray(serverData.ideaSubmissions)) {
              setIdeaSubmissions(serverData.ideaSubmissions);
            }
            if (serverData.isSihLocked !== undefined) {
              setIsSihLocked(Boolean(serverData.isSihLocked));
            }

            // Persist latest cloud server snapshot to local storage for instant offline/mount access
            try {
              const currentLocal = loadSavedDatabase() || {};
              localStorage.setItem(DB_STORAGE_KEY, JSON.stringify({
                ...currentLocal,
                ...serverData
              }));
            } catch (e) {}
          }
        }
      } catch (err) {}
      
      // 1. Query Profiles Table from Supabase
      const profiles = await fetchProfilesFromSupabase();
      if (profiles && Array.isArray(profiles) && profiles.length > 0) {
        setUsers(prevUsers => {
          const updatedUsers = [...prevUsers];
          profiles.forEach(p => {
            const index = updatedUsers.findIndex(u => u.id === p.id);
            const freshPic = p.avatar_url || p.profile_pic_url;
            if (index !== -1) {
              updatedUsers[index] = {
                ...updatedUsers[index],
                name: p.name || updatedUsers[index].name,
                email: p.email || updatedUsers[index].email,
                profilePicUrl: freshPic || updatedUsers[index].profilePicUrl,
                profilePic: freshPic || updatedUsers[index].profilePic,
                avatarUrl: freshPic || updatedUsers[index].avatarUrl,
                roles: p.roles || updatedUsers[index].roles,
                domain: p.domain || updatedUsers[index].domain,
                batch: p.batch || updatedUsers[index].batch,
                bio: p.bio || updatedUsers[index].bio
              };
            } else {
              updatedUsers.push({
                id: p.id,
                name: p.name || 'New Student',
                email: p.email || '',
                profilePicUrl: freshPic || '',
                profilePic: freshPic || '',
                avatarUrl: freshPic || '',
                roles: p.roles || ['student'],
                domain: p.domain || 'FULLSTACK',
                batch: p.batch || 'Batch A - Aug 2026 (Fullstack & AI)',
                bio: p.bio || ''
              });
            }
          });
          saveAndBroadcastState({ users: updatedUsers });
          return updatedUsers;
        });
      }

      // 2. Query Announcements Table from Supabase (Smart Merge)
      const dbAnnouncements = await fetchAnnouncementsFromSupabase();
      if (dbAnnouncements && Array.isArray(dbAnnouncements)) {
        const formattedAnnouncements = dbAnnouncements.map(a => ({
          id: a.id,
          authorId: a.author_id,
          authorName: a.author_name || 'Mentor',
          bootcampId: a.bootcamp_id || 'all',
          title: a.title,
          message: a.message,
          createdAt: a.created_at,
          isPinned: a.is_pinned ?? true
        }));

        setAnnouncements(prevLocal => {
          const mergedMap = new Map();
          prevLocal.forEach(a => {
            if (!deletedAnnIds.has(a.id)) mergedMap.set(a.id, a);
          });
          formattedAnnouncements.forEach(a => {
            if (!deletedAnnIds.has(a.id)) mergedMap.set(a.id, a);
          });
          const result = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveAndBroadcastState({ announcements: result });
          return result;
        });
      }

      // 3. Query Teams Table from Supabase
      const dbTeams = await fetchTeamsFromSupabase();
      if (dbTeams && Array.isArray(dbTeams)) {
        const formattedTeams = dbTeams.map(t => ({
          id: t.id,
          name: t.name,
          leadStudentId: t.lead_student_id,
          memberIds: t.member_ids || [],
          githubUrl: t.github_url || '',
          createdAt: t.created_at
        }));
        setTeams(prevLocal => {
          const mergedMap = new Map();
          prevLocal.forEach(t => mergedMap.set(t.id, t));
          formattedTeams.forEach(t => mergedMap.set(t.id, t));
          const result = Array.from(mergedMap.values());
          saveAndBroadcastState({ teams: result });
          return result;
        });
      }

      // 4. Query Submissions Table from Supabase
      const dbSubmissions = await fetchSubmissionsFromSupabase();
      if (dbSubmissions && Array.isArray(dbSubmissions)) {
        const formattedSubmissions = dbSubmissions.map(s => ({
          id: s.id,
          studentId: s.student_id,
          studentName: s.student_name,
          githubUrl: s.github_url,
          imageAttachment: s.media_url,
          mediaFiles: s.media_url ? [s.media_url] : [],
          roundName: s.round_name || 'Sprint Deliverable',
          isProject: Boolean(s.is_project),
          createdAt: s.created_at
        }));
        setSubmissions(prevLocal => {
          const mergedMap = new Map();
          prevLocal.forEach(s => mergedMap.set(s.id, s));
          formattedSubmissions.forEach(s => mergedMap.set(s.id, s));
          const result = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          saveAndBroadcastState({ submissions: result });
          return result;
        });
      }

      // 5. Query Daily Habits Table from Supabase
      const dbHabits = await fetchDailyHabitsFromSupabase();
      if (dbHabits && Array.isArray(dbHabits)) {
        setDailyHabitStates(prev => {
          const updated = { ...prev };
          dbHabits.forEach(h => {
            if (h.key) {
              updated[h.key] = {
                studyDone: Boolean(h.study_done),
                submitDone: Boolean(h.submit_done)
              };
            }
          });
          saveAndBroadcastState({ dailyHabitStates: updated });
          return updated;
        });
      }

    } catch (err) {
      console.warn('⚠️ [Supabase Database Fetch Warning]:', err);
    }
  };


  // AUTOMATIC MULTI-DEVICE REALTIME CLOUD SYNC: Supabase Realtime + Polling + Focus Event Listeners
  useEffect(() => {
    fetchLatestCloudDb();

    // 1. Periodic 3-Second Background Cloud Polling (Syncs live across phones/laptops/browsers)
    const pollInterval = setInterval(fetchLatestCloudDb, 3000);

    // 2. Refetch on Window Focus & Online (Instant sync when user switches tabs or wakes device screen)
    const handleFocus = () => fetchLatestCloudDb();
    const handleOnline = () => fetchLatestCloudDb();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    // 3. Supabase Realtime WebSocket Listener (Subscribes to live DB inserts & updates)
    const realtimeChannel = supabase
      .channel('powerhub-live-sync-v2')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('⚡ [Supabase Realtime Payload Received]', payload);
        fetchLatestCloudDb();
      })
      .subscribe((status) => {
        console.log('⚡ [Supabase Realtime Channel Status]:', status);
      });

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Manual Sync Cloud Database function (refetches fresh state from Supabase)
  const syncCloudDatabase = async () => {
    await fetchLatestCloudDb();
    alert('☁️ Live Supabase Cloud Sync Complete! All device profiles, announcements, and submissions are up to date.');
  };





  const DEFAULT_FALLBACK_USER = {
    id: 'user-barath',
    name: 'BARATHKRISHNA H',
    email: 'barathkrishna@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#38bdf8',
    initials: 'BK',
    roles: ['student', 'mentor', 'admin'],
    domain: 'FULLSTACK',
    batch: 'Batch A - Aug 2026 (Fullstack & AI)',
    mentorBatches: ['Batch A - Aug 2026 (Fullstack & AI)', 'Batch B - Aug 2026 (VLSI & Embedded)', 'Batch C - Aug 2026 (Automotive & IoT)'],
    bootcampId: 'bootcamp-1',
    bio: 'Lead student building fullstack AI platforms.'
  };

  const currentUser = (users && users.length > 0) ? (users.find(u => u.id === currentUserId) || users[0]) : DEFAULT_FALLBACK_USER;

  // Student Quick Links Timestamps (Per Student Supabase & LocalSync)
  const [userQuickLinks, setUserQuickLinks] = useState({ drive: null, classroom: null, community: null });

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserQuickLinksFromSupabase(currentUser.id).then(links => {
        if (links) setUserQuickLinks(links);
      });
    }
  }, [currentUser?.id]);

  const trackQuickLinkClick = async (linkKey) => {
    if (!currentUser?.id) return;
    const updated = await saveUserQuickLinkClickInSupabase(currentUser.id, linkKey);
    setUserQuickLinks(updated);
    saveAndBroadcastState({ userQuickLinks: updated });
  };

  // Tech Industry Pulse Daily News State
  const [techNews, setTechNews] = useState([]);

  const refreshTechNews = React.useCallback(async () => {
    try {
      const items = await fetchTechNewsFromSupabase();
      if (items && items.length > 0) {
        setTechNews(items);
      }
    } catch (err) {
      console.warn('Failed to load tech news feed:', err);
    }
  }, []);

  useEffect(() => {
    refreshTechNews();
  }, [refreshTechNews]);

  // Auto-Certificates State & Issue Function
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificatesFromSupabase().then(certs => {
      if (certs) setCertificates(certs);
    });
  }, []);

  const issueCertificate = async (studentId, programTitle, mentorSignatureStr) => {
    const student = users.find(u => u.id === studentId);
    if (!student) return null;

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certId = `cert-${Date.now()}`;
    const verificationId = `PH-CERT-2026-${randomSuffix}`;

    const newCert = {
      id: certId,
      student_id: studentId,
      student_name: student.name,
      domain: student.domain || 'FULLSTACK',
      program_title: programTitle || `${student.domain || 'Fullstack'} Program Completion`,
      issued_at: new Date().toISOString(),
      mentor_signature: mentorSignatureStr || `${currentUser?.name || 'Lead Mentor'} (Powerhub Engineering)`,
      verification_id: verificationId
    };

    setCertificates(prev => {
      const updated = [newCert, ...prev];
      saveAndBroadcastState({ certificates: updated });
      return updated;
    });
    await issueCertificateInSupabase(newCert);

    logAutomationAction(
      `🏅 Auto-Certificate Issued to ${student.name} (${verificationId})`,
      currentUser?.id || 'mentor',
      currentUser?.name || 'Mentor'
    );

    return newCert;
  };

  // Feature #3: Interview Prep & Mock Interview Booking State
  const [interviewQuestions] = useState(INITIAL_INTERVIEW_QUESTIONS);
  const [mockInterviews, setMockInterviews] = useState(() => {
    if (savedDb && savedDb.mockInterviews) return savedDb.mockInterviews;
    return [
      {
        id: 'mock-1',
        student_id: 'user-barath-001',
        student_name: 'Barath Krishna H',
        mentor_id: 'barathkrishna046@gmail.com',
        mentor_name: 'Barath Krishna (Lead Mentor)',
        domain: 'FULLSTACK',
        requested_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        scheduled_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        status: 'scheduled'
      }
    ];
  });

  const bookMockInterview = (requestedSlotStr, notesStr) => {
    if (!currentUser?.id) return null;
    const newBooking = {
      id: `mock-${Date.now()}`,
      student_id: currentUser.id,
      student_name: currentUser.name || 'Student',
      mentor_id: 'barathkrishna046@gmail.com',
      mentor_name: 'Barath Krishna (Lead Mentor)',
      domain: currentUser.domain || 'FULLSTACK',
      requested_at: new Date().toISOString(),
      scheduled_at: requestedSlotStr || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      notes: notesStr || 'General Technical & System Design Practice',
      status: 'requested'
    };

    setMockInterviews(prev => {
      const updated = [newBooking, ...prev];
      saveAndBroadcastState({ mockInterviews: updated });
      return updated;
    });
    return newBooking;
  };

  const updateMockInterviewStatus = (mockId, statusStr, scheduledTimeStr) => {
    setMockInterviews(prev => {
      const updated = prev.map(m => {
        if (m.id === mockId) {
          return { 
            ...m, 
            status: statusStr, 
            scheduled_at: scheduledTimeStr || m.scheduled_at 
          };
        }
        return m;
      });
      saveAndBroadcastState({ mockInterviews: updated });
      return updated;
    });
  };

  // Feature #4: Peer Code Review State & Actions
  const [peerReviews, setPeerReviews] = useState(() => {
    if (savedDb && savedDb.peerReviews) return savedDb.peerReviews;
    return [
      {
        id: 'pr-1',
        submission_id: 'sub-sample-1',
        reviewer_id: 'user-barath-001',
        reviewer_name: 'Barath Krishna H',
        submitter_id: 'user-navin',
        submitter_name: 'Navin Kumar',
        github_url: 'https://github.com/navinkumar/react-powerhub',
        feedback_text: 'Excellent component separation, clean prop types, and responsive layout!',
        checklist_json: { codeRuns: true, namingConventions: true, readmeClear: true },
        created_at: new Date().toISOString()
      }
    ];
  });

  const submitPeerReview = (submissionId, submitterId, submitterName, githubUrl, feedbackText, checklistObj) => {
    if (!currentUser?.id) return null;
    const newReview = {
      id: `pr-${Date.now()}`,
      submission_id: submissionId,
      reviewer_id: currentUser.id,
      reviewer_name: currentUser.name || 'Peer Reviewer',
      submitter_id: submitterId,
      submitter_name: submitterName,
      github_url: githubUrl,
      feedback_text: feedbackText,
      checklist_json: checklistObj || { codeRuns: true, namingConventions: true, readmeClear: true },
      created_at: new Date().toISOString()
    };

    setPeerReviews(prev => {
      const updated = [newReview, ...prev];
      saveAndBroadcastState({ peerReviews: updated });
      return updated;
    });

    logAutomationAction(
      `⭐ Peer Code Review Completed by ${currentUser.name} for ${submitterName} (+2 Pts Bonus)`,
      currentUser.id,
      currentUser.name
    );

    return newReview;
  };

  // Feature #5: Monthly Hackathons / Coding Contests State & Actions
  const [hackathons, setHackathons] = useState(() => {
    if (savedDb && savedDb.hackathons) return savedDb.hackathons;
    return [
      {
        id: 'hack-1',
        title: 'Powerhub August Autonomous AI & Fullstack Buildathon',
        description: 'Build production-ready web apps or AI agents within 48 hours. Top 3 teams win global points bonuses!',
        start_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        end_at: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        is_team_based: true,
        created_by: 'barathkrishna046@gmail.com',
        participants: ['user-barath-001', 'user-navin', 'user-kanika'],
        winners: null,
        status: 'active'
      }
    ];
  });

  const createHackathon = (title, description, startAt, endAt, isTeamBased) => {
    const newHack = {
      id: `hack-${Date.now()}`,
      title,
      description,
      start_at: startAt || new Date().toISOString(),
      end_at: endAt || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      is_team_based: Boolean(isTeamBased),
      created_by: currentUser?.id || 'mentor',
      participants: [],
      winners: null,
      status: 'active'
    };

    setHackathons(prev => [newHack, ...prev]);
    saveAndBroadcastState({ hackathons: [newHack, ...hackathons] });
    return newHack;
  };

  const joinHackathon = (hackathonId) => {
    if (!currentUser?.id) return;
    setHackathons(prev => prev.map(h => {
      if (h.id === hackathonId && !h.participants.includes(currentUser.id)) {
        return { ...h, participants: [...h.participants, currentUser.id] };
      }
      return h;
    }));
    saveAndBroadcastState({ hackathons: hackathons.map(h => h.id === hackathonId && !h.participants.includes(currentUser.id) ? { ...h, participants: [...h.participants, currentUser.id] } : h) });
  };

  // Top Level Navigation State
  const [activeTopTab, setActiveTopTab] = useState('dashboard'); // 'dashboard' | 'hackathon'

  // Global SIH Lock State (Mentor controlled lock)
  const [isSihLocked, setIsSihLocked] = useState(() => {
    if (savedDb && savedDb.isSihLocked !== undefined) return Boolean(savedDb.isSihLocked);
    return false;
  });

  const toggleSihLock = (status) => {
    const newStatus = status !== undefined ? Boolean(status) : !isSihLocked;
    setIsSihLocked(newStatus);
    saveAndBroadcastState({ isSihLocked: newStatus });
  };

  // SIH Hackathon Module States & Persistence
  const [problemStatements, setProblemStatements] = useState(() => {
    if (savedDb && savedDb.problemStatements) return savedDb.problemStatements;
    return [
      {
        id: 'ps-101',
        title: 'AI-Powered Smart Traffic Management System for Smart Cities',
        description: 'Build an edge-deployed real-time computer vision & IoT pipeline to dynamically regulate traffic signals, reduce congestion, and prioritize emergency vehicles.',
        category: 'Hardware',
        domain_tags: ['AI', 'Edge AI', 'IoT'],
        createdBy: 'barathkrishna046@gmail.com',
        status: 'active',
        createdAt: '2026-08-08T10:00:00Z'
      },
      {
        id: 'ps-102',
        title: 'Autonomous Student Career Analytics & Skill Match Engine',
        description: 'Create a fullstack AI portal that analyzes student repository commits, certifications, and project benchmarks to auto-generate verified career roadmaps and job match scores.',
        category: 'Software',
        domain_tags: ['Fullstack', 'AI', 'Analytics'],
        createdBy: 'barathkrishna046@gmail.com',
        status: 'active',
        createdAt: '2026-08-08T11:00:00Z'
      },
      {
        id: 'ps-103',
        title: 'Decentralized Peer Code Auditing & Verification Protocol',
        description: 'Design a zero-trust automated peer review system with automated test execution, static code analysis, and anti-plagiarism detection for student coding submissions.',
        category: 'Software',
        domain_tags: ['Fullstack', 'Security'],
        createdBy: 'barathkrishna046@gmail.com',
        status: 'active',
        createdAt: '2026-08-08T12:00:00Z'
      }
    ];
  });

  const [hackathonTeams, setHackathonTeams] = useState(() => {
    if (savedDb && savedDb.hackathonTeams) return savedDb.hackathonTeams;
    return [];
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    if (savedDb && savedDb.teamMembers) return savedDb.teamMembers;
    return [];
  });

  const [ideaSubmissions, setIdeaSubmissions] = useState(() => {
    if (savedDb && savedDb.ideaSubmissions) return savedDb.ideaSubmissions;
    return [];
  });

  const resetSihHackathonData = () => {
    setHackathonTeams([]);
    setTeamMembers([]);
    setIdeaSubmissions([]);
    saveAndBroadcastState({
      hackathonTeams: [],
      teamMembers: [],
      ideaSubmissions: []
    });
  };

  // SIH Hackathon Actions
  const createProblemStatement = (title, description, category, domainTags, bannerUrl = '') => {
    const newPS = {
      id: `ps-${Date.now()}`,
      title,
      description,
      category: category || 'Software',
      domain_tags: Array.isArray(domainTags) ? domainTags : (domainTags ? domainTags.split(',').map(s => s.trim()) : ['Fullstack']),
      bannerUrl: bannerUrl || '',
      createdBy: currentUser?.id || 'barathkrishna046@gmail.com',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setProblemStatements(prev => [newPS, ...prev]);
    saveAndBroadcastState({ problemStatements: [newPS, ...problemStatements] });
    return newPS;
  };

  const updateProblemStatement = (psId, updatedData) => {
    setProblemStatements(prev => prev.map(p => p.id === psId ? { ...p, ...updatedData } : p));
    saveAndBroadcastState({ problemStatements: problemStatements.map(p => p.id === psId ? { ...p, ...updatedData } : p) });
  };

  const deleteProblemStatement = (psId) => {
    setProblemStatements(prev => {
      const updated = prev.filter(p => p.id !== psId);
      saveAndBroadcastState({ problemStatements: updated });
      return updated;
    });
  };

  const createHackathonTeam = (teamName) => {
    if (!currentUser?.id) return null;
    const newTeamId = `hteam-${Date.now()}`;
    const newTeam = {
      id: newTeamId,
      teamName,
      createdBy: currentUser.id,
      problemStatementId: null,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    const newMember = {
      id: `tm-${Date.now()}`,
      teamId: newTeamId,
      studentId: currentUser.id,
      joinedAt: new Date().toISOString()
    };

    setHackathonTeams(prev => [newTeam, ...prev]);
    setTeamMembers(prev => [...prev, newMember]);
    saveAndBroadcastState({ 
      hackathonTeams: [newTeam, ...hackathonTeams],
      teamMembers: [...teamMembers, newMember]
    });
    return newTeam;
  };

  const selectProblemStatementForTeam = (teamId, psId) => {
    setHackathonTeams(prev => prev.map(t => t.id === teamId ? { ...t, problemStatementId: psId } : t));
    saveAndBroadcastState({ hackathonTeams: hackathonTeams.map(t => t.id === teamId ? { ...t, problemStatementId: psId } : t) });
  };

  const updateHackathonTeam = (teamId, updatedData) => {
    setHackathonTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updatedData } : t));
    saveAndBroadcastState({ hackathonTeams: hackathonTeams.map(t => t.id === teamId ? { ...t, ...updatedData } : t) });
  };

  const inviteTeamMember = (teamId, studentId) => {
    if (!teamMembers.some(m => m.teamId === teamId && m.studentId === studentId)) {
      const newMember = {
        id: `tm-${Date.now()}`,
        teamId,
        studentId,
        joinedAt: new Date().toISOString()
      };
      setTeamMembers(prev => [...prev, newMember]);
      saveAndBroadcastState({ teamMembers: [...teamMembers, newMember] });
    }
  };

  const removeTeamMember = (teamId, studentId) => {
    setTeamMembers(prev => prev.filter(m => !(m.teamId === teamId && m.studentId === studentId)));
    saveAndBroadcastState({ teamMembers: teamMembers.filter(m => !(m.teamId === teamId && m.studentId === studentId)) });
  };

  const submitIdeaSubmission = (teamId, psId, solutionApproach, techStack, expectedImpact) => {
    const existingIndex = ideaSubmissions.findIndex(s => s.teamId === teamId);
    let updatedSubmissions;

    if (existingIndex !== -1) {
      updatedSubmissions = ideaSubmissions.map((s, idx) => {
        if (idx === existingIndex) {
          return {
            ...s,
            solutionApproach,
            techStack,
            expectedImpact,
            submittedAt: new Date().toISOString(),
            reviewStatus: 'pending'
          };
        }
        return s;
      });
    } else {
      const newSub = {
        id: `sub-${Date.now()}`,
        teamId,
        problemStatementId: psId,
        solutionApproach,
        techStack,
        expectedImpact,
        submittedAt: new Date().toISOString(),
        reviewStatus: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        mentorFeedback: null
      };
      updatedSubmissions = [newSub, ...ideaSubmissions];
    }

    setIdeaSubmissions(updatedSubmissions);
    setHackathonTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'submitted' } : t));

    saveAndBroadcastState({
      ideaSubmissions: updatedSubmissions,
      hackathonTeams: hackathonTeams.map(t => t.id === teamId ? { ...t, status: 'submitted' } : t)
    });
  };

  const reviewIdeaSubmission = (submissionId, decision, mentorFeedbackText) => {
    const targetSub = ideaSubmissions.find(s => s.id === submissionId);
    if (!targetSub) return;

    const updatedSubmissions = ideaSubmissions.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          reviewStatus: decision,
          reviewedBy: currentUser?.id || 'barathkrishna046@gmail.com',
          reviewedAt: new Date().toISOString(),
          mentorFeedback: mentorFeedbackText || null
        };
      }
      return s;
    });

    const updatedTeams = hackathonTeams.map(t => {
      if (t.id === targetSub.teamId) {
        return { ...t, status: decision };
      }
      return t;
    });

    setIdeaSubmissions(updatedSubmissions);
    setHackathonTeams(updatedTeams);

    saveAndBroadcastState({
      ideaSubmissions: updatedSubmissions,
      hackathonTeams: updatedTeams
    });
  };


  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [pendingSetupProfile, setPendingSetupProfile] = useState(null);

  // Supabase Auth State Listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('⚡ [Supabase Auth Listener]', event, session?.user?.email);

      if (session?.user) {
        try {
          const { profile, isNewUser, setupCompleted } = await fetchOrCreateUserProfile(session.user, users);
          
          setUsers(prev => {
            const idx = prev.findIndex(u => u.id === profile.id || u.email === profile.email);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...profile };
              return updated;
            }
            return [profile, ...prev];
          });

          setCurrentUserId(profile.id);
          localStorage.setItem('ph_active_user_id', profile.id);

          if (profile.role === 'mentor' || isMentorEmail(profile.email)) {
            setCurrentRoleView('mentor');
            setAuthScreen('app');
            setShowProfileSetupModal(false);
          } else {
            setCurrentRoleView('student');
            if (!setupCompleted) {
              setPendingSetupProfile(profile);
              setShowProfileSetupModal(true);
            } else {
              setAuthScreen('app');
              setShowProfileSetupModal(false);
            }
          }
        } catch (err) {
          console.error('Error in auth session setup:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthScreen('login');
        setShowProfileSetupModal(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleCompleteStudentSetup = (completedProfile) => {
    const updatedUsers = users.map(u => u.id === completedProfile.id ? completedProfile : u);
    setUsers(updatedUsers);
    saveAndBroadcastState({ users: updatedUsers });
    syncProfileToSupabase(completedProfile);

    setShowProfileSetupModal(false);
    setPendingSetupProfile(null);
    setAuthScreen('app');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setAuthScreen('login');
  };

  const loginWithGoogleUser = async (authUserPayload) => {
    try {
      const authUser = {
        id: authUserPayload.id || `google-user-${Date.now()}`,
        email: authUserPayload.email,
        user_metadata: authUserPayload.user_metadata || { full_name: authUserPayload.name }
      };

      const { profile, isNewUser, setupCompleted } = await fetchOrCreateUserProfile(authUser, users);
      
      setUsers(prev => {
        const idx = prev.findIndex(u => u.id === profile.id || u.email === profile.email);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...profile };
          return updated;
        }
        return [profile, ...prev];
      });

      setCurrentUserId(profile.id);
      localStorage.setItem('ph_active_user_id', profile.id);

      if (profile.role === 'mentor' || isMentorEmail(profile.email)) {
        setCurrentRoleView('mentor');
        setAuthScreen('app');
        setShowProfileSetupModal(false);
      } else {
        setCurrentRoleView('student');
        if (!setupCompleted) {
          setPendingSetupProfile(profile);
          setShowProfileSetupModal(true);
        } else {
          setAuthScreen('app');
          setShowProfileSetupModal(false);
        }
      }
    } catch (err) {
      console.error('Error logging in Google account:', err);
    }
  };

  const selectProfile = (userId) => {
    setCurrentUserId(userId);
    localStorage.setItem('ph_active_user_id', userId);
    const user = users.find(u => u.id === userId);
    const isMentor = user?.role === 'mentor' || (user?.roles || []).includes('mentor') || isMentorEmail(user?.email);

    if (isMentor) {
      setCurrentRoleView('mentor');
    } else {
      setCurrentRoleView('student');
    }
    setAuthScreen('app');
  };

  const toggleRoleView = (view) => {
    const isMentor = currentUser?.role === 'mentor' || (currentUser?.roles || []).includes('mentor') || isMentorEmail(currentUser?.email);
    if (view === 'mentor' && !isMentor) {
      alert('⚠️ Access Restricted: Mentor role is required to switch to Mentor View.');
      return;
    }
    setCurrentRoleView(view);
  };

  // Update Profile Picture for student with field standardization & logging
  const updateUserProfilePic = (userId, profilePicUrl) => {
    console.log(`[Profile Pic Upload] Updating DB/State for user ${userId} with URL:`, profilePicUrl);
    setUsers(prev => {
      const nextUsers = prev.map(u => {
        if (u.id === userId) {
          const updated = { 
            ...u, 
            profilePicUrl: profilePicUrl,
            profilePic: profilePicUrl, 
            avatarUrl: profilePicUrl 
          };
          syncProfileToSupabase(updated);
          return updated;
        }
        return u;
      });
      return nextUsers;
    });
  };




  // Update Resume Profile for student
  const updateResumeProfile = (userId, updatedData) => {
    setResumeProfiles(prev => {
      const updated = {
        ...prev,
        [userId]: {
          ...(prev[userId] || {}),
          ...updatedData
        }
      };
      saveAndBroadcastState({ resumeProfiles: updated });
      return updated;
    });
  };

  const getStudentHabitRecord = (studentId, dateStr) => {
    const { todayStr, isPast11PM } = getISTDateDetails();
    const key = `${studentId}_${dateStr}`;
    const raw = dailyHabitStates[key] || dailyHabitStates[dateStr] || { studyDone: false, submitDone: false };

    // Check if student has submitted work via submission panel for this date
    const hasSubmission = (submissions || []).some(s => 
      (s.studentId === studentId || s.student_id === studentId || s.userId === studentId) &&
      (s.dateStr === dateStr || (s.submittedAt && s.submittedAt.slice(0, 10) === dateStr) || (s.createdAt && s.createdAt.slice(0, 10) === dateStr))
    );

    const studyDone = Boolean(raw.studyDone || hasSubmission);
    const submitDone = Boolean(raw.submitDone || hasSubmission);

    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    let isMissed = false;
    if (!submitDone) {
      if (isPast) {
        isMissed = true;
      } else if (isToday && isPast11PM) {
        isMissed = true;
      }
    }

    return {
      studyDone,
      submitDone,
      isMissed
    };
  };

  const toggleDailyHabit = (studentId, dateStr, field) => {
    const { todayStr, isPast11PM } = getISTDateDetails();

    // 1. Strict Date Validation: Only allow writes to TODAY'S date entry (Asia/Kolkata timezone)
    if (dateStr !== todayStr) {
      console.warn(`[Backend & Frontend Validation Blocked] Cannot edit non-today date: ${dateStr}. Today is ${todayStr}.`);
      return false;
    }

    // 2. Strict 11:00 PM IST Cutoff Enforcement for Submissions:
    if (field === 'submitDone' && isPast11PM) {
      console.warn(`[11:00 PM IST Cutoff Blocked] 11:00 PM IST submission deadline cutoff has passed.`);
      return false;
    }

    const targetStudentId = studentId || currentUser?.id || 'user-barath';
    const key = `${targetStudentId}_${dateStr}`;

    setDailyHabitStates(prev => {
      const currentVal = prev[key] || prev[dateStr] || { studyDone: false, submitDone: false };
      const updatedVal = {
        ...currentVal,
        [field]: !currentVal[field]
      };
      syncDailyHabitToSupabase(targetStudentId, dateStr, updatedVal);
      return {
        ...prev,
        [key]: updatedVal
      };
    });
    return true;
  };


  const [mentorFeedbacks, setMentorFeedbacks] = useState(() => {

    if (savedDb && savedDb.mentorFeedbacks) return savedDb.mentorFeedbacks;
    return {
      'user-barath_2026-08-07': 'Great job completing 7 PM study & 11 PM submission on time!'
    };
  });

  const saveMentorFeedback = (studentId, dateStr, feedbackText) => {
    const key = `${studentId}_${dateStr}`;
    setMentorFeedbacks(prev => ({
      ...prev,
      [key]: feedbackText
    }));
    console.log(`[Mentor Feedback Saved] ${key}: "${feedbackText}"`);
  };

  const calculateStudentStreak = (studentId) => {
    const { todayStr } = getISTDateDetails();
    return recalculateStudentStreak(studentId, submissions, todayStr);
  };




  const updateGoogleSuiteConfig = ({ topic, timing, meetUrl, driveUrl, classroomUrl, communityHubUrl }) => {
    if (topic !== undefined || timing !== undefined || meetUrl !== undefined) {
      setGoogleMeetConfig(prev => ({
        topic: topic !== undefined ? topic : prev.topic,
        timing: timing !== undefined ? timing : prev.timing,
        meetUrl: meetUrl !== undefined ? meetUrl : prev.meetUrl
      }));
    }
    if (driveUrl !== undefined) setGoogleDriveUrl(driveUrl);
    if (classroomUrl !== undefined) setGoogleClassroomUrl(classroomUrl);
    if (communityHubUrl !== undefined) setCommunityHubUrl(communityHubUrl);

    saveAndBroadcastState({
      googleDriveUrl: driveUrl,
      googleClassroomUrl: classroomUrl,
      communityHubUrl
    });
  };

  // Yesterday's Rank Snapshots for Rank Change Indicators (▲, ▼, —)
  const [leaderboardHistory, setLeaderboardHistory] = useState(() => {
    if (savedDb && savedDb.leaderboardHistory) return savedDb.leaderboardHistory;
    return {
      'user-barath': 1,
      'user-shankar': 2,
      'user-abinav': 3,
      'user-gowtham': 4,
      'user-akshaya': 5,
      'user-navin': 6,
      'user-kanika': 7
    };
  });

  const calculateStudentScore = (studentId, timeRange = 'all_time') => {
    // Filter student submissions: If score reset occurred, only count submissions submitted AFTER scoreResetTimestamp
    const validStudentSubs = submissions.filter(s => {
      if (s.deleted_at) return false;
      if (s.studentId !== studentId && s.student_id !== studentId) return false;
      if (scoreResetTimestamp && s.submittedAt && s.submittedAt < scoreResetTimestamp) {
        return false; // Exclude submissions prior to score reset!
      }
      return true;
    });

    const studentTeams = teams.filter(t => !t.deleted_at && t.memberIds && t.memberIds.includes(studentId));
    const leadTeams = teams.filter(t => !t.deleted_at && t.leadStudentId === studentId);
    const streak = calculateStudentStreak ? calculateStudentStreak(studentId) : 0;

    let baseSubmissionPts = 0;
    let onTimeBonusPts = 0;
    let earlyBonusPts = 0;
    let projectPts = 0;
    let firstSubmitterPts = 0;
    let penaltyPts = 0;
    let missedDeductionsPts = 0;

    const pointsLedger = [];

    let onTimeCount = 0;
    let totalSubmissionsCount = validStudentSubs.length;

    validStudentSubs.forEach((sub, idx) => {
      if (sub.status === 'approved' || sub.status === 'pending') {
        baseSubmissionPts += 10;
        pointsLedger.push({
          id: `leg-sub-${sub.id}`,
          date: sub.submittedAt ? sub.submittedAt.split('T')[0] : '2026-08-07',
          reason: `Submission Approval (${sub.roundName || 'Daily Habit'})`,
          amount: '+10 pts',
          type: 'earn'
        });

        if (sub.isOnTime !== false) {
          onTimeCount++;
          onTimeBonusPts += 5;
          pointsLedger.push({
            id: `leg-ontime-${sub.id}`,
            date: sub.submittedAt ? sub.submittedAt.split('T')[0] : '2026-08-07',
            reason: 'On-Time Submission Bonus',
            amount: '+5 pts',
            type: 'earn'
          });
        }

        // Early submission bonus (+1 pt if submitted >1hr before 11 PM cutoff, i.e. before 22:00 IST)
        if (sub.submittedAt) {
          const subDate = new Date(sub.submittedAt);
          if (subDate.getHours() < 22) {
            earlyBonusPts += 1;
            pointsLedger.push({
              id: `leg-early-${sub.id}`,
              date: sub.submittedAt.split('T')[0],
              reason: 'Early Submission Bonus (>1hr before 11 PM IST)',
              amount: '+1 pt',
              type: 'earn'
            });
          }
        }

        if (sub.isProject) projectPts += 20;
        if (sub.isFirstSubmitter) firstSubmitterPts += 10;
      } else if (sub.status === 'flagged') {
        penaltyPts += 15;
        pointsLedger.push({
          id: `leg-flagged-${sub.id}`,
          date: sub.submittedAt ? sub.submittedAt.split('T')[0] : '2026-08-07',
          reason: 'Flagged Submission Penalty',
          amount: '-15 pts',
          type: 'deduct'
        });
      }
    });

    const hasPostResetActivity = validStudentSubs.length > 0;

    let streakBonusPts = 0;
    if (hasPostResetActivity || !scoreResetTimestamp) {
      if (streak >= 7) {
        streakBonusPts = 10;
        pointsLedger.push({
          id: `leg-streak-${studentId}`,
          date: getISTDateDetails().todayStr,
          reason: `7-Day Active Streak Bonus (${streak} Days)`,
          amount: '+10 pts',
          type: 'earn'
        });
      } else if (streak >= 3) {
        streakBonusPts = 5;
        pointsLedger.push({
          id: `leg-streak-${studentId}`,
          date: getISTDateDetails().todayStr,
          reason: `3-Day Active Streak Bonus (${streak} Days)`,
          amount: '+5 pts',
          type: 'earn'
        });
      }
    }

    const completedPeerReviews = peerReviews.filter(r => r.reviewer_id === studentId && (!scoreResetTimestamp || r.created_at >= scoreResetTimestamp));
    const peerReviewBonusPts = completedPeerReviews.length * 2;
    if (peerReviewBonusPts > 0) {
      pointsLedger.push({
        id: `leg-peer-${studentId}`,
        date: getISTDateDetails().todayStr,
        reason: `Peer Code Review Bonus (${completedPeerReviews.length} Reviews Completed)`,
        amount: `+${peerReviewBonusPts} pts`,
        type: 'earn'
      });
    }

    const teamPts = (hasPostResetActivity || !scoreResetTimestamp) ? studentTeams.length * 5 : 0;
    const leadershipPts = (hasPostResetActivity || !scoreResetTimestamp) ? leadTeams.length * 15 : 0;

    const automatedScore = Math.max(0, (baseSubmissionPts + onTimeBonusPts + earlyBonusPts + streakBonusPts + peerReviewBonusPts + teamPts + leadershipPts + projectPts + firstSubmitterPts) - (penaltyPts + missedDeductionsPts));

    const isManualSet = manualMentorMarks[studentId] !== undefined && manualMentorMarks[studentId] !== null && manualMentorMarks[studentId] !== '';
    const manualMarkVal = isManualSet ? Number(manualMentorMarks[studentId]) : 0;

    if (isManualSet && manualMarkVal > 0) {
      pointsLedger.push({
        id: `leg-manual-${studentId}`,
        date: getISTDateDetails().todayStr,
        reason: '⭐ Direct Mentor Evaluation Marks (Assigned by Mentor)',
        amount: `+${manualMarkVal} pts`,
        type: 'earn'
      });
    }

    const totalScore = Math.max(0, automatedScore + manualMarkVal);

    const onTimePercentage = totalSubmissionsCount > 0 ? Math.round((onTimeCount / totalSubmissionsCount) * 100) : 0;
    const onTimeFraction = `${onTimeCount}/${totalSubmissionsCount} On-Time (${onTimePercentage}%)`;

    return {
      baseSubmissionPts,
      onTimeBonusPts,
      earlyBonusPts,
      streakBonusPts,
      teamPts,
      leadershipPts,
      projectPts,
      firstSubmitterPts,
      penaltyPts,
      missedDeductionsPts,
      automatedScore,
      isManualSet,
      manualMarkVal,
      totalScore,
      onTimeCount,
      totalSubmissionsCount,
      onTimeFraction,
      onTimePercentage,
      pointsLedger,
      submissionCount: validStudentSubs.length,
      teamCount: studentTeams.length,
      leadCount: leadTeams.length,
      streak
    };
  };


  const submitWork = ({ githubUrl, imageAttachment, videoAttachmentName, roundName, isProject }) => {
    // D3: GitHub URL Validation & Duplicate Flagging across students
    const dupCheck = validateAndFlagDuplicateGithub(githubUrl, currentUser.id, getISTDateDetails().todayStr, submissions);
    if (!dupCheck.isValid) {
      throw new Error(dupCheck.error);
    }

    const existingIndex = submissions.findIndex(s => 
      (s.studentId === currentUser.id || s.student_id === currentUser.id) && 
      (s.roundName === roundName || s.round_name === roundName || s.date === getISTDateDetails().todayStr)
    );

    let updatedSubmissions;
    let newSub;

    if (existingIndex !== -1) {
      const existing = submissions[existingIndex];
      newSub = {
        ...existing,
        githubUrl: githubUrl.trim(),
        github_url: githubUrl.trim(),
        imageAttachment: imageAttachment || existing.imageAttachment || null,
        mediaUrl: imageAttachment || existing.mediaUrl || null,
        media_url: imageAttachment || existing.media_url || null,
        videoAttachmentName: videoAttachmentName || existing.videoAttachmentName || null,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isUpdated: true,
        status: 'pending', // Reset status to pending so mentor reviews the update!
        isDuplicateFlagged: dupCheck.isDuplicate,
        duplicateInfo: dupCheck.isDuplicate ? `Duplicate GitHub URL match with student '${dupCheck.duplicateStudentName}'` : null,
      };
      updatedSubmissions = [...submissions];
      updatedSubmissions[existingIndex] = newSub;
    } else {
      const existingInRound = submissions.filter(s => s.roundName === roundName || s.round_name === roundName);
      const isFirstSubmitter = existingInRound.length === 0;

      newSub = {
        id: `sub-${Date.now()}`,
        studentId: currentUser.id,
        student_id: currentUser.id,
        studentName: currentUser.name,
        student_name: currentUser.name,
        date: getISTDateDetails().todayStr,
        bootcampId: currentUser.bootcampId || 'bootcamp-1',
        roundName: roundName || 'Month 1 Sprint Submission',
        round_name: roundName || 'Month 1 Sprint Submission',
        githubUrl: githubUrl.trim(),
        github_url: githubUrl.trim(),
        imageAttachment: imageAttachment || null,
        mediaUrl: imageAttachment || null,
        media_url: imageAttachment || null,
        videoAttachmentName: videoAttachmentName || null,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        isProject: Boolean(isProject),
        isFirstSubmitter,
        isDuplicateFlagged: dupCheck.isDuplicate,
        duplicateInfo: dupCheck.isDuplicate ? `Duplicate GitHub URL match with student '${dupCheck.duplicateStudentName}'` : null,
        status: 'pending',
        isOnTime: true,
        reviewNotes: null
      };
      updatedSubmissions = [newSub, ...submissions];
    }
    setSubmissions(updatedSubmissions);

    // B1: Auto-Tick Submission Calendar
    const updatedHabits = autoTickSubmissionCalendar(currentUser.id, getISTDateDetails().todayStr, dailyHabitStates);
    setDailyHabitStates(updatedHabits);

    // B3: Points Ledger - Base points (+5) & Early Submission Bonus (+1 if >1hr before 11 PM cutoff)
    const ist = getISTDateDetails();
    let pts = 5;
    let reason = 'Submission Completed (+5)';
    if (ist.secondsTo11PM > 3600) {
      pts += 1;
      reason = 'Early Submission Bonus (+6)';
    }

    const { ledger: newLedger } = recordPointsLedgerEntry(pointsLedger, {
      studentId: currentUser.id,
      dateStr: ist.todayStr,
      amount: pts,
      reason
    });
    setPointsLedger(newLedger);

    // B2 & B4: Streak Calculation & Milestone Badges (strict submissions check)
    const newStreak = recalculateStudentStreak(currentUser.id, updatedSubmissions, ist.todayStr);
    const { updatedBadges } = checkAndAwardMilestoneBadges(currentUser.id, newStreak, currentUser.badges || []);

    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          myStreak: newStreak,
          badges: updatedBadges
        };
      }
      return u;
    });
    setUsers(updatedUsers);

    // Auditing: System Automation Log
    const newLogs = logAutomationAction(automationLogs, {
      actionType: 'B1_B3_AUTO_SUBMIT',
      affectedStudentId: currentUser.id,
      details: `Auto-ticked calendar, logged ${pts} points in points_ledger, updated streak (${newStreak} days).`
    });
    setAutomationLogs(newLogs);

    saveAndBroadcastState({
      submissions: updatedSubmissions,
      dailyHabitStates: updatedHabits,
      pointsLedger: newLedger,
      automationLogs: newLogs,
      users: updatedUsers
    });

    syncSubmissionToSupabase(newSub);
    exportSubmissionToGoogleSheets(newSub);
    return newSub;
  };

  const reviewSubmission = (submissionId, { status, skillRatingsObj, reviewNotes, isProject, isFirstSubmitter }) => {
    let targetStudentId = null;
    let targetRoundName = '';

    const updatedSubmissions = submissions.map(s => {
      if (s.id === submissionId) {
        targetStudentId = s.studentId;
        targetRoundName = s.roundName;
        return {
          ...s,
          status,
          reviewNotes: reviewNotes || s.reviewNotes,
          isProject: isProject !== undefined ? isProject : s.isProject,
          isFirstSubmitter: isFirstSubmitter !== undefined ? isFirstSubmitter : s.isFirstSubmitter
        };
      }
      return s;
    });
    setSubmissions(updatedSubmissions);

    // C2: Auto-send Notification to Student on Mentor Feedback
    let updatedNotifs = notifications;
    if (targetStudentId && reviewNotes) {
      const fbNotif = createMentorFeedbackNotification(targetStudentId, targetRoundName, reviewNotes);
      updatedNotifs = [fbNotif, ...notifications];
      setNotifications(updatedNotifs);
    }

    const newLogs = logAutomationAction(automationLogs, {
      actionType: 'C2_MENTOR_FEEDBACK_NOTIF',
      affectedStudentId: targetStudentId,
      details: `In-app notification sent to student for feedback on ${targetRoundName}`
    });
    setAutomationLogs(newLogs);

    saveAndBroadcastState({
      submissions: updatedSubmissions,
      notifications: updatedNotifs,
      automationLogs: newLogs
    });
  };

  const updateSubmissionDetails = (subId, { projectTitle, projectDescription, demoLink }) => {
    setSubmissions(prev => {
      const updated = prev.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            projectTitle: projectTitle !== undefined ? projectTitle : s.projectTitle,
            projectDescription: projectDescription !== undefined ? projectDescription : s.projectDescription,
            demoLink: demoLink !== undefined ? demoLink : s.demoLink,
            demoUrl: demoLink !== undefined ? demoLink : s.demoUrl
          };
        }
        return s;
      });
      saveAndBroadcastState({ submissions: updated });
      return updated;
    });
  };

  const createTeam = ({ name, teamAvatarUrl, leadStudentId, memberIds }) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: name || 'New AI Team',
      teamAvatarUrl: teamAvatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      bootcampId: 'bootcamp-1',
      projectId: `proj-${Date.now()}`,
      projectName: `${name} Shared Deliverable`,
      leadStudentId,
      memberIds: memberIds || [leadStudentId],
      githubUrl: 'https://github.com/team-repo',
      createdAt: new Date().toISOString()
    };
    setTeams(prev => {
      const updated = [...prev, newTeam];
      saveAndBroadcastState({ teams: updated });
      return updated;
    });
    syncTeamToSupabase(newTeam);
  };

  const postAnnouncement = ({ title, message, bootcampId }) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      authorId: currentUser?.id || 'barath-mentor',
      authorName: `${currentUser?.name || 'Mentor'} (Mentor)`,
      bootcampId: bootcampId || 'all',
      title,
      message,
      createdAt: new Date().toISOString(),
      isPinned: true
    };
    setAnnouncements(prev => {
      const updated = [newAnn, ...prev.filter(a => a.id !== newAnn.id)];
      saveAndBroadcastState({ announcements: updated });
      return updated;
    });
    syncAnnouncementToSupabase(newAnn);
  };

  // Data Durability & Auto-Export States
  const [deletionLog, setDeletionLog] = useState(() => {
    if (savedDb && savedDb.deletionLog) return savedDb.deletionLog;
    return [];
  });

  const DEFAULT_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbz_powerhub_sheets_api_barathkrishnah/exec';

  const [googleSheetsWebhookUrl, setGoogleSheetsWebhookUrlState] = useState(() => {
    return localStorage.getItem('ph_google_sheets_webhook_url') || (savedDb?.googleSheetsWebhookUrl || DEFAULT_SHEETS_WEBHOOK);
  });

  const setGoogleSheetsWebhookUrl = (urlStr) => {
    const val = urlStr || DEFAULT_SHEETS_WEBHOOK;
    setGoogleSheetsWebhookUrlState(val);
    localStorage.setItem('ph_google_sheets_webhook_url', val);
    saveAndBroadcastState({ googleSheetsWebhookUrl: val });
  };

  const [submissionExportLogs, setSubmissionExportLogs] = useState(() => {
    if (savedDb && savedDb.submissionExportLogs) return savedDb.submissionExportLogs;
    return [];
  });

  const [databaseBackups, setDatabaseBackups] = useState(() => {
    if (savedDb && savedDb.databaseBackups) return savedDb.databaseBackups;
    return [];
  });

  const [scoreResetTimestamp, setScoreResetTimestamp] = useState(() => {
    if (savedDb && savedDb.scoreResetTimestamp) return savedDb.scoreResetTimestamp;
    return null;
  });

  // Google Sheets Submission Auto-Export Method
  const exportSubmissionToGoogleSheets = async (subObj) => {
    const studentUser = users.find(u => u.id === subObj.studentId || u.id === subObj.student_id) || { name: 'Student', domain: 'Engineering' };
    const exportRow = {
      studentName: studentUser.name,
      domain: studentUser.domain || 'FULLSTACK',
      submittedAt: subObj.submittedAt || new Date().toISOString(),
      githubUrl: subObj.githubUrl || subObj.github_url || '',
      status: subObj.isOnTime !== false ? 'On-Time' : 'Late',
      roundName: subObj.roundName || 'Daily Deliverable'
    };

    setSubmissionExportLogs(prev => [exportRow, ...prev]);
    saveAndBroadcastState({ submissionExportLogs: [exportRow, ...submissionExportLogs] });

    if (googleSheetsWebhookUrl) {
      try {
        await fetch(googleSheetsWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exportRow)
        });
        console.log('⚡ [Google Sheets API Auto-Export] Logged submission row:', exportRow);
      } catch (err) {
        console.warn('⚡ [Google Sheets API Auto-Export Error]:', err);
      }
    }
  };

  // Section 1: Reset All Student Scores to Zero & Clear Ledger
  const resetAllStudentScoresToZero = () => {
    const resetTime = new Date().toISOString();
    setManualMentorMarks({});
    setPointsLedger([]);
    setScoreResetTimestamp(resetTime);

    const resetUsers = users.map(u => ({
      ...u,
      totalScore: 0,
      myStreak: 0
    }));
    setUsers(resetUsers);

    saveAndBroadcastState({
      manualMentorMarks: {},
      pointsLedger: [],
      scoreResetTimestamp: resetTime,
      users: resetUsers
    });

    logAutomationAction('🧹 Reset All Student Scores to Zero & Cleared Points Ledger', currentUser?.id, currentUser?.name);
    alert('✅ All student scores have been reset to 0, and points_ledger audit history has been cleared!');
  };

  // Section 6: Soft Delete Action (Mentor-Only with mandatory reason and deletion audit log)
  const softDeleteRecord = (recordType, recordId, recordTitle, reason = 'Mentor action') => {
    const isMentorRole = currentRoleView === 'mentor' || currentUser?.role === 'mentor' || isMentorEmail(currentUser?.email) || currentUser?.email === 'barathkrishnah@gmail.com' || currentUser?.email === 'barathkrishna046@gmail.com';
    if (!isMentorRole) {
      alert('⚠️ Only mentor roles can perform soft delete actions.');
      return false;
    }

    if (!reason || !reason.trim()) {
      alert('⚠️ A valid reason is required to confirm soft deletion for audit logging.');
      return false;
    }

    const deletionAuditEntry = {
      id: `del-${Date.now()}`,
      record_type: recordType,
      record_id: recordId,
      record_title: recordTitle || recordId,
      deleted_by_id: currentUser.id,
      deleted_by_name: currentUser.name || 'Mentor',
      deleted_at: new Date().toISOString(),
      reason: reason.trim()
    };

    const newLog = [deletionAuditEntry, ...deletionLog];
    setDeletionLog(newLog);

    // Apply soft-delete timestamp (deleted_at) to target record type WITHOUT cascading auto-deletes
    let updatedUsers = users;
    let updatedTeams = teams;
    let updatedAnnouncements = announcements;
    let updatedSubmissions = submissions;
    let updatedProblemStatements = problemStatements;

    if (recordType === 'team') {
      updatedTeams = teams.map(t => t.id === recordId ? { ...t, deleted_at: new Date().toISOString() } : t);
      setTeams(updatedTeams);
    } else if (recordType === 'announcement') {
      updatedAnnouncements = announcements.map(a => a.id === recordId ? { ...a, deleted_at: new Date().toISOString() } : a);
      setAnnouncements(updatedAnnouncements);
    } else if (recordType === 'student_profile') {
      updatedUsers = users.map(u => u.id === recordId ? { ...u, deleted_at: new Date().toISOString() } : u);
      setUsers(updatedUsers);
    } else if (recordType === 'submission') {
      updatedSubmissions = submissions.map(s => s.id === recordId ? { ...s, deleted_at: new Date().toISOString() } : s);
      setSubmissions(updatedSubmissions);
    } else if (recordType === 'problem_statement') {
      updatedProblemStatements = problemStatements.map(p => p.id === recordId ? { ...p, deleted_at: new Date().toISOString() } : p);
      setProblemStatements(updatedProblemStatements);
    }

    saveAndBroadcastState({
      deletionLog: newLog,
      teams: updatedTeams,
      announcements: updatedAnnouncements,
      users: updatedUsers,
      submissions: updatedSubmissions,
      problemStatements: updatedProblemStatements
    });

    logAutomationAction(
      `🔒 Soft-Deleted ${recordType}: "${recordTitle}" by ${currentUser.name} (Reason: ${reason})`,
      currentUser.id,
      currentUser.name
    );

    return true;
  };

  const restoreSoftDeletedRecord = (recordType, recordId) => {
    let updatedUsers = users;
    let updatedTeams = teams;
    let updatedAnnouncements = announcements;
    let updatedSubmissions = submissions;
    let updatedProblemStatements = problemStatements;

    if (recordType === 'team') {
      updatedTeams = teams.map(t => t.id === recordId ? { ...t, deleted_at: null } : t);
      setTeams(updatedTeams);
    } else if (recordType === 'announcement') {
      updatedAnnouncements = announcements.map(a => a.id === recordId ? { ...a, deleted_at: null } : a);
      setAnnouncements(updatedAnnouncements);
    } else if (recordType === 'student_profile') {
      updatedUsers = users.map(u => u.id === recordId ? { ...u, deleted_at: null } : u);
      setUsers(updatedUsers);
    } else if (recordType === 'submission') {
      updatedSubmissions = submissions.map(s => s.id === recordId ? { ...s, deleted_at: null } : s);
      setSubmissions(updatedSubmissions);
    } else if (recordType === 'problem_statement') {
      updatedProblemStatements = problemStatements.map(p => p.id === recordId ? { ...p, deleted_at: null } : p);
      setProblemStatements(updatedProblemStatements);
    }

    saveAndBroadcastState({
      teams: updatedTeams,
      announcements: updatedAnnouncements,
      users: updatedUsers,
      submissions: updatedSubmissions,
      problemStatements: updatedProblemStatements
    });

    alert('✅ Record restored successfully from soft-deleted archives!');
  };

  // Section 6: Automated Daily Backup System
  const createAutomatedDailyBackup = () => {
    const backupSnapshot = {
      id: `backup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      created_by: currentUser?.name || 'automated_system',
      record_counts: {
        users: users.filter(u => !u.deleted_at).length,
        submissions: submissions.filter(s => !s.deleted_at).length,
        teams: teams.filter(t => !t.deleted_at).length,
        certificates: certificates.length,
        peerReviews: peerReviews.length
      },
      data: {
        users,
        teams,
        submissions,
        announcements,
        certificates,
        interviewQuestions,
        peerReviews,
        problemStatements,
        hackathonTeams,
        ideaSubmissions,
        deletionLog
      }
    };

    const newBackups = [backupSnapshot, ...databaseBackups].slice(0, 14);
    setDatabaseBackups(newBackups);
    saveAndBroadcastState({ databaseBackups: newBackups });
    return backupSnapshot;
  };

  // Legacy Soft-Delete Compatibility Wrappers
  const deleteTeam = (teamId, reason = 'Mentor action') => {
    setTeams(prev => {
      const updated = prev.filter(t => t.id !== teamId);
      saveAndBroadcastState({ teams: updated });
      return updated;
    });
    logAutomationAction(`Deleted team allocation ${teamId} (Reason: ${reason})`, currentUser?.id, currentUser?.name);
  };

  const removeStudentFromTeam = (teamId, studentId) => {
    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === teamId) {
          const newMembers = (t.memberIds || []).filter(mId => mId !== studentId);
          const newLead = t.leadStudentId === studentId ? (newMembers[0] || null) : t.leadStudentId;
          return {
            ...t,
            memberIds: newMembers,
            leadStudentId: newLead
          };
        }
        return t;
      });
      saveAndBroadcastState({ teams: updated });
      return updated;
    });
    logAutomationAction(`Removed student ${studentId} from team ${teamId}`, currentUser?.id, currentUser?.name);
  };

  const deleteAnnouncement = (annId, reason = 'Mentor manual deletion') => {
    setAnnouncements(prev => {
      const updated = prev.filter(a => a.id !== annId);
      const updatedDeletedSet = new Set(deletedAnnIds);
      updatedDeletedSet.add(annId);
      setDeletedAnnIds(updatedDeletedSet);
      saveAndBroadcastState({
        announcements: updated,
        deletedAnnIds: Array.from(updatedDeletedSet)
      });
      return updated;
    });
    deleteAnnouncementFromSupabase(annId);
    logAutomationAction(`Deleted announcement ${annId} (Reason: ${reason})`, currentUser?.id || 'mentor', currentUser?.name || 'Mentor');
  };

  const deleteStudentProfile = (studentId, reason = 'Mentor action') => {
    const student = users.find(u => u.id === studentId);
    softDeleteRecord('student_profile', studentId, student?.name || studentId, reason);
  };

  const createStudentProfile = ({ name, email, domain, batch }) => {
    if (!name.trim()) {
      alert('Please enter a student name.');
      return null;
    }

    const newId = `user-student-${Date.now()}`;
    const newStudent = {
      id: newId,
      name: name.trim(),
      email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@student.powerhub.dev`,
      roles: ['student'],
      role: 'student',
      domain: domain || 'FULLSTACK',
      batch: batch || `${domain || 'FULLSTACK'} Cohort 2026`,
      myStreak: 0,
      totalScore: 0,
      created_at: new Date().toISOString(),
      setupCompleted: true
    };

    const updatedUsers = [newStudent, ...users];
    setUsers(updatedUsers);
    saveAndBroadcastState({ users: updatedUsers });
    syncProfileToSupabase(newStudent);

    console.log(`[Create Student Profile] Created student ${newStudent.name} (${newStudent.id})`);
    alert(`✅ New student profile for "${newStudent.name}" created successfully.`);
    return newStudent;
  };

  // Mentor Direct Student Mark Assignment (Non-Automated Direct Marks)
  const setStudentManualMarks = (studentId, marks, reason = 'Mentor Assessment Marks') => {
    const numericMarks = Math.max(0, parseInt(marks, 10) || 0);
    const targetStudent = users.find(u => u.id === studentId);
    const studentName = targetStudent ? targetStudent.name : studentId;

    setManualMentorMarks(prev => {
      const updated = {
        ...prev,
        [studentId]: numericMarks
      };
      saveAndBroadcastState({ manualMentorMarks: updated });
      return updated;
    });

    // Create Audit Log record
    const auditRecord = {
      id: `audit-${Date.now()}`,
      studentId,
      studentName,
      fieldChanged: 'Direct Mentor Marks Set',
      oldValue: `${manualMentorMarks[studentId] ?? 'Automated'} pts`,
      newValue: `${numericMarks} pts`,
      reason: reason || 'Direct Mentor Evaluation Marks',
      timestamp: new Date().toISOString()
    };

    setAuditLogs(prev => [auditRecord, ...prev]);

    console.log(`[Mentor Marks Assigned] Set ${numericMarks} marks for ${studentName} (${studentId})`);
    alert(`⭐ Successfully assigned ${numericMarks} marks to student "${studentName}".`);
  };


  // Database Backup Export Utility (JSON File Download)
  const exportDatabase = () => {
    const dbPayload = {
      users,
      teams,
      submissions,
      skillRatings,
      announcements,
      auditLogs,
      resumeProfiles,
      googleMeetConfig,
      googleDriveUrl,
      googleClassroomUrl,
      monthlyHabits,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `powerhub_database_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Database Restore Import Utility
  const importDatabase = (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.teams) setTeams(parsed.teams);
      if (parsed.submissions) setSubmissions(parsed.submissions);
      if (parsed.announcements) setAnnouncements(parsed.announcements);
      if (parsed.resumeProfiles) setResumeProfiles(parsed.resumeProfiles);
      if (parsed.googleMeetConfig) setGoogleMeetConfig(parsed.googleMeetConfig);
      if (parsed.googleDriveUrl) setGoogleDriveUrl(parsed.googleDriveUrl);
      if (parsed.googleClassroomUrl) setGoogleClassroomUrl(parsed.googleClassroomUrl);
      if (parsed.monthlyHabits) setMonthlyHabits(parsed.monthlyHabits);
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (err) {
      console.error('Failed to import database JSON:', err);
      throw new Error('Invalid Database Backup JSON file.');
    }
  };

  const registerPushSubscription = async (studentId) => {
    try {
      const { subscribeStudentToPush } = await import('../lib/pushNotifications');
      const res = await subscribeStudentToPush(studentId);
      if (res.success && res.subscription) {
        const updatedSubs = [res.subscription, ...pushSubscriptions.filter(s => s.endpoint !== res.subscription.endpoint)];
        setPushSubscriptions(updatedSubs);
        saveAndBroadcastState({ pushSubscriptions: updatedSubs });
      }
      return res;
    } catch (e) {
      console.error('Failed to register push subscription:', e);
      return { success: false, error: e.message };
    }
  };

  return (
    <AppContext.Provider value={{
      users,
      teams,
      bootcamps: INITIAL_BOOTCAMPS,
      submissions,
      skillRatings,
      announcements,
      auditLogs,
      domainRoadmaps: DOMAIN_ROADMAPS,
      scheduleMonths: SCHEDULE_MONTHS,
      dailyHabitStates,
      selectedScheduleMonth,
      setSelectedScheduleMonth,

      aiTeamAvatars: AI_TEAM_AVATARS,
      emojiCombos: EMOJI_COMBOS,
      googleMeetConfig,
      googleDriveUrl,
      googleClassroomUrl,
      communityHubUrl,
      resumeProfiles,
      updateResumeProfile,
      updateUserProfilePic,
      toggleDailyHabit,
      getStudentHabitRecord,
      mentorFeedbacks,
      saveMentorFeedback,
      calculateStudentStreak,
      batches: BATCHES,
      milestoneBadges: MILESTONE_BADGES,
      leaderboardHistory,

      updateGoogleSuiteConfig,
      currentUser,
      authScreen,
      setAuthScreen,
      currentRoleView,
      selectProfile,
      toggleRoleView,
      calculateStudentScore,
      submitWork,
      reviewSubmission,
      updateSubmissionDetails,
      createTeam,
      deleteTeam,
      removeStudentFromTeam,
      postAnnouncement,
      deleteAnnouncement,
      deletedAnnIds,
      exportDatabase,
      importDatabase,
      syncCloudDatabase,
      notifications,
      userQuickLinks,
      trackQuickLinkClick,
      techNews,
      refreshTechNews,
      certificates,
      issueCertificate,
      pointsLedger,
      automationLogs,
      pushSubscriptions,
      notificationLogs,
      registerPushSubscription,
      isRealtimeConnected,
      showProfileSetupModal,
      setShowProfileSetupModal,
      showUserProfileModal,
      setShowUserProfileModal,
      pendingSetupProfile,
      handleCompleteStudentSetup,
      handleSignOut,
      loginWithGoogleUser,
      deleteStudentProfile,
      createStudentProfile,
      manualMentorMarks,
      setStudentManualMarks,
      interviewQuestions,
      mockInterviews,
      bookMockInterview,
      updateMockInterviewStatus,
      peerReviews,
      submitPeerReview,
      hackathons,
      createHackathon,
      joinHackathon,
      activeTopTab,
      setActiveTopTab,
      problemStatements,
      hackathonTeams,
      teamMembers,
      ideaSubmissions,
      createProblemStatement,
      updateProblemStatement,
      deleteProblemStatement,
      createHackathonTeam,
      updateHackathonTeam,
      selectProblemStatementForTeam,
      inviteTeamMember,
      removeTeamMember,
      submitIdeaSubmission,
      reviewIdeaSubmission,
      isSihLocked,
      toggleSihLock,
      resetSihHackathonData,
      deletionLog,
      softDeleteRecord,
      restoreSoftDeletedRecord,
      googleSheetsWebhookUrl,
      setGoogleSheetsWebhookUrl,
      submissionExportLogs,
      databaseBackups,
      createAutomatedDailyBackup,
      resetAllStudentScoresToZero

    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext) || {};
