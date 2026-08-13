import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, Github, Linkedin, Mail, MapPin, ExternalLink, Globe, Code, 
  ShieldCheck, CheckCircle2, UserCheck, ArrowRight, Lock, Edit3, Save, X, 
  Terminal, Cpu, Briefcase, GraduationCap, Wrench, Send, Layers, Sparkles,
  Copy, Check, FileText, Download, Share2, ToggleLeft, ToggleRight
} from 'lucide-react';

export default function PublicPortfolioView({ username }) {
  const { 
    currentUser, 
    users, 
    submissions, 
    teams, 
    calculateStudentScore, 
    calculateStudentStreak,
    resumeProfiles, 
    certificates,
    updateResumeProfile,
    updateSubmissionDetails
  } = useApp();

  const [targetUser, setTargetUser] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Mode Drawer state for owner
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [aboutTextInput, setAboutTextInput] = useState('');
  const [taglineInput, setTaglineInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [instagramInput, setInstagramInput] = useState('');
  const [resumeUrlInput, setResumeUrlInput] = useState('');
  const [showStatsInput, setShowStatsInput] = useState(true);

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
      setBioInput(userProfile.bio || student.bio || 'passionate about building web applications & solving complex engineering problems');
      setAboutTextInput(userProfile.aboutText || 'I am a passionate full-stack developer currently pursuing engineering. I have hands-on experience in developing real-world applications with modern frameworks like React, Node.js, and Supabase.');
      setTaglineInput(userProfile.headline || `${student.domain || 'Fullstack'} Developer`);
      setGithubInput(userProfile.githubUrl || student.githubUrl || '');
      setLinkedinInput(userProfile.linkedinUrl || student.linkedinUrl || '');
      setInstagramInput(userProfile.instagramUrl || student.instagramUrl || '');
      setResumeUrlInput(userProfile.resumeUrl || '');
      setShowStatsInput(userProfile.showPowerhubStats !== false);
    }
  }, [userProfile, student]);

  const scoreObj = calculateStudentScore ? calculateStudentScore(student.id) : { totalScore: 0, submissionCount: 0 };
  const studentStreak = calculateStudentStreak ? calculateStudentStreak(student.id) : 0;

  // AUTO-PULLED SUBMISSIONS made by this student from submissions table
  const studentSubs = (submissions || []).filter(s => s.studentId === student.id || s.student_id === student.id);
  const studentCerts = (certificates || []).filter(c => c.student_id === student.id || c.studentId === student.id);

  // Tech stack mapping based on student cohort/domain
  const getTechStackTags = () => {
    const domain = (student.domain || 'Fullstack').toLowerCase();
    if (domain.includes('ui') || domain.includes('ux') || domain.includes('design')) {
      return ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Design Systems', 'HTML5', 'CSS3', 'TailwindCSS', 'User Testing'];
    } else if (domain.includes('ai') || domain.includes('ml') || domain.includes('data')) {
      return ['Python', 'PyTorch', 'TensorFlow', 'OpenCV', 'Scikit-Learn', 'FastAPI', 'Pandas', 'NumPy', 'Jupyter', 'Git & GitHub'];
    } else if (domain.includes('embed') || domain.includes('iot') || domain.includes('vlsi')) {
      return ['C/C++', 'ESP32', 'FreeRTOS', 'MQTT', 'Verilog', 'CAN Bus', 'Embedded Linux', 'KiCAD', 'Sensor Drivers', 'Python'];
    } else {
      return ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TailwindCSS', 'ReactJS', 'NodeJS', 'ExpressJS', 'MongoDB', 'Supabase', 'PostgreSQL', 'Git & GitHub', 'Vite'];
    }
  };

  const techStack = getTechStackTags();

  // Copy portfolio shareable URL handler
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/portfolio/${student.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Save profile bio & settings handler
  const handleSaveProfileSettings = (e) => {
    e.preventDefault();
    updateResumeProfile(student.id, {
      bio: bioInput,
      aboutText: aboutTextInput,
      headline: taglineInput,
      githubUrl: githubInput,
      linkedinUrl: linkedinInput,
      instagramUrl: instagramInput,
      resumeUrl: resumeUrlInput,
      showPowerhubStats: showStatsInput
    });
    setIsEditingProfile(false);
    alert('✅ Portfolio profile settings updated successfully!');
  };

  // Save individual project card handler
  const handleSaveProjectDetails = (subId) => {
    updateSubmissionDetails(subId, {
      projectTitle: editTitle,
      projectDescription: editDesc,
      demoLink: editDemoLink
    });
    setEditingSubId(null);
    alert('✅ Project card updated!');
  };

  // Helper to parse clean repo name from GitHub URL
  const parseRepoName = (sub) => {
    if (sub.projectTitle) return sub.projectTitle;
    if (sub.githubUrl) {
      try {
        const parts = sub.githubUrl.split('/').filter(Boolean);
        if (parts.length >= 2) {
          const repo = parts[parts.length - 1].replace(/\.git$/, '');
          return repo.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
      } catch (e) {}
    }
    return sub.roundName || 'Sprint Deliverable Project';
  };

  // Private view notice if student set portfolio to private and viewer is not owner
  if (!isPublic && !isOwner) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#f59e0b' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', marginBottom: '0.5rem' }}>
            Portfolio Set to Private
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
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
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', scrollBehavior: 'smooth' }}>
      
      {/* =====================================================
          1. TOP NAVIGATION BAR (PILL-STYLE NAV MATCHING SPEC)
          ===================================================== */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '0.85rem 1.5rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backdropFilter: 'blur(12px)' 
      }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* BRAND / STUDENT NAME */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#0f172a', color: '#ffffff', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem' }}>
              ⚡
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.1 }}>
                {student.name}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>
                MY PORTFOLIO
              </span>
            </div>
          </div>

          {/* PILL NAV TABS */}
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            background: '#f1f5f9', 
            padding: '4px 6px', 
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
          }}>
            <a href="#home" style={{ padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', transition: 'all 0.2s' }}>HOME</a>
            <a href="#about" style={{ padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', transition: 'all 0.2s' }}>ABOUT</a>
            <a href="#projects" style={{ padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', transition: 'all 0.2s' }}>PROJECT</a>
            <a href="#resume" style={{ padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', transition: 'all 0.2s' }}>RESUME</a>
            <a href="#tools" style={{ padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', transition: 'all 0.2s' }}>TOOLS</a>
            <a href="#contact" style={{ padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', transition: 'all 0.2s' }}>CONTACT</a>
          </nav>

          {/* ACTION BUTTONS: COPY LINK & OWNER EDIT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: copiedLink ? '#dcfce7' : '#ffffff',
                color: copiedLink ? '#15803d' : '#0f172a',
                border: '1.5px solid ' + (copiedLink ? '#86efac' : '#e2e8f0'),
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
              title="Copy shareable link to portfolio"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>

            {isOwner && (
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Edit3 size={14} /> {isEditingProfile ? 'Close Editor' : 'Edit Portfolio'}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* OWNER EDIT PROFILE MODAL / DRAWER */}
      {isOwner && isEditingProfile && (
        <div style={{ background: '#f8fafc', borderBottom: '2px solid #0f172a', padding: '1.75rem 1.5rem', boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Edit3 size={18} style={{ color: '#2563eb' }} /> Customize Portfolio Content & Social Links
              </h3>
              <button onClick={() => setIsEditingProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                    Role / Cohort Headline
                  </label>
                  <input 
                    type="text" 
                    value={taglineInput}
                    onChange={e => setTaglineInput(e.target.value)}
                    placeholder="e.g. Full stack developer"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                    Short One-Line Bio
                  </label>
                  <input 
                    type="text" 
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    placeholder="e.g. passionate about building scalable web applications"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  About Me Paragraph (Displayed in About Section)
                </label>
                <textarea 
                  rows="3"
                  value={aboutTextInput}
                  onChange={e => setAboutTextInput(e.target.value)}
                  placeholder="I am a passionate full-stack developer currently pursuing engineering. I have hands-on experience in developing real-world applications..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: '500' }}
                />
              </div>

              {/* SOCIAL LINKS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>GitHub Profile URL</label>
                  <input type="url" value={githubInput} onChange={e => setGithubInput(e.target.value)} placeholder="https://github.com/username" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>LinkedIn Profile URL</label>
                  <input type="url" value={linkedinInput} onChange={e => setLinkedinInput(e.target.value)} placeholder="https://linkedin.com/in/username" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>Instagram Profile URL</label>
                  <input type="url" value={instagramInput} onChange={e => setInstagramInput(e.target.value)} placeholder="https://instagram.com/username" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>Resume PDF Link</label>
                  <input type="url" value={resumeUrlInput} onChange={e => setResumeUrlInput(e.target.value)} placeholder="https://.../resume.pdf" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                </div>
              </div>

              {/* STATS TOGGLE */}
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block' }}>
                    Show PowerHub Verified Stats Banner
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Auto-appends your project count, habit streak, points, and certificates to your About section.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatsInput(!showStatsInput)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: showStatsInput ? '#16a34a' : '#94a3b8' }}
                >
                  {showStatsInput ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditingProfile(false)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.55rem 1.35rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={15} /> Save Portfolio Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          2. HOME SECTION
          ===================================================== */}
      <section id="home" style={{ padding: '4.5rem 1.5rem 3.5rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* AVATAR */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
          {student.profilePicUrl || student.avatarUrl ? (
            <img 
              src={student.profilePicUrl || student.avatarUrl} 
              alt={student.name}
              style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #0f172a', objectFit: 'cover', boxShadow: '0 10px 25px rgba(0,0,0,0.12)' }}
            />
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', fontSize: '2.6rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #334155', margin: '0 auto' }}>
              {student.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span style={{ position: 'absolute', bottom: 4, right: 4, background: '#10b981', color: '#ffffff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff', fontSize: '0.8rem', fontWeight: '900' }} title="Powerhub Verified Student">
            ✓
          </span>
        </div>

        {/* AUTO-FILLED INTRO STATEMENT */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.85rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
          Hi! I'm {student.name}, excited to share my portfolio with u guys
        </h1>

        {/* ROLE / COHORT BADGE */}
        <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto 1.75rem', fontWeight: '500' }}>
          I'm a <span style={{ color: '#0f172a', fontWeight: '800', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{taglineInput || `${student.domain || 'Fullstack'} Developer`}</span> with {bioInput}
        </p>

        {/* CTA ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <a 
            href="#projects" 
            style={{ 
              background: '#0f172a', 
              color: '#ffffff', 
              textDecoration: 'none', 
              padding: '0.7rem 1.5rem', 
              borderRadius: '9999px', 
              fontWeight: '800', 
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(15,23,42,0.2)'
            }}
          >
            <Code size={16} /> View Projects ({studentSubs.length})
          </a>

          <a 
            href="#contact" 
            style={{ 
              background: '#ffffff', 
              color: '#0f172a', 
              border: '2px solid #0f172a', 
              textDecoration: 'none', 
              padding: '0.65rem 1.5rem', 
              borderRadius: '9999px', 
              fontWeight: '800', 
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Mail size={16} /> Contact Me
          </a>
        </div>

      </section>

      {/* =====================================================
          3. ABOUT SECTION
          ===================================================== */}
      <section id="about" style={{ padding: '3.5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span style={{ background: '#0f172a', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase' }}>
              SECTION
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              About Me
            </h2>
          </div>

          {/* EDITABLE ABOUT PARAGRAPH */}
          <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(15,23,42,0.04)', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, margin: 0, fontWeight: '450' }}>
              {aboutTextInput}
            </p>
          </div>

          {/* AUTO-APPENDED POWERHUB STATS BANNER (TOGGLEABLE) */}
          {showStatsInput && (
            <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 8px 24px rgba(15,23,42,0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} style={{ color: '#fbbf24' }} /> POWERHUB VERIFIED ENGINEERING METRICS
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>{studentSubs.length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Projects Completed</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f97316' }}>🔥 {studentStreak} Days</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Submission Streak</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#22c55e' }}>{scoreObj.totalScore || 0} Pts</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Leaderboard Score</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#eab308' }}>🏅 {studentCerts.length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '700' }}>Certificates Issued</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          4. PROJECT SECTION — AUTO-PULLED FROM SUBMISSIONS
          ===================================================== */}
      <section id="projects" style={{ padding: '4rem 1.5rem', maxWidth: '1150px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ background: '#0f172a', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase' }}>
            PORTFOLIO SHOWCASE
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', margin: '0.35rem 0 0.2rem' }}>
            Featured Projects & Production Deliverables ({studentSubs.length})
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Auto-populated directly from PowerHub verified daily code submission records.
          </p>
        </div>

        {studentSubs.length === 0 ? (
          <div style={{ padding: '3.5rem 2rem', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '24px', textAlign: 'center', color: '#64748b' }}>
            <Code size={44} style={{ color: '#94a3b8', marginBottom: '0.85rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem' }}>No Submissions Found Yet</h3>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>
              New deliverables submitted via the PowerHub daily panel will automatically populate project cards here.
            </p>
          </div>
        ) : (
          /* GRID LAYOUT: 3 COLUMNS DESKTOP / 1 COLUMN MOBILE */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.75rem' }}>
            {studentSubs.map((sub, idx) => {
              const isEditingThisCard = editingSubId === sub.id;
              const title = parseRepoName(sub);
              const hasScreenshot = !!(sub.imageAttachment || sub.mediaUrl || sub.media_url);
              const previewImg = sub.imageAttachment || sub.mediaUrl || sub.media_url;
              const demoUrl = sub.demoLink || sub.demoUrl || sub.mediaUrl;

              return (
                <div 
                  key={sub.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '2px solid #0f172a',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* BROWSER-MOCKUP STYLE PREVIEW HEADER MATCHING SPECIFICATION */}
                  <div style={{ borderBottom: '2px solid #0f172a', background: '#0f172a', color: '#ffffff' }}>
                    {/* BROWSER TOP BAR (🔴 🟡 🟢 CONTROLS + URL BAR) */}
                    <div style={{ background: '#1e293b', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                      </div>
                      <div style={{ flex: 1, background: '#0f172a', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.githubUrl ? sub.githubUrl.replace(/^https?:\/\//, '') : 'github.com/project-repo'}
                      </div>
                    </div>

                    {/* PREVIEW IMAGE / MOCKUP BODY */}
                    {hasScreenshot ? (
                      <div style={{ height: '170px', overflow: 'hidden', background: '#000000' }}>
                        <img 
                          src={previewImg} 
                          alt={title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        height: '170px', 
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                        padding: '1.25rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '900', color: '#60a5fa' }}>
                            PROJECT #{idx + 1}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
                            {new Date(sub.submittedAt || sub.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Terminal size={22} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.25 }}>
                              {title}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                              Verified PowerHub Submission
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD BODY CONTENT */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    
                    {isEditingThisCard ? (
                      /* INLINE OWNER CARD EDITOR */
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
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569' }}>Demo Link (Optional)</label>
                          <input type="url" value={editDemoLink} onChange={e => setEditDemoLink(e.target.value)} placeholder="https://my-app.vercel.app" style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          <button onClick={() => setEditingSubId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={() => handleSaveProjectDetails(sub.id)} style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Save Card</button>
                        </div>
                      </div>
                    ) : (
                      /* DISPLAY VIEW */
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>
                            {title}
                          </h3>

                          {isOwner && (
                            <button 
                              onClick={() => {
                                setEditingSubId(sub.id);
                                setEditTitle(title);
                                setEditDesc(sub.projectDescription || sub.notes || '');
                                setEditDemoLink(sub.demoLink || sub.demoUrl || '');
                              }}
                              style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                          )}
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                          {sub.projectDescription || sub.notes || `Production deliverable for ${sub.roundName || 'Sprint Challenge'}.`}
                        </p>
                      </div>
                    )}

                    {/* TWO PILL-STYLE BUTTONS AT BOTTOM MATCHING REFERENCE CARD STYLE */}
                    <div style={{ display: 'flex', gap: '0.65rem', borderTop: '1.5px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <a 
                        href={demoUrl || sub.githubUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          flex: 1,
                          background: '#16a34a',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: '900',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 12px rgba(22,163,74,0.2)'
                        }}
                      >
                        <Globe size={14} /> Demo Link
                      </a>

                      <a 
                        href={sub.githubUrl || sub.github_url || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          flex: 1,
                          background: '#0f172a',
                          color: '#ffffff',
                          textDecoration: 'none',
                          padding: '0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: '900',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 12px rgba(15,23,42,0.2)'
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

      {/* =====================================================
          5. RESUME SECTION
          ===================================================== */}
      <section id="resume" style={{ padding: '3.5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ background: '#0f172a', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase' }}>
                CREDENTIALS
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0.3rem 0 0' }}>
                Resume & Qualifications
              </h2>
            </div>

            {/* DOWNLOAD RESUME BUTTON */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {userProfile.resumeUrl ? (
                <a 
                  href={userProfile.resumeUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ background: '#0f172a', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}
                >
                  <Download size={15} /> Download Resume PDF
                </a>
              ) : (
                <a 
                  href={`/resume/${student.id}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ background: '#0f172a', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}
                >
                  <FileText size={15} /> View Interactive Resume
                </a>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#2563eb', fontWeight: '900', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                <GraduationCap size={22} /> Education & Engineering Track
              </div>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.6, fontWeight: '500' }}>
                {userProfile.education || `${student.domain || 'Engineering'} Specialization Track at Powerhub Academy`}
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#16a34a', fontWeight: '900', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                <Briefcase size={22} /> Hands-on Industry Experience
              </div>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.6, fontWeight: '500' }}>
                Completed {studentSubs.length} production project deliverables with peer code reviews & mentor evaluations.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          6. TOOLS SECTION
          ===================================================== */}
      <section id="tools" style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ background: '#0f172a', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase' }}>
            SKILLS & FRAMEWORKS
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0.3rem 0 0.2rem' }}>
            Tools & Tech Stack
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Mastered through hands-on engineering challenges and sprint deliverables
          </p>
        </div>

        {/* TECH STACK BADGES MATCHING CALENDAR TOP BADGE STYLE */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {techStack.map((tech, idx) => (
            <span 
              key={idx} 
              style={{ 
                background: '#0f172a', 
                color: '#ffffff', 
                padding: '0.5rem 1rem', 
                borderRadius: '9999px', 
                fontSize: '0.85rem', 
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Cpu size={15} style={{ color: '#60a5fa' }} /> {tech}
            </span>
          ))}
        </div>

      </section>

      {/* =====================================================
          7. CONTACT SECTION & FOOTER
          ===================================================== */}
      <section id="contact" style={{ padding: '4.5rem 1.5rem 3rem', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#60a5fa', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            LET'S CONNECT
          </span>

          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.6rem 0 0.4rem', fontFamily: 'var(--font-heading)' }}>
            Contact & Social Profiles
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Interested in discussing engineering roles or software projects? Feel free to reach out directly.
          </p>

          {/* EMAIL DIRECT CTA */}
          <a 
            href={`mailto:${student.email}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.55rem', 
              background: '#ffffff', 
              color: '#0f172a', 
              textDecoration: 'none', 
              padding: '0.8rem 2rem', 
              borderRadius: '9999px', 
              fontWeight: '900', 
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
              marginBottom: '2.5rem'
            }}
          >
            <Mail size={18} /> Contact via {student.email}
          </a>

          {/* SOCIAL ICON LINKS FOOTER MATCHING SPECIFICATION */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '2rem', marginBottom: '2rem' }}>
            {(userProfile.githubUrl || student.githubUrl) && (
              <a 
                href={userProfile.githubUrl || student.githubUrl} 
                target="_blank" 
                rel="noreferrer" 
                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} 
                title="GitHub Profile"
              >
                <Github size={22} />
              </a>
            )}

            {(userProfile.linkedinUrl || student.linkedinUrl) && (
              <a 
                href={userProfile.linkedinUrl || student.linkedinUrl} 
                target="_blank" 
                rel="noreferrer" 
                style={{ background: '#0077b5', color: '#ffffff', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} 
                title="LinkedIn Profile"
              >
                <Linkedin size={22} />
              </a>
            )}

            {(userProfile.instagramUrl || student.instagramUrl) && (
              <a 
                href={userProfile.instagramUrl || student.instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} 
                title="Instagram Profile"
              >
                <Globe size={22} />
              </a>
            )}
          </div>

          {/* FOOTER COPYRIGHT MATCHING SPECIFICATION */}
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
            © by {student.name}. All rights reserved.
          </div>

        </div>
      </section>

    </div>
  );
}
