import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Sparkles, Check, ArrowLeft, Shield } from 'lucide-react';

export default function ProfilePicker() {
  const { users, selectProfile, createProfile, setAuthScreen } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('Fullstack Development');
  const [isStudent, setIsStudent] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [avatarBg, setAvatarBg] = useState('#2752dd');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    const roles = [];
    if (isStudent) roles.push('student');
    if (isMentor) roles.push('mentor');
    if (roles.length === 0) roles.push('student');

    createProfile({ name, email, avatarBg, roles, domain });
    setShowCreateModal(false);
  };

  const bgColors = ['#2752dd', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#6366f1'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
      
      {/* Back to Login Button */}
      <button 
        onClick={() => setAuthScreen('login')}
        className="btn-outline"
        style={{ position: 'absolute', top: '2rem', left: '2rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Sign in
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={28} style={{ color: 'var(--primary-blue)' }} />
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
            Who's using Powerhub?
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Select your profile to access your personalized leaderboard & submission dashboard
        </p>
      </div>

      {/* Disney+ / Hotstar Style Profile Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        maxWidth: '900px',
        width: '100%',
        marginBottom: '3rem'
      }}>
        {users.map(user => {
          const isDualRole = user.roles.includes('student') && user.roles.includes('mentor');

          return (
            <div
              key={user.id}
              onClick={() => selectProfile(user.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                group: 'profile-card'
              }}
            >
              {/* Circular Avatar */}
              <div 
                className="avatar-circle"
                style={{
                  width: '110px',
                  height: '110px',
                  backgroundColor: user.avatarBg || 'var(--primary-blue)',
                  fontSize: '2.5rem',
                  position: 'relative',
                  border: isDualRole ? '4px solid var(--accent-gold)' : '3px solid transparent'
                }}
              >
                {user.initials}
                {isDualRole && (
                  <div 
                    title="Dual Role: Student & Mentor View Switcher"
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      right: '-6px',
                      background: 'var(--accent-gold)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      padding: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Shield size={16} />
                  </div>
                )}
              </div>

              {/* Name & Role Label */}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'block' }}>
                  {user.name}
                </span>
                
                {isDualRole ? (
                  <span className="tag-pill pill-yellow" style={{ marginTop: '0.35rem' }}>
                    Student & Mentor
                  </span>
                ) : (
                  <span className="tag-pill pill-blue" style={{ marginTop: '0.35rem' }}>
                    {user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Profile Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div 
            style={{
              width: '110px',
              height: '110px',
              borderRadius: 'var(--radius-full)',
              border: '2px dashed var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
              backgroundColor: '#f8fafc'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-blue)';
              e.currentTarget.style.color = 'var(--primary-blue)';
              e.currentTarget.style.backgroundColor = 'var(--primary-blue-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-medium)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
          >
            <UserPlus size={36} />
          </div>
          <span style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            New Profile
          </span>
        </div>
      </div>

      {/* First Time Setup Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div 
            className="card" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '100%', padding: '2rem' }}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Set Up New Powerhub Profile</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              First-time Google Sign-In setup. Configure your display name, role, and domain.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Alex Rivera"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="alex@powerhub.dev"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Primary Learning Track / Domain
                </label>
                <select
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <option value="Fullstack Development">Fullstack Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="AI (Machine Learning)">AI (Machine Learning)</option>
                  <option value="Edge AI">Edge AI</option>
                  <option value="Embedded IoT">Embedded IoT</option>
                  <option value="Automotive Track">Automotive Track</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Role(s)
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isStudent} 
                      onChange={e => setIsStudent(e.target.checked)} 
                    /> Student
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isMentor} 
                      onChange={e => setIsMentor(e.target.checked)} 
                    /> Mentor
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Avatar Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {bgColors.map(c => (
                    <div
                      key={c}
                      onClick={() => setAvatarBg(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: avatarBg === c ? '3px solid var(--text-main)' : 'none'
                      }}
                    >
                      {avatarBg === c && <Check size={16} style={{ color: '#fff' }} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
