import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, Calendar, Video, MessageSquare, Users, Github, ExternalLink, 
  Send, AlertCircle, CheckCircle2, Lock, Flame, Sparkles, BookOpen, 
  Award, Clock, BellRing, Folder, AlertTriangle, FileText, Printer, ChevronRight
} from 'lucide-react';
import ResumeBuilder from './ResumeBuilder';
import DomainBootcampRoadmap from './DomainBootcampRoadmap';
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
    googleMeetConfig, googleDriveUrl, googleClassroomUrl, scheduleMonths, 
    dailyHabitStates, selectedScheduleMonth, setSelectedScheduleMonth, 
    domainRoadmaps, toggleDailyHabit, getStudentHabitRecord, calculateStudentScore, submitWork,
    mentorFeedbacks, calculateStudentStreak, milestoneBadges, leaderboardHistory 
  } = useApp();

  const myStreak = calculateStudentStreak ? calculateStudentStreak(currentUser.id) : 0;

  // Leaderboard Filters & Modal State
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [timeRangeToggle, setTimeRangeToggle] = useState('ALL');
  const [studentModal, setStudentModal] = useState({ open: false, student: null });

  const [githubUrl, setGithubUrl] = useState('');

  const [imageAttachment, setImageAttachment] = useState('');
  const [isProject, setIsProject] = useState(true);
  const [mediaFile, setMediaFile] = useState(null);
  // Quick Links Click Timestamp Tracking (localStorage)
  const [lastOpenedTimestamps, setLastOpenedTimestamps] = useState(() => ({
    drive: localStorage.getItem('ph_last_open_drive') || null,
    classroom: localStorage.getItem('ph_last_open_classroom') || null,
    community: localStorage.getItem('ph_last_open_community') || null
  }));

  const handleQuickLinkClick = (key) => {
    const now = new Date().toISOString();
    localStorage.setItem(`ph_last_open_${key}`, now);
    setLastOpenedTimestamps(prev => ({ ...prev, [key]: now }));
  };

  const formatDaysAgo = (isoStr) => {
    if (!isoStr) return "Not opened yet";
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Opened today";
    if (diffDays === 1) return "Opened yesterday";
    return `Last opened ${diffDays} days ago`;
  };

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'roadmap' | 'resume'


  const allCalendarDays = React.useMemo(() => generateCalendarDays(), []);

  // Asia/Kolkata Timezone (IST) State
  const [istInfo, setIstInfo] = useState(() => getISTDateDetails());

  useEffect(() => {
    const timer = setInterval(() => {
      setIstInfo(getISTDateDetails());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = istInfo.todayStr;
  const isPast11PM = istInfo.isPast11PM;

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
      setSubmitError('Submission failed. Please verify inputs and try again.');
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

  const myScore = calculateStudentScore(currentUser.id, timeRangeToggle);
  const myRankItem = leaderboardWithRanks.find(s => s.id === currentUser.id);
  const myRank = myRankItem ? myRankItem.todayRank : 1;
  const nextRankItem = myRank > 1 ? leaderboardWithRanks[myRank - 2] : null;
  const ptsGapToNext = nextRankItem ? (nextRankItem.totalScore - (myScore.totalScore || 0)) + 1 : 0;

  const globalLeaderboard = leaderboardWithRanks;

  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const myTeam = teams.find(t => t.memberIds.includes(currentUser.id));

  const studentDomain = currentUser.domain || 'FULLSTACK';
  const currentRoadmap = domainRoadmaps[studentDomain] || domainRoadmaps['FULLSTACK'];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* PROMINENT NAVIGATION SUB-TABS WITH ACTIVE HIGHLIGHT */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              fontSize: '0.92rem',
              fontWeight: '800',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'dashboard' ? '0 2px 8px rgba(39,82,221,0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Trophy size={18} /> Student Dashboard
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            style={{
              fontSize: '0.92rem',
              fontWeight: '800',
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'resume' ? '#059669' : '#ecfdf5',
              color: activeTab === 'resume' ? '#ffffff' : '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'resume' ? '0 2px 8px rgba(5,150,105,0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={18} /> 📄 My Resume & Profile Builder
          </button>
        </div>

        {/* Quick Resume Generator Trigger Pill */}
        {activeTab !== 'resume' && (
          <button
            onClick={() => setActiveTab('resume')}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.45rem 1rem',
              fontSize: '0.82rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5,150,105,0.25)'
            }}
          >
            <Sparkles size={14} /> Build / Download Resume (PDF) <ChevronRight size={14} />
          </button>
        )}
      </div>

      {activeTab === 'resume' ? (
        <ResumeBuilder />
      ) : (





        <>
          {/* STREAK & MILESTONE BADGES CARD */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1.5px solid #fed7aa', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(234,88,12,0.08)' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              {(milestoneBadges || []).map(badge => {
                const isUnlocked = myStreak >= badge.reqStreak;
                return (
                  <div 
                    key={badge.id}
                    style={{
                      background: isUnlocked ? badge.bg : '#ffffff',
                      border: isUnlocked ? `1.5px solid ${badge.text}` : '1px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      opacity: isUnlocked ? 1 : 0.6,
                      filter: isUnlocked ? 'none' : 'grayscale(80%)'
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

          {/* ROW 1: DAILY HABIT & SUBMISSION CALENDAR MATCHING PICTURE 2 LAYOUT & THEME */}
          <div className="card" style={{ borderColor: '#bfdbfe', borderWidth: '1.5px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 28px rgba(37,99,235,0.06)', padding: '1.75rem' }}>

            {/* TOP HEADER MATCHING PICTURE 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '14px', 
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', 
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

            {/* PASTEL SKILL PILL TAGS ROW MATCHING PICTURE 2 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <span className="tag-pill pill-peach">HTML5</span>
              <span className="tag-pill pill-blue">CSS3</span>
              <span className="tag-pill pill-yellow">JavaScript</span>
              <span className="tag-pill pill-cyan">TailwindCSS</span>
              <span className="tag-pill pill-periwinkle">ReactJS</span>
              <span className="tag-pill pill-lightgreen">NodeJS</span>
              <span className="tag-pill pill-periwinkle">ExpressJS</span>
              <span className="tag-pill pill-green">MongoDB</span>
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
                const habitRec = getStudentHabitRecord(currentUser.id, dateStr);
                const studyDone = habitRec.studyDone;
                const submitDone = habitRec.submitDone;
                const isMissed = habitRec.isMissed;

                const isPast = dateStr < todayStr;
                const isActive = dateStr === todayStr;
                const isFuture = dateStr > todayStr;

                let badgeBg = '#64748b';
                let badgeText = '#ffffff';
                let badgeLabel = 'Past (Locked)';

                if (isPast) {
                  if (isMissed) {
                    badgeBg = '#ef4444';
                    badgeText = '#ffffff';
                    badgeLabel = 'Missed ❌';
                  } else {
                    badgeBg = '#64748b';
                    badgeText = '#ffffff';
                    badgeLabel = 'Past (Locked)';
                  }
                } else if (isActive) {
                  if (studyDone && submitDone) {
                    badgeBg = '#059669';
                    badgeText = '#ffffff';
                    badgeLabel = 'Completed ✓';
                  } else if (isPast11PM && !submitDone) {
                    badgeBg = '#ef4444';
                    badgeText = '#ffffff';
                    badgeLabel = '11 PM Cutoff (Missed ❌)';
                  } else {
                    badgeBg = '#d97706';
                    badgeText = '#ffffff';
                    badgeLabel = '★ TODAY ACTIVE';
                  }
                } else {
                  badgeBg = '#0284c7';
                  badgeText = '#ffffff';
                  badgeLabel = 'Scheduled';
                }

                // 11:00 PM IST Submission Checkbox Locking Rule
                const isSubmitLocked = !isActive || isPast11PM;

                return (
                  <div 
                    key={dateStr} 
                    style={{ 
                      minWidth: '160px', 
                      width: '160px', 
                      flexShrink: 0, 
                      scrollSnapAlign: 'start',
                      background: item.pastel.bg, 
                      border: isActive ? '2px solid #f59e0b' : `1.5px solid ${item.pastel.border}`, 
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
                      <span style={{ fontWeight: '800', fontSize: '0.92rem', color: item.pastel.text, fontFamily: 'var(--font-heading)' }}>{item.day}</span>
                      <span style={{ fontSize: '0.72rem', color: item.pastel.text, fontWeight: '700', opacity: 0.85 }}>{item.dateLabel}</span>
                    </div>

                    {/* 7 PM Study Checkbox */}
                    <label 
                      style={{ 
                        background: studyDone ? '#059669' : '#ffffff', 
                        color: studyDone ? '#ffffff' : '#0f172a', 
                        border: '1px solid ' + (studyDone ? '#059669' : item.pastel.border), 
                        padding: '0.35rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: isActive ? 'pointer' : 'not-allowed',
                        opacity: isActive ? 1 : 0.85 
                      }} 
                      onClick={() => isActive && toggleDailyHabit(currentUser.id, dateStr, 'studyDone')}
                    >
                      <span>📖 7 PM Study</span>
                      <input 
                        type="checkbox" 
                        checked={studyDone} 
                        disabled={!isActive}
                        readOnly 
                        style={{ accentColor: '#059669', cursor: isActive ? 'pointer' : 'not-allowed' }} 
                      />
                    </label>

                    {/* 11:00 PM Submission Checkbox (Auto-Locked at 11:00 PM IST) */}
                    <label 
                      style={{ 
                        background: submitDone ? '#059669' : (isSubmitLocked && !submitDone && (isPast || isPast11PM) ? '#fee2e2' : '#ffffff'), 
                        color: submitDone ? '#ffffff' : (isSubmitLocked && !submitDone && (isPast || isPast11PM) ? '#dc2626' : '#0f172a'), 
                        border: '1px solid ' + (submitDone ? '#059669' : (isSubmitLocked && !submitDone && (isPast || isPast11PM) ? '#fca5a5' : item.pastel.border)), 
                        padding: '0.35rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        cursor: (!isActive || isPast11PM) ? 'not-allowed' : 'pointer',
                        opacity: (!isActive || isPast11PM) ? 0.85 : 1 
                      }} 
                      onClick={() => isActive && !isPast11PM && toggleDailyHabit(currentUser.id, dateStr, 'submitDone')}
                    >
                      <span>
                        {submitDone ? '📤 11 PM Subm...' : (isSubmitLocked && (isPast || isPast11PM) ? '❌ 11 PM Missed' : '📤 11 PM Subm...')}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={submitDone} 
                        disabled={isSubmitLocked}
                        readOnly 
                        style={{ accentColor: '#059669', cursor: isSubmitLocked ? 'not-allowed' : 'pointer' }} 
                      />
                    </label>

                    <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
                      <span style={{ background: badgeBg, color: badgeText, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                        {badgeLabel}
                      </span>
                    </div>

                    {/* MENTOR FEEDBACK BANNER ON CARD */}
                    {mentorFeedbacks && mentorFeedbacks[`${currentUser.id}_${dateStr}`] && (
                      <div 
                        title={`Mentor Feedback: "${mentorFeedbacks[`${currentUser.id}_${dateStr}`]}"`}
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
                        💬 <b>Mentor:</b> "{mentorFeedbacks[`${currentUser.id}_${dateStr}`]}"
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


          {/* MY SCOREBOARD ENHANCEMENTS CARD */}
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

          {/* ROW 2: 3-COLUMN MIDDLE GRID MATCHING PICTURE 2 THEME & LAYOUT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            
            {/* CARD 1: LIVE GOOGLE MEET */}
            <div className="card" style={{ borderColor: '#bbf7d0', borderWidth: '1.5px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 28px rgba(16,185,129,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
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

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TOPIC:</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>{googleMeetConfig.topic}</h4>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#166534' }}>🕒 Timing: {googleMeetConfig.timing}</div>
                </div>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                  <span style={{ color: '#059669' }}>((•))</span> Live Session
                </div>
                <a href={googleMeetConfig.meetUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ backgroundColor: '#059669', borderRadius: '12px', padding: '0.6rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Join Google Meet Now <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* CARD 2: MENTOR ANNOUNCEMENTS */}
            <div className="card" style={{ borderColor: '#fecdd3', borderWidth: '1.5px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 28px rgba(244,63,94,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
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
                    <div key={ann.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.75rem' }}>
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
            <div className="card" style={{ borderColor: '#fed7aa', borderWidth: '1.5px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 28px rgba(249,115,22,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
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
                  <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
                      <img src={myTeam.teamAvatarUrl} alt={myTeam.name} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #ea580c' }} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{myTeam.name}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Project: {myTeam.projectName}</span>
                      </div>
                    </div>
                    <a href={myTeam.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
                      <Github size={13} /> {myTeam.githubUrl}
                    </a>
                  </div>
                ) : (
                  <div style={{ border: '2px dashed #fed7aa', borderRadius: '14px', padding: '1.5rem 1rem', textAlign: 'center', marginBottom: '1rem', background: '#fff7ed' }}>
                    <Users size={28} style={{ margin: '0 auto 0.4rem', color: '#ea580c' }} />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>No Team Assigned Yet</h4>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                  <span style={{ color: '#ea580c' }}>((•))</span> Team Active
                </div>
                <a href={myTeam?.githubUrl || 'https://github.com'} target="_blank" rel="noreferrer" className="btn-primary" style={{ backgroundColor: '#ea580c', borderRadius: '12px', padding: '0.6rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Open Repo ↗
                </a>
              </div>
            </div>

          </div>


          {/* ROW 3: LEADERBOARD ENHANCEMENTS */}
          <div className="card" style={{ borderColor: '#10b981', borderWidth: '1.5px', borderRadius: '20px', padding: '1.5rem', background: '#ffffff', boxShadow: '0 10px 28px rgba(16,185,129,0.06)' }}>
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

                <span style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>((•)) LIVE AUDITED</span>
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

                    // Distinct Highlighted Styles for Top 3
                    let rowBg = student.id === currentUser.id ? '#eff6ff' : '#ffffff';
                    let rowBorder = '1px solid #e2e8f0';
                    let rankBadge = `#${rank}`;
                    let rankBg = '#f1f5f9';
                    let rankColor = '#475569';

                    if (isTop1) {
                      rowBg = 'linear-gradient(135deg, #fef9c3, #fef08a)';
                      rowBorder = '2px solid #eab308';
                      rankBadge = '🥇 #1';
                      rankBg = '#eab308';
                      rankColor = '#ffffff';
                    } else if (isTop2) {
                      rowBg = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)';
                      rowBorder = '2px solid #94a3b8';
                      rankBadge = '🥈 #2';
                      rankBg = '#64748b';
                      rankColor = '#ffffff';
                    } else if (isTop3) {
                      rowBg = 'linear-gradient(135deg, #ffedd5, #fed7aa)';
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


          {/* ROW 4: SUBMISSION PANEL & UPLOADED PIC UI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ borderColor: '#8b5cf6', borderWidth: '1.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{currentUser.name}'s Submission Panel</h2>
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem', color: '#334155' }}>
                    Optional Media Upload (Image or Video to Supabase Storage)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={e => setMediaFile(e.target.files?.[0] || null)}
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
                  />
                  {mediaFile && (
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.25rem', display: 'block' }}>
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

            {/* ENHANCED QUICK LINKS & SCOREBOARD MINI DASHBOARD */}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 1. QUICK LINK CARDS (3-COLUMN RESPONSIVE GRID WITH HOVER LIFT & GRADIENTS & LAST OPENED TIMESTAMPS) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {/* Google Drive */}
                <a 
                  href={googleDriveUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={() => handleQuickLinkClick('drive')}
                  className="quick-link-card"
                  style={{ 
                    textDecoration: 'none', 
                    background: '#ffffff', 
                    border: '2px solid #10b981', 
                    borderRadius: '20px', 
                    padding: '1.25rem 1rem', 
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#059669', border: '1px solid #86efac', margin: '0 auto 0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 4px 10px rgba(16,185,129,0.15)' }}>
                    📁
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Google Drive <ExternalLink size={13} style={{ color: '#059669' }} />
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '0.15rem' }}>Cohort Assets & Slides</span>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800', marginTop: '0.4rem', background: '#f0fdf4', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    🕒 {formatDaysAgo(lastOpenedTimestamps.drive)}
                  </span>
                </a>

                {/* Google Classroom */}
                <a 
                  href={googleClassroomUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={() => handleQuickLinkClick('classroom')}
                  className="quick-link-card"
                  style={{ 
                    textDecoration: 'none', 
                    background: '#ffffff', 
                    border: '2px solid #2563eb', 
                    borderRadius: '20px', 
                    padding: '1.25rem 1rem', 
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #eff6ff, #bfdbfe)', color: '#2563eb', border: '1px solid #93c5fd', margin: '0 auto 0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 4px 10px rgba(37,99,235,0.15)' }}>
                    👨‍🏫
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Google Classroom <ExternalLink size={13} style={{ color: '#2563eb' }} />
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '0.15rem' }}>Assignments & Tasks</span>
                  <span style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: '800', marginTop: '0.4rem', background: '#eff6ff', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                    🕒 {formatDaysAgo(lastOpenedTimestamps.classroom)}
                  </span>
                </a>

                {/* Community & Resources */}
                <a 
                  href="https://discord.gg" 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={() => handleQuickLinkClick('community')}
                  className="quick-link-card"
                  style={{ 
                    textDecoration: 'none', 
                    background: '#ffffff', 
                    border: '2px solid #ea580c', 
                    borderRadius: '20px', 
                    padding: '1.25rem 1rem', 
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(234,88,12,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #fff7ed, #fed7aa)', color: '#ea580c', border: '1px solid #fdba74', margin: '0 auto 0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 4px 10px rgba(234,88,12,0.15)' }}>
                    💬
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Community Hub <ExternalLink size={13} style={{ color: '#ea580c' }} />
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '0.15rem' }}>Peer Discussion & Docs</span>
                  <span style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: '800', marginTop: '0.4rem', background: '#fff7ed', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                    🕒 {formatDaysAgo(lastOpenedTimestamps.community)}
                  </span>
                </a>
              </div>

              {/* 2. SCOREBOARD CARD — REDESIGNED AS MINI DASHBOARD (3 STAT CARDS + SLIM BREAKDOWN PILL ROW) */}
              <div style={{ background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', border: '1.5px solid #bfdbfe', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 6px 20px rgba(37,99,235,0.06)' }}>
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
                          strokeDashoffset={2 * Math.PI * 28 * (1 - ((myScore.totalScore % 25) / 25))}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 800ms ease' }}
                        />
                      </svg>
                      <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1d4ed8', zIndex: 1 }}>
                        {myScore.totalScore}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>Total Points</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginTop: '0.1rem' }}>
                      Progress to next 25-pt tier: {(myScore.totalScore % 25)}/25
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
          </div>
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
    </div>
  );
}

