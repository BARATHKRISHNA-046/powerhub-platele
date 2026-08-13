import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, Calendar, Video, MessageSquare, Users, Github, ExternalLink, 
  Send, AlertCircle, CheckCircle2, Lock, Flame, Sparkles, BookOpen, 
  Award, Clock, BellRing, Folder, AlertTriangle, FileText, Printer, ChevronRight
} from 'lucide-react';
import ResumeBuilder from './ResumeBuilder';
import DomainBootcampRoadmap from './DomainBootcampRoadmap';
import SectionErrorBoundary from './SectionErrorBoundary';
import { uploadSubmissionMedia } from '../lib/uploadSubmission';


import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

import { generateCalendarDays, SCHEDULE_MONTHS, getISTDateDetails } from '../data/mockData';

export default function StudentDashboard() {
  const { 
    currentUser, users, teams, submissions, skillRatings, announcements, 
    googleMeetConfig, googleDriveUrl, googleClassroomUrl, communityHubUrl, scheduleMonths, 
    dailyHabitStates, selectedScheduleMonth, setSelectedScheduleMonth, 
    domainRoadmaps, toggleDailyHabit, getStudentHabitRecord, calculateStudentScore, submitWork,
    mentorFeedbacks, calculateStudentStreak, milestoneBadges, leaderboardHistory, registerPushSubscription,
    userQuickLinks, trackQuickLinkClick, techNews, refreshTechNews, certificates,
    interviewQuestions, mockInterviews, bookMockInterview, peerReviews, submitPeerReview,
    hackathons, joinHackathon, resumeProfiles, updateResumeProfile
  } = useApp();

  const [showTechNewsModal, setShowTechNewsModal] = useState(false);
  const [viewCertModal, setViewCertModal] = useState(null);
  const [selectedPeerSub, setSelectedPeerSub] = useState(null);
  const [peerFeedbackText, setPeerFeedbackText] = useState('');
  const [peerChecklist, setPeerChecklist] = useState({ codeRuns: true, namingConventions: true, readmeClear: true });
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('ALL');
  const [selectedDiffFilter, setSelectedDiffFilter] = useState('ALL');
  const [showMockBookingModal, setShowMockBookingModal] = useState(false);
  const [mockTimeInput, setMockTimeInput] = useState('');
  const [mockNotesInput, setMockNotesInput] = useState('');
  const [practicedQuestions, setPracticedQuestions] = useState({});
  const [studentNotes, setStudentNotes] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [pushSubMsg, setPushSubMsg] = useState('');

  const handleEnablePush = async () => {
    if (!currentUser?.id) return;
    const res = await registerPushSubscription(currentUser.id);
    if (res.success) {
      setPushSubMsg('Push Notifications Enabled!');
    } else {
      setPushSubMsg('Failed: ' + (res.error || 'Permission denied'));
    }
  };

  const currentUserId = currentUser?.id || 'usr-alex';
  const myStreak = (calculateStudentStreak && currentUserId) ? calculateStudentStreak(currentUserId) : 0;


  // Leaderboard Filters & Modal State
  const [timeRangeToggle, setTimeRangeToggle] = useState('ALL');
  const [studentModal, setStudentModal] = useState({ open: false, student: null });

  const [githubUrl, setGithubUrl] = useState('');
  const [imageAttachment, setImageAttachment] = useState('');
  const [isProject, setIsProject] = useState(false);
  const [cohortFilter, setCohortFilter] = useState('ALL');

  const [mediaFile, setMediaFile] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const formatExactRelativeTime = (isoStr) => {
    if (!isoStr) return { text: "Not opened yet", isUnopened: true };
    const diffMs = Date.now() - new Date(isoStr).getTime();
    if (isNaN(diffMs) || diffMs < 0) return { text: "Not opened yet", isUnopened: true };
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 45) return { text: "Opened just now", isUnopened: false };
    if (diffMin < 60) return { text: `Opened ${diffMin} min ago`, isUnopened: false };
    if (diffHr < 24) return { text: `Opened ${diffHr} hr${diffHr > 1 ? 's' : ''} ago`, isUnopened: false };
    if (diffDays === 1) return { text: "Opened yesterday", isUnopened: false };
    return { text: `Opened ${diffDays} days ago`, isUnopened: false };
  };

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'roadmap' | 'resume'esume'


  const allCalendarDays = React.useMemo(() => generateCalendarDays(), []);

  // Asia/Kolkata Timezone (IST) State
  const [istInfo, setIstInfo] = useState(() => getISTDateDetails());

  useEffect(() => {
    const timer = setInterval(() => {
      setIstInfo(getISTDateDetails());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleNavResume = () => setActiveTab('resume');
    window.addEventListener('POWERHUB_NAVIGATE_RESUME', handleNavResume);
    return () => window.removeEventListener('POWERHUB_NAVIGATE_RESUME', handleNavResume);
  }, []);

  const todayStr = istInfo.todayStr;
  const isPast11PM = istInfo.isPast11PM;

  const todayCardRef = React.useRef(null);

  useEffect(() => {
    if (todayCardRef.current) {
      const timer = setTimeout(() => {
        if (todayCardRef.current) {
          todayCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [todayStr, selectedScheduleMonth, activeTab]);

  const activeMonthDays = React.useMemo(() => {
    return allCalendarDays.filter(d => d.monthName === selectedScheduleMonth);
  }, [allCalendarDays, selectedScheduleMonth]);


  useEffect(() => {
    if (window.location.hash === '#resume') {
      setActiveTab('resume');
    }
  }, []);


  // Live Countdown Timer for Night 11:00 PM Deadline Cutoff
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 24, seconds: 50 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(23, 0, 0, 0); // 11:00 PM Night Cutoff

      let diff = cutoff - now;
      if (diff <= 0) {
        cutoff.setDate(cutoff.getDate() + 1);
        diff = cutoff - now;
      }


      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Strict GitHub URL validation (must match https://github.com/...)
    if (!githubUrl || !githubUrl.trim().startsWith('https://github.com/')) {
      setSubmitError('Invalid GitHub Link! Repository URL must start with https://github.com/');
      return;
    }

    setIsUploading(true);
    try {
      let uploadedMediaUrl = null;
      if (mediaFile) {
        uploadedMediaUrl = await uploadSubmissionMedia(mediaFile);
      }

      const mediaFiles = uploadedMediaUrl ? [uploadedMediaUrl] : (imageAttachment ? [imageAttachment] : []);

      submitWork({
        githubUrl: githubUrl.trim(),
        mediaFiles,
        imageAttachment: uploadedMediaUrl || imageAttachment,
        roundName: 'Sprint Deliverable',
        isProject
      });

      setSubmitSuccess('Deliverable submitted successfully via Supabase & Prisma!');
      setGithubUrl('');
      setMediaFile(null);
      setImageAttachment('');
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please verify inputs and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredLeaderboardUsers = React.useMemo(() => {
    let list = users;
    if (cohortFilter !== 'ALL') {
      list = list.filter(u => 
        (u.domain || '').toUpperCase() === cohortFilter.toUpperCase() || 
        (u.batch || '').toUpperCase().includes(cohortFilter.toUpperCase())
      );
    }
    return list.map(user => {
      const scoreObj = calculateStudentScore(user.id, timeRangeToggle);
      return {
        ...user,
        ...scoreObj
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [users, cohortFilter, timeRangeToggle, calculateStudentScore]);

  const leaderboardWithRanks = React.useMemo(() => {
    return filteredLeaderboardUsers.map((student, idx) => {
      const todayRank = idx + 1;
      const yesterdayRank = (leaderboardHistory && leaderboardHistory[student.id]) || todayRank;

      let rankIndicator = '—';
      let rankColor = '#94a3b8';
      if (todayRank < yesterdayRank) {
        rankIndicator = '▲';
        rankColor = '#16a34a';
      } else if (todayRank > yesterdayRank) {
        rankIndicator = '▼';
        rankColor = '#dc2626';
      }

      return {
        ...student,
        todayRank,
        yesterdayRank,
        rankIndicator,
        rankColor
      };
    });
  }, [filteredLeaderboardUsers, leaderboardHistory]);

  const myScore = currentUserId ? calculateStudentScore(currentUserId, timeRangeToggle) : { totalScore: 0, baseSubmissionPts: 0, onTimeBonusPts: 0, earlyBonusPts: 0, streakBonusPts: 0, teamPts: 0, leadershipPts: 0, projectPts: 0, firstSubmitterPts: 0, penaltyPts: 0, missedDeductionsPts: 0, onTimeCount: 0, totalSubmissionsCount: 0, onTimeFraction: '0/0 On-Time (0%)', pointsLedger: [] };
  const myRankItem = leaderboardWithRanks.find(s => s.id === currentUserId);
  const myRank = myRankItem ? myRankItem.todayRank : 1;
  const nextRankItem = myRank > 1 ? leaderboardWithRanks[myRank - 2] : null;
  const ptsGapToNext = nextRankItem ? Math.max(0, (nextRankItem.totalScore - (myScore?.totalScore || 0)) + 1) : 0;

  const globalLeaderboard = leaderboardWithRanks;

  const mySubmissions = submissions.filter(s => s.studentId === currentUserId);
  const myTeam = teams.find(t => t.memberIds && t.memberIds.includes(currentUserId));

  const studentDomain = currentUser?.domain || 'FULLSTACK';
  const currentRoadmap = domainRoadmaps[studentDomain] || domainRoadmaps['FULLSTACK'];



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* PROMINENT SECONDARY NAVIGATION TOOLBAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '0.5rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}>
        {/* SEGMENTED NAVIGATION PILLS */}
        <div style={{
          background: '#f8fafc',
          padding: '4px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#ffffff',
              color: activeTab === 'dashboard' ? '#ffffff' : '#475569',
              border: activeTab === 'dashboard' ? 'none' : '1px solid #cbd5e1',
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'dashboard' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Trophy size={17} /> Student Dashboard
          </button>

          <a
            href={`/portfolio/${currentUser?.id}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.25s ease'
            }}
          >
            🌐 My Portfolio
          </a>

          <button
            type="button"
            onClick={() => {
              const portfolioUrl = `${window.location.origin}/portfolio/${currentUser?.id}`;
              navigator.clipboard.writeText(portfolioUrl);
              alert(`📋 Shareable Portfolio Link Copied to Clipboard!\n\n${portfolioUrl}`);
            }}
            title="Copy shareable public portfolio link to clipboard"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #0f172a',
              padding: '0.55rem 1rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.25s ease'
            }}
          >
            📋 Copy Portfolio Link
          </button>
        </div>

        {/* RIGHT QUICK PLATFORM STATUS BADGES & PUSH PERMISSION */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleEnablePush}
            title="Click to enable real-time mobile and browser push notifications"
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            🔔 {pushSubMsg || 'Enable Web Push'}
          </button>
        </div>
      </div>

      {activeTab === 'resume' ? (
        <ResumeBuilder />
      ) : (

        <>
          {/* STREAK CARD */}
          <SectionErrorBoundary name="Streak Badges">
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
                    <Flame size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#9a3412' }}>
                      Active Habit Streak: <span style={{ color: '#ea580c' }}>🔥 {myStreak} Days</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#c2410c' }}>
                      Consecutive uninterrupted days with 7 PM Study & 11 PM Submission completed. (Resets to 0 on Missed day)
                    </p>
                  </div>
                </div>

                <span style={{ background: '#ea580c', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '800', boxShadow: '0 4px 12px rgba(234,88,12,0.25)' }}>
                  🔥 {myStreak} Day Streak
                </span>
              </div>

              {/* UNLOCKED MILESTONE BADGES GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {(milestoneBadges || []).map((badge) => {
                  const isUnlocked = myStreak >= badge.reqStreak;
                  return (
                    <div 
                      key={badge.id}
                      style={{
                        background: isUnlocked ? badge.bg : '#ffffff',
                        border: '1.5px solid ' + (isUnlocked ? badge.border : '#e2e8f0'),
                        borderRadius: '14px',
                        padding: '0.75rem 0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        opacity: isUnlocked ? 1 : 0.65,
                        transition: 'all 200ms ease'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: isUnlocked ? badge.text : '#64748b' }}>{badge.title}</div>
                        <div style={{ fontSize: '0.7rem', color: isUnlocked ? badge.text : '#94a3b8' }}>
                          {isUnlocked ? 'Unlocked 🏆' : `Requires ${badge.reqStreak}-day streak`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionErrorBoundary>

          {/* ROW 1: DAILY HABIT & SUBMISSION CALENDAR */}
          <SectionErrorBoundary name="Daily Habit Calendar">

            <div className="card" style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '20px', padding: '1.75rem' }}>

            {/* TOP HEADER MATCHING PICTURE 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '14px', 
                  background: '#eff6ff', 
                  border: '1px solid #bfdbfe',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#2563eb',
                  boxShadow: '0 4px 10px rgba(37,99,235,0.1)'
                }}>
                  <Calendar size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    Daily Habit & Submission Calendar (Aug 2026 – Mar 2027)
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Asia/Kolkata Timezone (IST). 11:00 PM IST submission cutoff enforced. Only today's active card is editable.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* 11:00 PM IST LIVE COUNTDOWN BANNER */}
                {!isPast11PM ? (
                  <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.45rem 0.95rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37,99,235,0.08)' }}>
                    <Clock size={15} style={{ color: '#2563eb' }} />
                    Cutoff in: {Math.floor(istInfo.secondsTo11PM / 3600)}h {Math.floor((istInfo.secondsTo11PM % 3600) / 60)}m {istInfo.secondsTo11PM % 60}s (11:00 PM IST)
                  </span>
                ) : (
                  <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.45rem 0.95rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={15} /> 11:00 PM IST Cutoff Passed (Locked)
                  </span>
                )}

                <select
                  value={selectedScheduleMonth}
                  onChange={e => setSelectedScheduleMonth(e.target.value)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '0.5rem 1.1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.08)'
                  }}
                >
                  {scheduleMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DAILY CARDS HORIZONTALLY SCROLLABLE ROW */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '0.85rem', 
                overflowX: 'auto', 
                paddingBottom: '0.85rem', 
                paddingTop: '0.25rem',
                marginBottom: '1.25rem',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {activeMonthDays.map((item) => {
                const dateStr = item.dateStr;
                const habitRec = getStudentHabitRecord(currentUserId, dateStr);

                const studyDone = habitRec.studyDone;
                const submitDone = habitRec.submitDone;
                const isMissed = habitRec.isMissed;

                const isPast = dateStr < todayStr;
                const isActive = dateStr === todayStr;
                const isFuture = dateStr > todayStr;

                const isFullyDone = studyDone && submitDone;

                // STATUS-BASED PASTEL COLOR PALETTE DEFINITIONS:
                // Green = Completed / Done
                // Blue = Scheduled / Upcoming
                // Amber/Gold = Today Active
                // Gray = Locked / Past (Red = Missed)
                let theme = {
                  bg: '#f8fafc',
                  border: '#e2e8f0',
                  text: '#475569',
                  badgeBg: '#64748b',
                  badgeText: '#ffffff',
                  badgeLabel: 'Past (Locked)',
                  checkBg: '#ffffff',
                  checkText: '#475569',
                  checkBorder: '#cbd5e1',
                  accentColor: '#64748b'
                };

                if (isFullyDone) {
                  // GREEN = Completed / Done
                  theme = {
                    bg: '#f0fdf4',
                    border: '#86efac',
                    text: '#166534',
                    badgeBg: '#059669',
                    badgeText: '#ffffff',
                    badgeLabel: 'Completed ✓',
                    checkBg: '#059669',
                    checkText: '#ffffff',
                    checkBorder: '#059669',
                    accentColor: '#059669'
                  };
                } else if (isActive) {
                  if (isPast11PM && !submitDone) {
                    theme = {
                      bg: '#fef2f2',
                      border: '#fca5a5',
                      text: '#991b1b',
                      badgeBg: '#ef4444',
                      badgeText: '#ffffff',
                      badgeLabel: '11 PM Cutoff (Missed ❌)',
                      checkBg: '#fee2e2',
                      checkText: '#dc2626',
                      checkBorder: '#fca5a5',
                      accentColor: '#ef4444'
                    };
                  } else {
                    // AMBER / GOLD = Today Active
                    theme = {
                      bg: '#fffbeb',
                      border: '#f59e0b',
                      text: '#92400e',
                      badgeBg: '#d97706',
                      badgeText: '#ffffff',
                      badgeLabel: '★ TODAY ACTIVE',
                      checkBg: '#ffffff',
                      checkText: '#92400e',
                      checkBorder: '#fde68a',
                      accentColor: '#d97706'
                    };
                  }
                } else if (isFuture) {
                  // BLUE = Scheduled / Upcoming
                  theme = {
                    bg: '#eff6ff',
                    border: '#bfdbfe',
                    text: '#1e40af',
                    badgeBg: '#2563eb',
                    badgeText: '#ffffff',
                    badgeLabel: 'Scheduled',
                    checkBg: '#ffffff',
                    checkText: '#1e40af',
                    checkBorder: '#bfdbfe',
                    accentColor: '#2563eb'
                  };
                } else if (isPast) {
                  if (isMissed) {
                    theme = {
                      bg: '#fef2f2',
                      border: '#fca5a5',
                      text: '#991b1b',
                      badgeBg: '#ef4444',
                      badgeText: '#ffffff',
                      badgeLabel: 'Missed ❌',
                      checkBg: '#fee2e2',
                      checkText: '#991b1b',
                      checkBorder: '#fca5a5',
                      accentColor: '#ef4444'
                    };
                  } else {
                    // GRAY = Locked / Past
                    theme = {
                      bg: '#f8fafc',
                      border: '#e2e8f0',
                      text: '#475569',
                      badgeBg: '#64748b',
                      badgeText: '#ffffff',
                      badgeLabel: 'Past (Locked)',
                      checkBg: '#f1f5f9',
                      checkText: '#64748b',
                      checkBorder: '#e2e8f0',
                      accentColor: '#64748b'
                    };
                  }
                }

                // 11:00 PM IST Submission Checkbox Locking Rule
                const isSubmitLocked = !isActive || isPast11PM;

                return (
                  <div 
                    key={dateStr} 
                    ref={isActive ? todayCardRef : null}
                    style={{ 
                      minWidth: '160px', 
                      width: '160px', 
                      flexShrink: 0, 
                      scrollSnapAlign: 'start',
                      background: theme.bg, 
                      border: isActive ? '2px solid #f59e0b' : `1.5px solid ${theme.border}`, 
                      borderRadius: '14px', 
                      padding: '0.85rem 0.75rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.65rem', 
                      boxShadow: isActive ? '0 4px 16px rgba(245, 158, 11, 0.3)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.92rem', color: theme.text, fontFamily: 'var(--font-heading)' }}>{item.day}</span>
                      <span className="tabular-nums" style={{ fontSize: '0.72rem', color: theme.text, fontWeight: '700', opacity: 0.85 }}>{item.dateLabel}</span>
                    </div>

                    {/* 7 PM Study Checkbox */}
                    <label 
                      style={{ 
                        background: studyDone ? '#059669' : theme.checkBg, 
                        color: studyDone ? '#ffffff' : theme.checkText, 
                        border: '1px solid ' + (studyDone ? '#059669' : theme.checkBorder), 
                        padding: '0.5rem 0.6rem', 
                        minHeight: '44px',
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: isActive ? 'pointer' : 'not-allowed',
                        opacity: isActive ? 1 : 0.85 
                      }} 
                      onClick={() => isActive && toggleDailyHabit(currentUserId, dateStr, 'studyDone')}
                    >
                      <span>📖 7 PM Study</span>
                      <input 
                        type="checkbox" 
                        checked={studyDone} 
                        disabled={!isActive}
                        readOnly 
                        style={{ width: '18px', height: '18px', accentColor: studyDone ? '#059669' : theme.accentColor, cursor: isActive ? 'pointer' : 'not-allowed' }} 
                      />
                    </label>

                    {/* 11:00 PM Submission Checkbox (Auto-Locked at 11:00 PM IST) */}
                    <label 
                      style={{ 
                        background: submitDone ? '#059669' : (isSubmitLocked && !submitDone && (isPast || isPast11PM) ? '#fee2e2' : theme.checkBg), 
                        color: submitDone ? '#ffffff' : (isSubmitLocked && !submitDone && (isPast || isPast11PM) ? '#dc2626' : theme.checkText), 
                        border: '1px solid ' + (submitDone ? '#059669' : (isSubmitLocked && !submitDone && (isPast || isPast11PM) ? '#fca5a5' : theme.checkBorder)), 
                        padding: '0.5rem 0.6rem', 
                        minHeight: '44px',
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: (isActive && !isSubmitLocked) ? 'pointer' : 'not-allowed',
                        opacity: (isActive && !isSubmitLocked) ? 1 : 0.85 
                      }} 
                      onClick={() => isActive && !isSubmitLocked && toggleDailyHabit(currentUserId, dateStr, 'submitDone')}
                    >
                      <span>🚀 11 PM Submit</span>
                      <input 
                        type="checkbox" 
                        checked={submitDone} 
                        disabled={isSubmitLocked}
                        readOnly 
                        style={{ width: '18px', height: '18px', accentColor: submitDone ? '#059669' : theme.accentColor, cursor: (isActive && !isSubmitLocked) ? 'pointer' : 'not-allowed' }} 
                      />
                    </label>

                    <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
                      <span style={{ background: theme.badgeBg, color: theme.badgeText, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                        {theme.badgeLabel}
                      </span>
                    </div>

                    {/* MENTOR FEEDBACK BANNER ON CARD */}
                    {mentorFeedbacks && mentorFeedbacks[`${currentUserId}_${dateStr}`] && (
                      <div 
                        title={`Mentor Feedback: "${mentorFeedbacks[`${currentUserId}_${dateStr}`]}"`}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '0.35rem 0.45rem',
                          fontSize: '0.68rem',
                          color: '#1d4ed8',
                          fontWeight: '700',
                          lineHeight: '1.25'
                        }}
                      >
                        💬 <b>Mentor:</b> "{mentorFeedbacks[`${currentUserId}_${dateStr}`]}"
                      </div>
                    )}

                  </div>
                );
              })}
            </div>




            {/* BOTTOM METADATA & FOOTER ROW MATCHING PICTURE 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ color: '#2563eb' }}>((•))</span> Online Track</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>⏰ Daily 11:00 PM Cutoff</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>💼 Placement Assistance</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>👨‍🏫 Live Mentor Support</span>
              </div>
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>
                Active Schedule Track
              </span>
            </div>
          </div>
          </SectionErrorBoundary>

          {/* MY SCOREBOARD ENHANCEMENTS CARD */}
          <SectionErrorBoundary name="Scoreboard Breakdown">
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1.5px solid #bfdbfe', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(37,99,235,0.08)' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                  <Award size={30} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    My Scoreboard Breakdown: <span style={{ color: '#2563eb' }}>{myScore.totalScore} pts</span>
                  </h3>
                  {/* PROGRESS INDICATOR GAP TO NEXT RANK */}
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: myRank === 1 ? '#b45309' : '#1d4ed8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {myRank === 1 ? (
                      <span>🥇 Rank #1 Leader! (Maintaining highest score overall)</span>
                    ) : (
                      <span>🎯 <b>{ptsGapToNext} more pts</b> to reach Rank #{myRank - 1} ({nextRankItem?.name || 'Next Rank'})</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ background: '#2563eb', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: '900', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                  Current Rank: #{myRank}
                </span>
              </div>
            </div>

            {/* DETAILED POINTS BREAKDOWN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.75rem 0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Base Submissions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e40af' }}>+{myScore.baseSubmissionPts || 0} pts</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.75rem 0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>On-Time Bonus</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#16a34a' }}>+{myScore.onTimeBonusPts || 0} pts</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.75rem 0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Early Bonus (&gt;1hr)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0284c7' }}>+{myScore.earlyBonusPts || 0} pts</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.75rem 0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Streak Bonus</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ea580c' }}>+{myScore.streakBonusPts || 0} pts</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.75rem 0.85rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>Missed Deductions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#dc2626' }}>-{myScore.missedDeductionsPts || 0} pts</div>
              </div>
            </div>

            {/* AUDIT LOG TRANSACTIONS LEDGER VIEW */}
            <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                📜 Points Ledger Audit History ({myScore.pointsLedger?.length || 0} Transactions)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '140px', overflowY: 'auto' }}>
                {(myScore.pointsLedger || []).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0.55rem', background: item.type === 'deduct' ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: '1px solid ' + (item.type === 'deduct' ? '#fecaca' : '#e2e8f0') }}>
                    <span style={{ fontWeight: '700', color: '#334155' }}>
                      {item.date}: {item.reason}
                    </span>
                    <span style={{ fontWeight: '900', color: item.type === 'deduct' ? '#dc2626' : '#16a34a' }}>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </SectionErrorBoundary>

          {/* ROW 2: 3-COLUMN MIDDLE GRID */}
          <SectionErrorBoundary name="Live Session & Domain Radar">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>

            
            {/* CARD 1: LIVE GOOGLE MEET */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2752dd' }}>
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>Live Google Meet</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Official mentor video conference & code reviews</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  <span className="tag-pill pill-lightgreen">WebRTC</span>
                  <span className="tag-pill pill-blue">Live Review</span>
                  <span className="tag-pill pill-yellow">Q&A</span>
                  <span className="tag-pill pill-peach">8:00 PM IST</span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2752dd', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TOPIC:</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>{googleMeetConfig.topic}</h4>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>🕒 Timing: {googleMeetConfig.timing}</div>
                </div>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                  <span style={{ color: '#2752dd' }}>((•))</span> Live Session
                </div>
                <a href={googleMeetConfig.meetUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ backgroundColor: '#2752dd', borderRadius: '12px', padding: '0.6rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Join Google Meet Now <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* CARD 2: MENTOR ANNOUNCEMENTS */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ffe4e6', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>Mentor Announcements</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Official updates & submission guidelines</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  <span className="tag-pill pill-peach">Cohort Updates</span>
                  <span className="tag-pill pill-periwinkle">Guidelines</span>
                  <span className="tag-pill pill-cyan">Broadcast</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {announcements.map((ann) => (
                    <div key={ann.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>📌 {ann.title}</span>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4', marginTop: '0.2rem' }}>{ann.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                  <span style={{ color: '#e11d48' }}>((•))</span> Live Notices ({announcements.length})
                </div>
                <button className="btn-secondary" style={{ backgroundColor: '#e11d48', borderRadius: '12px', padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}>
                  Pinned Notices
                </button>
              </div>
            </div>

            {/* CARD 3: MY ASSIGNED TEAM */}
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ffedd5', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>My Assigned Team</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Shared team project & repository</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  <span className="tag-pill pill-yellow">Team Collaboration</span>
                  <span className="tag-pill pill-blue">GitHub Sync</span>
                  <span className="tag-pill pill-lightgreen">Lead (+15 pts)</span>
                </div>

                {myTeam ? (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
                      <img src={myTeam.teamAvatarUrl} alt={myTeam.name} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #2752dd' }} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{myTeam.name}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Project: {myTeam.projectName}</span>
                      </div>
                    </div>
                    <a href={myTeam.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2752dd', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
                      <Github size={13} /> {myTeam.githubUrl}
                    </a>
                  </div>
                ) : (
                  <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: '14px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', background: '#f8fafc' }}>
                    <Users size={28} style={{ margin: '0 auto 0.4rem', color: '#64748b' }} />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>No Team Assigned Yet</h4>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                  <span style={{ color: '#2752dd' }}>((•))</span> Team Active
                </div>
                <a href={myTeam?.githubUrl || 'https://github.com'} target="_blank" rel="noreferrer" className="btn-primary" style={{ backgroundColor: '#2752dd', borderRadius: '12px', padding: '0.6rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Open Repo ↗
                </a>
              </div>
            </div>
          </div>
          </SectionErrorBoundary>

          {/* ROW 3: LEADERBOARD ENHANCEMENTS */}

          <SectionErrorBoundary name="Global Leaderboard">
            <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', background: '#ffffff' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Trophy size={26} style={{ color: '#f59e0b' }} />
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>Global Student Leaderboard</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Click any student row to view submission history, streak & score breakdown</p>
                </div>
              </div>

              {/* FILTER CONTROLS: COHORT DROPDOWN & TIME RANGE TOGGLE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Cohort Dropdown */}
                <select
                  value={cohortFilter}
                  onChange={e => setCohortFilter(e.target.value)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Cohorts</option>
                  <option value="FULLSTACK">Fullstack & AI</option>
                  <option value="VLSI">VLSI & Embedded</option>
                  <option value="AUTOMOTIVE">Automotive & IoT</option>
                  <option value="UIUX">UI/UX Design</option>
                  <option value="EDGEAI">Edge AI</option>
                </select>

                {/* Time Range Toggle */}
                <div style={{ background: '#f1f5f9', padding: '0.2rem', borderRadius: '10px', display: 'flex', gap: '0.2rem' }}>
                  {['WEEK', 'MONTH', 'ALL'].map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRangeToggle(range)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        borderRadius: '8px',
                        border: 'none',
                        background: timeRangeToggle === range ? '#2563eb' : 'transparent',
                        color: timeRangeToggle === range ? '#ffffff' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {range === 'WEEK' ? 'This Week' : range === 'MONTH' ? 'This Month' : 'All-Time'}
                    </button>
                  ))}
                </div>

                <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>((•)) LIVE AUDITED</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '0.75rem' }}>RANK</th>
                    <th style={{ padding: '0.75rem' }}>TREND</th>
                    <th style={{ padding: '0.75rem' }}>STUDENT</th>
                    <th style={{ padding: '0.75rem' }}>COHORT / BATCH</th>
                    <th style={{ padding: '0.75rem' }}>SUBMISSIONS</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>TOTAL SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {globalLeaderboard.map((student, idx) => {
                    const rank = idx + 1;
                    const isTop1 = rank === 1;
                    const isTop2 = rank === 2;
                    const isTop3 = rank === 3;

                    // Clean Light White Row Styles
                    let rowBg = student.id === currentUserId ? '#f0f7ff' : '#ffffff';
                    let rowBorder = '1px solid #e2e8f0';
                    let rankBadge = `#${rank}`;
                    let rankBg = '#f1f5f9';
                    let rankColor = '#475569';

                    if (isTop1) {
                      rowBorder = '2px solid #f59e0b';
                      rankBadge = '🥇 #1';
                      rankBg = '#f59e0b';
                      rankColor = '#ffffff';
                    } else if (isTop2) {
                      rowBorder = '2px solid #94a3b8';
                      rankBadge = '🥈 #2';
                      rankBg = '#64748b';
                      rankColor = '#ffffff';
                    } else if (isTop3) {
                      rowBorder = '2px solid #ea580c';
                      rankBadge = '🥉 #3';
                      rankBg = '#ea580c';
                      rankColor = '#ffffff';
                    }

                    return (
                      <tr 
                        key={student.id} 
                        onClick={() => setStudentModal({ open: true, student })}
                        style={{ 
                          background: rowBg, 
                          border: rowBorder, 
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                        }}
                        className="leaderboard-row-hover"
                      >
                        {/* Rank Badge */}
                        <td style={{ padding: '0.85rem 0.75rem', borderRadius: '12px 0 0 12px' }}>
                          <span style={{ background: rankBg, color: rankColor, padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '900' }}>
                            {rankBadge}
                          </span>
                        </td>

                        {/* Rank-Change Indicator ▲ ▼ — */}
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: '900', fontSize: '0.95rem' }}>
                          <span style={{ color: student.rankColor }} title={`Today: #${student.todayRank}, Yesterday: #${student.yesterdayRank}`}>
                            {student.rankIndicator} {student.todayRank !== student.yesterdayRank ? Math.abs(student.yesterdayRank - student.todayRank) : ''}
                          </span>
                        </td>

                        {/* Student Name & Avatar & Streak Badge */}
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: '800' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {student.profilePicUrl || student.profilePic || student.avatarUrl ? (
                              <img 
                                src={student.profilePicUrl || student.profilePic || student.avatarUrl} 
                                alt={student.name} 
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`;
                                }}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: isTop1 ? '2px solid #eab308' : '1.5px solid #2563eb', flexShrink: 0 }} 
                              />
                            ) : (
                              <div className="avatar-circle" style={{ width: '36px', height: '36px', backgroundColor: student.avatarBg || '#fb923c', color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                {student.initials || student.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div style={{ fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {student.name}
                                {/* Streak Badge 🔥 */}
                                {student.streak >= 3 && (
                                  <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                                    🔥 {student.streak}d
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>{student.domain}</span>
                            </div>
                          </div>
                        </td>

                        {/* Batch / Cohort */}
                        <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', color: '#475569', fontWeight: '700' }}>
                          {student.batch || 'Batch A'}
                        </td>

                        {/* On-Time Submissions Fraction + Percentage */}
                        <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', fontWeight: '800', color: '#16a34a' }}>
                          ✔ {student.onTimeFraction || `${student.onTimeCount || 0}/${student.totalSubmissionsCount || 0} On-Time`}
                        </td>

                        {/* Total Score */}
                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: '900', fontSize: '1.05rem', color: isTop1 ? '#854d0e' : '#0f172a', borderRadius: '0 12px 12px 0' }}>
                          {student.totalScore} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </SectionErrorBoundary>

          {/* ROW 4: SUBMISSION PANEL & UPLOADED PIC UI */}
          <SectionErrorBoundary name="Submission Panel">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>

            <div className="card" style={{ borderColor: '#8b5cf6', borderWidth: '1.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{currentUser?.name || 'Student'}'s Submission Panel</h2>

                <div style={{ background: '#fff7ed', border: '1.5px solid #ffedd5', color: '#c2410c', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800' }}>
                  ⏳ {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem', color: '#334155' }}>
                    GitHub Repository Link (Required: https://github.com/...)
                  </label>
                  <input 
                    type="url" 
                    value={githubUrl} 
                    onChange={e => {
                      setGithubUrl(e.target.value);
                      if (submitError) setSubmitError('');
                    }} 
                    placeholder="https://github.com/username/project-repository" 
                    required 
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }} 
                  />
                </div>

                <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem', color: '#334155' }}>
                    Optional Media Upload (Image or Video to Supabase Storage)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={e => setMediaFile(e.target.files?.[0] || null)}
                    style={{ 
                      width: '100%', 
                      maxWidth: '100%',
                      boxSizing: 'border-box', 
                      padding: '0.5rem', 
                      fontSize: '0.82rem', 
                      background: '#f8fafc', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-medium)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  />
                  {mediaFile && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#059669', 
                      fontWeight: '700', 
                      marginTop: '0.35rem', 
                      display: 'block',
                      wordBreak: 'break-all',
                      overflowWrap: 'anywhere',
                      maxWidth: '100%'
                    }}>
                      📁 Selected for Supabase Storage: {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>


                {submitError && (
                  <div style={{ padding: '0.65rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.82rem', fontWeight: '700' }}>
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div style={{ padding: '0.65rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.82rem', fontWeight: '700' }}>
                    {submitSuccess}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="btn-secondary" 
                  style={{ backgroundColor: isUploading ? '#64748b' : '#1e293b', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {isUploading ? 'Uploading to Supabase Storage...' : 'Submit Deliverable via Supabase'}
                </button>
              </form>
            </div>
          </div>
          </SectionErrorBoundary>

          {/* ENHANCED QUICK LINKS & SCOREBOARD MINI DASHBOARD */}
          <SectionErrorBoundary name="Quick Links & Scoreboard Dashboard">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>


              {/* 1. QUICK LINK CARDS WITH AUTHENTIC BRAND SVG LOGOS & SUPABASE PER-STUDENT PERSISTENCE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {/* Google Drive Card */}
                {(() => {
                  const status = formatExactRelativeTime(userQuickLinks?.drive);
                  return (
                    <a 
                      href={googleDriveUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => trackQuickLinkClick && trackQuickLinkClick('drive')}
                      className={`quick-link-card ${status.isUnopened ? 'unopened-pulse-glow' : ''}`}
                      style={{ 
                        textDecoration: 'none', 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '20px', 
                        padding: '1.25rem 1rem', 
                        textAlign: 'center',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* AUTHENTIC GOOGLE DRIVE BRAND MULTI-COLOR TRIANGLE LOGO */}
                      <div style={{ 
                        width: '54px', 
                        height: '54px', 
                        borderRadius: '16px', 
                        background: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        margin: '0 auto 0.65rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M8.6 2L1 15h5.4L14 2H8.6z" fill="#4285F4"/>
                          <path d="M8.6 2L14 2l8.4 14.6H17L8.6 2z" fill="#0F9D58"/>
                          <path d="M1 15l2.7 4.7c.8 1.4 2.3 2.3 4 2.3h10.6l-3.7-6.4H1z" fill="#FFBA00"/>
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Google Drive</span>
                        <ExternalLink size={14} className="external-link-icon" style={{ color: '#4285F4' }} />
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '0.15rem' }}>Cohort Assets & Slides</span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: status.isUnopened ? '#4338ca' : '#4285F4', 
                        fontWeight: '800', 
                        marginTop: '0.45rem', 
                        background: status.isUnopened ? '#e0e7ff' : '#eff6ff', 
                        padding: '0.22rem 0.65rem', 
                        borderRadius: '9999px', 
                        border: '1px solid ' + (status.isUnopened ? '#c7d2fe' : '#bfdbfe') 
                      }}>
                        🕒 {status.text}
                      </span>
                    </a>
                  );
                })()}

                {/* Google Classroom Card */}
                {(() => {
                  const status = formatExactRelativeTime(userQuickLinks?.classroom);
                  return (
                    <a 
                      href={googleClassroomUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => trackQuickLinkClick && trackQuickLinkClick('classroom')}
                      className={`quick-link-card ${status.isUnopened ? 'unopened-pulse-glow' : ''}`}
                      style={{ 
                        textDecoration: 'none', 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '20px', 
                        padding: '1.25rem 1rem', 
                        textAlign: 'center',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* AUTHENTIC GOOGLE CLASSROOM BRAND CHALKBOARD LOGO */}
                      <div style={{ 
                        width: '54px', 
                        height: '54px', 
                        borderRadius: '16px', 
                        background: '#f0fdf4', 
                        border: '1px solid #bbf7d0', 
                        margin: '0 auto 0.65rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        boxShadow: '0 4px 12px rgba(15,157,88,0.12)' 
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="3" width="20" height="16" rx="3" fill="#0F9D58" stroke="#0B7340" strokeWidth="1.5"/>
                          <rect x="3.5" y="4.5" width="17" height="13" rx="1.5" fill="#137333"/>
                          <path d="M12 7.5a2 2 0 100 4 2 2 0 000-4z" fill="#FFBA00"/>
                          <path d="M8.5 14.5c0-1.9 2.3-3 3.5-3s3.5 1.1 3.5 3" stroke="#FFBA00" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M7 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="#FFFFFF" opacity="0.8"/>
                          <path d="M17 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="#FFFFFF" opacity="0.8"/>
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Google Classroom</span>
                        <ExternalLink size={14} className="external-link-icon" style={{ color: '#0F9D58' }} />
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '0.15rem' }}>Assignments & Tasks</span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: status.isUnopened ? '#4338ca' : '#15803d', 
                        fontWeight: '800', 
                        marginTop: '0.45rem', 
                        background: status.isUnopened ? '#e0e7ff' : '#f0fdf4', 
                        padding: '0.22rem 0.65rem', 
                        borderRadius: '9999px', 
                        border: '1px solid ' + (status.isUnopened ? '#c7d2fe' : '#bbf7d0') 
                      }}>
                        🕒 {status.text}
                      </span>
                    </a>
                  );
                })()}

                {/* Community Hub Card (WhatsApp Community & Chat) */}
                {(() => {
                  const status = formatExactRelativeTime(userQuickLinks?.community);
                  const targetUrl = communityHubUrl || 'https://chat.whatsapp.com/PowerhubCommunity2026';
                  return (
                    <a 
                      href={targetUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => trackQuickLinkClick && trackQuickLinkClick('community')}
                      className={`quick-link-card ${status.isUnopened ? 'unopened-pulse-glow' : ''}`}
                      style={{ 
                        textDecoration: 'none', 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '20px', 
                        padding: '1.25rem 1rem', 
                        textAlign: 'center',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* AUTHENTIC WHATSAPP COMMUNITY BRAND LOGO */}
                      <div style={{ 
                        width: '54px', 
                        height: '54px', 
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', 
                        border: '1px solid #bbf7d0', 
                        margin: '0 auto 0.65rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        boxShadow: '0 4px 12px rgba(37,211,102,0.18)' 
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5.1-.7.3-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1s-1.3-.5-2.5-1.5c-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2.1-.3 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.2.8.4 1.4.6 1.9.7.8.3 1.6.2 2.2.1.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.1-.3-.2-.6-.3z" fill="#FFFFFF"/>
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.5 2 2 6.5 2 12c0 2.2.7 4.2 1.9 5.9L2.6 22l4.3-1.3C8.5 21.4 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.3 1 1-3.2-.2-.3C4 14.8 3.5 13.4 3.5 12 3.5 7.3 7.3 3.5 12 3.5s8.5 3.8 8.5 8.5S16.7 20 12 20z" fill="#25D366"/>
                        </svg>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Community Hub</span>
                        <ExternalLink size={14} className="external-link-icon" style={{ color: '#25D366' }} />
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700', marginTop: '0.15rem' }}>WhatsApp Group & Chat</span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: status.isUnopened ? '#4338ca' : '#15803d', 
                        fontWeight: '800', 
                        marginTop: '0.45rem', 
                        background: status.isUnopened ? '#e0e7ff' : '#dcfce7', 
                        padding: '0.22rem 0.65rem', 
                        borderRadius: '9999px', 
                        border: '1px solid ' + (status.isUnopened ? '#c7d2fe' : '#bbf7d0') 
                      }}>
                        🕒 {status.text}
                      </span>
                    </a>
                  );
                })()}

                {/* Tech Industry Pulse Card */}
                {(() => {
                  const status = formatExactRelativeTime(userQuickLinks?.techNews);
                  const newsList = techNews || [];
                  const displayedNews = newsList.slice(0, 3);

                  const getCategoryStyle = (cat) => {
                    if (cat === 'layoff') return { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', label: 'Layoff' };
                    if (cat === 'hiring') return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Hiring' };
                    return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Opening' };
                  };

                  return (
                    <div 
                      className={`quick-link-card ${status.isUnopened ? 'unopened-pulse-glow' : ''}`}
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '20px', 
                        padding: '1.25rem 1rem', 
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Header Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '42px', 
                              height: '42px', 
                              borderRadius: '14px', 
                              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', 
                              border: '1px solid #fed7aa', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              boxShadow: '0 4px 10px rgba(234,88,12,0.12)' 
                            }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                              </svg>
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                Tech Industry Pulse
                              </h3>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Layoffs, Hiring & Jobs</span>
                            </div>
                          </div>
                          
                          <span style={{ 
                            fontSize: '0.68rem', 
                            color: status.isUnopened ? '#4338ca' : '#ea580c', 
                            fontWeight: '800', 
                            background: status.isUnopened ? '#e0e7ff' : '#fff7ed', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '9999px', 
                            border: '1px solid ' + (status.isUnopened ? '#c7d2fe' : '#fed7aa') 
                          }}>
                            {status.text}
                          </span>
                        </div>

                        {/* News Feed List (3 items) */}
                        {newsList.length === 0 ? (
                          <div style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            <span className="animate-spin">⏳</span> Checking for today's tech news...
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.5rem' }}>
                            {displayedNews.map((item) => {
                              const catTheme = getCategoryStyle(item.category);
                              const pubTimeAgo = formatExactRelativeTime(item.published_at).text.replace('Opened ', '');
                              return (
                                <a 
                                  key={item.id}
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => trackQuickLinkClick && trackQuickLinkClick('techNews')}
                                  style={{
                                    textDecoration: 'none',
                                    padding: '0.5rem 0.65rem',
                                    borderRadius: '10px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                                    <span style={{ 
                                      background: catTheme.bg, 
                                      color: catTheme.color, 
                                      border: `1px solid ${catTheme.border}`,
                                      padding: '0.1rem 0.45rem', 
                                      borderRadius: '6px', 
                                      fontSize: '0.65rem', 
                                      fontWeight: '800', 
                                      textTransform: 'uppercase' 
                                    }}>
                                      {catTheme.label}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '600' }}>
                                      {item.source} • {pubTimeAgo}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {item.headline}
                                    </span>
                                    <ExternalLink size={12} className="external-link-icon" style={{ color: '#ea580c', flexShrink: 0 }} />
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Modal Trigger Link */}
                      <button
                        onClick={() => {
                          trackQuickLinkClick && trackQuickLinkClick('techNews');
                          setShowTechNewsModal(true);
                        }}
                        style={{
                          marginTop: '0.75rem',
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          color: '#ea580c',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <span>See all Tech Industry News ({newsList.length})</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* PUBLIC PORTFOLIO & PRIVACY CONTROL CARD */}
              {(() => {
                const currentProf = (resumeProfiles && resumeProfiles[currentUser?.id]) || {};
                const isPublic = currentProf.isPortfolioPublic === true;

                return (
                  <div className="card" style={{ background: 'linear-gradient(135deg, #ffffff, #eff6ff)', border: '1.5px solid #bfdbfe', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 4px 14px rgba(37,99,235,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 10px rgba(37,99,235,0.25)' }}>
                          🌐
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                            Public Portfolio Website & Privacy Controls
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                            Share your verified skills, deliverables, and certificates at <code>/portfolio/{currentUser?.id}</code>
                          </span>
                        </div>
                      </div>

                      {/* TOGGLE & ACTIONS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: isPublic ? '#16a34a' : '#64748b' }}>
                            {isPublic ? '🟢 Public (ON)' : '🔒 Private (OFF)'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newStatus = !isPublic;
                              updateResumeProfile(currentUser?.id, { isPortfolioPublic: newStatus });
                              alert(`Portfolio privacy updated: ${newStatus ? 'Publicly Visible 🌐' : 'Set to Private 🔒'}`);
                            }}
                            style={{
                              width: '46px',
                              height: '24px',
                              borderRadius: '9999px',
                              background: isPublic ? '#16a34a' : '#cbd5e1',
                              border: 'none',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'background 0.2s ease',
                              padding: '2px'
                            }}
                            title="Toggle Public Portfolio Visibility"
                          >
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              transform: isPublic ? 'translateX(22px)' : 'translateX(0px)',
                              transition: 'transform 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                          </button>
                        </div>

                        <a
                          href={`/portfolio/${currentUser?.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '0.45rem 0.95rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                          }}
                        >
                          <ExternalLink size={14} /> Open My Portfolio
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* DIGITAL CERTIFICATES CARD */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={22} style={{ color: '#16a34a' }} />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                        My Digital Certificates
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                        Milestones & Program Completion Credentials
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                    {certificates.filter(c => c.student_id === currentUser?.id).length} Verified
                  </span>
                </div>

                {certificates.filter(c => c.student_id === currentUser?.id).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                    <Award size={36} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>No certificates issued yet.</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mentors auto-issue certificates upon milestone / program completion.</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {certificates.filter(c => c.student_id === currentUser?.id).map((cert) => (
                      <div key={cert.id} style={{ background: 'linear-gradient(135deg, #ffffff, #f0fdf4)', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(22,163,74,0.06)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                              🎓 OFFICIAL CREDENTIAL
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700' }}>
                              {new Date(cert.issued_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.3', marginBottom: '0.35rem' }}>
                            {cert.program_title}
                          </h4>
                          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>
                            ID: <code>{cert.verification_id}</code>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #dcfce7' }}>
                          <button 
                            onClick={() => setViewCertModal(cert)}
                            style={{ flex: 1, background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                          >
                            <ExternalLink size={14} /> View Landscape
                          </button>
                          <button 
                            onClick={() => {
                              const shareUrl = encodeURIComponent(`${window.location.origin}/verify/${cert.verification_id}`);
                              const text = encodeURIComponent(`I earned my official Powerhub Certificate for ${cert.program_title}! 🎓 Verification ID: ${cert.verification_id}`);
                              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&text=${text}`, '_blank');
                            }}
                            style={{ background: '#0077b5', color: '#ffffff', border: 'none', padding: '0.45rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            title="Share on LinkedIn"
                          >
                            LinkedIn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FEATURE #3: INTERVIEW PREP & MOCK INTERVIEW SUITE CARD */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', border: '1px solid #a5b4fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>🎯</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                        Domain Interview Prep & Mock Slots
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                        Curated Questions, Private Notes & Mentor Mock Interviews
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setShowInterviewModal(true)}
                      className="btn-primary" 
                      style={{ background: '#4f46e5', fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                    >
                      📖 Practice Question Bank
                    </button>
                    <button 
                      onClick={() => setShowMockBookingModal(true)}
                      className="btn-outline" 
                      style={{ color: '#4f46e5', borderColor: '#c7d2fe', fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
                    >
                      📅 Book Mentor Mock Slot
                    </button>
                  </div>
                </div>

                {/* MY MOCK INTERVIEWS LIST */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                    My Booked Mock Interview Sessions
                  </h4>
                  {mockInterviews.filter(m => m.student_id === currentUser?.id).length === 0 ? (
                    <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b' }}>
                      No mock interviews booked yet. Click "Book Mentor Mock Slot" to schedule a 1-on-1 session.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {mockInterviews.filter(m => m.student_id === currentUser?.id).map(m => (
                        <div key={m.id} style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
                              {m.domain} Technical Mock Session
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Scheduled: <b>{new Date(m.scheduled_at).toLocaleString()}</b> • Mentor: {m.mentor_name}
                            </div>
                          </div>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: '800', 
                            padding: '0.2rem 0.65rem', 
                            borderRadius: '9999px',
                            background: m.status === 'completed' ? '#dcfce7' : m.status === 'scheduled' ? '#e0e7ff' : '#fef3c7',
                            color: m.status === 'completed' ? '#15803d' : m.status === 'scheduled' ? '#4338ca' : '#92400e'
                          }}>
                            {m.status === 'completed' ? '✅ Completed' : m.status === 'scheduled' ? '📅 Confirmed' : '⏳ Requested'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* FEATURE #4: PEER CODE REVIEWS CARD */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>👥</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                        Peer Code Reviews (+2 Pts Bonus)
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                        Review peer deliverables, provide constructive feedback & earn score bonuses
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                    {peerReviews.filter(pr => pr.reviewer_id === currentUser?.id).length} Completed (+{peerReviews.filter(pr => pr.reviewer_id === currentUser?.id).length * 2} pts)
                  </span>
                </div>

                {/* PEER REVIEW SUBMISSION QUEUE */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
                    Available Peer Submissions Requiring Review
                  </h4>
                  {submissions.filter(s => s.studentId !== currentUser?.id).length === 0 ? (
                    <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b' }}>
                      No peer submissions available for review right now.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {submissions.filter(s => s.studentId !== currentUser?.id).slice(0, 3).map(sub => {
                        const submitter = users.find(u => u.id === sub.studentId) || { name: 'Peer Student' };
                        const hasReviewed = peerReviews.some(pr => pr.submission_id === sub.id && pr.reviewer_id === currentUser?.id);

                        return (
                          <div key={sub.id} style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span>{submitter.name}</span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>• {sub.roundName || 'Daily Deliverable'}</span>
                              </div>
                              <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>
                                {sub.githubUrl}
                              </a>
                            </div>

                            {hasReviewed ? (
                              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: '800' }}>
                                ✓ Review Submitted (+2 Pts)
                              </span>
                            ) : (
                              <button 
                                onClick={() => setSelectedPeerSub({ ...sub, submitterName: submitter.name })}
                                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                ✍ Review Code (+2 Pts)
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* FEATURE #5: MONTHLY HACKATHONS & CODING CONTESTS CARD */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fae8ff, #f0abfc)', border: '1px solid #e879f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>🚀</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', margin: 0 }}>
                        Monthly Hackathons & Contests
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                        Live 48-Hour Buildathons, Dedicated Leaderboard & Winner Bonus (+50 Pts)
                      </span>
                    </div>
                  </div>
                </div>

                {/* HACKATHON EVENTS LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {hackathons.map(h => {
                    const isRegistered = h.participants?.includes(currentUser?.id);
                    const isLive = new Date(h.start_at) <= new Date() && new Date(h.end_at) >= new Date();

                    return (
                      <div key={h.id} style={{ background: 'linear-gradient(135deg, #ffffff, #fdf4ff)', border: '1.5px solid #f0abfc', borderRadius: '16px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ background: isLive ? '#dcfce7' : '#e0e7ff', color: isLive ? '#15803d' : '#4338ca', border: '1px solid ' + (isLive ? '#86efac' : '#c7d2fe'), padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase' }}>
                            {isLive ? '🔴 LIVE EVENT NOW' : '📅 UPCOMING EVENT'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                            Ends: {new Date(h.end_at).toLocaleString()}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.35rem' }}>
                          {h.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                          {h.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f5d0fe', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#86198f', fontWeight: '800' }}>
                            👥 {h.participants?.length || 0} Registered Participants • Winner Bonus: +50 Pts
                          </div>

                          {isRegistered ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                              ✓ Registered Participant
                            </span>
                          ) : (
                            <button 
                              onClick={() => {
                                joinHackathon(h.id);
                                alert(`🚀 Successfully registered for ${h.title}!`);
                              }}
                              style={{ background: 'linear-gradient(135deg, #c026d3, #9333ea)', color: '#ffffff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                            >
                              🚀 Register & Join Hackathon
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SCOREBOARD CARD — REDESIGNED AS MINI DASHBOARD (3 STAT CARDS + SLIM BREAKDOWN PILL ROW) */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Award size={20} style={{ color: '#2563eb' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>My Scoreboard Dashboard</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', background: '#ffffff', padding: '0.2rem 0.65rem', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
                    Live Sync
                  </span>
                </div>

                {/* 3 EQUAL-HEIGHT STAT CARDS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                  
                  {/* STAT CARD A: TOTAL POINTS WITH CIRCULAR SVG PROGRESS RING & ANIMATED COUNT UP */}
                  <div style={{ background: 'linear-gradient(135deg, #ffffff, #eff6ff)', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', textAlign: 'center' }}>
                    {/* SVG CIRCULAR PROGRESS RING */}
                    <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.4rem' }}>
                      <svg width="70" height="70" viewBox="0 0 70 70" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                        <circle cx="35" cy="35" r="28" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="35" 
                          cy="35" 
                          r="28" 
                          stroke="#2563eb" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - (((myScore?.totalScore || 0) % 25) / 25))}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 800ms ease' }}
                        />
                      </svg>
                      <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1d4ed8', zIndex: 1 }}>
                        {myScore?.totalScore || 0}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Total Points</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginTop: '0.1rem' }}>
                      Progress to next 25-pt tier: {((myScore?.totalScore || 0) % 25)}/25
                    </div>
                  </div>


                  {/* STAT CARD B: CURRENT RANK WITH ▲ / ▼ INDICATOR */}
                  <div style={{ background: 'linear-gradient(135deg, #ffffff, #eff6ff)', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>#{myRank}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '900', color: myRankItem?.rankColor || '#16a34a', background: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        {myRankItem?.rankIndicator || '—'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Current Rank</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginTop: '0.1rem' }}>
                      {myRank === 1 ? '🥇 Rank #1 Leader!' : `Compared to yesterday (#${myRankItem?.yesterdayRank || myRank})`}
                    </div>
                  </div>

                  {/* STAT CARD C: STREAK WITH VISUAL FLAME */}
                  <div style={{ background: 'linear-gradient(135deg, #ffffff, #fff7ed)', border: '1.5px solid ' + (myStreak > 0 ? '#fed7aa' : '#cbd5e1'), borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1.8rem', opacity: myStreak > 0 ? 1 : 0.4, filter: myStreak > 0 ? 'none' : 'grayscale(100%)' }}>🔥</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '900', color: myStreak > 0 ? '#ea580c' : '#64748b' }}>{myStreak} days</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Active Habit Streak</div>
                    <div style={{ fontSize: '0.7rem', color: myStreak > 0 ? '#c2410c' : '#64748b', fontWeight: '600', marginTop: '0.1rem' }}>
                      {myStreak > 0 ? '🔥 Streak Active!' : '0 days (Mark today done)'}
                    </div>
                  </div>

                </div>

                {/* SLIM HORIZONTAL BREAKDOWN PILL ROW */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem', paddingTop: '0.65rem', borderTop: '1px solid #dbeafe' }}>
                  <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    On-time: <b style={{ color: '#16a34a' }}>{myScore.onTimeCount || 0}</b>
                  </span>
                  <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Streak Bonus: <b style={{ color: '#ea580c' }}>+{myScore.streakBonusPts || 0} pts</b>
                  </span>
                  <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    Late Penalty: <b style={{ color: '#dc2626' }}>-{myScore.penaltyPts || 0} pts</b>
                  </span>
                </div>

              </div>
            </div>
          </SectionErrorBoundary>
        </>









      )}

      {/* STUDENT CLICKABLE ROW MODAL — SUBMISSION HISTORY & POINTS BREAKDOWN */}
      {studentModal.open && studentModal.student && (
        <div className="modal-overlay" onClick={() => setStudentModal({ open: false, student: null })}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%', borderRadius: '20px', padding: '1.75rem' }}>
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {studentModal.student.profilePicUrl || studentModal.student.profilePic || studentModal.student.avatarUrl ? (
                  <img 
                    src={studentModal.student.profilePicUrl || studentModal.student.profilePic || studentModal.student.avatarUrl} 
                    alt={studentModal.student.name} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentModal.student.name)}`;
                    }}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="avatar-circle" style={{ width: '48px', height: '48px', backgroundColor: studentModal.student.avatarBg || '#fb923c', color: '#ffffff', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    {studentModal.student.initials || studentModal.student.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    {studentModal.student.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>
                    {studentModal.student.domain} • {studentModal.student.batch || 'Batch A'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '900' }}>
                  Rank #{studentModal.student.todayRank || 1} ({studentModal.student.totalScore} pts)
                </span>
                <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: '800', marginTop: '0.25rem' }}>
                  🔥 {studentModal.student.streak || 0}-Day Streak
                </div>
              </div>
            </div>

            {/* SUBMISSION HISTORY LAST 14 DAYS GRID */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.65rem' }}>
                📅 Submission History (Last 14 Days)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.45rem' }}>
                {generateCalendarDays().filter(d => d.dateStr <= getISTDateDetails().todayStr).slice(-14).map((day) => {
                  const habit = getStudentHabitRecord(studentModal.student.id, day.dateStr);
                  const isDone = habit.studyDone && habit.submitDone;
                  const isPartial = habit.studyDone || habit.submitDone;
                  
                  let bg = '#f1f5f9';
                  let border = '#cbd5e1';
                  let icon = '⌛';
                  if (isDone) {
                    bg = '#dcfce7';
                    border = '#86efac';
                    icon = '✓';
                  } else if (habit.isMissed) {
                    bg = '#fee2e2';
                    border = '#fca5a5';
                    icon = '❌';
                  } else if (isPartial) {
                    bg = '#fef3c7';
                    border = '#fde68a';
                    icon = '📖';
                  }

                  return (
                    <div 
                      key={day.dateStr}
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: '8px',
                        padding: '0.4rem 0.2rem',
                        textAlign: 'center',
                        fontSize: '0.68rem',
                        fontWeight: '800'
                      }}
                      title={`${day.dateLabel}: ${isDone ? 'Completed' : habit.isMissed ? 'Missed' : 'Partial'}`}
                    >
                      <div style={{ color: '#64748b' }}>{day.day}</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}>{icon}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TOTAL POINTS BREAKDOWN */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                📊 Total Points Breakdown
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', fontWeight: '700' }}>
                <div>Base Submissions: <b style={{ color: '#1d4ed8' }}>+{studentModal.student.baseSubmissionPts || 0} pts</b></div>
                <div>On-Time Bonus: <b style={{ color: '#16a34a' }}>+{studentModal.student.onTimeBonusPts || 0} pts</b></div>
                <div>Early Bonus (&gt;1hr): <b style={{ color: '#0284c7' }}>+{studentModal.student.earlyBonusPts || 0} pts</b></div>
                <div>Streak Bonus: <b style={{ color: '#ea580c' }}>+{studentModal.student.streakBonusPts || 0} pts</b></div>
                <div>Missed Deductions: <b style={{ color: '#dc2626' }}>-{studentModal.student.missedDeductionsPts || 0} pts</b></div>
                <div>Total Score: <b style={{ color: '#0f172a' }}>{studentModal.student.totalScore} pts</b></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setStudentModal({ open: false, student: null })} 
                className="btn-primary" 
                style={{ background: '#2563eb', padding: '0.5rem 1.25rem', borderRadius: '10px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TECH INDUSTRY PULSE FULL NEWS FEED MODAL */}
      {showTechNewsModal && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '650px', width: '100%', borderRadius: '24px', padding: '1.5rem', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                    Tech Industry Pulse Daily Feed
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📅 Today's Live Feed ({new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}) • Auto-updated daily at 00:00 IST
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowTechNewsModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '32px', height: '32px', color: '#64748b', fontSize: '1rem', fontWeight: '800', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
              {(techNews || []).map((item) => {
                let catBg = '#eff6ff', catColor = '#1d4ed8', catBorder = '#bfdbfe', label = 'Opening';
                if (item.category === 'layoff') { catBg = '#fee2e2'; catColor = '#dc2626'; catBorder = '#fca5a5'; label = 'Layoff'; }
                else if (item.category === 'hiring') { catBg = '#dcfce7'; catColor = '#15803d'; catBorder = '#bbf7d0'; label = 'Hiring'; }

                const pubTimeAgo = formatExactRelativeTime(item.published_at).text.replace('Opened ', '');

                return (
                  <a 
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ background: catBg, color: catColor, border: `1px solid ${catBorder}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                        {item.source} • {pubTimeAgo}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.35', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span>{item.headline}</span>
                      <ExternalLink size={14} style={{ color: '#ea580c', flexShrink: 0 }} />
                    </h4>

                    {item.summary && (
                      <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                        {item.summary}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  refreshTechNews && refreshTechNews();
                  alert("✅ Refreshed today's latest daily tech news feed!");
                }}
                style={{ background: '#f8fafc', color: '#0f172a', border: '1.5px solid #cbd5e1', padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                🔄 Refresh Today's Feed
              </button>

              <button 
                onClick={() => setShowTechNewsModal(false)}
                className="btn-primary" 
                style={{ background: '#ea580c', padding: '0.5rem 1.25rem', borderRadius: '10px' }}
              >
                Close Feed
              </button>
            </div>
          </div>
        </div>
      )}
      {/* STUDENT LANDSCAPE CERTIFICATE VIEW MODAL */}
      {viewCertModal && (
        <div className="modal-overlay" onClick={() => setViewCertModal(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '100%', borderRadius: '24px', padding: '1.5rem', background: '#0f172a', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Official Digital Certificate (ID: {viewCertModal.verification_id})
                </h3>
              </div>
              <button onClick={() => setViewCertModal(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#ffffff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>

            {/* LANDSCAPE CERTIFICATE DOCUMENT */}
            <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: '20px', padding: '2.5rem 2rem', border: '10px solid #1e293b', textAlign: 'center', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                <Award size={14} /> Powerhub Autonomous Academy
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', margin: '0.25rem 0' }}>
                Certificate of Completion
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Presented to
              </p>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#2563eb', margin: '0.5rem 0', borderBottom: '2px solid #e2e8f0', display: 'inline-block', paddingBottom: '0.25rem' }}>
                {viewCertModal.student_name}
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '700', maxWidth: '600px', margin: '0.5rem auto' }}>
                for successfully completing all engineering requirements for {viewCertModal.program_title}
              </p>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>ISSUED DATE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{new Date(viewCertModal.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: '800', marginTop: '0.2rem' }}>ID: {viewCertModal.verification_id}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'serif', fontSize: '1.1rem', fontWeight: '700', fontStyle: 'italic', color: '#1e293b' }}>Barath Krishna</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0f172a' }}>{viewCertModal.mentor_signature || 'Lead Mentor'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button 
                onClick={() => window.print()}
                className="btn-outline" 
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
              >
                🖨️ Download PDF / Print
              </button>
              <button 
                onClick={() => {
                  const shareUrl = encodeURIComponent(`${window.location.origin}/verify/${viewCertModal.verification_id}`);
                  const text = encodeURIComponent(`Check out my verified Powerhub Digital Certificate! 🎓 Verification ID: ${viewCertModal.verification_id}`);
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&text=${text}`, '_blank');
                }}
                className="btn-primary" 
                style={{ background: '#0077b5' }}
              >
                Share on LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE #3: INTERVIEW QUESTION BANK MODAL */}
      {showInterviewModal && (
        <div className="modal-overlay" onClick={() => setShowInterviewModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', borderRadius: '24px', padding: '1.5rem', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                    Domain Technical Interview Question Bank
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Browse real-world questions, test model answers, and record private attempt notes.
                  </span>
                </div>
              </div>
              <button onClick={() => setShowInterviewModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '32px', height: '32px', color: '#64748b', cursor: 'pointer', fontWeight: '800' }}>✕</button>
            </div>

            {/* FILTERS BAR */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <select 
                value={selectedDomainFilter} 
                onChange={e => setSelectedDomainFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '700' }}
              >
                <option value="ALL">All Domains</option>
                <option value="FULLSTACK">Fullstack</option>
                <option value="AI">AI & GenAI</option>
                <option value="Edge AI">Edge AI / IoT</option>
                <option value="Automotive">Automotive</option>
              </select>

              <select 
                value={selectedDiffFilter} 
                onChange={e => setSelectedDiffFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '700' }}
              >
                <option value="ALL">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* QUESTIONS LIST */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
              {interviewQuestions
                .filter(q => selectedDomainFilter === 'ALL' || q.domain === selectedDomainFilter)
                .filter(q => selectedDiffFilter === 'ALL' || q.difficulty === selectedDiffFilter)
                .map(q => {
                  const isPracticed = practicedQuestions[q.id];
                  const isRevealed = revealedAnswers[q.id];

                  return (
                    <div key={q.id} style={{ padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                            {q.domain}
                          </span>
                          <span style={{ 
                            background: q.difficulty === 'easy' ? '#dcfce7' : q.difficulty === 'medium' ? '#fef3c7' : '#fee2e2',
                            color: q.difficulty === 'easy' ? '#15803d' : q.difficulty === 'medium' ? '#92400e' : '#dc2626',
                            padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase'
                          }}>
                            {q.difficulty}
                          </span>
                        </div>

                        <button 
                          onClick={() => setPracticedQuestions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          style={{ background: isPracticed ? '#dcfce7' : '#ffffff', color: isPracticed ? '#15803d' : '#64748b', border: '1px solid ' + (isPracticed ? '#86efac' : '#cbd5e1'), padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                          {isPracticed ? '✓ Practiced' : '+ Mark Practiced'}
                        </button>
                      </div>

                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                        {q.question_text}
                      </h4>

                      {/* MODEL ANSWER & HINTS TOGGLE */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <button 
                          onClick={() => setRevealedAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                          {isRevealed ? '🙈 Hide Model Answer & Hints' : '💡 Reveal Model Answer & Hints'}
                        </button>

                        {isRevealed && (
                          <div style={{ marginTop: '0.5rem', padding: '0.85rem', background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '0.82rem', lineHeight: 1.45 }}>
                            <div style={{ fontWeight: '800', color: '#1d4ed8', marginBottom: '0.25rem' }}>Model Answer:</div>
                            <p style={{ color: '#334155', margin: '0 0 0.5rem' }}>{q.model_answer}</p>
                            {q.hints && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                                💡 Hint: {q.hints}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* PRIVATE ATTEMPT NOTES */}
                      <div>
                        <input 
                          type="text" 
                          placeholder="Write your private practice attempt notes / key points here..."
                          value={studentNotes[q.id] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setStudentNotes(prev => ({ ...prev, [q.id]: val }));
                          }}
                          style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#ffffff' }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* FEATURE #3: MOCK INTERVIEW BOOKING MODAL */}
      {showMockBookingModal && (
        <div className="modal-overlay" onClick={() => setShowMockBookingModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📅</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Request 1-on-1 Mentor Mock Slot
                </h3>
              </div>
              <button onClick={() => setShowMockBookingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              bookMockInterview(mockTimeInput, mockNotesInput);
              setShowMockBookingModal(false);
              alert('📅 Mock Interview slot requested successfully! Mentor will review and confirm.');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Preferred Slot Date & Time (IST) *
                </label>
                <input 
                  type="datetime-local" 
                  value={mockTimeInput}
                  onChange={e => setMockTimeInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Focus Area / Target Preparation Notes *
                </label>
                <input 
                  type="text" 
                  value={mockNotesInput}
                  onChange={e => setMockNotesInput(e.target.value)}
                  placeholder="e.g. Fullstack System Design, React RSC, Node APIs"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: '#1d4ed8' }}>
                💡 Mentors will receive your requested slot and confirm calendar availability.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowMockBookingModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#4f46e5' }}>
                  📅 Submit Slot Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEATURE #4: PEER CODE REVIEW MODAL */}
      {selectedPeerSub && (
        <div className="modal-overlay" onClick={() => setSelectedPeerSub(null)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', width: '100%', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>✍️</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Peer Review for {selectedPeerSub.submitterName}
                </h3>
              </div>
              <button onClick={() => setSelectedPeerSub(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              submitPeerReview(
                selectedPeerSub.id,
                selectedPeerSub.studentId,
                selectedPeerSub.submitterName,
                selectedPeerSub.githubUrl,
                peerFeedbackText,
                peerChecklist
              );
              setSelectedPeerSub(null);
              setPeerFeedbackText('');
              alert('⭐ Peer Code Review submitted successfully! +2 Points Bonus added to your total score.');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.82rem' }}>
                <div><strong>GitHub URL:</strong> <a href={selectedPeerSub.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{selectedPeerSub.githubUrl}</a></div>
              </div>

              {/* CHECKLIST */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.5rem' }}>
                  Peer Evaluation Checklist *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={peerChecklist.codeRuns}
                      onChange={e => setPeerChecklist(prev => ({ ...prev, codeRuns: e.target.checked }))}
                    />
                    <span>✅ Code compiles and runs cleanly without errors</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={peerChecklist.namingConventions}
                      onChange={e => setPeerChecklist(prev => ({ ...prev, namingConventions: e.target.checked }))}
                    />
                    <span>✅ Follows clean variable & function naming conventions</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={peerChecklist.readmeClear}
                      onChange={e => setPeerChecklist(prev => ({ ...prev, readmeClear: e.target.checked }))}
                    />
                    <span>✅ README / documentation is clear and structured</span>
                  </label>
                </div>
              </div>

              {/* FEEDBACK TEXT */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  1-3 Sentence Constructive Feedback *
                </label>
                <textarea 
                  rows="3"
                  value={peerFeedbackText}
                  onChange={e => setPeerFeedbackText(e.target.value)}
                  placeholder="Provide helpful code feedback, strengths, and areas for improvement..."
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'var(--font-sans)' }}
                />
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>
                🎉 Submitting this review will immediately award <b>+2 Bonus Points</b> to your total score!
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedPeerSub(null)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#16a34a' }}>
                  ⭐ Submit Review (+2 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

