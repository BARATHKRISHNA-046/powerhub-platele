import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Sparkles, ArrowRight, Code, Trophy, Users } from 'lucide-react';

export default function LoginView() {
  const { setAuthScreen } = useApp();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Animated Light Grid Background */}
      <div className="login-bg-grid" />

      {/* Login Card */}
      <div 
        className="card card-accent-top" 
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '460px',
          width: '90%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-blue), #1d42b8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(39, 82, 221, 0.3)'
          }}>
            <Sparkles size={24} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Power<span style={{ color: 'var(--primary-blue)' }}>hub</span>
          </span>
        </div>

        <div className="section-label" style={{ marginBottom: '1.25rem' }}>
          Error Makes Clever Style System
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Accelerate Your Tech Mastery
        </h1>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
          Track your submissions, earn leadership points, inspect domain roadmaps, and compete on the global leaderboard.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <span className="tag-pill pill-blue"><Code size={13} /> Project Submissions</span>
          <span className="tag-pill pill-yellow"><Trophy size={13} /> Realtime Scores</span>
          <span className="tag-pill pill-peach"><Users size={13} /> Emoji Teams</span>
        </div>

        {/* Direct Account Select Button */}
        <button
          onClick={() => setAuthScreen('profile_picker')}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-medium)',
            background: '#ffffff',
            color: 'var(--dark-navy)',
            fontWeight: '700',
            fontSize: '0.98rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1rem'
          }}
        >
          <span>Continue to Select Profile</span>
          <ArrowRight size={18} style={{ color: 'var(--primary-blue)' }} />
        </button>

        <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} style={{ color: '#10b981' }} /> Powerhub Secure Workspace
        </p>
      </div>
    </div>
  );
}
