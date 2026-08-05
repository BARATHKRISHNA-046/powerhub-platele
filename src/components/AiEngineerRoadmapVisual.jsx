import React, { useState } from 'react';
import { 
  Bot, Cpu, Shield, Database, Sparkles, Zap, ExternalLink, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function AiEngineerRoadmapVisual() {
  const [selectedTrack, setSelectedTrack] = useState('all'); // 'all' | 'models' | 'rag' | 'agents' | 'multimodal'

  const aiNodes = [
    {
      stage: '1. Introduction & Core Concepts',
      track: 'models',
      topics: [
        { name: 'Introduction', type: 'topic', desc: 'Overview of modern AI Engineering role' },
        { name: 'LLMs', type: 'topic', desc: 'Large Language Models architecture' },
        { name: 'Inference', type: 'topic', desc: 'Model latency & token execution' },
        { name: 'Prompt Engineering', type: 'topic', desc: 'Instruction design & zero-shot/few-shot prompting' }
      ],
      checkpoints: [
        { name: 'Concept Checkpoint', desc: 'Understand AI Engineer vs ML Engineer, AGI vs Narrow AI, and tokenization principles' }
      ]
    },
    {
      stage: '2. Pre-trained Models & OpenAI Platform',
      track: 'models',
      topics: [
        { name: 'Pre-trained Models', type: 'topic', desc: 'Claude, Gemini, Mistral, Llama 3' },
        { name: 'OpenAI API', type: 'topic', desc: 'Chat Completions API & System Messages' },
        { name: 'Token Management', type: 'topic', desc: 'Context length constraints & pricing' },
        { name: 'Fine-tuning', type: 'topic', desc: 'Customizing model weights for specific domains' }
      ],
      checkpoints: [
        { name: 'API Checkpoint', desc: 'Build an interactive AI Chatbot using OpenAI / Gemini API with streaming responses' }
      ]
    },
    {
      stage: '3. AI Safety, Ethics & OpenSource AI',
      track: 'models',
      topics: [
        { name: 'AI Safety & Ethics', type: 'topic', desc: 'Prompt injection mitigation, bias & privacy' },
        { name: 'OpenSource AI', type: 'topic', desc: 'Hugging Face, Transformers.js & Inference SDK' },
        { name: 'Ollama', type: 'topic', desc: 'Running LLMs locally on edge hardware' }
      ],
      checkpoints: [
        { name: 'Safety & Local LLM Checkpoint', desc: 'Deploy an offline local LLM using Ollama and add prompt injection guardrails' }
      ]
    },
    {
      stage: '4. Embeddings & Vector Databases',
      track: 'rag',
      topics: [
        { name: 'What are Embeddings', type: 'topic', desc: 'Dense vector space representations' },
        { name: 'OpenAI / HuggingFace Embeddings', type: 'topic', desc: 'Sentence Transformers & text-embedding-3' },
        { name: 'Vector Databases', type: 'topic', desc: 'Chroma, Pinecone, FAISS, Weaviate, Qdrant' },
        { name: 'Vector Search', type: 'topic', desc: 'Cosine similarity, HNSW indexing & KNN' }
      ],
      checkpoints: [
        { name: 'Semantic Search Checkpoint', desc: 'Build a semantic search engine over custom PDF documents using Pinecone/Chroma' }
      ]
    },
    {
      stage: '5. RAG (Retrieval-Augmented Generation)',
      track: 'rag',
      topics: [
        { name: 'RAG Architecture', type: 'topic', desc: 'Chunking, embedding, vector retrieval & generation' },
        { name: 'LangChain & LlamaIndex', type: 'topic', desc: 'Orchestration frameworks for RAG pipelines' },
        { name: 'OpenAI Assistant API', type: 'topic', desc: 'Managed RAG & Code Interpreter' }
      ],
      checkpoints: [
        { name: 'Full RAG Pipeline Checkpoint', desc: 'Deploy a production RAG QA bot using LlamaIndex / LangChain connected to a vector DB' }
      ]
    },
    {
      stage: '6. Autonomous AI Agents',
      track: 'agents',
      topics: [
        { name: 'AI Agents', type: 'topic', desc: 'ReAct prompting, planning & tool use' },
        { name: 'Function Calling', type: 'topic', desc: 'OpenAI Functions & structured JSON outputs' },
        { name: 'Agent Frameworks', type: 'topic', desc: 'Building multi-agent workflows' }
      ],
      checkpoints: [
        { name: 'Autonomous Agent Checkpoint', desc: 'Build an autonomous web-searching agent that executes function tools independently' }
      ]
    },
    {
      stage: '7. Multimodal AI & Dev Tools',
      track: 'multimodal',
      topics: [
        { name: 'Multimodal AI', type: 'topic', desc: 'Vision API, DALL-E, Whisper Audio API' },
        { name: 'AI Development Tools', type: 'topic', desc: 'AI code completion, copilots & automated evaluation' }
      ],
      checkpoints: [
        { name: 'Multimodal AI Capstone Checkpoint', desc: 'Create an end-to-end multimodal assistant supporting voice, image analysis, and code execution' }
      ]
    }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '2px solid #8b5cf6' }}>
      
      {/* HEADER SECTION MATCHING ROADMAP.SH AI ENGINEER */}
      <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '12px', height: '28px', backgroundColor: '#8b5cf6', borderRadius: '4px' }}></div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                AI Engineer Roadmap
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem', maxWidth: '680px' }}>
              Pre-requisites: Frontend • Backend • Full-Stack. Step-by-step master curriculum for building LLM applications, RAG pipelines, Vector DBs, and Autonomous AI Agents.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ background: '#8b5cf6', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>roadmap.sh / ai-engineer</span> <ExternalLink size={14} />
            </div>

            {/* LEGEND BADGES MATCHING IMAGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#fef08a', border: '2px solid #ca8a04', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#854d0e' }}>Key AI topics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>AI Checkpoints</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACK FILTER PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Focus Track:</span>
          {[
            { id: 'all', label: 'All AI Tracks' },
            { id: 'models', label: 'LLMs & APIs' },
            { id: 'rag', label: 'Embeddings & RAG' },
            { id: 'agents', label: 'AI Agents' },
            { id: 'multimodal', label: 'Multimodal AI' }
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
                backgroundColor: selectedTrack === track.id ? '#8b5cf6' : '#f1f5f9',
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
        {aiNodes
          .filter(node => selectedTrack === 'all' || node.track === selectedTrack)
          .map((node, idx) => (
            <div 
              key={idx}
              style={{
                background: '#faf5ff',
                border: '1.5px solid #e9d5ff',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#8b5cf6', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                    STAGE {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {node.stage}
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', background: '#f3e8ff', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  Month {idx + 1} Target
                </span>
              </div>

              {/* TOPIC YELLOW BOXES FLOWCHART ROW */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#854d0e', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  🟨 KEY AI TOPICS TO MASTER:
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
                        <ArrowRight size={16} style={{ color: '#8b5cf6' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* BLACK CHECKPOINT BOXES ROW */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  ⬛ AI IMPLEMENTATION CHECKPOINT:
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
                        borderLeft: '4px solid #a855f7',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#c084fc', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} style={{ color: '#c084fc' }} /> {cp.name}
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
          Continue learning with following relevant tracks:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['AI & Data Scientist', 'Prompt Engineering', 'RAG & Vector DBs'].map(trackName => (
            <span key={trackName} style={{ background: '#8b5cf6', color: '#ffffff', padding: '0.45rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}>
              {trackName}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
