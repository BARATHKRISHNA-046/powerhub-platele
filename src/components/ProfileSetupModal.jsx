import React, { useState } from 'react';
import { Sparkles, CheckCircle2, GraduationCap } from 'lucide-react';

export default function ProfileSetupModal({ profile, onCompleteSetup }) {
  const [name, setName] = useState(profile?.name || '');
  const [domain, setDomain] = useState(profile?.domain || 'FULLSTACK');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    const updatedProfile = {
      ...profile,
      name: name.trim(),
      domain,
      batch: `${domain} Cohort 2026`,
      setupCompleted: true
    };

    onCompleteSetup(updatedProfile);
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
        padding: '2.5rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          marginBottom: '1rem',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
        }}>
          <GraduationCap size={26} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Welcome to Powerhub! 🎉
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.75rem', lineHeight: '1.5' }}>
          Please confirm your full name and select your learning cohort to complete your student profile setup.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.92rem',
                fontWeight: '600',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Select Batch / Learning Cohort
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.92rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="FULLSTACK">💻 FULLSTACK Web Development</option>
              <option value="UIUX">🎨 UI/UX Design & Research</option>
              <option value="EMBEDDED">⚙️ Embedded IoT & Systems</option>
              <option value="AI_ML">🤖 AI & Machine Learning</option>
            </select>
          </div>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '0.85rem',
            fontSize: '0.8rem',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={18} style={{ flexShrink: 0 }} />
            <span>Your role will be registered as <strong>Student</strong> linked to <strong>{profile?.email}</strong>.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}
          >
            <CheckCircle2 size={18} />
            <span>Complete Setup & Launch Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  );
}
