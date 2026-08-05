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
  DOMAIN_ROADMAPS
} from '../data/mockData';

const AppContext = createContext();

const DB_STORAGE_KEY = 'POWERHUB_PERMANENT_DB_V10';

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

  // Monthly Habits State
  const [selectedScheduleMonth, setSelectedScheduleMonth] = useState('August 2026');
  const [monthlyHabits, setMonthlyHabits] = useState(() => {
    if (savedDb && savedDb.monthlyHabits) return savedDb.monthlyHabits;
    return MONTHLY_DAILY_SCHEDULES;
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

  // UNIFIED AUTO-SAVE HOOK: Writes full database state on any mutation

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
      monthlyHabits,
      lastSavedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbPayload));
    } catch (err) {
      console.warn('LocalStorage save warning:', err);
    }
  }, [
    users, teams, submissions, skillRatings, announcements, 
    auditLogs, resumeProfiles, googleMeetConfig, googleDriveUrl, 
    googleClassroomUrl, monthlyHabits
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

  // Update Profile Picture for student via Gallery
  const updateUserProfilePic = (userId, profilePicUrl) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, profilePic: profilePicUrl, avatarUrl: profilePicUrl };
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

  const toggleDailyHabit = (monthName, dayLabel, field) => {
    setMonthlyHabits(prev => {
      const monthDays = prev[monthName] || [];
      const updatedDays = monthDays.map(item => {
        if (item.day === dayLabel) {
          return { ...item, [field]: !item[field] };
        }
        return item;
      });
      return { ...prev, [monthName]: updatedDays };
    });
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
      monthlyHabits,
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
      notifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
