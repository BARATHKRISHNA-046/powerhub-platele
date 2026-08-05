import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, Layers, Cpu, Server, Shield, 
  Cloud, Terminal, Code, ArrowRight, ExternalLink, Sparkles 
} from 'lucide-react';

export default function FullstackRoadmapVisual({ roadmapData }) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'timeline'
  const [selectedTrack, setSelectedTrack] = useState('all'); // 'all' | 'frontend' | 'backend' | 'devops' | 'aws'

  const flowchartNodes = [
    {
      stage: '1. Frontend Foundations',
      track: 'frontend',
      topics: [
        { name: 'HTML', type: 'topic', desc: 'Semantic HTML5 structure & accessibility' },
        { name: 'CSS', type: 'topic', desc: 'CSS3 Flexbox, Grid, & responsive layouts' },
        { name: 'JavaScript', type: 'topic', desc: 'ES6+ syntax, DOM manipulation & async/await' },
        { name: 'npm', type: 'topic', desc: 'Package management & scripts' }
      ],
      checkpoints: [
        { name: 'Checkpoint - Static Webpages', desc: 'Build responsive landing pages with pure HTML/CSS' },
        { name: 'Checkpoint - Interactivity', desc: 'Dynamic DOM updates, fetch API, and external libraries' }
      ]
    },
    {
      stage: '2. Modern Frontend & Git',
      track: 'frontend',
      topics: [
        { name: 'Git', type: 'topic', desc: 'Version control basics, commits & branches' },
        { name: 'GitHub', type: 'topic', desc: 'Repositories, Pull Requests & collaboration' },
        { name: 'React', type: 'topic', desc: 'JSX, Components, Hooks, State & Props' },
        { name: 'Tailwind CSS', type: 'topic', desc: 'Utility-first modern styling' }
      ],
      checkpoints: [
        { name: 'Checkpoint - Collaborative Work', desc: 'Team branch management & conflict resolution' },
        { name: 'Checkpoint - Frontend Apps', desc: 'Multi-page React web app with router & Tailwind' }
      ]
    },
    {
      stage: '3. Backend Core (Node.js)',
      track: 'backend',
      topics: [
        { name: 'Node.js', type: 'topic', desc: 'Event loop, fs module, async I/O' }
      ],
      checkpoints: [
        { name: 'Checkpoint — CLI Apps', desc: 'Command line utilities & interactive Node tools' }
      ]
    },
    {
      stage: '4. Databases & Security',
      track: 'backend',
      topics: [
        { name: 'PostgreSQL', type: 'topic', desc: 'Relational schema, SQL queries & indexing' },
        { name: 'RESTful APIs', type: 'topic', desc: 'Express endpoints, CRUD operations & JSON response format' },
        { name: 'JWT Auth', type: 'topic', desc: 'JSON Web Tokens, password hashing & auth middleware' },
        { name: 'Redis', type: 'topic', desc: 'In-memory caching & session management' }
      ],
      checkpoints: [
        { name: 'Checkpoint — Simple CRUD Apps', desc: 'Express REST API connected to database' },
        { name: 'Checkpoint — Complete App', desc: 'Fullstack app with DB, JWT auth & caching' }
      ]
    },
    {
      stage: '5. DevOps & AWS Cloud',
      track: 'devops',
      topics: [
        { name: 'Linux Basics', type: 'topic', desc: 'Bash commands, permissions, SSH & systemctl' },
        { name: 'AWS Services', type: 'topic', desc: 'EC2, VPC, S3, Route53, SES' }
      ],
      checkpoints: [
        { name: 'Checkpoint — Deployment', desc: 'AWS EC2 server deployment & domain config' }
      ]
    },
    {
      stage: '6. Monitoring & CI/CD',
      track: 'devops',
      topics: [
        { name: 'Monit', type: 'topic', desc: 'Server process health monitoring' },
        { name: 'GitHub Actions', type: 'topic', desc: 'Automated CI/CD build & test workflows' },
        { name: 'Ansible', type: 'topic', desc: 'Automated server configuration management' }
      ],
      checkpoints: [
        { name: 'Checkpoint — Monitoring & CI / CD', desc: 'Automated testing and deployment pipelines' }
      ]
    },
    {
      stage: '7. Infrastructure as Code',
      track: 'aws',
      topics: [
        { name: 'Terraform', type: 'topic', desc: 'Declarative cloud infrastructure provisioning' }
      ],
      checkpoints: [
        { name: 'Checkpoint — Infrastructure & Automation', desc: 'Production-ready cloud capstone deployment' }
      ]
    }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
      
      {/* HEADER SECTION MATCHING ROADMAP.SH DESIGN */}
      <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '12px', height: '28px', backgroundColor: '#2563eb', borderRadius: '4px' }}></div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Full Stack Developer Roadmap
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem', maxWidth: '680px' }}>
              Target audience for this roadmap is absolute beginners wanting to get into full-stack development. Step-by-step 7-month curriculum with topics and project checkpoints.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ background: '#3b82f6', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>roadmap.sh</span> <ExternalLink size={14} />
            </div>

            {/* LEGEND BADGES MATCHING IMAGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#fef08a', border: '2px solid #ca8a04', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#854d0e' }}>Key topics to learn</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>Project Checkpoints</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACK FILTER PILLS MATCHING IMAGE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Focus Track:</span>
          {[
            { id: 'all', label: 'All Tracks' },
            { id: 'frontend', label: 'Frontend' },
            { id: 'backend', label: 'Backend' },
            { id: 'devops', label: 'DevOps' },
            { id: 'aws', label: 'AWS & Infrastructure' }
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
                backgroundColor: selectedTrack === track.id ? '#2563eb' : '#f1f5f9',
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
        {flowchartNodes
          .filter(node => selectedTrack === 'all' || node.track === selectedTrack)
          .map((node, idx) => (
            <div 
              key={idx}
              style={{
                background: '#fafafa',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#2563eb', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                    STAGE {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {node.stage}
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', background: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  Month {idx + 1} Target
                </span>
              </div>

              {/* TOPIC YELLOW BOXES FLOWCHART ROW */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#854d0e', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  🟨 KEY TOPICS TO MASTER:
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
                        <ArrowRight size={16} style={{ color: '#2563eb' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* BLACK CHECKPOINT BOXES ROW */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  ⬛ REQUIRED MILESTONE CHECKPOINTS:
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
                        borderLeft: '4px solid #3b82f6',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#38bdf8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} style={{ color: '#38bdf8' }} /> {cp.name}
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

      {/* FOOTER TRACK BADGES MATCHING IMAGE */}
      <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.65rem' }}>
          Continue Learning with following relevant tracks:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['Frontend', 'Backend', 'DevOps', 'AWS'].map(trackName => (
            <span key={trackName} style={{ background: '#3b82f6', color: '#ffffff', padding: '0.45rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}>
              {trackName}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
