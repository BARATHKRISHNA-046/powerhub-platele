import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, Layers, Users, FileText, Plus, CheckCircle2, XCircle, Clock, 
  Search, Filter, Send, Award, Sparkles, UserPlus, Trash2, ArrowRight, Shield, ChevronRight, ChevronLeft, Image as ImageIcon
} from 'lucide-react';

export default function HackathonModule() {
  const { 
    currentUser, 
    currentRoleView,
    users, 
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
    resetSihHackathonData
  } = useApp();

  const isMentor = currentRoleView === 'mentor' || currentUser?.role === 'mentor' || currentUser?.email === 'barathkrishna046@gmail.com';

  // Active sub-tabs for Student (ps, team, submission) vs Mentor (manage_ps, all_teams, review, shortlisted)
  const [studentTab, setStudentTab] = useState('ps'); // 'ps' | 'team' | 'submission'
  const [mentorTab, setMentorTab] = useState('review'); // 'manage_ps' | 'all_teams' | 'review' | 'shortlisted'

  // Student Filters & Inputs
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedInviteStudentId, setSelectedInviteStudentId] = useState('');
  const [editingTeamRepoUrl, setEditingTeamRepoUrl] = useState({});

  // Carousel Ref & Scroll Handler
  const psCarouselRef = React.useRef(null);
  const scrollPsCarousel = (offset) => {
    if (psCarouselRef.current) {
      psCarouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Submission Form State (for Team Leader)
  const [solutionApproachInput, setSolutionApproachInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [expectedImpactInput, setExpectedImpactInput] = useState('');

  // Mentor Inputs & Editing States
  const [newPsTitle, setNewPsTitle] = useState('');
  const [newPsDesc, setNewPsDesc] = useState('');
  const [newPsCategory, setNewPsCategory] = useState('Software');
  const [newPsTags, setNewPsTags] = useState('Fullstack, AI');
  const [newPsBannerUrl, setNewPsBannerUrl] = useState('');
  const [mentorFeedbackText, setMentorFeedbackText] = useState({});
  const [teamStatusFilter, setTeamStatusFilter] = useState('ALL');

  // Mentor Edit PS Card Modal State
  const [editingPsId, setEditingPsId] = useState(null);
  const [editPsTitle, setEditPsTitle] = useState('');
  const [editPsDesc, setEditPsDesc] = useState('');
  const [editPsCategory, setEditPsCategory] = useState('Software');
  const [editPsTags, setEditPsTags] = useState('');
  const [editPsBanner, setEditPsBanner] = useState('');

  // Mentor Edit Team Directory Card State
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamPsId, setEditTeamPsId] = useState('');
  const [editTeamStatus, setEditTeamStatus] = useState('draft');

  // Mentor Edit Submission History Card State
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubFeedback, setEditSubFeedback] = useState('');
  const [editSubStatus, setEditSubStatus] = useState('shortlisted');

  // Derive Student Team Context
  const myTeamMemberRecord = teamMembers.find(m => m.studentId === currentUser?.id);
  const myTeam = myTeamMemberRecord ? hackathonTeams.find(t => t.id === myTeamMemberRecord.teamId) : null;
  const isTeamLeader = myTeam ? myTeam.createdBy === currentUser?.id : false;
  const myTeamMembers = myTeam ? teamMembers.filter(m => m.teamId === myTeam.id) : [];
  const myTeamSub = myTeam ? ideaSubmissions.find(s => s.teamId === myTeam.id) : null;
  const myChosenPS = myTeam && myTeam.problemStatementId ? problemStatements.find(p => p.id === myTeam.problemStatementId) : null;

  // Initialize submission inputs if existing submission exists
  React.useEffect(() => {
    if (myTeamSub) {
      setSolutionApproachInput(myTeamSub.solutionApproach || '');
      setTechStackInput(myTeamSub.techStack || '');
      setExpectedImpactInput(myTeamSub.expectedImpact || '');
    }
  }, [myTeamSub]);

  // Pending count for Mentor Badge
  const pendingCount = ideaSubmissions.filter(s => s.reviewStatus === 'pending').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'var(--font-sans)' }}>
      
      {/* HERO SECTION LANDING - HACK2SKILL PATTERN */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', 
        color: '#ffffff', 
        borderRadius: '24px', 
        padding: '2.5rem 2rem', 
        marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          
          <div style={{ maxWidth: '680px' }}>
            {/* ROLE TOGGLE PATTERN - PARTICIPATE VS HOST STYLE (NON-INTERACTIVE BADGE) */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '4px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '1rem',
              backdropFilter: 'blur(8px)'
            }}>
              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '900',
                background: !isMentor ? '#2563eb' : 'transparent',
                color: !isMentor ? '#ffffff' : '#94a3b8',
                transition: 'all 0.3s ease'
              }}>
                👤 Participant View
              </span>
              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '900',
                background: isMentor ? '#4f46e5' : 'transparent',
                color: isMentor ? '#ffffff' : '#94a3b8',
                transition: 'all 0.3s ease'
              }}>
                👨‍🏫 Host & Evaluator View
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Compete. Build. Innovate.
              </h1>
              <span style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                SIH Challenge 2026
              </span>
              {isSihLocked && (
                <span style={{ background: '#ef4444', color: '#ffffff', border: '1px solid #f87171', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '900' }}>
                  🔒 LOCKED BY MENTORS
                </span>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500', lineHeight: 1.5 }}>
              Solve industrial problem statements, assemble multidisciplinary engineering teams, submit architectural solution proposals, and get shortlisted by mentors.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.85rem' }}>
            {/* MENTOR CONTROLS: LOCK/UNLOCK + RESET ALL TEAMS */}
            {isMentor && (
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const newStatus = !isSihLocked;
                    toggleSihLock(newStatus);
                    alert(`SIH Hackathon Portal is now ${newStatus ? '🔒 LOCKED for all students' : '🟢 UNLOCKED for all students'}.`);
                  }}
                  style={{
                    background: isSihLocked ? '#16a34a' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1rem',
                    borderRadius: '14px',
                    fontSize: '0.82rem',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  {isSihLocked ? '🔓 Unlock SIH Portal' : '🔒 Lock SIH Portal'}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Delete ALL registered teams, team members, and idea submissions? (Resets all counters to 0)')) {
                      resetSihHackathonData();
                      alert('✅ All SIH Hackathon teams and submissions have been deleted. Registered Teams = 0, Submissions = 0.');
                    }
                  }}
                  style={{
                    background: '#991b1b',
                    color: '#ffffff',
                    border: '1px solid #fca5a5',
                    padding: '0.65rem 1rem',
                    borderRadius: '14px',
                    fontSize: '0.82rem',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 15px rgba(153,27,27,0.3)'
                  }}
                >
                  🧹 Delete All Teams & Reset (0)
                </button>
              </div>
            )}

            {/* LIVE COUNT HIGHLIGHT BADGE */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#38bdf8' }}>{hackathonTeams.length}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Teams Live</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', padding: '0.6rem 1rem', borderRadius: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f43f5e' }}>{problemStatements.length}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Statements</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* STATS STRIP (HACK2SKILL-STYLE CONTRASTING DARK BAND) */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: '#ffffff', 
        borderRadius: '20px', 
        padding: '1.25rem 1.75rem', 
        marginBottom: '1.5rem',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#60a5fa', fontFamily: 'var(--font-heading)' }}>
              {hackathonTeams.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registered Teams
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#34d399', fontFamily: 'var(--font-heading)' }}>
              {ideaSubmissions.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Submissions Received
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>
              {hackathonTeams.filter(t => t.status === 'shortlisted').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shortlisted Teams
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#c084fc', fontFamily: 'var(--font-heading)' }}>
              14 Days
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Until Grand Finale
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB NAVIGATION */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem', 
        background: '#ffffff', 
        padding: '0.5rem', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        overflowX: 'auto'
      }}>
        {!isMentor ? (
          <>
            <button
              onClick={() => setStudentTab('ps')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: studentTab === 'ps' ? '#2563eb' : 'transparent',
                color: studentTab === 'ps' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={16} />
              <span>Problem Statements</span>
            </button>

            <button
              onClick={() => setStudentTab('team')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: studentTab === 'team' ? '#2563eb' : 'transparent',
                color: studentTab === 'team' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={16} />
              <span>My Team {myTeam ? `(${myTeam.teamName})` : ''}</span>
            </button>

            <button
              onClick={() => setStudentTab('submission')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: studentTab === 'submission' ? '#2563eb' : 'transparent',
                color: studentTab === 'submission' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={16} />
              <span>My Submission</span>
              {myTeamSub && (
                <span style={{ 
                  fontSize: '0.68rem', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '9999px', 
                  background: myTeamSub.reviewStatus === 'shortlisted' ? '#dcfce7' : myTeamSub.reviewStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color: myTeamSub.reviewStatus === 'shortlisted' ? '#15803d' : myTeamSub.reviewStatus === 'rejected' ? '#b91c1c' : '#b45309',
                  fontWeight: '900'
                }}>
                  {myTeamSub.reviewStatus === 'shortlisted' ? '✓ Shortlisted' : myTeamSub.reviewStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setMentorTab('review')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: mentorTab === 'review' ? '#4f46e5' : 'transparent',
                color: mentorTab === 'review' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={16} />
              <span>Review Submissions</span>
              {pendingCount > 0 && (
                <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.7rem', fontWeight: '900', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMentorTab('manage_ps')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: mentorTab === 'manage_ps' ? '#4f46e5' : 'transparent',
                color: mentorTab === 'manage_ps' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={16} />
              <span>Manage Problem Statements</span>
            </button>

            <button
              onClick={() => setMentorTab('all_teams')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: mentorTab === 'all_teams' ? '#4f46e5' : 'transparent',
                color: mentorTab === 'all_teams' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={16} />
              <span>All Teams ({hackathonTeams.length})</span>
            </button>

            <button
              onClick={() => setMentorTab('shortlisted')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                background: mentorTab === 'shortlisted' ? '#4f46e5' : 'transparent',
                color: mentorTab === 'shortlisted' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Trophy size={16} />
              <span>Shortlisted Teams ({hackathonTeams.filter(t => t.status === 'shortlisted').length})</span>
            </button>
          </>
        )}
      </div>

      {/* =====================================================
          STUDENT VIEW CONTENTS
          ===================================================== */}
      {!isMentor && (
        <>
          {/* SIH LOCKED BANNER FOR STUDENTS */}
          {isSihLocked && (
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', 
              border: '2px solid #f87171', 
              borderRadius: '24px', 
              padding: '2.5rem 2rem', 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              boxShadow: '0 10px 25px rgba(225, 29, 72, 0.1)'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fecdd3', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
                🔒
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#9f1239', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                SIH Hackathon Portal Locked by Mentors
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#be123c', maxWidth: '600px', margin: '0 auto 1.25rem', lineHeight: 1.5, fontWeight: '600' }}>
                Mentors have temporarily locked the SIH Hackathon section for evaluations. Problem statement selection, team creation/modifications, and proposal submissions are disabled.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', color: '#9f1239', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', border: '1px solid #fda4af' }}>
                ⏳ Please check back when mentors unlock the portal to make updates.
              </div>
            </div>
          )}

          {/* SUB-TAB A: PROBLEM STATEMENTS */}
          {studentTab === 'ps' && (
            <div>
              {/* FILTERS BAR */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <Filter size={15} style={{ color: '#64748b' }} />
                    <select 
                      value={categoryFilter} 
                      onChange={e => setCategoryFilter(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', width: '260px' }}>
                    <Search size={15} style={{ color: '#64748b' }} />
                    <input 
                      type="text" 
                      placeholder="Search title or domain tags..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                  Showing {problemStatements.filter(p => p.status === 'active').length} Active Problem Statements
                </div>
              </div>

              {/* CAROUSEL HEADER & NAVIGATION BUTTONS */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Sparkles size={20} style={{ color: '#2563eb' }} />
                  Browse Challenge Cards ({problemStatements.filter(p => p.status === 'active').length})
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Use arrows or swipe to explore</span>
                  <button
                    onClick={() => scrollPsCarousel(-340)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                    title="Scroll Left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollPsCarousel(340)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                    title="Scroll Right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* HACK2SKILL-STYLE HORIZONTALLY SCROLLABLE CAROUSEL ROW */}
              <div 
                ref={psCarouselRef}
                style={{ 
                  display: 'flex', 
                  gap: '1.25rem', 
                  overflowX: 'auto', 
                  paddingBottom: '1.25rem',
                  paddingTop: '0.25rem',
                  scrollSnapType: 'x mandatory',
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {problemStatements
                  .filter(p => p.status === 'active')
                  .filter(p => categoryFilter === 'ALL' || p.category === categoryFilter)
                  .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.domain_tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map(ps => {
                    const isChosenByMyTeam = myTeam && myTeam.problemStatementId === ps.id;

                    return (
                      <div 
                        key={ps.id} 
                        style={{ 
                          minWidth: '310px', 
                          maxWidth: '320px', 
                          flexShrink: 0, 
                          scrollSnapAlign: 'start',
                          background: '#ffffff', 
                          border: isChosenByMyTeam ? '2.5px solid #2563eb' : '1.5px solid #cbd5e1', 
                          borderRadius: '20px', 
                          boxShadow: isChosenByMyTeam ? '0 8px 24px rgba(37,99,235,0.18)' : '0 4px 18px rgba(0,0,0,0.06)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          overflow: 'hidden',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {/* TOP BANNER */}
                        {ps.bannerUrl ? (
                          <div style={{ height: '140px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                            <img src={ps.bannerUrl} alt={ps.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                              <span style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900', backdropFilter: 'blur(4px)' }}>
                                FREE | VIRTUAL
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '130px', 
                            background: ps.category === 'Hardware' ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                            padding: '1rem', 
                            color: '#ffffff', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between' 
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ background: 'rgba(255,255,255,0.22)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900', backdropFilter: 'blur(4px)' }}>
                                FREE | VIRTUAL
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {ps.category}
                              </span>
                            </div>
                            <div style={{ fontWeight: '900', fontSize: '1rem', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {ps.title}
                            </div>
                          </div>
                        )}

                        {/* CARD BODY CONTENT */}
                        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            {/* TAG PILLS */}
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                              <span style={{ background: ps.category === 'Hardware' ? '#fff7ed' : '#eff6ff', color: ps.category === 'Hardware' ? '#c2410c' : '#1d4ed8', border: `1px solid ${ps.category === 'Hardware' ? '#ffedd5' : '#bfdbfe'}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                                {ps.category}
                              </span>
                              {ps.domain_tags.map((tag, idx) => (
                                <span key={idx} style={{ background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '700' }}>
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            {/* TITLE */}
                            <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.35, marginBottom: '0.45rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {ps.title}
                            </h4>

                            {/* DESCRIPTION */}
                            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {ps.description}
                            </p>
                          </div>

                          <div>
                            {/* DEADLINE TEXT */}
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                              <Clock size={13} style={{ color: '#2563eb' }} />
                              <span>Registration Ends on <b style={{ color: '#0f172a' }}>Aug 25, 2026</b></span>
                            </div>

                            {/* FULL-WIDTH CTA BUTTON */}
                            {isSihLocked ? (
                              <button 
                                disabled 
                                style={{ width: '100%', background: '#fff1f2', color: '#be123c', border: '1px solid #fca5a5', padding: '0.65rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'not-allowed' }}
                              >
                                🔒 Locked by Mentors
                              </button>
                            ) : isChosenByMyTeam ? (
                              <button 
                                onClick={() => {
                                  selectProblemStatementForTeam(myTeam.id, null);
                                  alert('Deselected Problem Statement for your team.');
                                }}
                                style={{ width: '100%', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.65rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'pointer' }}
                              >
                                Deselect for My Team
                              </button>
                            ) : !myTeam ? (
                              <button 
                                onClick={() => setStudentTab('team')}
                                style={{ width: '100%', background: '#f59e0b', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}
                              >
                                🚀 Create Team to Apply
                              </button>
                            ) : !isTeamLeader ? (
                              <button 
                                disabled 
                                style={{ width: '100%', background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '0.65rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'not-allowed' }}
                              >
                                Team Leader Selects
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  selectProblemStatementForTeam(myTeam.id, ps.id);
                                  alert(`Selected "${ps.title}" for ${myTeam.teamName}!`);
                                }}
                                style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}
                              >
                                ✓ Select for My Team
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SUB-TAB B: MY TEAM */}
          {studentTab === 'team' && (
            <div>
              {!myTeam ? (
                /* NO TEAM EMPTY STATE */
                <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '580px', margin: '1rem auto' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                    <Users size={32} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Create Your SIH Hackathon Team
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                    Creating a team makes you the <b>Team Leader</b> automatically. You will be able to invite teammates, select problem statements, and submit your team's architectural solution.
                  </p>

                  {isSihLocked ? (
                    <div style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fda4af', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '800' }}>
                      🔒 Team creation is currently locked by mentors.
                    </div>
                  ) : (
                    <form onSubmit={e => {
                      e.preventDefault();
                      if (!newTeamName.trim()) return;
                      createHackathonTeam(newTeamName.trim());
                      setNewTeamName('');
                      alert(`Team "${newTeamName.trim()}" created successfully! You are now the Team Leader.`);
                    }} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Enter Team Name (e.g. Team Neural Hackers)"
                        value={newTeamName}
                        onChange={e => setNewTeamName(e.target.value)}
                        required
                        style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', width: '280px', outline: 'none' }}
                      />
                      <button type="submit" className="btn-primary" style={{ background: '#2563eb', padding: '0.65rem 1.25rem' }}>
                        🚀 Create Team
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* HAS TEAM VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* TEAM HEADER CARD */}
                  <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '900' }}>
                        👥
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                            {myTeam.teamName}
                          </h2>
                          {isTeamLeader && (
                            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900' }}>
                              👑 Team Leader
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Created on {new Date(myTeam.createdAt).toLocaleDateString()} • {myTeamMembers.length} Members
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ 
                        background: myTeam.status === 'shortlisted' ? '#dcfce7' : myTeam.status === 'rejected' ? '#fee2e2' : myTeam.status === 'submitted' ? '#fef3c7' : '#f1f5f9',
                        color: myTeam.status === 'shortlisted' ? '#15803d' : myTeam.status === 'rejected' ? '#b91c1c' : myTeam.status === 'submitted' ? '#b45309' : '#475569',
                        border: `1px solid ${myTeam.status === 'shortlisted' ? '#86efac' : myTeam.status === 'rejected' ? '#fca5a5' : myTeam.status === 'submitted' ? '#fde68a' : '#cbd5e1'}`,
                        padding: '0.4rem 0.85rem',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        fontWeight: '900',
                        textTransform: 'uppercase'
                      }}>
                        Status: {myTeam.status === 'shortlisted' ? 'Shortlisted ✓' : myTeam.status === 'rejected' ? 'Not Shortlisted' : myTeam.status === 'submitted' ? 'Submitted - Pending Review' : 'Draft Mode'}
                      </span>
                    </div>
                  </div>

                  {/* CHOSEN PROBLEM STATEMENT CARD */}
                  <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.65rem' }}>
                      Team Chosen Problem Statement
                    </h3>

                    {myChosenPS ? (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                            {myChosenPS.category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>ID: {myChosenPS.id}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                          {myChosenPS.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                          {myChosenPS.description}
                        </p>
                      </div>
                    ) : (
                      <div style={{ padding: '1.25rem', background: '#fffbeb', border: '1px dashed #fde68a', borderRadius: '14px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: '700', margin: '0 0 0.5rem' }}>
                          ⚠️ No Problem Statement selected for your team yet.
                        </p>
                        {isTeamLeader && (
                          <button 
                            onClick={() => setStudentTab('ps')}
                            className="btn-primary" 
                            style={{ background: '#d97706', fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                          >
                            Browse Problem Statements →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* TEAM GITHUB REPOSITORY LINK CARD */}
                  <div className="card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <FolderGit2 size={22} style={{ color: '#2563eb' }} />
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                          Team GitHub Repository Link
                        </h3>
                      </div>

                      {myTeam.githubRepoUrl && (
                        <a 
                          href={myTeam.githubRepoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ background: '#0f172a', color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Github size={14} /> Open Repository ↗
                        </a>
                      )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.85rem', lineHeight: '1.45' }}>
                      All assigned team members can add or update your team's official GitHub project repository link. Mentors evaluate your code commit history directly from this link.
                    </p>

                    {/* REPO EDIT INPUT / SAVE BUTTON */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input 
                        type="url"
                        placeholder="https://github.com/your-org/your-repo-name"
                        value={editingTeamRepoUrl[myTeam.id] !== undefined ? editingTeamRepoUrl[myTeam.id] : (myTeam.githubRepoUrl || '')}
                        onChange={e => {
                          const val = e.target.value;
                          setEditingTeamRepoUrl(prev => ({ ...prev, [myTeam.id]: val }));
                        }}
                        style={{ flex: 1, minWidth: '260px', padding: '0.55rem 0.85rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}
                      />

                      <button
                        onClick={() => {
                          const urlToSave = editingTeamRepoUrl[myTeam.id] !== undefined ? editingTeamRepoUrl[myTeam.id] : (myTeam.githubRepoUrl || '');
                          if (!urlToSave.trim()) {
                            alert('Please enter a valid GitHub repository URL.');
                            return;
                          }
                          updateHackathonTeam(myTeam.id, { githubRepoUrl: urlToSave.trim() });
                          alert('✅ Team GitHub repository link saved successfully!');
                        }}
                        style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Save size={14} /> Save Repo Link
                      </button>
                    </div>
                  </div>

                  {/* TEAM MEMBERS ROSTER */}
                  <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Team Roster & Members ({myTeamMembers.length})
                      </h3>

                      {/* INVITE MEMBER CONTROL (LEADER ONLY) */}
                      {isTeamLeader && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <select 
                            value={selectedInviteStudentId}
                            onChange={e => setSelectedInviteStudentId(e.target.value)}
                            style={{ padding: '0.4rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '700' }}
                          >
                            <option value="">Select Platform Student to Invite...</option>
                            {users
                              .filter(u => u.roles?.includes('student') && !myTeamMembers.some(m => m.studentId === u.id))
                              .map(u => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.email}) - {u.domain || 'Engineering'}
                                </option>
                              ))}
                          </select>

                          <button 
                            onClick={() => {
                              if (!selectedInviteStudentId) return;
                              inviteTeamMember(myTeam.id, selectedInviteStudentId);
                              setSelectedInviteStudentId('');
                              alert('Teammate added to your team!');
                            }}
                            className="btn-primary"
                            style={{ background: '#2563eb', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            <UserPlus size={14} /> Add Member
                          </button>
                        </div>
                      )}
                    </div>

                    {/* MEMBERS LIST */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}>
                      {myTeamMembers.map(m => {
                        const studentUser = users.find(u => u.id === m.studentId) || { name: 'Student Member', email: 'student@powerhub.dev', domain: 'Engineering' };
                        const isLeader = m.studentId === myTeam.createdBy;

                        return (
                          <div key={m.id} style={{ padding: '0.9rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isLeader ? '#fef3c7' : '#e0e7ff', color: isLeader ? '#b45309' : '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                                {studentUser.name.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span>{studentUser.name}</span>
                                  {isLeader && <span style={{ fontSize: '0.7rem' }}>👑</span>}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{studentUser.email}</span>
                              </div>
                            </div>

                            {isTeamLeader && !isLeader && (
                              <button 
                                onClick={() => {
                                  if (confirm(`Remove ${studentUser.name} from team?`)) {
                                    removeTeamMember(myTeam.id, m.studentId);
                                  }
                                }}
                                style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                                title="Remove Member"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB C: MY SUBMISSION */}
          {studentTab === 'submission' && (
            <div>
              {!myTeam || !myChosenPS ? (
                <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', maxWidth: '520px', margin: '1rem auto' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                    Select a Problem Statement First
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    Your team must pick an active Problem Statement before submitting your solution proposal.
                  </p>
                  <button onClick={() => setStudentTab('ps')} className="btn-primary" style={{ background: '#2563eb' }}>
                    Browse Problem Statements →
                  </button>
                </div>
              ) : (
                <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.75rem' }}>
                  
                  {/* POLISHED STEPPER STATUS TRACKER (HACK2SKILL PATTERN) */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Award size={18} style={{ color: '#2563eb' }} />
                      Live Proposal Status Stepper
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', width: '100%', padding: '0 0.5rem' }}>
                      
                      {/* STEP 1: APPLIED */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginTop: '0.45rem' }}>1. Proposal Saved</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Team Drafted</span>
                      </div>

                      {/* CONNECTOR LINE 1 */}
                      <div style={{ flex: 1, height: '4px', background: myTeamSub ? '#16a34a' : '#cbd5e1', margin: '0 -0.5rem', marginTop: '-1.4rem', borderRadius: '2px', transition: 'all 0.3s ease' }} />

                      {/* STEP 2: UNDER REVIEW */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                        <div style={{ 
                          width: '38px', 
                          height: '38px', 
                          borderRadius: '50%', 
                          background: myTeamSub ? (myTeamSub.reviewStatus === 'shortlisted' ? '#16a34a' : myTeamSub.reviewStatus === 'rejected' ? '#dc2626' : '#2563eb') : '#cbd5e1', 
                          color: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: '900', 
                          fontSize: '0.95rem',
                          boxShadow: myTeamSub?.reviewStatus === 'pending' ? '0 0 0 4px rgba(37,99,235,0.25)' : 'none'
                        }}>
                          {myTeamSub?.reviewStatus === 'shortlisted' ? '✓' : myTeamSub?.reviewStatus === 'rejected' ? '❌' : '2'}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginTop: '0.45rem' }}>2. Mentor Review</span>
                        <span style={{ fontSize: '0.72rem', color: myTeamSub ? (myTeamSub.reviewStatus === 'shortlisted' ? '#16a34a' : myTeamSub.reviewStatus === 'rejected' ? '#dc2626' : '#2563eb') : '#64748b', fontWeight: '700' }}>
                          {myTeamSub ? (myTeamSub.reviewStatus === 'shortlisted' ? 'Passed Review' : myTeamSub.reviewStatus === 'rejected' ? 'Not Shortlisted' : 'Under Review') : 'Awaiting Submission'}
                        </span>
                      </div>

                      {/* CONNECTOR LINE 2 */}
                      <div style={{ flex: 1, height: '4px', background: myTeamSub?.reviewStatus === 'shortlisted' ? '#16a34a' : '#cbd5e1', margin: '0 -0.5rem', marginTop: '-1.4rem', borderRadius: '2px', transition: 'all 0.3s ease' }} />

                      {/* STEP 3: SHORTLISTED */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                        <div style={{ 
                          width: '38px', 
                          height: '38px', 
                          borderRadius: '50%', 
                          background: myTeamSub?.reviewStatus === 'shortlisted' ? '#16a34a' : '#cbd5e1', 
                          color: '#ffffff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: '900', 
                          fontSize: '0.95rem' 
                        }}>
                          {myTeamSub?.reviewStatus === 'shortlisted' ? '✓' : '3'}
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginTop: '0.45rem' }}>3. Shortlisted</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Final Selection</span>
                      </div>

                      {/* CONNECTOR LINE 3 */}
                      <div style={{ flex: 1, height: '4px', background: '#cbd5e1', margin: '0 -0.5rem', marginTop: '-1.4rem', borderRadius: '2px' }} />

                      {/* STEP 4: GRAND FINALE */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#cbd5e1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.95rem' }}>
                          🏆
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginTop: '0.45rem' }}>4. Grand Finale</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Aug 25 Results</span>
                      </div>

                    </div>
                  </div>

                  {/* STATUS BANNER */}
                  {myTeamSub && (
                    <div style={{ 
                      padding: '1rem 1.25rem', 
                      borderRadius: '16px', 
                      marginBottom: '1.5rem',
                      background: myTeamSub.reviewStatus === 'shortlisted' ? '#f0fdf4' : myTeamSub.reviewStatus === 'rejected' ? '#fef2f2' : '#fffbeb',
                      border: `1.5px solid ${myTeamSub.reviewStatus === 'shortlisted' ? '#bbf7d0' : myTeamSub.reviewStatus === 'rejected' ? '#fecaca' : '#fde68a'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {myTeamSub.reviewStatus === 'shortlisted' ? '🏆' : myTeamSub.reviewStatus === 'rejected' ? '❌' : '⏳'}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '900', margin: 0, color: myTeamSub.reviewStatus === 'shortlisted' ? '#166534' : myTeamSub.reviewStatus === 'rejected' ? '#991b1b' : '#92400e' }}>
                          {myTeamSub.reviewStatus === 'shortlisted' ? 'Congratulations! Team Idea Shortlisted ✓' : myTeamSub.reviewStatus === 'rejected' ? 'Submission Reviewed: Not Shortlisted' : 'Idea Submitted — Pending Mentor Review'}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.82rem', margin: 0, color: myTeamSub.reviewStatus === 'shortlisted' ? '#15803d' : myTeamSub.reviewStatus === 'rejected' ? '#b91c1c' : '#b45309' }}>
                        {myTeamSub.reviewStatus === 'shortlisted' ? 'Your team proposal has passed single-stage shortlisting evaluation by mentors.' : myTeamSub.reviewStatus === 'rejected' ? 'Mentors have reviewed your proposal. See feedback below.' : 'Mentors will review your solution architecture and tech stack submission.'}
                      </p>

                      {/* MENTOR FEEDBACK DISPLAY */}
                      {myTeamSub.mentorFeedback && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(0,0,0,0.1)', fontSize: '0.82rem' }}>
                          <strong>💬 Mentor Feedback:</strong> "{myTeamSub.mentorFeedback}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORM HEADER */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                        SIH Idea Proposal Submission
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Team: <b>{myTeam.teamName}</b> • Problem Statement: <b>{myChosenPS.title}</b>
                      </span>
                    </div>
                    {!isTeamLeader && (
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>
                        👁 Read-Only Mode (Member View)
                      </span>
                    )}
                  </div>

                  {/* SUBMISSION FORM */}
                  <form onSubmit={e => {
                    e.preventDefault();
                    if (!isTeamLeader) return;
                    if (myTeamSub && (myTeamSub.reviewStatus === 'shortlisted' || myTeamSub.reviewStatus === 'rejected')) {
                      alert('Submission is finalized and cannot be edited after decision.');
                      return;
                    }

                    submitIdeaSubmission(
                      myTeam.id,
                      myChosenPS.id,
                      solutionApproachInput,
                      techStackInput,
                      expectedImpactInput
                    );
                    alert('🚀 SIH Idea Submission submitted successfully! Status updated to Pending Mentor Review.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* SOLUTION APPROACH */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem' }}>
                        1. Proposed Solution Approach & System Architecture *
                      </label>
                      <textarea
                        rows="4"
                        value={solutionApproachInput}
                        onChange={e => setSolutionApproachInput(e.target.value)}
                        disabled={isSihLocked || !isTeamLeader || (myTeamSub && myTeamSub.reviewStatus !== 'pending' && myTeamSub.reviewStatus !== undefined)}
                        placeholder="Describe technical implementation strategy, data pipeline flow, and edge/cloud modules..."
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: (isSihLocked || !isTeamLeader) ? '#f8fafc' : '#ffffff' }}
                      />
                    </div>

                    {/* TECH STACK */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem' }}>
                        2. Technology Stack & Frameworks *
                      </label>
                      <textarea
                        rows="3"
                        value={techStackInput}
                        onChange={e => setTechStackInput(e.target.value)}
                        disabled={isSihLocked || !isTeamLeader || (myTeamSub && myTeamSub.reviewStatus !== 'pending' && myTeamSub.reviewStatus !== undefined)}
                        placeholder="List frameworks, DBs, models (e.g. React, Node.js, Supabase, PyTorch, MQTT)..."
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: (isSihLocked || !isTeamLeader) ? '#f8fafc' : '#ffffff' }}
                      />
                    </div>

                    {/* EXPECTED IMPACT */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.4rem' }}>
                        3. Expected Industrial Impact & ROI Metrics *
                      </label>
                      <textarea
                        rows="3"
                        value={expectedImpactInput}
                        onChange={e => setExpectedImpactInput(e.target.value)}
                        disabled={isSihLocked || !isTeamLeader || (myTeamSub && myTeamSub.reviewStatus !== 'pending' && myTeamSub.reviewStatus !== undefined)}
                        placeholder="Describe quantitative impact, efficiency gains, and deployment scalability..."
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: (isSihLocked || !isTeamLeader) ? '#f8fafc' : '#ffffff' }}
                      />
                    </div>

                    {/* SUBMIT BUTTON (TEAM LEADER ONLY) */}
                    {isTeamLeader && (!myTeamSub || myTeamSub.reviewStatus === 'pending') && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        {isSihLocked ? (
                          <button disabled style={{ background: '#fff1f2', color: '#be123c', border: '1px solid #fda4af', padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '800', cursor: 'not-allowed' }}>
                            🔒 Proposal Submissions Locked by Mentors
                          </button>
                        ) : (
                          <button type="submit" className="btn-primary" style={{ background: '#2563eb', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
                            <Send size={16} /> {myTeamSub ? '💾 Update Pending Submission' : '🚀 Submit Idea Proposal'}
                          </button>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* =====================================================
          MENTOR VIEW CONTENTS
          ===================================================== */}
      {isMentor && (
        <>
          {/* SUB-TAB A: MANAGE PROBLEM STATEMENTS */}
          {mentorTab === 'manage_ps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* CREATE PS FORM */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Plus size={20} style={{ color: '#4f46e5' }} /> Publish New SIH Problem Statement
                </h3>

                <form onSubmit={e => {
                  e.preventDefault();
                  if (!newPsTitle.trim() || !newPsDesc.trim()) return;
                  createProblemStatement(newPsTitle.trim(), newPsDesc.trim(), newPsCategory, newPsTags, newPsBannerUrl.trim());
                  setNewPsTitle('');
                  setNewPsDesc('');
                  setNewPsBannerUrl('');
                  alert('Published new SIH Problem Statement!');
                }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                        Title *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. AI-Powered Autonomous Energy Optimization Engine"
                        value={newPsTitle}
                        onChange={e => setNewPsTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                        Category *
                      </label>
                      <select 
                        value={newPsCategory}
                        onChange={e => setNewPsCategory(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700' }}
                      >
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                      Domain Tags (Comma Separated) *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Fullstack, AI, Edge AI, IoT"
                      value={newPsTags}
                      onChange={e => setNewPsTags(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                      Banner Image URL (Optional)
                    </label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://images.unsplash.com/photo-1518770660439-4636190af475 or leave empty for auto gradient banner"
                      value={newPsBannerUrl}
                      onChange={e => setNewPsBannerUrl(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                      Detailed Problem Description & Challenge Requirements *
                    </label>
                    <textarea 
                      rows="3"
                      placeholder="Explain problem context, target objectives, technical constraints..."
                      value={newPsDesc}
                      onChange={e => setNewPsDesc(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ background: '#4f46e5' }}>
                      + Publish Problem Statement
                    </button>
                  </div>
                </form>
              </div>

              {/* LIST OF PS */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                  All Problem Statements ({problemStatements.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {problemStatements.map(ps => {
                    const isEditingThisPs = editingPsId === ps.id;

                    return (
                      <div key={ps.id} style={{ padding: '1.1rem 1.25rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px' }}>
                        {isEditingThisPs ? (
                          /* MENTOR INLINE EDIT FORM FOR PROBLEM STATEMENT CARD */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '0.75rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Title</label>
                                <input type="text" value={editPsTitle} onChange={e => setEditPsTitle(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Category</label>
                                <select value={editPsCategory} onChange={e => setEditPsCategory(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '700' }}>
                                  <option value="Software">Software</option>
                                  <option value="Hardware">Hardware</option>
                                </select>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Domain Tags (Comma Separated)</label>
                                <input type="text" value={editPsTags} onChange={e => setEditPsTags(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Banner Image URL</label>
                                <input type="url" value={editPsBanner} onChange={e => setEditPsBanner(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Problem Description</label>
                              <textarea rows="2" value={editPsDesc} onChange={e => setEditPsDesc(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                              <button onClick={() => setEditingPsId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                              <button 
                                onClick={() => {
                                  const tagsArray = editPsTags.split(',').map(t => t.trim()).filter(Boolean);
                                  updateProblemStatement(ps.id, {
                                    title: editPsTitle,
                                    description: editPsDesc,
                                    category: editPsCategory,
                                    domain_tags: tagsArray,
                                    bannerUrl: editPsBanner
                                  });
                                  setEditingPsId(null);
                                  alert('✅ Problem Statement card updated!');
                                }} 
                                style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* DISPLAY VIEW */
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800' }}>
                                  {ps.category}
                                </span>
                                <span style={{ background: ps.status === 'active' ? '#dcfce7' : '#fee2e2', color: ps.status === 'active' ? '#15803d' : '#b91c1c', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                  {ps.status}
                                </span>
                                {ps.domain_tags && ps.domain_tags.map((t, idx) => (
                                  <span key={idx} style={{ background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '700' }}>
                                    #{t}
                                  </span>
                                ))}
                              </div>
                              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' }}>
                                {ps.title}
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                {ps.description}
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                onClick={() => {
                                  setEditingPsId(ps.id);
                                  setEditPsTitle(ps.title);
                                  setEditPsDesc(ps.description);
                                  setEditPsCategory(ps.category);
                                  setEditPsTags(ps.domain_tags ? ps.domain_tags.join(', ') : '');
                                  setEditPsBanner(ps.bannerUrl || '');
                                }}
                                style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                ✏️ Edit Card
                              </button>

                              <button
                                onClick={() => {
                                  const newStatus = ps.status === 'active' ? 'closed' : 'active';
                                  updateProblemStatement(ps.id, { status: newStatus });
                                }}
                                style={{ background: ps.status === 'active' ? '#fff7ed' : '#dcfce7', color: ps.status === 'active' ? '#c2410c' : '#15803d', border: '1px solid #fed7aa', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                {ps.status === 'active' ? 'Close Statement' : 'Reactivate'}
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete problem statement "${ps.title}" permanently?`)) {
                                    deleteProblemStatement(ps.id);
                                    alert(`Deleted problem statement "${ps.title}".`);
                                  }
                                }}
                                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB B: ALL TEAMS DIRECTORY */}
          {mentorTab === 'all_teams' && (
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  Hackathon Teams Directory ({hackathonTeams.length})
                </h3>

                <select 
                  value={teamStatusFilter}
                  onChange={e => setTeamStatusFilter(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '700' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Team Name</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Team Leader</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Members</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Chosen PS</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>GitHub Repo</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hackathonTeams
                      .filter(t => teamStatusFilter === 'ALL' || t.status === teamStatusFilter)
                      .map(t => {
                        const leader = users.find(u => u.id === t.createdBy) || { name: 'Student Leader' };
                        const members = teamMembers.filter(m => m.teamId === t.id);
                        const ps = problemStatements.find(p => p.id === t.problemStatementId);
                        const isEditingThisTeam = editingTeamId === t.id;

                        if (isEditingThisTeam) {
                          return (
                            <tr key={t.id} style={{ background: '#fffbe6', borderBottom: '1px solid #ffe58f' }}>
                              <td style={{ padding: '0.65rem 1rem' }}>
                                <input type="text" value={editTeamName} onChange={e => setEditTeamName(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: '800' }} />
                              </td>
                              <td style={{ padding: '0.65rem 1rem', fontWeight: '700', color: '#2563eb' }}>👑 {leader.name}</td>
                              <td style={{ padding: '0.65rem 1rem' }}>{members.length} Members</td>
                              <td style={{ padding: '0.65rem 1rem' }}>
                                <select value={editTeamPsId} onChange={e => setEditTeamPsId(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
                                  <option value="">Not Selected</option>
                                  {problemStatements.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: '0.65rem 1rem' }}>
                                <input 
                                  type="url" 
                                  placeholder="https://github.com/..."
                                  value={editingTeamRepoUrl[t.id] !== undefined ? editingTeamRepoUrl[t.id] : (t.githubRepoUrl || '')}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setEditingTeamRepoUrl(prev => ({ ...prev, [t.id]: val }));
                                  }}
                                  style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', width: '160px' }} 
                                />
                              </td>
                              <td style={{ padding: '0.65rem 1rem' }}>
                                <select value={editTeamStatus} onChange={e => setEditTeamStatus(e.target.value)} style={{ padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: '800' }}>
                                  <option value="draft">draft</option>
                                  <option value="submitted">submitted</option>
                                  <option value="shortlisted">shortlisted</option>
                                  <option value="rejected">rejected</option>
                                </select>
                              </td>
                              <td style={{ padding: '0.65rem 1rem' }}>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <button onClick={() => setEditingTeamId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.3rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                  <button 
                                    onClick={() => {
                                      const repoToSave = editingTeamRepoUrl[t.id] !== undefined ? editingTeamRepoUrl[t.id] : (t.githubRepoUrl || '');
                                      updateHackathonTeam(t.id, {
                                        teamName: editTeamName,
                                        problemStatementId: editTeamPsId || null,
                                        status: editTeamStatus,
                                        githubRepoUrl: repoToSave.trim()
                                      });
                                      setEditingTeamId(null);
                                      alert(`✅ Team "${editTeamName}" updated!`);
                                    }} 
                                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                                  >
                                    Save
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#0f172a' }}>{t.teamName}</td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#2563eb' }}>👑 {leader.name}</td>
                            <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{members.length} Members</td>
                            <td style={{ padding: '0.85rem 1rem', color: '#334155', maxWidth: '240px' }}>{ps ? ps.title : 'Not Selected'}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {t.githubRepoUrl ? (
                                <a 
                                  href={t.githubRepoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ background: '#0f172a', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <Github size={12} /> Repo ↗
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>Not Added</span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ 
                                background: t.status === 'shortlisted' ? '#dcfce7' : t.status === 'rejected' ? '#fee2e2' : t.status === 'submitted' ? '#fef3c7' : '#f1f5f9',
                                color: t.status === 'shortlisted' ? '#15803d' : t.status === 'rejected' ? '#b91c1c' : t.status === 'submitted' ? '#b45309' : '#475569',
                                padding: '0.2rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase'
                              }}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <button
                                onClick={() => {
                                  setEditingTeamId(t.id);
                                  setEditTeamName(t.teamName);
                                  setEditTeamPsId(t.problemStatementId || '');
                                  setEditTeamStatus(t.status);
                                }}
                                style={{ background: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                ✏️ Edit Team
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB C: REVIEW SUBMISSIONS */}
          {mentorTab === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* PENDING SUBMISSIONS QUEUE */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} style={{ color: '#f59e0b' }} /> Pending Submissions Queue ({pendingCount})
                </h3>

                {pendingCount === 0 ? (
                  <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                    ✅ All submitted idea proposals have been reviewed and evaluated!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {ideaSubmissions
                      .filter(s => s.reviewStatus === 'pending')
                      .map(sub => {
                        const team = hackathonTeams.find(t => t.id === sub.teamId) || { teamName: 'Hackathon Team' };
                        const leader = users.find(u => u.id === team.createdBy) || { name: 'Team Leader' };
                        const ps = problemStatements.find(p => p.id === sub.problemStatementId) || { title: 'Problem Statement' };

                        return (
                          <div key={sub.id} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '1.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
                              <div>
                                <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                                  {team.teamName} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>(Leader: {leader.name})</span>
                                </h4>
                                <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '800' }}>
                                  Target PS: {ps.title}
                                </span>
                                {team.githubRepoUrl && (
                                  <div style={{ marginTop: '0.35rem' }}>
                                    <a 
                                      href={team.githubRepoUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      style={{ background: '#0f172a', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                      <Github size={12} /> Team Code Repo ↗
                                    </a>
                                  </div>
                                )}
                              </div>

                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                                Submitted: {new Date(sub.submittedAt).toLocaleString()}
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#334155', marginBottom: '1.25rem' }}>
                              <div>
                                <strong style={{ color: '#0f172a' }}>Solution Approach & Architecture:</strong>
                                <p style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0.25rem 0 0' }}>{sub.solutionApproach}</p>
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a' }}>Tech Stack:</strong>
                                <p style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0.25rem 0 0' }}>{sub.techStack}</p>
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a' }}>Expected Impact:</strong>
                                <p style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0.25rem 0 0' }}>{sub.expectedImpact}</p>
                              </div>
                            </div>

                            {/* MENTOR EVALUATION FORM */}
                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem' }}>
                              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                                Mentor Evaluation Feedback & Guidance *
                              </label>
                              <input 
                                type="text"
                                placeholder="Write feedback, recommendations, or approval rationale..."
                                value={mentorFeedbackText[sub.id] || ''}
                                onChange={e => {
                                  const text = e.target.value;
                                  setMentorFeedbackText(prev => ({ ...prev, [sub.id]: text }));
                                }}
                                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginBottom: '0.85rem' }}
                              />

                              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => {
                                    reviewIdeaSubmission(sub.id, 'rejected', mentorFeedbackText[sub.id]);
                                    alert(`Rejected submission for ${team.teamName}`);
                                  }}
                                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                                >
                                  ❌ Reject Submission
                                </button>

                                <button 
                                  onClick={() => {
                                    reviewIdeaSubmission(sub.id, 'shortlisted', mentorFeedbackText[sub.id]);
                                    alert(`🏆 Shortlisted ${team.teamName}!`);
                                  }}
                                  style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.45rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 10px rgba(22,163,74,0.2)' }}
                                >
                                  ✓ Shortlist Team
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* REVIEWED SUBMISSIONS HISTORY WITH EDITABLE RE-EVALUATION */}
              <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                  Reviewed Submissions History ({ideaSubmissions.filter(s => s.reviewStatus !== 'pending').length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {ideaSubmissions
                    .filter(s => s.reviewStatus !== 'pending')
                    .map(sub => {
                      const team = hackathonTeams.find(t => t.id === sub.teamId) || { teamName: 'Hackathon Team' };
                      const isShort = sub.reviewStatus === 'shortlisted';
                      const isEditingThisSub = editingSubId === sub.id;

                      return (
                        <div key={sub.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                          {isEditingThisSub ? (
                            /* INLINE RE-EVALUATION FORM FOR MENTOR */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>
                                Editing Evaluation for {team.teamName}
                              </div>
                              <input 
                                type="text"
                                value={editSubFeedback}
                                onChange={e => setEditSubFeedback(e.target.value)}
                                placeholder="Update feedback or guidance rationale..."
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                              />

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <select 
                                  value={editSubStatus} 
                                  onChange={e => setEditSubStatus(e.target.value)}
                                  style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: '800' }}
                                >
                                  <option value="shortlisted">🏆 Shortlisted</option>
                                  <option value="rejected">❌ Rejected</option>
                                </select>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button onClick={() => setEditingSubId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                  <button 
                                    onClick={() => {
                                      reviewIdeaSubmission(sub.id, editSubStatus, editSubFeedback);
                                      setEditingSubId(null);
                                      alert(`✅ Updated evaluation decision for ${team.teamName}!`);
                                    }}
                                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                                  >
                                    Save Decision
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* DISPLAY VIEW */
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{team.teamName}</span>
                                <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.5rem' }}>Feedback: "{sub.mentorFeedback || 'No feedback text'}"</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <span style={{ 
                                  background: isShort ? '#dcfce7' : '#fee2e2', 
                                  color: isShort ? '#15803d' : '#b91c1c', 
                                  border: `1px solid ${isShort ? '#86efac' : '#fca5a5'}`, 
                                  padding: '0.2rem 0.65rem', 
                                  borderRadius: '8px', 
                                  fontSize: '0.72rem', 
                                  fontWeight: '800', 
                                  textTransform: 'uppercase' 
                                }}>
                                  {isShort ? '✓ Shortlisted' : 'Rejected'}
                                </span>

                                <button
                                  onClick={() => {
                                    setEditingSubId(sub.id);
                                    setEditSubFeedback(sub.mentorFeedback || '');
                                    setEditSubStatus(sub.reviewStatus || 'shortlisted');
                                  }}
                                  style={{ background: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                                >
                                  ✏️ Re-evaluate
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB D: SHORTLISTED TEAMS */}
          {mentorTab === 'shortlisted' && (
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={24} style={{ color: '#f59e0b' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                    Final Shortlisted Teams Directory
                  </h3>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '900' }}>
                  Single-Stage Final Selection ({hackathonTeams.filter(t => t.status === 'shortlisted').length} Teams)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {hackathonTeams
                  .filter(t => t.status === 'shortlisted')
                  .map(team => {
                    const leader = users.find(u => u.id === team.createdBy) || { name: 'Leader' };
                    const members = teamMembers.filter(m => m.teamId === team.id);
                    const ps = problemStatements.find(p => p.id === team.problemStatementId) || { title: 'Problem Statement' };
                    const sub = ideaSubmissions.find(s => s.teamId === team.id);

                    return (
                      <div key={team.id} style={{ background: 'linear-gradient(135deg, #ffffff, #f0fdf4)', border: '2px solid #86efac', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ background: '#16a34a', color: '#ffffff', padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900' }}>
                              🏆 SHORTLISTED WINNER
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: '700' }}>
                              {members.length} Members
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.25rem' }}>
                            {team.teamName}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '800', marginBottom: '0.75rem' }}>
                            👑 Leader: {leader.name}
                          </div>

                          <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                            <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>Problem Statement:</div>
                            <div style={{ color: '#475569' }}>{ps.title}</div>
                          </div>

                          {team.githubRepoUrl && (
                            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.6rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                              <a 
                                href={team.githubRepoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ background: '#0f172a', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Github size={12} /> Project GitHub Repo ↗
                              </a>
                            </div>
                          )}

                          {sub && sub.mentorFeedback && (
                            <div style={{ fontSize: '0.78rem', color: '#166534', fontStyle: 'italic', background: '#f0fdf4', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                              💬 Mentor: "{sub.mentorFeedback}"
                            </div>
                          )}
                        </div>

                        {/* MENTOR QUICK ACTIONS ON SHORTLISTED CARDS */}
                        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #bbf7d0', paddingTop: '0.75rem' }}>
                          <button
                            onClick={() => {
                              if (sub) {
                                setEditingSubId(sub.id);
                                setEditSubFeedback(sub.mentorFeedback || '');
                                setEditSubStatus('shortlisted');
                                setMentorTab('review');
                              }
                            }}
                            style={{ flex: 1, background: '#ffffff', color: '#15803d', border: '1px solid #86efac', padding: '0.4rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            ✏️ Edit Feedback
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Revoke shortlisted status for ${team.teamName}?`)) {
                                updateHackathonTeam(team.id, { status: 'submitted' });
                                if (sub) {
                                  reviewIdeaSubmission(sub.id, 'pending', 'Shortlisted status revoked for re-evaluation.');
                                }
                                alert(`Revoked shortlisted status for ${team.teamName}. Returned to Pending Review queue.`);
                              }
                            }}
                            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            ❌ Revoke
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
