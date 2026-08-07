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

export default function StudentDashboard() {
  const { 
    currentUser, users, teams, submissions, skillRatings, announcements, 
    googleMeetConfig, googleDriveUrl, googleClassroomUrl, scheduleMonths, 
    monthlyHabits, selectedScheduleMonth, setSelectedScheduleMonth, 
    domainRoadmaps, toggleDailyHabit, calculateStudentScore, submitWork 
  } = useApp();

  const [githubUrl, setGithubUrl] = useState('');
  const [imageAttachment, setImageAttachment] = useState('');
  const [isProject, setIsProject] = useState(true);
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'roadmap' | 'resume'

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
  const activeMonthHabits = monthlyHabits[selectedScheduleMonth] || monthlyHabits['August 2026'];

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
          {/* ROW 1: DAILY HABIT & SUBMISSION CALENDAR */}
          <div className="card" style={{ borderColor: '#3b82f6', borderWidth: '1.5px', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={22} style={{ color: '#2563eb' }} />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                    Daily Habit & Submission Calendar (Aug 2026 – Mar 2027)
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Shuffled pastel daily cards across full 8-month schedule. Only active current day boxes are tickable.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <select
                  value={selectedScheduleMonth}
                  onChange={e => setSelectedScheduleMonth(e.target.value)}
                  style={{
                    background: '#eff6ff',
                    border: '1.5px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {scheduleMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {activeMonthHabits.map((item) => {

                let cardBg = '#f8fafc';
                let cardBorder = '#e2e8f0';
                let badgeBg = '#64748b';
                let badgeText = '#ffffff';
                let badgeLabel = 'Past (Locked)';

                if (item.studyDone && item.submitDone) {
                  // Completed / Done -> Green
                  cardBg = '#f0fdf4';
                  cardBorder = '#86efac';
                  badgeBg = '#059669';
                  badgeText = '#ffffff';
                  badgeLabel = 'Completed ✔';
                } else if (item.isActive) {
                  // Today Active -> Amber / Gold
                  cardBg = '#fffbeb';
                  cardBorder = '#fde68a';
                  badgeBg = '#d97706';
                  badgeText = '#ffffff';
                  badgeLabel = '★ TODAY ACTIVE';
                } else if (!item.isPast) {
                  // Scheduled / Upcoming -> Blue
                  cardBg = '#f0f9ff';
                  cardBorder = '#bae6fd';
                  badgeBg = '#0284c7';
                  badgeText = '#ffffff';
                  badgeLabel = 'Scheduled';
                } else {
                  // Locked / Past -> Gray
                  cardBg = '#f8fafc';
                  cardBorder = '#cbd5e1';
                  badgeBg = '#64748b';
                  badgeText = '#ffffff';
                  badgeLabel = 'Past (Locked)';
                }

                return (
                  <div key={item.day} style={{ background: cardBg, border: `1.5px solid ${cardBorder}`, borderRadius: 'var(--radius-md)', padding: '0.85rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', boxShadow: item.isActive ? '0 4px 12px rgba(217, 119, 6, 0.15)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a', fontFamily: 'var(--font-heading)' }}>{item.day}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{item.dateLabel}</span>
                    </div>

                    <label style={{ background: item.studyDone ? '#059669' : '#ffffff', color: item.studyDone ? '#ffffff' : '#0f172a', border: '1px solid ' + (item.studyDone ? '#059669' : 'var(--border-medium)'), padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: item.isActive ? 'pointer' : 'default' }} onClick={() => item.isActive && toggleDailyHabit(selectedScheduleMonth, item.day, 'studyDone')}>
                      <span>📖 7 PM Study</span>
                      <input type="checkbox" checked={item.studyDone} readOnly style={{ accentColor: '#059669' }} />
                    </label>

                    <label style={{ background: item.submitDone ? '#059669' : '#ffffff', color: item.submitDone ? '#ffffff' : '#0f172a', border: '1px solid ' + (item.submitDone ? '#059669' : 'var(--border-medium)'), padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: item.isActive ? 'pointer' : 'default' }} onClick={() => item.isActive && toggleDailyHabit(selectedScheduleMonth, item.day, 'submitDone')}>
                      <span>📤 11:00 PM Subm...</span>
                      <input type="checkbox" checked={item.submitDone} readOnly style={{ accentColor: '#059669' }} />
                    </label>

                    <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
                      <span style={{ background: badgeBg, color: badgeText, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* ROW 2: 3-COLUMN MIDDLE GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ borderColor: '#10b981', borderWidth: '1.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <div style={{ width: '28px', height: '28px', background: '#e6f4ea', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f9d58' }}>
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Live Google Meet</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official mentor video conference & code walk-throughs</p>
                </div>
              </div>

              <div style={{ background: '#e6f4ea', border: '1px solid #a8dab5', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f9d58', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TOPIC:</div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>{googleMeetConfig.topic}</h4>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#166534' }}>🕒 Timing: {googleMeetConfig.timing}</div>
              </div>

              <a href={googleMeetConfig.meetUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', backgroundColor: '#059669', textDecoration: 'none', justifyContent: 'center' }}>
                <Video size={18} /> Join Google Meet Now <ExternalLink size={14} />
              </a>
            </div>

            <div className="card" style={{ borderColor: '#f43f5e', borderWidth: '1.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <MessageSquare size={20} style={{ color: '#f43f5e' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Mentor Announcements</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official updates & submission guidelines</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto', marginTop: '0.75rem' }}>
                {announcements.map((ann) => (
                  <div key={ann.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>📌 {ann.title}</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{ann.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderColor: '#f97316', borderWidth: '1.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <Users size={20} style={{ color: '#f97316' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>My Assigned Team</h3>
                </div>
              </div>

              {myTeam ? (
                <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
                    <img src={myTeam.teamAvatarUrl} alt={myTeam.name} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #f97316' }} />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{myTeam.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project: {myTeam.projectName}</span>
                    </div>
                  </div>
                  <a href={myTeam.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                    <Github size={13} /> {myTeam.githubUrl}
                  </a>
                </div>
              ) : (
                <div style={{ border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '2rem 1rem', textAlign: 'center', marginTop: '0.75rem' }}>
                  <Users size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--text-light)' }} />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>No Team Assigned Yet</h4>
                </div>
              )}
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
                        {student.profilePic || student.avatarUrl ? (
                          <img 
                            src={student.profilePic || student.avatarUrl} 
                            alt={student.name} 
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
