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
  fetchDailyHabitsFromSupabase
} from '../lib/supabase';






const AppContext = createContext();

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

  // Users State (initialized from seed, populated live from Supabase)
  const [users, setUsers] = useState(INITIAL_USERS);

  // Teams State (populated live from Supabase)
  const [teams, setTeams] = useState([]);

  // Submissions State (populated live from Supabase)
  const [submissions, setSubmissions] = useState([]);

  // Skill Ratings State
  const [skillRatings, setSkillRatings] = useState([]);

  // Announcements State (populated live from Supabase)
  const [announcements, setAnnouncements] = useState([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);


  // Resume Profiles State
  const [resumeProfiles, setResumeProfiles] = useState(() => {
    if (savedDb && savedDb.resumeProfiles && typeof savedDb.resumeProfiles === 'object') {
      return { ...INITIAL_RESUME_PROFILES, ...savedDb.resumeProfiles };
    }
    return INITIAL_RESUME_PROFILES;
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

  // DIRECT SUPABASE DATABASE READ & LIVE SYNC FUNCTION
  const fetchLatestCloudDb = async () => {
    try {
      console.log('🔄 [Supabase Sync Engine] Querying Supabase database tables...');
      
      // 1. Query Profiles Table from Supabase
      const profiles = await fetchProfilesFromSupabase();
      if (profiles && Array.isArray(profiles) && profiles.length > 0) {
        console.log(`✅ [Supabase Read Success] Received ${profiles.length} profiles from database.`);
        setUsers(prevUsers => {
          // Merge Supabase profiles over existing users, adding new remote users if created on another device
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
              // Add new student/user created on another device
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
          return updatedUsers;
        });
      }

      // 2. Query Announcements Table from Supabase
      const dbAnnouncements = await fetchAnnouncementsFromSupabase();
      if (dbAnnouncements && Array.isArray(dbAnnouncements)) {
        console.log(`✅ [Supabase Read Success] Received ${dbAnnouncements.length} announcements from database.`);
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
        setAnnouncements(formattedAnnouncements);
      }

      // 3. Query Teams Table from Supabase
      const dbTeams = await fetchTeamsFromSupabase();
      if (dbTeams && Array.isArray(dbTeams)) {
        console.log(`✅ [Supabase Read Success] Received ${dbTeams.length} teams from database.`);
        const formattedTeams = dbTeams.map(t => ({
          id: t.id,
          name: t.name,
          leadStudentId: t.lead_student_id,
          memberIds: t.member_ids || [],
          githubUrl: t.github_url || '',
          createdAt: t.created_at
        }));
        setTeams(formattedTeams);
      }

      // 4. Query Submissions Table from Supabase
      const dbSubmissions = await fetchSubmissionsFromSupabase();
      if (dbSubmissions && Array.isArray(dbSubmissions)) {
        console.log(`✅ [Supabase Read Success] Received ${dbSubmissions.length} submissions from database.`);
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
        setSubmissions(formattedSubmissions);
      }

      // 5. Query Daily Habits Table from Supabase
      const dbHabits = await fetchDailyHabitsFromSupabase();
      if (dbHabits && Array.isArray(dbHabits)) {
        console.log(`✅ [Supabase Read Success] Received ${dbHabits.length} daily habit records from database.`);
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


  const selectProfile = (userId) => {
    setCurrentUserId(userId);
    localStorage.setItem('ph_active_user_id', userId);
    const user = users.find(u => u.id === userId);
    if (user && user.roles.length === 1) {
      setCurrentRoleView(user.roles[0]);
    } else if (user && user.roles.includes('mentor')) {
      setCurrentRoleView('mentor');
    } else {
      setCurrentRoleView('student');
    }
    setAuthScreen('dashboard');
  };

  const toggleRoleView = (view) => {
    if (currentUser.roles.includes(view)) {
      setCurrentRoleView(view);
    }
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

    setResumeProfiles(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        ...updatedData
      }
    }));
  };

  const getStudentHabitRecord = (studentId, dateStr) => {
    const { todayStr, isPast11PM } = getISTDateDetails();
    const key = `${studentId}_${dateStr}`;
    const raw = dailyHabitStates[key] || dailyHabitStates[dateStr] || { studyDone: false, submitDone: false };

    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    let isMissed = false;
    if (isPast && !raw.submitDone) {
      isMissed = true;
    } else if (isToday && isPast11PM && !raw.submitDone) {
      isMissed = true;
    }

    return {
      studyDone: Boolean(raw.studyDone),
      submitDone: Boolean(raw.submitDone),
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
    const calendarDays = generateCalendarDays();
    const pastAndTodayDays = calendarDays.filter(d => d.dateStr <= todayStr).reverse();

    let streak = 0;
    for (const day of pastAndTodayDays) {
      const habit = getStudentHabitRecord(studentId, day.dateStr);
      if (habit.studyDone && habit.submitDone) {
        streak++;
      } else {
        break; // Streak reset on missed or incomplete day
      }
    }
    return streak;
  };




  const updateGoogleSuiteConfig = ({ topic, timing, meetUrl, driveUrl, classroomUrl }) => {
    if (topic !== undefined || timing !== undefined || meetUrl !== undefined) {
      setGoogleMeetConfig(prev => ({
        topic: topic !== undefined ? topic : prev.topic,
        timing: timing !== undefined ? timing : prev.timing,
        meetUrl: meetUrl !== undefined ? meetUrl : prev.meetUrl
      }));
    }
    if (driveUrl !== undefined) setGoogleDriveUrl(driveUrl);
    if (classroomUrl !== undefined) setGoogleClassroomUrl(classroomUrl);
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

  const calculateStudentScore = (studentId, timeRange = 'ALL') => {
    const studentSubs = submissions.filter(s => s.studentId === studentId);
    const studentTeams = teams.filter(t => t.memberIds && t.memberIds.includes(studentId));
    const leadTeams = teams.filter(t => t.leadStudentId === studentId);
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
    let totalSubmissionsCount = studentSubs.length;

    studentSubs.forEach((sub, idx) => {
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

    // Streak Bonus Points
    let streakBonusPts = 0;
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

    // Check missed days deductions (-2 pts per missed day)
    const calendarDays = generateCalendarDays();
    const pastDays = calendarDays.filter(d => d.dateStr < getISTDateDetails().todayStr);
    pastDays.forEach(day => {
      const habit = getStudentHabitRecord(studentId, day.dateStr);
      if (habit.isMissed) {
        missedDeductionsPts += 2;
        pointsLedger.push({
          id: `leg-missed-${day.dateStr}`,
          date: day.dateStr,
          reason: `Deduction: Missed Submission (${day.dateLabel})`,
          amount: '-2 pts',
          type: 'deduct'
        });
      }
    });

    const teamPts = studentTeams.length * 5;
    const leadershipPts = leadTeams.length * 15;

    const totalScore = Math.max(0, (baseSubmissionPts + onTimeBonusPts + earlyBonusPts + streakBonusPts + teamPts + leadershipPts + projectPts + firstSubmitterPts) - (penaltyPts + missedDeductionsPts));

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
      totalScore,
      onTimeCount,
      totalSubmissionsCount,
      onTimeFraction,
      onTimePercentage,
      pointsLedger,
      submissionCount: studentSubs.length,
      teamCount: studentTeams.length,
      leadCount: leadTeams.length,
      streak
    };
  };


  const submitWork = ({ githubUrl, imageAttachment, videoAttachmentName, roundName, isProject }) => {
    const githubRegex = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
    if (!githubUrl || !githubRegex.test(githubUrl.trim())) {
      throw new Error("A valid GitHub link is required — other domain links aren't accepted. (e.g. https://github.com/username/repository)");
    }

    const existingInRound = submissions.filter(s => s.roundName === roundName);
    const isFirstSubmitter = existingInRound.length === 0;

    const newSub = {
      id: `sub-${Date.now()}`,
      studentId: currentUser.id,
      date: getISTDateDetails().todayStr,
      bootcampId: currentUser.bootcampId || 'bootcamp-1',
      roundName: roundName || 'Month 1 Sprint Submission',
      githubUrl: githubUrl.trim(),
      imageAttachment: imageAttachment || null,
      mediaUrl: imageAttachment || null,
      videoAttachmentName: videoAttachmentName || null,
      submittedAt: new Date().toISOString(),
      isProject: Boolean(isProject),
      isFirstSubmitter,
      status: 'submitted',
      isOnTime: true,
      reviewNotes: null
    };

    setSubmissions(prev => [newSub, ...prev]);
    syncSubmissionToSupabase(newSub);
    toggleDailyHabit(currentUser.id, getISTDateDetails().todayStr, 'submitDone');
    return newSub;
  };



  const reviewSubmission = (submissionId, { status, skillRatingsObj, reviewNotes, isProject, isFirstSubmitter }) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status,
          reviewNotes: reviewNotes || s.reviewNotes,
          isProject: isProject !== undefined ? isProject : s.isProject,
          isFirstSubmitter: isFirstSubmitter !== undefined ? isFirstSubmitter : s.isFirstSubmitter
        };
      }
      return s;
    }));
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
    setTeams(prev => [...prev, newTeam]);
    syncTeamToSupabase(newTeam);
  };

  const deleteTeam = (teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    deleteTeamFromSupabase(teamId);
  };


  const postAnnouncement = ({ title, message, bootcampId }) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      authorId: currentUser.id,
      authorName: `${currentUser.name} (Mentor)`,
      bootcampId: bootcampId || 'all',
      title,
      message,
      createdAt: new Date().toISOString(),
      isPinned: true
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    syncAnnouncementToSupabase(newAnn);
  };


  const deleteAnnouncement = (annId) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    deleteAnnouncementFromSupabase(annId);
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
      createTeam,
      deleteTeam,
      postAnnouncement,
      deleteAnnouncement,
      exportDatabase,
      importDatabase,
      syncCloudDatabase,
      notifications

    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
