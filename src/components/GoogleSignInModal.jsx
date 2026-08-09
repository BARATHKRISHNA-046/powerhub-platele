import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, Sparkles, User, GraduationCap, Shield } from 'lucide-react';
import { MENTOR_EMAIL } from '../lib/authService';

export default function GoogleSignInModal({ onClose, onSelectAccount }) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const email = customEmail.toLowerCase().trim();
    const name = customName.trim() || email.split('@')[0];

    onSelectAccount({
      email,
      name,
      user_metadata: { full_name: name }
    });
  };

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
        maxWidth: '460px',
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

        {/* Google OAuth Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
            Sign in with Google
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
            Choose an account to continue to Powerhub
          </p>
        </div>

        {/* PRE-CONFIGURED QUICK GOOGLE ACCOUNTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {/* Account 1: Hardcoded Mentor Email */}
          <button
            onClick={() => onSelectAccount({
              email: MENTOR_EMAIL,
              name: 'Barath Krishna (Mentor)',
              user_metadata: { full_name: 'Barath Krishna' }
            })}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              border: '1.5px solid #bfdbfe',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.9rem'
              }}>
                BK
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Barath Krishna <Shield size={14} className="text-blue-600" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '600' }}>
                  {MENTOR_EMAIL} • Mentor Role
                </div>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#2563eb' }} />
          </button>

          {/* Account 2: Demo Student Account */}
          <button
            onClick={() => onSelectAccount({
              email: 'student.alex@gmail.com',
              name: 'Alex Johnson',
              user_metadata: { full_name: 'Alex Johnson' }
            })}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#475569',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.9rem'
              }}>
                AJ
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Alex Johnson <GraduationCap size={14} className="text-purple-600" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                  student.alex@gmail.com • Student Role
                </div>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#64748b' }} />
          </button>
        </div>

        {/* CUSTOM GOOGLE EMAIL INPUT */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
            Or Sign In With Any Google Account
          </div>

          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              required
              placeholder="Enter your Google email..."
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Enter your full name (optional)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              style={{
                padding: '0.8rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
              }}
            >
              <span>Continue with Custom Account</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Role Rule: <strong>{MENTOR_EMAIL}</strong> = Mentor • All others = Student</span>
        </div>
      </div>
    </div>
  );
}
