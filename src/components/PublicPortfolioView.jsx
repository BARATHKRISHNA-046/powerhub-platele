import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, Github, Linkedin, Mail, MapPin, ExternalLink, Globe, Code, 
  ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Lock, Edit3, Save, X, 
  Terminal, Cpu, Briefcase, GraduationCap, Wrench, Send, Layers, Sparkles
} from 'lucide-react';

export default function PublicPortfolioView({ username }) {
  const { 
    currentUser, 
    users, 
    submissions, 
    teams, 
    calculateStudentScore, 
    resumeProfiles, 
    certificates,
    updateResumeProfile,
    updateSubmissionDetails
  } = useApp();

  const [targetUser, setTargetUser] = useState(null);

  // Edit Mode state for owner
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [taglineInput, setTaglineInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [instagramInput, setInstagramInput] = useState('');

  // Editing individual project card state
  const [editingSubId, setEditingSubId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDemoLink, setEditDemoLink] = useState('');

  useEffect(() => {
    if (username && users && users.length > 0) {
      const found = users.find(u => 
        u.id === username || 
        u.name?.toLowerCase().replace(/\s+/g, '') === username.toLowerCase() ||
        u.email?.split('@')[0]?.toLowerCase() === username.toLowerCase()
      );
      if (found) {
        setTargetUser(found);
      } else {
        setTargetUser(users[0]);
      }
    } else if (currentUser) {
      setTargetUser(currentUser);
    }
  }, [username, users, currentUser]);

  const student = targetUser || currentUser || (users && users[0]) || { name: 'Powerhub Engineer', id: 'student-demo' };
  const userProfile = (resumeProfiles && resumeProfiles[student.id]) || {};

  // Check if current logged-in user is owner of this portfolio
  const isOwner = currentUser && (currentUser.id === student.id || currentUser.email === student.email);

  const isPublic = userProfile.isPortfolioPublic !== false;

  useEffect(() => {
    if (userProfile) {
      setBioInput(userProfile.summary || student.bio || 'Full stack developer with strong frontend knowledge');
      setTaglineInput(userProfile.headline || `${student.domain || 'Fullstack & AI'} Engineer`);
      setGithubInput(userProfile.githubUrl || '');
      setLinkedinInput(userProfile.linkedinUrl || '');
      setInstagramInput(userProfile.instagramUrl || '');
    }
  }, [userProfile, student]);

  const scoreObj = calculateStudentScore ? calculateStudentScore(student.id) : { totalScore: 0, submissionCount: 0 };

  // AUTO-PULL ALL SUBMISSIONS made by this student from submissions table
  const studentSubs = (submissions || []).filter(s => s.studentId === student.id || s.student_id === student.id);
  const studentCerts = (certificates || []).filter(c => c.student_id === student.id || c.studentId === student.id);
  const studentTeam = (teams || []).find(t => t.memberIds && t.memberIds.includes(student.id));

  // Tech stack mapping based on domain
  const getTechStackTags = () => {
    const domain = (student.domain || 'Fullstack').toLowerCase();
    if (domain.includes('ui') || domain.includes('ux') || domain.includes('design')) {
      return ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Design Systems', 'HTML5/CSS3', 'TailwindCSS'];
    } else if (domain.includes('ai') || domain.includes('ml') || domain.includes('data')) {
      return ['Python', 'PyTorch', 'TensorFlow', 'OpenCV', 'Scikit-Learn', 'FastAPI', 'Pandas', 'NumPy', 'Jupyter', 'Git'];
    } else if (domain.includes('embed') || domain.includes('iot') || domain.includes('auto')) {
      return ['C/C++', 'ESP32', 'FreeRTOS', 'MQTT', 'CAN Bus', 'Embedded Linux', 'KiCAD', 'Sensor Drivers', 'Python'];
    } else {
      return ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'React.js', 'Node.js', 'Express', 'Supabase', 'PostgreSQL', 'TailwindCSS', 'Git & GitHub', 'Vite'];
    }
  };

  const techStack = getTechStackTags();

  // Save profile bio & socials handler
  const handleSaveBio = (e) => {
    e.preventDefault();
    updateResumeProfile(student.id, {
      summary: bioInput,
      headline: taglineInput,
      githubUrl: githubInput,
      linkedinUrl: linkedinInput,
      instagramUrl: instagramInput
    });
    setIsEditingBio(false);
    alert('✅ Portfolio bio & social links updated successfully!');
  };

  // Save project details handler
  const handleSaveProjectDetails = (subId) => {
    updateSubmissionDetails(subId, {
      projectTitle: editTitle,
      projectDescription: editDesc,
      demoLink: editDemoLink
    });
    setEditingSubId(null);
    alert('✅ Project card details updated!');
  };

  // Private view notice if student set portfolio to private and viewer is not owner
  if (!isPublic && !isOwner) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '480px', width: '100%' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#f59e0b' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', marginBottom: '0.5rem' }}>
            Portfolio Set to Private
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {student.name}'s portfolio is currently set to private mode.
          </p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem' }}>
            Return to Powerhub Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: 'var(--font-sans)', paddingBottom: '5rem' }}>
      
      {/* 1. TOP NAV BAR (PILL NAV STYLE MATCHING REFERENCE) */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '0.85rem 1.5rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backdropFilter: 'blur(12px)' 
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* LOGO / NAME */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#0f172a', color: '#ffffff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
              ⚡
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.1 }}>
                {student.name}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>
                Powerhub Verified Engineer
              </span>
            </div>
          </div>

          {/* PILL NAVIGATION LINKS */}
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            background: '#f1f5f9', 
            padding: '4px 6px', 
            borderRadius: '9999px',
            border: '1px solid #e2e8f0'
          }}>
            <a href="#home" style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none' }}>Home</a>
            <a href="#projects" style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none' }}>Projects</a>
            <a href="#resume" style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none' }}>Resume</a>
            <a href="#tools" style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none' }}>Tools</a>
            <a href="#contact" style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none' }}>Contact</a>
          </nav>

          {/* OWNER EDIT BUTTON OR PUBLIC BADGE */}
          {isOwner ? (
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Edit3 size={14} /> {isEditingBio ? 'Close Bio Editor' : 'Edit Profile & Bio'}
            </button>
          ) : (
            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} /> Verified Student Portfolio
            </span>
          )}

        </div>
      </header>

      {/* OWNER EDIT BIO DRAWER */}
      {isOwner && isEditingBio && (
        <div style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', padding: '1.5rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Edit3 size={18} style={{ color: '#2563eb' }} /> Edit Portfolio Headline & Social Links
            </h3>

            <form onSubmit={handleSaveBio} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Headline / Tagline
                </label>
                <input 
                  type="text" 
                  value={taglineInput}
                  onChange={e => setTaglineInput(e.target.value)}
                  placeholder="e.g. Full stack developer with strong frontend knowledge"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Short Bio / Summary
                </label>
                <textarea 
                  rows="3"
                  value={bioInput}
                  onChange={e => setBioInput(e.target.value)}
                  placeholder="Write a brief overview of your engineering background and project experience..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>GitHub URL</label>
                  <input type="url" value={githubInput} onChange={e => setGithubInput(e.target.value)} placeholder="https://github.com/username" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>LinkedIn URL</label>
                  <input type="url" value={linkedinInput} onChange={e => setLinkedinInput(e.target.value)} placeholder="https://linkedin.com/in/username" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>Instagram / Twitter URL</label>
                  <input type="url" value={instagramInput} onChange={e => setInstagramInput(e.target.value)} placeholder="https://instagram.com/username" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditingBio(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>
                  <Save size={14} style={{ marginRight: '0.3rem' }} /> Save Bio & Socials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A) HOME / HERO SECTION */}
      <section id="home" style={{ padding: '4rem 1.5rem 3rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* AVATAR */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
          {student.profilePicUrl || student.avatarUrl ? (
            <img 
              src={student.profilePicUrl || student.avatarUrl} 
              alt={student.name}
              style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #0f172a', objectFit: 'cover', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}
            />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', fontSize: '2.4rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #334155', margin: '0 auto' }}>
              {student.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ position: 'absolute', bottom: 4, right: 4, background: '#10b981', color: '#ffffff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff', fontSize: '0.75rem', fontWeight: '900' }}>
            ✓
          </span>
        </div>

        {/* HERO TITLE */}
        <h1 style={{ fontSize: '2.6rem', fontWeight: '900', fontFamily: 'var(--font-heading)', color: '#0f172a', margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
          Hi! I'm {student.name}, excited to share my portfolio
        </h1>

        {/* HEADLINE / TAGLINE */}
        <div style={{ display: 'inline-block', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.4rem 1.25rem', borderRadius: '9999px', color: '#2563eb', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1.25rem' }}>
          ✨ {taglineInput || `${student.domain || 'Fullstack'} Engineer`}
        </div>

        {/* SHORT BIO */}
        <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto 1.75rem', fontWeight: '500' }}>
          {bioInput}
        </p>

        {/* QUICK METRICS STRIP */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '1rem 0' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>{studentSubs.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Verified Projects</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16a34a' }}>{scoreObj.totalScore || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Powerhub Score</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#d97706' }}>{studentCerts.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Certificates</div>
          </div>
        </div>

      </section>

      {/* B) PROJECT SECTION — AUTO-PULLED FROM SUBMISSIONS */}
      <section id="projects" style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Projects & Production Deliverables ({studentSubs.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Auto-synced from Powerhub daily submission panel records
            </p>
          </div>
        </div>

        {studentSubs.length === 0 ? (
          <div style={{ padding: '3rem 2rem', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '20px', textAlign: 'center', color: '#64748b' }}>
            <Code size={40} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem' }}>No Submissions Yet</h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              Projects submitted via the student daily submission panel will automatically generate portfolio cards here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {studentSubs.map((sub, idx) => {
              const isEditingThisCard = editingSubId === sub.id;
              const hasDemo = !!(sub.demoLink || sub.demoUrl);

              return (
                <div 
                  key={sub.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '2px solid #0f172a',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* PREVIEW CONTAINER PLACEHOLDER */}
                  <div style={{ 
                    height: '160px', 
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                    color: '#ffffff', 
                    padding: '1.25rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900', color: '#60a5fa' }}>
                        VERIFIED SUBMISSION #{idx + 1}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '700' }}>
                        {new Date(sub.submittedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Terminal size={20} />
                      </div>
                      <div style={{ fontWeight: '900', fontSize: '1rem', color: '#ffffff', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {sub.projectTitle || sub.roundName || `Submission #${idx + 1}`}
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY CONTENT */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    
                    {isEditingThisCard ? (
                      /* INLINE OWNER EDIT FORM FOR THIS PROJECT CARD */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Project Title</label>
                          <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Description</label>
                          <textarea rows="2" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Live Demo Link (Optional)</label>
                          <input type="url" value={editDemoLink} onChange={e => setEditDemoLink(e.target.value)} placeholder="https://my-app.vercel.app" style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <button onClick={() => setEditingSubId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={() => handleSaveProjectDetails(sub.id)} style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      /* CARD DISPLAY VIEW */
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                            {sub.projectTitle || sub.roundName || `Submission #${idx + 1}`}
                          </h3>

                          {isOwner && (
                            <button 
                              onClick={() => {
                                setEditingSubId(sub.id);
                                setEditTitle(sub.projectTitle || sub.roundName || '');
                                setEditDesc(sub.projectDescription || sub.notes || '');
                                setEditDemoLink(sub.demoLink || sub.demoUrl || '');
                              }}
                              style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                          )}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                          {sub.projectDescription || sub.notes || sub.techStack || 'Built as part of Powerhub daily engineering challenges.'}
                        </p>
                      </div>
                    )}

                    {/* TWO PILL-STYLE BUTTONS AT BOTTOM (MATCHING REFERENCE) */}
                    <div style={{ display: 'flex', gap: '0.65rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      {hasDemo && (
                        <a 
                          href={sub.demoLink || sub.demoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{
                            flex: 1,
                            background: '#16a34a',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: '900',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 4px 10px rgba(22,163,74,0.2)'
                          }}
                        >
                          <Globe size={14} /> Demo Link
                        </a>
                      )}

                      <a 
                        href={sub.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          flex: 1,
                          background: '#0f172a',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: '900',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 10px rgba(15,23,42,0.2)'
                        }}
                      >
                        <Github size={14} /> GitHub Link
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* C) RESUME SECTION */}
      <section id="resume" style={{ padding: '3rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Resume & Verified Qualifications
            </h2>

            <a 
              href={`/resume/${student.id}`} 
              target="_blank" 
              rel="noreferrer" 
              style={{ background: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ExternalLink size={14} /> View Interactive Resume
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: '900', fontSize: '1rem', marginBottom: '0.5rem' }}>
                <GraduationCap size={20} /> Education & Engineering Background
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {userProfile.education || `${student.domain || 'Engineering'} Specialization at Powerhub Academy`}
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: '900', fontSize: '1rem', marginBottom: '0.5rem' }}>
                <Briefcase size={20} /> Hands-on Project Experience
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                Completed {studentSubs.length} production deliverables with verified code submissions and mentor reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* D) TOOLS SECTION */}
      <section id="tools" style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'var(--font-heading)' }}>
          Tech Stack & Development Tools
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Technologies and frameworks mastered during engineering bootcamps
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {techStack.map((tech, idx) => (
            <span 
              key={idx} 
              style={{ 
                background: '#0f172a', 
                color: '#ffffff', 
                padding: '0.45rem 0.95rem', 
                borderRadius: '9999px', 
                fontSize: '0.82rem', 
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <Cpu size={14} style={{ color: '#60a5fa' }} /> {tech}
            </span>
          ))}
        </div>
      </section>

      {/* E) CONTACT SECTION */}
      <section id="contact" style={{ padding: '3rem 1.5rem', background: '#0f172a', color: '#ffffff', marginTop: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Get in Touch
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.75rem' }}>
            Interested in collaborating or discussing engineering roles? Connect directly.
          </p>

          <a 
            href={`mailto:${student.email}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: '#2563eb', 
              color: '#ffffff', 
              textDecoration: 'none', 
              padding: '0.75rem 1.75rem', 
              borderRadius: '9999px', 
              fontWeight: '900', 
              fontSize: '0.95rem',
              boxShadow: '0 6px 18px rgba(37,99,235,0.3)',
              marginBottom: '2rem'
            }}
          >
            <Mail size={18} /> Contact via {student.email}
          </a>

          {/* SOCIAL ICONS FOOTER */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            {userProfile.githubUrl && (
              <a href={userProfile.githubUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="GitHub">
                <Github size={20} />
              </a>
            )}
            {userProfile.linkedinUrl && (
              <a href={userProfile.linkedinUrl} target="_blank" rel="noreferrer" style={{ background: '#0077b5', color: '#ffffff', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="LinkedIn">
                <Linkedin size={20} />
              </a>
            )}
            {userProfile.instagramUrl && (
              <a href={userProfile.instagramUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Instagram">
                <Globe size={20} />
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
