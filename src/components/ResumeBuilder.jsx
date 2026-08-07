import React, { useState } from 'react';
import { compressImageFile, useApp } from '../context/AppContext';
import { uploadProfilePicture } from '../lib/uploadSubmission';

import { 
  FileText, Download, Printer, User, Mail, Phone, MapPin, 
  Linkedin, Github, Globe, Calendar, Award, CheckCircle2, 
  Sparkles, Save, Briefcase, GraduationCap, Plus, Trash2 
} from 'lucide-react';

export default function ResumeBuilder() {
  const { 
    currentUser, users, resumeProfiles, updateResumeProfile, 
    updateUserProfilePic, calculateStudentScore, submissions, skillRatings, teams 
  } = useApp();


  const userProfile = (resumeProfiles && resumeProfiles[currentUser.id]) || {
    fullName: currentUser.name || 'STUDENT NAME',
    dob: '2004-05-15',
    nativeLocation: 'Chennai, Tamil Nadu, India',
    email: currentUser.email || 'student@powerhub.dev',
    phone: '+91 98765 43210',
    linkedinUrl: `https://linkedin.com/in/${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '-')}`,
    githubUrl: `https://github.com/${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '')}`,
    portfolioUrl: `https://${(currentUser.name || 'student').toLowerCase().replace(/\s+/g, '')}.dev`,
    summary: `${currentUser.domain || 'FULLSTACK'} developer specializing in building fullstack solutions, team collaboration, and automated pipelines.`,
    skills: ['React.js', 'JavaScript (ES6+)', 'Node.js', 'Git / GitHub', 'REST APIs', 'TailwindCSS'],
    talents: ['Problem Solving', 'Team Collaboration', 'Fast Learner', 'System Architecture'],
    degree: 'B.E. Computer Science & Engineering',
    institution: 'Chennai Institute of Technology',
    gradYear: '2026',
    cgpa: '8.8 / 10',
    experienceRole: 'Software Developer Intern',
    experienceCompany: 'Tech Solutions Lab',
    experienceDuration: 'Jun 2025 - Aug 2025',
    experienceDesc: 'Developed interactive UI dashboards and integrated backend REST APIs.'
  };

  const [formData, setFormData] = useState(userProfile);
  const [skillInput, setSkillInput] = useState('');
  const [talentInput, setTalentInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Powerhub Platform Highlights calculation
  const scoreObj = calculateStudentScore ? calculateStudentScore(currentUser.id) : { totalScore: 45, submissionCount: 2 };
  const mySubmissions = (submissions || []).filter(s => s.studentId === currentUser.id);
  const myTeam = (teams || []).find(t => t.memberIds && t.memberIds.includes(currentUser.id));
  const mySkillRatings = (skillRatings || []).filter(r => r.studentId === currentUser.id);

  // Safe Leaderboard calculation for verified rank
  const globalLeaderboard = (users || []).map(user => {
    const sObj = calculateStudentScore ? calculateStudentScore(user.id) : { totalScore: 0 };
    return {
      ...user,
      ...sObj
    };
  }).sort((a, b) => b.totalScore - a.totalScore);

  const userRankIndex = globalLeaderboard.findIndex(u => u.id === currentUser.id);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 3;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleAddTalent = (e) => {
    e.preventDefault();
    if (!talentInput.trim()) return;
    const current = formData.talents || [];
    if (!current.includes(talentInput.trim())) {
      setFormData(prev => ({ ...prev, talents: [...current, talentInput.trim()] }));
    }
    setTalentInput('');
  };

  const handleRemoveTalent = (talentToRemove) => {
    setFormData(prev => ({
      ...prev,
      talents: (prev.talents || []).filter(t => t !== talentToRemove)
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (updateResumeProfile) {
      updateResumeProfile(currentUser.id, formData);
    }
    setSaveMessage('Resume Profile saved successfully!');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* HEADER BAR WITH GENERATE & PRINT BUTTONS */}
      <div className="card" style={{ borderColor: '#059669', borderWidth: '1.5px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileText size={24} style={{ color: '#059669' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                Student Profile & Automated Resume Generator
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Fill in your details below to generate a professional, ATS-optimized resume populated with your verified Powerhub achievements.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => setShowPreviewModal(true)} 
              className="btn-primary" 
              style={{ fontSize: '0.88rem', backgroundColor: '#059669' }}
            >
              <Sparkles size={16} /> Preview Auto Resume
            </button>

            <button 
              onClick={handlePrint} 
              className="btn-secondary" 
              style={{ fontSize: '0.88rem', backgroundColor: '#1e293b' }}
            >
              <Printer size={16} /> Download / Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN FORM & POWERHUB HIGHLIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: RESUME PROFILE FORM */}
        <div className="card">
          <span className="section-label">PROFILE INFORMATION</span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>
            Edit Resume Details
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Section 1: Personal Information */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#2752dd', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} /> Personal Details
              </h4>

              {/* Profile Picture Upload from Device Gallery */}
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <img 
                  src={(currentUser.profilePicUrl || currentUser.profilePic || currentUser.avatarUrl) ? ((currentUser.profilePicUrl || currentUser.profilePic || currentUser.avatarUrl).includes('data:image') ? (currentUser.profilePicUrl || currentUser.profilePic || currentUser.avatarUrl) : `${currentUser.profilePicUrl || currentUser.profilePic || currentUser.avatarUrl}?t=${Date.now()}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`} 
                  alt={currentUser.name} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`;
                  }}
                  style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }} 
                />

                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'block' }}>
                    Profile Picture (Gallery Upload)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                    Upload PNG, JPEG, or WEBP photo (max 2MB limit).
                  </span>

                  <label style={{ background: '#2563eb', color: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    📷 Select Photo from Gallery
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp" 
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
                        if (!validTypes.includes(file.type.toLowerCase())) {
                          alert('❌ Invalid File Format! Please select a PNG, JPEG, or WEBP image.');
                          return;
                        }

                        if (file.size > 2 * 1024 * 1024) {
                          alert(`❌ File Size Exceeds 2MB Limit! Selected file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
                          return;
                        }

                        try {
                          const res = await uploadProfilePicture(file);
                          if (res && res.profilePicUrl) {
                            updateUserProfilePic(currentUser.id, res.profilePicUrl);
                            alert(`Profile picture updated cleanly for ${currentUser.name}!`);
                          }
                        } catch (err) {
                          console.error('[Resume Profile Pic Upload Error]', err);
                          alert(err.message || 'Failed to upload profile picture.');
                        }
                      }}
                    />
                  </label>
                </div>

              </div>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName || ''} 
                    onChange={e => handleChange('fullName', e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Date of Birth (DOB)</label>
                  <input 
                    type="date" 
                    value={formData.dob || ''} 
                    onChange={e => handleChange('dob', e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Native / Location</label>
                  <input 
                    type="text" 
                    value={formData.nativeLocation || ''} 
                    onChange={e => handleChange('nativeLocation', e.target.value)} 
                    placeholder="e.g. Chennai, Tamil Nadu" 
                    required 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone || ''} 
                    onChange={e => handleChange('phone', e.target.value)} 
                    placeholder="+91 98765 43210" 
                    required 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Email Address</label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={e => handleChange('email', e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                />
              </div>
            </div>

            {/* Section 2: Online Handles & Links */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#2752dd', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={15} /> Social Profiles & Links
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <Linkedin size={13} /> LinkedIn Profile URL
                  </label>
                  <input 
                    type="url" 
                    value={formData.linkedinUrl || ''} 
                    onChange={e => handleChange('linkedinUrl', e.target.value)} 
                    placeholder="https://linkedin.com/in/..." 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <Github size={13} /> GitHub Profile URL
                  </label>
                  <input 
                    type="url" 
                    value={formData.githubUrl || ''} 
                    onChange={e => handleChange('githubUrl', e.target.value)} 
                    placeholder="https://github.com/..." 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <Globe size={13} /> Portfolio Website URL
                  </label>
                  <input 
                    type="url" 
                    value={formData.portfolioUrl || ''} 
                    onChange={e => handleChange('portfolioUrl', e.target.value)} 
                    placeholder="https://..." 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Summary */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#2752dd', marginBottom: '0.35rem' }}>
                Professional Summary / Bio
              </label>
              <textarea 
                rows="3" 
                value={formData.summary || ''} 
                onChange={e => handleChange('summary', e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
              />
            </div>

            {/* Section 4: Technical Skills & Key Talents */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#2752dd', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Skills & Talents
              </h4>

              {/* Skills Tag Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>Technical Skills</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={skillInput} 
                    onChange={e => setSkillInput(e.target.value)} 
                    placeholder="Add skill (e.g. React, Python)" 
                    style={{ flex: 1, padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                  <button type="button" onClick={handleAddSkill} className="btn-outline" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>Add</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(formData.skills || []).map(skill => (
                    <span key={skill} className="tag-pill pill-blue" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {skill}
                      <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSkill(skill)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Talents Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>Key Talents & Strengths</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={talentInput} 
                    onChange={e => setTalentInput(e.target.value)} 
                    placeholder="Add talent (e.g. Leadership, Problem Solving)" 
                    style={{ flex: 1, padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                  <button type="button" onClick={handleAddTalent} className="btn-outline" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>Add</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(formData.talents || []).map(talent => (
                    <span key={talent} className="tag-pill pill-peach" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {talent}
                      <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTalent(talent)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 5: Education */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#2752dd', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <GraduationCap size={15} /> Education
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Degree / Specialization</label>
                  <input 
                    type="text" 
                    value={formData.degree || ''} 
                    onChange={e => handleChange('degree', e.target.value)} 
                    placeholder="B.E. Automotive Engineering" 
                    required 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Institution / College</label>
                  <input 
                    type="text" 
                    value={formData.institution || ''} 
                    onChange={e => handleChange('institution', e.target.value)} 
                    placeholder="Chennai Institute of Technology" 
                    required 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>Graduation Year</label>
                  <input 
                    type="text" 
                    value={formData.gradYear || ''} 
                    onChange={e => handleChange('gradYear', e.target.value)} 
                    placeholder="2026" 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>CGPA / Score</label>
                  <input 
                    type="text" 
                    value={formData.cgpa || ''} 
                    onChange={e => handleChange('cgpa', e.target.value)} 
                    placeholder="8.8 / 10" 
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }} 
                  />
                </div>
              </div>
            </div>

            {saveMessage && (
              <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> {saveMessage}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', backgroundColor: '#059669' }}>
              <Save size={16} /> Save Profile Details
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: AUTO-POPULATED POWERHUB PLATFORM HIGHLIGHTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ borderColor: '#f59e0b', borderWidth: '1.5px', background: '#fffbeb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={20} style={{ color: '#d97706' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#92400e' }}>
                Powerhub Verified Credentials
              </h3>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#b45309', marginBottom: '1rem', lineHeight: '1.45' }}>
              These verified platform metrics are automatically injected into your auto-generated resume.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Leaderboard Rank</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>#{userRank} Global</div>
              </div>

              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Total Score</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2752dd' }}>{scoreObj.totalScore} pts</div>
              </div>

              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Deliverables</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669' }}>{scoreObj.submissionCount} Approved</div>
              </div>

              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Team Projects</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#8b5cf6' }}>{myTeam ? myTeam.name : '1 Active'}</div>
              </div>
            </div>
          </div>

          {/* LIVE RESUME ATS PREVIEW CARD */}
          <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '1px solid var(--border-medium)' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>
                {formData.fullName}
              </h2>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.85rem' }}>
                <span>📍 {formData.nativeLocation}</span>
                <span>📧 {formData.email}</span>
                <span>📞 {formData.phone}</span>
                <span>🎂 {formData.dob}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span>🔗 {formData.linkedinUrl}</span>
                <span>💻 {formData.githubUrl}</span>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                PROFESSIONAL SUMMARY
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.45' }}>{formData.summary}</p>
            </div>

            {/* Verified Powerhub Section */}
            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: '900', textTransform: 'uppercase', color: '#2752dd', marginBottom: '0.35rem' }}>
                🏆 VERIFIED POWERHUB CREDENTIALS
              </h4>
              <ul style={{ fontSize: '0.78rem', color: '#334155', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.4' }}>
                <li>Global Standings: Ranked #{userRank} with {scoreObj.totalScore} points in {currentUser.domain} track.</li>
                <li>Project Submissions: {scoreObj.submissionCount} verified GitHub sprint submissions completed on-time.</li>
                <li>Team Collaborations: Active member in {myTeam ? myTeam.name : 'Human AI Team'}.</li>
              </ul>
            </div>

            {/* Education */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                EDUCATION
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700' }}>
                <span>{formData.degree} — {formData.institution}</span>
                <span>Graduation: {formData.gradYear} (CGPA: {formData.cgpa})</span>
              </div>
            </div>

            {/* Skills & Talents */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.2rem', marginBottom: '0.35rem' }}>
                TECHNICAL SKILLS & TALENTS
              </h4>
              <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                <strong>Skills:</strong> {(formData.skills || []).join(' • ')}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.25rem' }}>
                <strong>Talents:</strong> {(formData.talents || []).join(' • ')}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* FULL RESUME PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span className="tag-pill pill-blue">ATS-Friendly Resume Preview</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrint} className="btn-primary" style={{ fontSize: '0.82rem', backgroundColor: '#059669' }}>
                  <Printer size={14} /> Print / Save as PDF
                </button>
                <button onClick={() => setShowPreviewModal(false)} className="btn-outline" style={{ fontSize: '0.82rem' }}>
                  Close
                </button>
              </div>
            </div>

            {/* ATS Printable Resume Body */}
            <div className="resume-printable-document" style={{ background: '#ffffff', color: '#0f172a', fontFamily: 'sans-serif', lineHeight: '1.5' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{formData.fullName}</h1>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0.35rem 0' }}>
                  📍 Native: {formData.nativeLocation} | 🎂 DOB: {formData.dob} | 📞 {formData.phone}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#2563eb', margin: 0 }}>
                  ✉️ {formData.email} | 🔗 {formData.linkedinUrl} | 💻 {formData.githubUrl}
                </p>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                  PROFILE SUMMARY
                </h3>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>{formData.summary}</p>
              </div>

              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '900', textTransform: 'uppercase', color: '#1e40af', marginBottom: '0.35rem' }}>
                  POWERHUB PLATFORM VERIFIED ACHIEVEMENTS
                </h3>
                <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: '1.2rem' }}>
                  <li><strong>Rank & Score:</strong> Ranked #{userRank} globally with {scoreObj.totalScore} cumulative points.</li>
                  <li><strong>On-Time Submissions:</strong> {scoreObj.submissionCount} verified project submissions reviewed & approved by mentors.</li>
                  <li><strong>Leadership & Collaboration:</strong> Active team member in {myTeam ? myTeam.name : 'Human AI Team'}.</li>
                </ul>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                  EDUCATION
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700' }}>
                  <span>{formData.degree} — {formData.institution}</span>
                  <span>Graduation: {formData.gradYear} (CGPA: {formData.cgpa})</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                  EXPERIENCE & PROJECTS
                </h3>
                <div style={{ fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>{formData.experienceRole} — {formData.experienceCompany}</span>
                    <span>{formData.experienceDuration}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.25rem 0 0' }}>{formData.experienceDesc}</p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                  SKILLS & TALENTS
                </h3>
                <p style={{ fontSize: '0.88rem', margin: '0 0 0.25rem' }}>
                  <strong>Technical Skills:</strong> {(formData.skills || []).join(', ')}
                </p>
                <p style={{ fontSize: '0.88rem', margin: 0 }}>
                  <strong>Key Talents:</strong> {(formData.talents || []).join(', ')}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
