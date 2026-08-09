import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Download, Share2, Award, ExternalLink, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PublicVerifyView({ initialCertId, onBack }) {
  const { certificates, users } = useApp();
  const [searchId, setSearchId] = useState(initialCertId || 'PH-CERT-2026-X89B2Q');

  const cert = certificates?.find(c => 
    c.verification_id?.toLowerCase() === searchId.trim().toLowerCase() ||
    c.id?.toLowerCase() === searchId.trim().toLowerCase()
  ) || certificates?.[0];

  const handleShareLinkedIn = () => {
    if (!cert) return;
    const shareUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`I am proud to share my verified Powerhub Digital Certificate for completing ${cert.program_title}! 🎓 Verification ID: ${cert.verification_id}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&text=${text}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#f8fafc', padding: '2rem 1rem', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button 
            onClick={onBack} 
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to Powerhub
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff' }}>Powerhub Public Verification System</span>
          </div>
        </div>

        {/* Verification Lookup Bar */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Certificate Verification ID (e.g. PH-CERT-2026-X89B2Q)..."
            style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.65rem 1rem', color: '#ffffff', fontSize: '0.9rem', fontWeight: '600' }}
          />
          <button 
            style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Verify Certificate
          </button>
        </div>

        {cert ? (
          <div>
            {/* Authenticity Banner */}
            <div style={{ background: 'linear-gradient(90deg, #065f46, #047857)', border: '1px solid #10b981', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={28} style={{ color: '#34d399' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>Official Verified Powerhub Certificate</h3>
                  <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: 0 }}>
                    Verification ID: <strong>{cert.verification_id}</strong> • Read-only Record
                  </p>
                </div>
              </div>

              <button 
                onClick={handleShareLinkedIn}
                style={{ background: '#0077b5', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              >
                <Share2 size={16} /> Share on LinkedIn
              </button>
            </div>

            {/* LANDSCAPE CERTIFICATE DOCUMENT PREVIEW */}
            <div 
              id="certificate-print-area"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: '24px',
                padding: '3rem 2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: '12px solid #1e293b',
                position: 'relative',
                aspectRatio: '1.414 / 1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'center'
              }}
            >
              {/* Corner Ornaments */}
              <div style={{ position: 'absolute', top: '15px', left: '15px', borderTop: '3px solid #f59e0b', borderLeft: '3px solid #f59e0b', width: '30px', height: '30px' }}></div>
              <div style={{ position: 'absolute', top: '15px', right: '15px', borderTop: '3px solid #f59e0b', borderRight: '3px solid #f59e0b', width: '30px', height: '30px' }}></div>
              <div style={{ position: 'absolute', bottom: '15px', left: '15px', borderBottom: '3px solid #f59e0b', borderLeft: '3px solid #f59e0b', width: '30px', height: '30px' }}></div>
              <div style={{ position: 'absolute', bottom: '15px', right: '15px', borderBottom: '3px solid #f59e0b', borderRight: '3px solid #f59e0b', width: '30px', height: '30px' }}></div>

              {/* Certificate Header */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.3rem 0.85rem', borderRadius: '9999px', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  <Award size={14} /> Powerhub Autonomous Learning & Industry Engineering
                </div>

                <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0.25rem 0' }}>
                  Certificate of Completion
                </h1>

                <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  This official credential is proudly presented to
                </p>
              </div>

              {/* Recipient Name */}
              <div style={{ margin: '1.5rem 0' }}>
                <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#2563eb', fontFamily: 'var(--font-heading)', margin: '0 0 0.5rem', borderBottom: '2px solid #e2e8f0', display: 'inline-block', paddingBottom: '0.5rem' }}>
                  {cert.student_name}
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#334155', fontWeight: '700', maxWidth: '650px', margin: '0.75rem auto 0', lineHeight: '1.5' }}>
                  for successfully mastering the curriculum and completing all required engineering deliverables for
                </p>
                <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', marginTop: '0.5rem' }}>
                  {cert.program_title}
                </div>
              </div>

              {/* Certificate Footer & Seal */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
                {/* Issue Date & ID */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Issued Date</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                    {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '800', marginTop: '0.35rem' }}>
                    ID: {cert.verification_id}
                  </div>
                </div>

                {/* Gold Seal Badge */}
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '4px solid #fef3c7', boxShadow: '0 8px 16px rgba(245,158,11,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <ShieldCheck size={28} />
                  <span style={{ fontSize: '0.55rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.1rem' }}>Verified</span>
                </div>

                {/* Mentor Signature */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'serif', fontSize: '1.25rem', fontWeight: '700', fontStyle: 'italic', color: '#1e293b', borderBottom: '1px dashed #94a3b8', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                    Barath Krishna
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a' }}>{cert.mentor_signature || 'Lead Mentor & Program Director'}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>Powerhub Autonomous Academy</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Award size={48} style={{ color: '#f59e0b', opacity: 0.6, margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>Certificate Not Found</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              No certificate matches ID "<strong>{searchId}</strong>". Please verify the certificate ID and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
