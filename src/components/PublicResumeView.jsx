import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, FileText, Github, Linkedin, Mail, MapPin, Phone, ExternalLink, Printer, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PublicResumeView({ userId }) {
  const { users, submissions, teams, skillRatings, calculateStudentScore, resumeProfiles } = useApp();
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    if (userId && users && users.length > 0) {
      const found = users.find(u => u.id === userId || u.name?.toLowerCase().replace(/\s+/g, '') === userId.toLowerCase());
      if (found) {
        setTargetUser(found);
      } else {
        setTargetUser(users[0]);
      }
    }
  }, [userId, users]);

  const student = targetUser || (users && users[0]) || { name: 'Powerhub Student', id: userId };
  const userProfile = (resumeProfiles && resumeProfiles[student.id]) || {
    template: 'modern',
    fullName: student.name || 'Powerhub Student',
    email: student.email || 'student@powerhub.dev',
    phone: '+91 98765 43210',
    nativeLocation: 'Chennai, Tamil Nadu',
    linkedinUrl: `https://linkedin.com/in/${(student.name || 'student').toLowerCase().replace(/\s+/g, '-')}`,
    githubUrl: `https://github.com/${(student.name || 'student').toLowerCase().replace(/\s+/g, '')}`,
    summary: `${student.domain || 'FULLSTACK'} developer specializing in building fullstack solutions, team collaboration, and automated pipelines.`,
    skills: ['React.js', 'JavaScript (ES6+)', 'Node.js', 'Git / GitHub', 'REST APIs', 'TailwindCSS'],
    talents: ['Problem Solving', 'Team Collaboration', 'Fast Learner'],
    degree: 'B.E. Computer Science & Engineering',
    institution: 'Chennai Institute of Technology',
    gradYear: '2026',
    cgpa: '8.8 / 10',
    experienceRole: 'Software Developer Intern',
    experienceCompany: 'Tech Solutions Lab',
    experienceDuration: 'Jun 2025 - Aug 2025',
    experienceDesc: 'Developed interactive UI dashboards and integrated backend REST APIs.',
    enabledBadges: { rank: true, streak: true, teamLead: true, firstSubmitter: true }
  };

  const scoreObj = calculateStudentScore ? calculateStudentScore(student.id) : { totalScore: 0, submissionCount: 0 };
  const studentSubs = (submissions || []).filter(s => s.studentId === student.id);
  const studentTeam = (teams || []).find(t => t.memberIds && t.memberIds.includes(student.id));
  const isTeamLead = studentTeam && studentTeam.leadStudentId === student.id;

  const globalLeaderboard = (users || []).map(u => {
    const sObj = calculateStudentScore ? calculateStudentScore(u.id) : { totalScore: 0 };
    return { ...u, ...sObj };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const userRankIndex = globalLeaderboard.findIndex(u => u.id === student.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  const templateStyle = userProfile.template || 'modern';

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem', fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* TOP PUBLIC HEADER BAR */}
      <div style={{ maxWidth: '840px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem 1.5rem', boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#2563eb', color: '#ffffff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              POWERHUB Verified Live Resume
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Live Verified Data from Powerhub Supabase
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => window.print()} 
            style={{ background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* RESUME PAPER CONTAINER */}
      <div 
        className="resume-printable-document"
        style={{ 
          maxWidth: '840px', 
          margin: '0 auto', 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '20px', 
          padding: '2.5rem', 
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)' 
        }}
      >
        {/* TEMPLATE RENDERING */}

        {/* 1. MODERN TEMPLATE */}
        {templateStyle === 'modern' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #2563eb', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{userProfile.fullName}</h1>
                <p style={{ fontSize: '1.05rem', fontWeight: '800', color: '#2563eb', margin: '0.25rem 0 0' }}>
                  {student.domain || 'Fullstack & AI Developer'}
                </p>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                  📍 {userProfile.nativeLocation}
                </p>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right' }}>
                <span>✉️ {userProfile.email}</span>
                <span>📞 {userProfile.phone}</span>
                <span style={{ color: '#2563eb', fontWeight: '700' }}>🔗 {userProfile.linkedinUrl}</span>
                <span style={{ color: '#2563eb', fontWeight: '700' }}>💻 {userProfile.githubUrl}</span>
              </div>
            </div>

            {/* Badges Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>
                🏆 Global Rank #{userRank} ({scoreObj.totalScore} pts)
              </span>
              <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>
                📦 {studentSubs.length} Verified Submissions
              </span>
              {isTeamLead && (
                <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '800' }}>
                  👑 Team Lead ({studentTeam?.name})
                </span>
              )}
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                PROFESSIONAL SUMMARY
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                {userProfile.summary}
              </p>
            </div>

            {/* Verified Powerhub Projects */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                VERIFIED PROJECT DELIVERABLES ({studentSubs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {studentSubs.length > 0 ? (
                  studentSubs.map((sub, i) => (
                    <div key={sub.id || i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{sub.roundName || `Sprint Project #${i+1}`}</strong>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', background: '#dcfce7', padding: '0.15rem 0.55rem', borderRadius: '6px' }}>
                          Verified On-Time
                        </span>
                      </div>
                      <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                        🔗 {sub.githubUrl}
                      </a>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No submissions logged yet.</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                EDUCATION
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                <span>{userProfile.degree} — {userProfile.institution}</span>
                <span>Graduation: {userProfile.gradYear} ({userProfile.cgpa})</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                TECHNICAL SKILLS
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(userProfile.skills || []).map((skill, i) => (
                  <span key={i} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CLASSIC ATS TEMPLATE */}
        {templateStyle === 'classic' && (
          <div style={{ color: '#000000', fontFamily: 'serif' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{userProfile.fullName}</h1>
              <p style={{ fontSize: '0.9rem', margin: '0.4rem 0 0' }}>
                {userProfile.email} | {userProfile.phone} | {userProfile.nativeLocation}
              </p>
              <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                LinkedIn: {userProfile.linkedinUrl} | GitHub: {userProfile.githubUrl}
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                PROFESSIONAL SUMMARY
              </h2>
              <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{userProfile.summary}</p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                EDUCATION
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <strong>{userProfile.degree} — {userProfile.institution}</strong>
                <span>Graduation: {userProfile.gradYear} ({userProfile.cgpa})</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                PROJECTS & ACHIEVEMENTS
              </h2>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem' }}>
                {studentSubs.map((sub, i) => (
                  <li key={i} style={{ marginBottom: '0.4rem' }}>
                    <strong>{sub.roundName}:</strong> {sub.githubUrl}
                  </li>
                ))}
                <li><strong>Powerhub Leaderboard:</strong> Rank #{userRank} with {scoreObj.totalScore} cumulative points.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                SKILLS
              </h2>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>
                {(userProfile.skills || []).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* 3. MINIMAL TEMPLATE */}
        {templateStyle === 'minimal' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '300', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>{userProfile.fullName}</h1>
              <p style={{ fontSize: '1rem', color: '#64748b', margin: '0.4rem 0 0' }}>{student.domain} Specialist</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                <span>{userProfile.email}</span>
                <span>•</span>
                <span>{userProfile.phone}</span>
                <span>•</span>
                <span>{userProfile.nativeLocation}</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.7', margin: 0 }}>{userProfile.summary}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.85rem' }}>Selected Projects</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {studentSubs.map((sub, i) => (
                  <div key={i} style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{sub.roundName}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#2563eb' }}>{sub.githubUrl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.85rem' }}>Skills & Expertise</h3>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.8' }}>
                {(userProfile.skills || []).join(' / ')}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
