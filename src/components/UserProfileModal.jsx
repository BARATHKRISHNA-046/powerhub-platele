import React from 'react';
import { X, ShieldCheck, GraduationCap, Calendar, Flame, Trophy, Mail, Layers, UserCheck } from 'lucide-react';

export default function UserProfileModal({ profile, onClose, myStreak = 0, totalScore = 0 }) {
  if (!profile) return null;

  const isMentor = profile.role === 'mentor' || (profile.roles && profile.roles.includes('mentor'));
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'User')}`;
  const avatarSrc = profile.profilePicUrl || profile.profilePic || profile.avatarUrl || fallbackAvatar;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={18} />
        </button>

        {/* Header Profile Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', borderBottom: '1px solid #f1f5f9', pb: '1.5rem' }}>
          <img
            src={avatarSrc}
            alt={profile.name}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #2563eb',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {profile.name}
              </h3>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                textTransform: 'uppercase',
                background: isMentor ? '#0f172a' : '#eff6ff',
                color: isMentor ? '#ffffff' : '#1d4ed8',
                border: isMentor ? 'none' : '1px solid #bfdbfe',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                {isMentor ? <ShieldCheck size={13} /> : <GraduationCap size={13} />}
                {isMentor ? 'Verified Mentor' : 'Verified Student'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} /> {profile.email}
            </p>
          </div>
        </div>

        {/* READ-ONLY METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Card 1: Role */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <UserCheck size={14} className="text-blue-600" /> Account Role
            </div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
              {isMentor ? 'Mentor / Instructor' : 'Student'}
            </div>
          </div>

          {/* Card 2: Cohort / Batches */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={14} className="text-purple-600" /> {isMentor ? 'Assigned Cohorts' : 'Cohort / Domain'}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
              {isMentor ? 'All Cohorts (FULLSTACK, UI/UX, AI, EMBEDDED)' : (profile.domain || 'FULLSTACK')}
            </div>
          </div>

          {!isMentor && (
            <>
              {/* Card 3: Current Streak */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c2410c', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flame size={14} /> Habit Streak
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c2410c' }}>
                  🔥 {myStreak} Day Streak
                </div>
              </div>

              {/* Card 4: Total Points */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Trophy size={14} /> Leadership Points
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#b45309' }}>
                  🏆 {totalScore} Pts Earned
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account Details Banner */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '16px',
          padding: '1rem',
          fontSize: '0.82rem',
          color: '#475569',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} />
            <span>Member Joined: <strong>{new Date(profile.created_at || Date.now()).toLocaleDateString()}</strong></span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#ffffff', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            VERIFIED PROFILE
          </span>
        </div>

        {/* PORTFOLIO QUICK ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <a
            href={`/portfolio/${profile.id}`}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1,
              background: '#0f172a',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '0.65rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.82rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(15,23,42,0.2)'
            }}
          >
            🌐 View Public Portfolio
          </a>

          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/portfolio/${profile.id}`;
              navigator.clipboard.writeText(url);
              alert(`📋 Shareable Portfolio Link Copied!\n\n${url}`);
            }}
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #0f172a',
              padding: '0.65rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            📋 Copy Portfolio Link
          </button>
        </div>
      </div>
    </div>
  );
}
