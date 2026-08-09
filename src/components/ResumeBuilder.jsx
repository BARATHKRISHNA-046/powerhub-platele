import React, { useState, useEffect } from 'react';
import { compressImageFile, useApp } from '../context/AppContext';
import { uploadProfilePicture } from '../lib/uploadSubmission';

import { 
  FileText, Download, Printer, User, Mail, Phone, MapPin, 
  Linkedin, Github, Globe, Calendar, Award, CheckCircle2, 
  Sparkles, Save, Briefcase, GraduationCap, Plus, Trash2,
  Share2, Copy, RefreshCw, Layers, ShieldCheck, Target, Eye
} from 'lucide-react';

export default function ResumeBuilder() {
  const { 
    currentUser, users, resumeProfiles, updateResumeProfile, 
    updateUserProfilePic, calculateStudentScore, submissions, skillRatings, teams 
  } = useApp();

  const savedProfile = (resumeProfiles && resumeProfiles[currentUser.id]) || {};

  // Compute live stats & leaderboard rank
  const scoreObj = calculateStudentScore ? calculateStudentScore(currentUser.id) : { totalScore: 0, submissionCount: 0 };
  const mySubmissions = (submissions || []).filter(s => s.studentId === currentUser.id);
  const myTeam = (teams || []).find(t => t.memberIds && t.memberIds.includes(currentUser.id));
  const isTeamLead = myTeam && myTeam.leadStudentId === currentUser.id;
  const mySkillRatings = (skillRatings || []).filter(r => r.studentId === currentUser.id);

  const globalLeaderboard = (users || []).map(u => {
    const sObj = calculateStudentScore ? calculateStudentScore(u.id) : { totalScore: 0 };
    return { ...u, ...sObj };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const userRankIndex = globalLeaderboard.findIndex(u => u.id === currentUser.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  // Auto-generate 2-3 sentence summary function
  const generateAutoSummary = () => {
    const domainStr = currentUser.domain || 'Fullstack & AI';
    const subCount = mySubmissions.length;
    const rankStr = `#${userRank}`;
    const leadStr = isTeamLead ? `and serves as Team Lead for '${myTeam?.name || 'AI Team'}'.` : 'with strong team collaboration experience.';
    return `${domainStr} developer with ${subCount} verified project deliverable${subCount !== 1 ? 's' : ''}, current Powerhub leaderboard rank ${rankStr} (${scoreObj.totalScore} cumulative points), ${leadStr} Passionate about building robust applications, automated pipelines, and modern web software.`;
  };

  const initialProfile = {
    template: savedProfile.template || 'modern',
    fullName: savedProfile.fullName || currentUser.name || 'STUDENT NAME',
    dob: savedProfile.dob || '2004-05-15',
    nativeLocation: savedProfile.nativeLocation || 'Chennai, Tamil Nadu, India',
    email: savedProfile.email || currentUser.email || 'student@powerhub.dev',
    phone: savedProfile.phone || '+91 98765 43210',
    linkedinUrl: savedProfile.linkedinUrl || `https://linkedin.com/in/${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '-')}`,
    githubUrl: savedProfile.githubUrl || `https://github.com/${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '')}`,
    portfolioUrl: savedProfile.portfolioUrl || `https://${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '')}.dev`,
    summary: savedProfile.summary || generateAutoSummary(),
    skills: savedProfile.skills || ['React.js', 'JavaScript (ES6+)', 'Node.js', 'Git / GitHub', 'REST APIs', 'TailwindCSS', 'PostgreSQL'],
    talents: savedProfile.talents || ['Problem Solving', 'Team Collaboration', 'System Architecture', 'Fast Learner'],
    degree: savedProfile.degree || 'B.E. Computer Science & Engineering',
    institution: savedProfile.institution || 'Chennai Institute of Technology',
    gradYear: savedProfile.gradYear || '2026',
    cgpa: savedProfile.cgpa || '8.8 / 10',
    experienceRole: savedProfile.experienceRole || 'Software Developer Intern',
    experienceCompany: savedProfile.experienceCompany || 'Tech Solutions Lab',
    experienceDuration: savedProfile.experienceDuration || 'Jun 2025 - Aug 2025',
    experienceDesc: savedProfile.experienceDesc || 'Developed interactive UI dashboards and integrated backend REST APIs.',
    enabledBadges: savedProfile.enabledBadges || { rank: true, streak: true, teamLead: true, firstSub: true },
    lastExportedCount: savedProfile.lastExportedCount || 0
  };

  const [formData, setFormData] = useState(initialProfile);
  const [activeTemplate, setActiveTemplate] = useState(initialProfile.template);
  const [skillInput, setSkillInput] = useState('');
  const [talentInput, setTalentInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [copyLinkMsg, setCopyLinkMsg] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeExportMode, setActiveExportMode] = useState('pdf'); // 'pdf' or 'ats_text'
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [projectDescriptions, setProjectDescriptions] = useState({});
  const [fetchingGithub, setFetchingGithub] = useState(false);

  // Stale detection
  const isStale = mySubmissions.length > (formData.lastExportedCount || 0);

  // GitHub README description fetcher
  useEffect(() => {
    const fetchRepoDescriptions = async () => {
      setFetchingGithub(true);
      const descs = {};
      for (const sub of mySubmissions) {
        if (sub.githubUrl && sub.githubUrl.includes('github.com')) {
          try {
            const parts = sub.githubUrl.replace(/https?:\/\/(www\.)?github\.com\//, '').split('/');
            if (parts.length >= 2) {
              const owner = parts[0];
              const repo = parts[1].replace(/\.git$/, '');
              const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
              if (res.ok) {
                const data = await res.json();
                descs[sub.id] = data.description || `${sub.roundName}: Production codebase built & verified on Powerhub.`;
              } else {
                descs[sub.id] = `${sub.roundName}: Fullstack repository with verified automated tests.`;
              }
            }
          } catch (e) {
            descs[sub.id] = `${sub.roundName}: Production codebase built & verified on Powerhub.`;
          }
        } else {
          descs[sub.id] = `${sub.roundName}: Production codebase built & verified on Powerhub.`;
        }
      }
      setProjectDescriptions(descs);
      setFetchingGithub(false);
    };

    if (mySubmissions.length > 0) {
      fetchRepoDescriptions();
    }
  }, [mySubmissions.length]);

  // Keyword Tailoring Matcher
  useEffect(() => {
    if (!jobDescriptionInput.trim()) {
      setMatchedKeywords([]);
      return;
    }
    const commonTechs = [
      'react', 'javascript', 'node', 'express', 'typescript', 'python', 'java',
      'sql', 'postgresql', 'mongodb', 'docker', 'aws', 'git', 'github', 'tailwind',
      'css', 'html', 'rest', 'api', 'graphql', 'next.js', 'vue', 'redux', 'ci/cd'
    ];
    const textLower = jobDescriptionInput.toLowerCase();
    const matches = commonTechs.filter(tech => textLower.includes(tech));
    setMatchedKeywords(matches);
  }, [jobDescriptionInput]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (tpl) => {
    setActiveTemplate(tpl);
    setFormData(prev => ({ ...prev, template: tpl }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const current = formData.skills || [];
    if (!current.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...current, skillInput.trim()] }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  const handleToggleBadge = (badgeKey) => {
    setFormData(prev => ({
      ...prev,
      enabledBadges: {
        ...prev.enabledBadges,
        [badgeKey]: !prev.enabledBadges[badgeKey]
      }
    }));
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    const updated = {
      ...formData,
      template: activeTemplate,
      lastExportedCount: mySubmissions.length
    };
    if (updateResumeProfile) {
      updateResumeProfile(currentUser.id, updated);
    }
    setSaveMessage('Resume Profile & Preferences Saved!');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}/?shareResume=${currentUser.id}`;
    navigator.clipboard.writeText(url);
    setCopyLinkMsg('Public Resume Link copied to clipboard!');
    setTimeout(() => setCopyLinkMsg(''), 3500);
  };

  const handlePrint = () => {
    setFormData(prev => ({ ...prev, lastExportedCount: mySubmissions.length }));
    handleSaveProfile();
    window.print();
  };

  // Compute skill proficiency bars (1 to 5 ratings)
  const getSkillProficiency = (skillName) => {
    const found = mySkillRatings.find(r => r.skillName?.toLowerCase() === skillName.toLowerCase());
    if (found && found.rating) return found.rating;
    return 4.5; // Default high rating for student skills
  };

  // Plain Text ATS Resume Generator
  const generateAtsText = () => {
    return `${formData.fullName.toUpperCase()}
${formData.email} | ${formData.phone} | ${formData.nativeLocation}
LinkedIn: ${formData.linkedinUrl} | GitHub: ${formData.githubUrl}

==================================================
PROFESSIONAL SUMMARY
==================================================
${formData.summary}

==================================================
POWERHUB VERIFIED ACHIEVEMENTS & METRICS
==================================================
- Leaderboard Rank: #${userRank} (${scoreObj.totalScore} cumulative points)
- Verified Submissions: ${mySubmissions.length} on-time sprint project deliverables
- Team Collaboration: Active member in ${myTeam ? myTeam.name : 'Human AI Team'} ${isTeamLead ? '(Team Lead)' : ''}

==================================================
EDUCATION
==================================================
${formData.degree} — ${formData.institution}
Graduation Year: ${formData.gradYear} | CGPA: ${formData.cgpa}

==================================================
PROJECT DELIVERABLES & EXPERIENCE
==================================================
${mySubmissions.map(s => `- ${s.roundName}: ${s.githubUrl}\n  Description: ${projectDescriptions[s.id] || 'Verified sprint submission'}`).join('\n\n')}

${formData.experienceRole} — ${formData.experienceCompany} (${formData.experienceDuration})
${formData.experienceDesc}

==================================================
TECHNICAL SKILLS & TALENTS
==================================================
Skills: ${(formData.skills || []).join(', ')}
Talents: ${(formData.talents || []).join(', ')}
`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* STALE RESUME WARNING BANNER */}
      {isStale && (
        <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 4px 12px rgba(245,158,11,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={22} style={{ color: '#d97706' }} />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#92400e', display: 'block' }}>
                Updated with {mySubmissions.length - (formData.lastExportedCount || 0)} new submission(s) since your last export!
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Your resume data has fresh verified deliverables ready to export.
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              setFormData(prev => ({ ...prev, summary: generateAutoSummary() }));
              handleSaveProfile();
            }}
            style={{ background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
          >
            ⚡ Auto-Refresh Summary & Sync
          </button>
        </div>
      )}

      {/* HEADER BAR WITH TEMPLATE PICKER & ACTION BUTTONS */}
      <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileText size={24} style={{ color: '#2563eb' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                Automated Resume & Portfolio Builder
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
              Select a template, customize content, match job keywords, and export or share your live verified Powerhub resume.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handleCopyPublicLink} 
              className="btn-outline" 
              style={{ fontSize: '0.85rem', borderColor: '#2563eb', color: '#2563eb' }}
            >
              <Share2 size={15} /> Copy Live Shareable Link
            </button>

            <button 
              onClick={() => setShowPreviewModal(true)} 
              className="btn-primary" 
              style={{ fontSize: '0.88rem', backgroundColor: '#2563eb' }}
            >
              <Eye size={16} /> Live Preview Resume
            </button>

            <button 
              onClick={handlePrint} 
              className="btn-secondary" 
              style={{ fontSize: '0.88rem', backgroundColor: '#0f172a' }}
            >
              <Printer size={16} /> Download / Print PDF
            </button>
          </div>
        </div>

        {copyLinkMsg && (
          <div style={{ marginTop: '0.75rem', color: '#059669', fontSize: '0.82rem', fontWeight: '800', background: '#ecfdf5', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            ✓ {copyLinkMsg} (Public link: {window.location.origin}/?shareResume={currentUser.id})
          </div>
        )}

        {/* TEMPLATE PICKER ROW */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={16} style={{ color: '#2563eb' }} /> Choose Visual Template:
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'modern', label: '🎨 Modern (Accent & Icons)', desc: 'Colorful badges & modern typography' },
              { id: 'classic', label: '📄 Classic (ATS Standard)', desc: 'Clean black-and-white traditional ATS format' },
              { id: 'minimal', label: '✨ Minimal (Whitespace)', desc: 'Minimalist clean typography' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateChange(t.id)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  border: activeTemplate === t.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: activeTemplate === t.id ? '#eff6ff' : '#ffffff',
                  color: activeTemplate === t.id ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: EDITABLE RESUME PROFILE FORM */}
        <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Edit Resume Content
            </h3>
            {saveMessage && (
              <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '800', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                ✓ {saveMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Section 1: Auto-Written Professional Summary */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={14} /> Auto-Written Summary
                </h4>
                <button
                  type="button"
                  onClick={() => handleChange('summary', generateAutoSummary())}
                  style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>

              <textarea
                value={formData.summary}
                onChange={e => handleChange('summary', e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', fontFamily: 'inherit', lineHeight: '1.5' }}
              />
            </div>

            {/* Section 2: Personal Details */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> Personal Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>Full Name</label>
                  <input type="text" value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>Location</label>
                  <input type="text" value={formData.nativeLocation} onChange={e => handleChange('nativeLocation', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>Email</label>
                  <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>Phone</label>
                  <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>LinkedIn URL</label>
                  <input type="text" value={formData.linkedinUrl} onChange={e => handleChange('linkedinUrl', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>GitHub URL</label>
                  <input type="text" value={formData.githubUrl} onChange={e => handleChange('githubUrl', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                </div>
              </div>
            </div>

            {/* Section 3: Toggleable Achievement Badges */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} /> Toggle Resume Badges
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {[
                  { key: 'rank', label: `Global Rank Badge (#${userRank})` },
                  { key: 'streak', label: 'Daily Habit Streak Badge' },
                  { key: 'teamLead', label: 'Team Lead Badge' },
                  { key: 'firstSub', label: 'First Submitter Badge' }
                ].map(b => (
                  <label key={b.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#0f172a', fontWeight: '700', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={Boolean(formData.enabledBadges?.[b.key])} 
                      onChange={() => handleToggleBadge(b.key)}
                      style={{ accentColor: '#2563eb' }}
                    />
                    {b.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 4: Technical Skills & Proficiency Indicators */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Skills & Proficiency Ratings
              </h4>

              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="Add skill (e.g. Docker, Python)" 
                  value={skillInput} 
                  onChange={e => setSkillInput(e.target.value)} 
                  style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
                <button onClick={handleAddSkill} type="button" style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.45rem 0.75rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}>
                  + Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(formData.skills || []).map((skill, i) => {
                  const rating = getSkillProficiency(skill);
                  return (
                    <span key={i} style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {skill} 
                      <span style={{ color: '#f59e0b', fontSize: '0.72rem' }}>★ {rating}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: '900', padding: 0 }}>×</button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Job Description Keyword Tailoring */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Target size={14} /> Job-Tailored Keyword Highlighting
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>
                Paste a target job description below to highlight and match relevant technical keywords on your resume.
              </p>

              <textarea
                value={jobDescriptionInput}
                onChange={e => setJobDescriptionInput(e.target.value)}
                placeholder="Paste Job Description here (e.g. Seeking Fullstack Engineer proficient in React, Node, PostgreSQL, and REST APIs)..."
                rows={3}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'inherit' }}
              />

              {matchedKeywords.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>Matched Keywords ({matchedKeywords.length}):</span>
                  {matchedKeywords.map(kw => (
                    <span key={kw} style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase' }}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
              💾 Save Resume Profile & Preferences
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REAL-TIME VERIFIED POWERHUB ACHIEVEMENTS & PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* VERIFIED ACHIEVEMENTS SUMMARY BOX */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <span className="section-label" style={{ color: '#059669' }}>VERIFIED ON POWERHUB</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              Live Platform Metrics & GitHub Data
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Global Rank</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f59e0b', marginTop: '0.15rem' }}>#{userRank}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Total Points</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', marginTop: '0.15rem' }}>{scoreObj.totalScore} pts</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.65rem' }}>
              Verified Projects ({mySubmissions.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '260px', overflowY: 'auto' }}>
              {mySubmissions.map((sub, i) => (
                <div key={sub.id || i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{sub.roundName}</div>
                  <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                    🔗 {sub.githubUrl}
                  </a>
                  <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
                    {projectDescriptions[sub.id] || 'Fetching GitHub description...'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK EXPORT PREVIEW MINI BOX */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Ready to Apply for Jobs?
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Preview your selected <strong>{activeTemplate.toUpperCase()}</strong> resume or copy unformatted plain text for job applications.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowPreviewModal(true)} 
                className="btn-primary" 
                style={{ fontSize: '0.85rem', backgroundColor: '#2563eb' }}
              >
                <Eye size={15} /> Open Preview Modal
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FULL RESUME PREVIEW MODAL WITH TEMPLATE RENDERING & ATS PLAIN TEXT TAB */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#ffffff' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setActiveExportMode('pdf')} 
                  style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', border: 'none', background: activeExportMode === 'pdf' ? '#2563eb' : '#f1f5f9', color: activeExportMode === 'pdf' ? '#ffffff' : '#475569', cursor: 'pointer' }}
                >
                  Visual Template ({activeTemplate.toUpperCase()})
                </button>
                <button 
                  onClick={() => setActiveExportMode('ats_text')} 
                  style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', border: 'none', background: activeExportMode === 'ats_text' ? '#2563eb' : '#f1f5f9', color: activeExportMode === 'ats_text' ? '#ffffff' : '#475569', cursor: 'pointer' }}
                >
                  Plain Text / ATS Copy Format
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeExportMode === 'pdf' && (
                  <button onClick={handlePrint} className="btn-primary" style={{ fontSize: '0.82rem', backgroundColor: '#0f172a' }}>
                    <Printer size={14} /> Print / Save PDF
                  </button>
                )}
                <button onClick={() => setShowPreviewModal(false)} className="btn-outline" style={{ fontSize: '0.82rem' }}>
                  Close
                </button>
              </div>
            </div>

            {/* ATS PLAIN TEXT EXPORT MODE */}
            {activeExportMode === 'ats_text' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b' }}>Plain Text for Online Job Forms</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateAtsText());
                      alert('ATS Text copied to clipboard!');
                    }}
                    style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Copy Plain Text
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generateAtsText()}
                  rows={18}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.82rem', padding: '1rem', background: '#0f172a', color: '#f8fafc', borderRadius: '12px', lineHeight: 1.5 }}
                />
              </div>
            ) : (
              /* VISUAL RESUME DOCUMENT */
              <div className="resume-printable-document" style={{ background: '#ffffff', color: '#0f172a', padding: '1rem' }}>
                
                {/* 1. MODERN TEMPLATE */}
                {activeTemplate === 'modern' && (
                  <div>
                    <div style={{ borderBottom: '3px solid #2563eb', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{formData.fullName}</h1>
                        <p style={{ fontSize: '1rem', fontWeight: '800', color: '#2563eb', margin: '0.2rem 0 0' }}>{currentUser.domain || 'Fullstack Developer'}</p>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>📍 {formData.nativeLocation}</p>
                      </div>
                      <div style={{ fontSize: '0.82rem', textAlign: 'right' }}>
                        <div>✉️ {formData.email}</div>
                        <div>📞 {formData.phone}</div>
                        <div style={{ color: '#2563eb', fontWeight: '700' }}>🔗 {formData.linkedinUrl}</div>
                        <div style={{ color: '#2563eb', fontWeight: '700' }}>💻 {formData.githubUrl}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                        PROFESSIONAL SUMMARY
                      </h3>
                      <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>{formData.summary}</p>
                    </div>

                    {/* Verified Projects */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                        VERIFIED PROJECTS & DELIVERABLES
                      </h3>
                      {mySubmissions.map((sub, i) => (
                        <div key={i} style={{ marginBottom: '0.6rem' }}>
                          <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>{sub.roundName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>{sub.githubUrl}</div>
                          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.15rem 0 0' }}>
                            {projectDescriptions[sub.id] || 'Verified sprint deliverable built and code-reviewed on Powerhub.'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Education */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                        EDUCATION
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700' }}>
                        <span>{formData.degree} — {formData.institution}</span>
                        <span>Graduation: {formData.gradYear} ({formData.cgpa})</span>
                      </div>
                    </div>

                    {/* Skills with Proficiency Bars */}
                    <div>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.5rem' }}>
                        SKILLS & PROFICIENCY
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        {(formData.skills || []).map((skill, i) => {
                          const isMatched = matchedKeywords.includes(skill.toLowerCase());
                          const rating = getSkillProficiency(skill);
                          return (
                            <div key={i} style={{ background: isMatched ? '#ecfdf5' : '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', border: isMatched ? '1px solid #86efac' : '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', color: '#0f172a' }}>
                                <span>{skill} {isMatched && '✓ Target Match'}</span>
                                <span style={{ color: '#f59e0b' }}>★ {rating} / 5</span>
                              </div>
                              <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '9999px', marginTop: '0.25rem', overflow: 'hidden' }}>
                                <div style={{ width: `${(rating / 5) * 100}%`, height: '100%', background: isMatched ? '#059669' : '#2563eb', borderRadius: '9999px' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CLASSIC ATS TEMPLATE */}
                {activeTemplate === 'classic' && (
                  <div style={{ color: '#000000', fontFamily: 'serif' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{formData.fullName}</h1>
                      <p style={{ fontSize: '0.88rem', margin: '0.3rem 0 0' }}>
                        {formData.email} | {formData.phone} | {formData.nativeLocation}
                      </p>
                      <p style={{ fontSize: '0.82rem', margin: '0.15rem 0 0' }}>
                        LinkedIn: {formData.linkedinUrl} | GitHub: {formData.githubUrl}
                      </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.15rem', marginBottom: '0.35rem' }}>
                        PROFESSIONAL SUMMARY
                      </h2>
                      <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>{formData.summary}</p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.15rem', marginBottom: '0.35rem' }}>
                        PROJECT DELIVERABLES
                      </h2>
                      {mySubmissions.map((sub, i) => (
                        <div key={i} style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                          <strong>{sub.roundName}:</strong> {sub.githubUrl}
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', color: '#334155' }}>
                            {projectDescriptions[sub.id] || 'Verified sprint submission'}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h2 style={{ fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '0.15rem', marginBottom: '0.35rem' }}>
                        TECHNICAL SKILLS
                      </h2>
                      <p style={{ fontSize: '0.85rem', margin: 0 }}>{(formData.skills || []).join(', ')}</p>
                    </div>
                  </div>
                )}

                {/* 3. MINIMAL TEMPLATE */}
                {activeTemplate === 'minimal' && (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h1 style={{ fontSize: '2.2rem', fontWeight: '300', color: '#0f172a', margin: 0 }}>{formData.fullName}</h1>
                      <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                        {formData.email} • {formData.phone} • {formData.nativeLocation}
                      </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>{formData.summary}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.65rem' }}>Projects</h3>
                      {mySubmissions.map((sub, i) => (
                        <div key={i} style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '0.85rem', marginBottom: '0.6rem' }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{sub.roundName}</h4>
                          <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>{sub.githubUrl}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.65rem' }}>Skills</h3>
                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.7', margin: 0 }}>{(formData.skills || []).join(' / ')}</p>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
