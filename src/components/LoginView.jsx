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
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: '1.5' }}>
          Track your submissions, earn leadership points, inspect domain roadmaps, and compete on the global leaderboard.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span className="tag-pill pill-blue"><Code size={13} /> Project Submissions</span>
          <span className="tag-pill pill-yellow"><Trophy size={13} /> Realtime Scores</span>
          <span className="tag-pill pill-peach"><Users size={13} /> Emoji Teams</span>
        </div>

        {/* Google OAuth Simulation Button */}
        <button
          onClick={() => setAuthScreen('profile_picker')}
          style={{
            width: '100%',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-medium)',
            background: '#ffffff',
            color: 'var(--dark-navy)',
            fontWeight: '600',
            fontSize: '0.98rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-blue)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign in with Google
          <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} style={{ color: '#10b981' }} /> Authenticated via Google OAuth Security
        </p>
      </div>
    </div>
  );
}
