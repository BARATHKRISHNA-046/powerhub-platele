import React, { useState } from 'react';
import { 
  Palette, Layout, Layers, Eye, Smartphone, CheckCircle2, ArrowRight, ExternalLink 
} from 'lucide-react';

export default function UiUxRoadmapVisual() {
  const [selectedTrack, setSelectedTrack] = useState('all');

  const uiuxNodes = [
    {
      stage: '1. Visual Hierarchy & Design Tokens',
      track: 'ui',
      topics: [
        { name: 'Color Theory', desc: 'Harmonious palettes & contrast ratios' },
        { name: 'Typography', desc: 'Font pairing, line height & scale' },
        { name: 'Grid Systems', desc: '8pt grid, columns & margins' },
        { name: 'Figma Basics', desc: 'Frames, shapes & vector tools' }
      ],
      checkpoints: [
        { name: 'UI Screen Redesign Checkpoint', desc: 'Redesign an existing mobile app interface applying clean visual hierarchy' }
      ]
    },
    {
      stage: '2. User Research & Information Architecture',
      track: 'ux',
      topics: [
        { name: 'User Personas', desc: 'Target audience archetype creation' },
        { name: 'Empathy Mapping', desc: 'Mapping user thoughts, feelings & pains' },
        { name: 'User Journey Maps', desc: 'End-to-end task workflow mapping' },
        { name: 'Information Architecture', desc: 'Sitemaps & card sorting' }
      ],
      checkpoints: [
        { name: 'User Research Case Study Checkpoint', desc: 'Document user research findings, personas, and sitemaps for a new product' }
      ]
    },
    {
      stage: '3. Wireframing & Low-Fi Prototyping',
      track: 'ux',
      topics: [
        { name: 'Paper Wireframing', desc: 'Rapid paper sketching & ideation' },
        { name: 'Low-Fi Figma Wireframes', desc: 'Gray-box structural layouts' },
        { name: 'User Flow Diagrams', desc: 'Connecting screen transition paths' }
      ],
      checkpoints: [
        { name: 'Clickable Low-Fi Prototype Checkpoint', desc: 'Create a complete interactive low-fidelity wireframe flow for user testing' }
      ]
    },
    {
      stage: '4. High-Fidelity UI & Design Systems',
      track: 'ui',
      topics: [
        { name: 'Auto-Layout 5.0', desc: 'Responsive Figma frames & padding' },
        { name: 'Tokens & Components', desc: 'Master components, variants & properties' },
        { name: 'Dark Mode / Glassmorphism', desc: 'Modern elevation, blur & dark themes' }
      ],
      checkpoints: [
        { name: 'Design System Library Checkpoint', desc: 'Build a reusable Figma design system with tokens, buttons, inputs & variants' }
      ]
    },
    {
      stage: '5. Advanced Prototyping & Usability Testing',
      track: 'ux',
      topics: [
        { name: 'Smart Animate', desc: 'Micro-interactions & seamless transitions' },
        { name: 'Usability Testing', desc: 'Unmoderated & moderated user sessions' },
        { name: 'A/B Testing & Heatmaps', desc: 'Click tracking & conversion optimization' }
      ],
      checkpoints: [
        { name: 'Usability Testing Report Checkpoint', desc: 'Run user testing sessions on interactive prototypes and document UX improvements' }
      ]
    },
    {
      stage: '6. Accessibility (WCAG 2.1) & Responsive UI',
      track: 'ui',
      topics: [
        { name: 'WCAG Guidelines', desc: 'AA/AAA contrast ratios & screen reader labels' },
        { name: 'Responsive Breakpoints', desc: 'Mobile, Tablet, and Desktop layouts' }
      ],
      checkpoints: [
        { name: 'Accessible Responsive Redesign Checkpoint', desc: 'Audit and redesign web/mobile interfaces to meet WCAG AA standards' }
      ]
    },
    {
      stage: '7. End-to-End UX Case Study Capstone',
      track: 'ux',
      topics: [
        { name: 'Developer Handoff', desc: 'Figma inspect, Zeplin & CSS tokens' },
        { name: 'Portfolio Case Study', desc: 'Problem statement, process & prototype presentation' }
      ],
      checkpoints: [
        { name: 'UX Case Study Capstone Checkpoint', desc: 'Publish a complete end-to-end UX case study from research to clickable prototype' }
      ]
    }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '2px solid #ec4899' }}>
      
      {/* HEADER SECTION MATCHING ROADMAP.SH UI/UX */}
      <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '12px', height: '28px', backgroundColor: '#ec4899', borderRadius: '4px' }}></div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                UI/UX Design & Product Strategy Roadmap
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem', maxWidth: '720px' }}>
              Structured 7-month curriculum covering Visual Hierarchy, Figma Auto-Layout, User Personas, Wireframing, Design Systems, Usability Testing & Case Study Portfolios.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ background: '#ec4899', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>roadmap.sh / ux-design</span> <ExternalLink size={14} />
            </div>

            {/* LEGEND BADGES MATCHING IMAGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#fef08a', border: '2px solid #ca8a04', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#854d0e' }}>Design Skills</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>UX Checkpoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACK FILTER PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Focus Track:</span>
          {[
            { id: 'all', label: 'All UI/UX Modules' },
            { id: 'ui', label: 'Visual & UI Design' },
            { id: 'ux', label: 'UX Research & Testing' }
          ].map(track => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              style={{
                padding: '0.4rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '800',
                border: 'none',
                backgroundColor: selectedTrack === track.id ? '#ec4899' : '#f1f5f9',
                color: selectedTrack === track.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {track.label}
            </button>
          ))}
        </div>
      </div>

      {/* VISUAL FLOWCHART DIAGRAM SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {uiuxNodes
          .filter(node => selectedTrack === 'all' || node.track === selectedTrack)
          .map((node, idx) => (
            <div 
              key={idx}
              style={{
                background: '#fdf2f8',
                border: '1.5px solid #fbcfe8',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#ec4899', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                    STAGE {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {node.stage}
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#be185d', textTransform: 'uppercase', background: '#fce7f3', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  Month {idx + 1} Target
                </span>
              </div>

              {/* TOPIC YELLOW BOXES ROW */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#854d0e', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  🟨 KEY UI/UX TOPICS TO MASTER:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                  {node.topics.map((t, i) => (
                    <React.Fragment key={t.name}>
                      <div 
                        title={t.desc}
                        style={{
                          backgroundColor: '#fef08a',
                          border: '2px solid #ca8a04',
                          color: '#713f12',
                          fontWeight: '900',
                          fontSize: '0.9rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(202, 138, 4, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {t.name}
                      </div>
                      {i < node.topics.length - 1 && (
                        <ArrowRight size={16} style={{ color: '#ec4899' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* BLACK CHECKPOINT BOXES ROW */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  ⬛ UI/UX PORTFOLIO CHECKPOINT:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {node.checkpoints.map(cp => (
                    <div 
                      key={cp.name}
                      style={{
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        borderLeft: '4px solid #f472b6',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#fbcfe8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} style={{ color: '#fbcfe8' }} /> {cp.name}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                        {cp.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>

    </div>
  );
}
