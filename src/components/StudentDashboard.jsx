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
    mentorFeedbacks, calculateStudentStreak, milestoneBadges 
  } = useApp();

  const myStreak = calculateStudentStreak ? calculateStudentStreak(currentUser.id) : 0;


  const [githubUrl, setGithubUrl] = useState('');
  const [imageAttachment, setImageAttachment] = useState('');
  const [isProject, setIsProject] = useState(true);
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
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

  const globalLeaderboard = users.map(user => {
    const scoreObj = calculateStudentScore(user.id);

    return {
      ...user,
      ...scoreObj
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const myScore = calculateStudentScore(currentUser.id);
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


          {/* ROW 3: LEADERBOARD */}
          <div className="card" style={{ borderColor: '#10b981', borderWidth: '1.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={22} style={{ color: '#f59e0b' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Leaderboard</h2>
              </div>
              <span style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>((•)) LIVE</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem' }}>RANK</th>
                    <th style={{ padding: '0.75rem' }}>STUDENT</th>
                    <th style={{ padding: '0.75rem' }}>TEAM IDENTITY</th>
                    <th style={{ padding: '0.75rem' }}>SUBMISSIONS</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>TOTAL SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {globalLeaderboard.map((student, idx) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-light)', background: student.id === currentUser.id ? '#f0f9ff' : 'transparent' }}>
                      <td style={{ padding: '0.85rem 0.75rem' }}>#{idx + 1}</td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {student.profilePicUrl || student.profilePic || student.avatarUrl ? (
                          <img 
                            src={student.profilePicUrl || student.profilePic || student.avatarUrl} 
                            alt={student.name} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`;
                            }}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #2563eb', flexShrink: 0 }} 
                          />
                        ) : (
                          <div className="avatar-circle" style={{ width: '32px', height: '32px', backgroundColor: student.avatarBg || '#fb923c', fontSize: '0.8rem', flexShrink: 0 }}>
                            {student.initials}
                          </div>
                        )}

                        <span>{student.name} ({student.domain})</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>-</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>✔ {student.submissionCount} On-Time</td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: '900' }}>{student.totalScore} pts</td>
                    </tr>
                  ))}

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <a href={googleDriveUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#ffffff', border: '2px solid #10b981', borderRadius: '20px', padding: '1.75rem 1.25rem', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e6f4ea', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📁</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>Google Drive <ExternalLink size={14} /></h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>Cohort Assets & Slides</span>
                </a>

                <a href={googleClassroomUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#ffffff', border: '2px solid #10b981', borderRadius: '20px', padding: '1.75rem 1.25rem', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e6f4ea', margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>👨‍🏫</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>Google Classroom <ExternalLink size={14} /></h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>Assignments & Tasks</span>
                </a>
              </div>

              <div className="card" style={{ borderColor: '#0284c7', borderWidth: '1.5px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>My Scoreboard</h3>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb' }}>{myScore.totalScore} TOTAL PTS</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
