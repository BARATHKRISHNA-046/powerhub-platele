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

  const savedDb = loadSavedDatabase();

  // Users State (with seed merge protection)
  const [users, setUsers] = useState(() => {
    if (savedDb && savedDb.users && Array.isArray(savedDb.users)) {
      // Merge initial users to ensure any newly added mock user is present without overwriting saved changes
      const savedUserIds = new Set(savedDb.users.map(u => u.id));
      const newSeedUsers = INITIAL_USERS.filter(u => !savedUserIds.has(u.id));
      return [...savedDb.users, ...newSeedUsers];
    }
    return INITIAL_USERS;
  });

  // Teams State
  const [teams, setTeams] = useState(() => {
    if (savedDb && savedDb.teams && Array.isArray(savedDb.teams)) return savedDb.teams;
    return INITIAL_TEAMS;
  });

  // Submissions State
  const [submissions, setSubmissions] = useState(() => {
    if (savedDb && savedDb.submissions && Array.isArray(savedDb.submissions)) return savedDb.submissions;
    return INITIAL_SUBMISSIONS;
  });

  // Skill Ratings State
  const [skillRatings, setSkillRatings] = useState(() => {
    if (savedDb && savedDb.skillRatings && Array.isArray(savedDb.skillRatings)) return savedDb.skillRatings;
    return INITIAL_SKILL_RATINGS;
  });

  // Announcements State
  const [announcements, setAnnouncements] = useState(() => {
    if (savedDb && savedDb.announcements && Array.isArray(savedDb.announcements)) return savedDb.announcements;
    return INITIAL_ANNOUNCEMENTS;
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    if (savedDb && savedDb.auditLogs && Array.isArray(savedDb.auditLogs)) return savedDb.auditLogs;
    return INITIAL_AUDIT_LOGS;
  });

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

const CLOUD_SYNC_ENDPOINT = 'https://jsonblob.com/api/jsonBlob/019fd29a-5c27-7bf2-906e-eb5b0a244f94';

  // AUTOMATIC CLOUD SYNC ON MOUNT: Syncs live data across laptops, phones, and browsers
  useEffect(() => {
    const fetchLatestCloudDb = async () => {
      try {
        const res = await fetch(CLOUD_SYNC_ENDPOINT, { cache: 'no-store' });
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && typeof cloudData === 'object') {
            if (Array.isArray(cloudData.users) && cloudData.users.length > 0) setUsers(cloudData.users);
            if (Array.isArray(cloudData.teams)) setTeams(cloudData.teams);
            if (Array.isArray(cloudData.announcements)) setAnnouncements(cloudData.announcements);
            if (Array.isArray(cloudData.submissions)) setSubmissions(cloudData.submissions);
            if (Array.isArray(cloudData.skillRatings)) setSkillRatings(cloudData.skillRatings);
            if (cloudData.googleMeetConfig) setGoogleMeetConfig(cloudData.googleMeetConfig);
            if (cloudData.googleDriveUrl) setGoogleDriveUrl(cloudData.googleDriveUrl);
            if (cloudData.googleClassroomUrl) setGoogleClassroomUrl(cloudData.googleClassroomUrl);
            if (cloudData.dailyHabitStates) setDailyHabitStates(cloudData.dailyHabitStates);
          }
        }
      } catch (err) {
        console.warn('Initial cloud sync notice:', err);
      }
    };
    fetchLatestCloudDb();
  }, []);

  // Manual Sync Cloud Database function
  const syncCloudDatabase = async () => {
    try {
      const res = await fetch(CLOUD_SYNC_ENDPOINT, { cache: 'no-store' });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object') {
          if (Array.isArray(cloudData.users) && cloudData.users.length > 0) setUsers(cloudData.users);
          if (Array.isArray(cloudData.teams)) setTeams(cloudData.teams);
          if (Array.isArray(cloudData.announcements)) setAnnouncements(cloudData.announcements);
          if (Array.isArray(cloudData.submissions)) setSubmissions(cloudData.submissions);
          if (Array.isArray(cloudData.skillRatings)) setSkillRatings(cloudData.skillRatings);
          if (cloudData.googleMeetConfig) setGoogleMeetConfig(cloudData.googleMeetConfig);
          if (cloudData.googleDriveUrl) setGoogleDriveUrl(cloudData.googleDriveUrl);
          if (cloudData.googleClassroomUrl) setGoogleClassroomUrl(cloudData.googleClassroomUrl);
          if (cloudData.dailyHabitStates) setDailyHabitStates(cloudData.dailyHabitStates);
          alert('☁️ Live Cloud Sync Complete! Teams, Announcements & Submissions updated across all devices.');
        }
      }
    } catch (err) {
      alert('Cloud sync temporarily unavailable. Using local device data.');
    }
  };

  // UNIFIED AUTO-SAVE & MULTI-DEVICE CLOUD SYNC HOOK
  useEffect(() => {
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
      dailyHabitStates,
      lastSavedAt: new Date().toISOString()
    };

    // 1. Save to local device storage
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbPayload));
    } catch (err) {
      console.warn('LocalStorage save warning:', err);
    }

    // 2. Push update to multi-device cloud sync bucket
    const timer = setTimeout(() => {
      fetch(CLOUD_SYNC_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      }).catch(err => console.warn('Cloud update push notice:', err));
    }, 800);

    return () => clearTimeout(timer);
  }, [
    users, teams, submissions, skillRatings, announcements, 
    auditLogs, resumeProfiles, googleMeetConfig, googleDriveUrl, 
    googleClassroomUrl, dailyHabitStates
  ]);




  const currentUser = users.find(u => u.id === currentUserId) || users[0];

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
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          profilePicUrl: profilePicUrl,
          profilePic: profilePicUrl, 
          avatarUrl: profilePicUrl 
        };
      }
      return u;
    }));
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
      return {
        ...prev,
        [key]: {
          ...currentVal,
          [field]: !currentVal[field]
        }
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

  const calculateStudentScore = (studentId) => {
    const studentSubs = submissions.filter(s => s.studentId === studentId);
    const studentTeams = teams.filter(t => t.memberIds && t.memberIds.includes(studentId));
    const leadTeams = teams.filter(t => t.leadStudentId === studentId);

    let submissionPts = 0;
    let projectPts = 0;
    let firstSubmitterPts = 0;
    let penaltyPts = 0;

    studentSubs.forEach(sub => {
      if (sub.status === 'approved' || sub.status === 'pending') {
        submissionPts += 10;
        if (sub.isProject) projectPts += 20;
        if (sub.isFirstSubmitter) firstSubmitterPts += 10;
      } else if (sub.status === 'flagged') {
        penaltyPts += 15;
      }
    });

    const teamPts = studentTeams.length * 5;
    const leadershipPts = leadTeams.length * 15;

    const totalScore = Math.max(0, (submissionPts + teamPts + leadershipPts + projectPts + firstSubmitterPts) - penaltyPts);

    return {
      submissionPts,
      teamPts,
      leadershipPts,
      projectPts,
      firstSubmitterPts,
      penaltyPts,
      totalScore,
      submissionCount: studentSubs.length,
      teamCount: studentTeams.length,
      leadCount: leadTeams.length
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
      bootcampId: currentUser.bootcampId || 'bootcamp-1',
      roundName: roundName || 'Month 1 Sprint Submission',
      githubUrl: githubUrl.trim(),
      imageAttachment: imageAttachment || null,
      videoAttachmentName: videoAttachmentName || null,
      submittedAt: new Date().toISOString(),
      isProject: Boolean(isProject),
      isFirstSubmitter,
      status: 'pending',
      isOnTime: true,
      reviewNotes: null
    };

    setSubmissions(prev => [newSub, ...prev]);
    toggleDailyHabit('August 2026', 'Wed', 'submitDone');
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
  };

  const deleteTeam = (teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
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
  };

  const deleteAnnouncement = (annId) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
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
