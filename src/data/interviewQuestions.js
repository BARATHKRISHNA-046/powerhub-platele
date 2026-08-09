export const INITIAL_INTERVIEW_QUESTIONS = [
  // FULLSTACK & WEB APP
  {
    id: 'q-fs-1',
    domain: 'FULLSTACK',
    difficulty: 'medium',
    question_text: 'Explain the difference between Server-Side Rendering (SSR) and Client-Side Rendering (CSR). How does Next.js handle both?',
    model_answer: 'CSR loads a minimal HTML payload and renders the UI in the browser using JavaScript. SSR generates full HTML on the server per request for faster initial paint and better SEO. Next.js supports App Router with React Server Components (RSC) where components render on the server by default unless designated with "use client".',
    hints: 'Think about LCP, SEO indexing, dynamic hydration, and server vs client component boundaries.'
  },
  {
    id: 'q-fs-2',
    domain: 'FULLSTACK',
    difficulty: 'hard',
    question_text: 'How do you optimize Supabase real-time subscriptions and RLS policies for high concurrent user loads?',
    model_answer: 'Use indexed foreign key columns on filter conditions, limit real-time broadcast payloads to specific table changes using channel filters, and avoid complex nested subqueries in RLS policies by using cached SECURITY DEFINER functions.',
    hints: 'Focus on Postgres WAL replication, indexing WHERE clauses, and RLS execution overhead.'
  },
  {
    id: 'q-fs-3',
    domain: 'FULLSTACK',
    difficulty: 'easy',
    question_text: 'What are React Hooks rules, and why can you not call hooks inside loops or conditions?',
    model_answer: 'React relies on the call order of hooks to associate internal state with component instances. Calling hooks conditionally changes the execution order between renders, causing React to mismatch state slots.',
    hints: 'Mention fiber nodes, hook linked list indices, and deterministic render order.'
  },

  // AI & GENAI
  {
    id: 'q-ai-1',
    domain: 'AI',
    difficulty: 'medium',
    question_text: 'How does Retrieval-Augmented Generation (RAG) improve LLM output accuracy and combat hallucinations?',
    model_answer: 'RAG retrieves relevant external document context from a vector database using semantic embedding distance (e.g. Cosine Similarity) and inserts it directly into the LLM prompt context window, grounding the response on empirical domain data.',
    hints: 'Discuss embeddings, chunking strategies, vector search (HNSW), and prompt context injection.'
  },
  {
    id: 'q-ai-2',
    domain: 'AI',
    difficulty: 'hard',
    question_text: 'Explain the mathematical foundation of Self-Attention in Transformer models: Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) V.',
    model_answer: 'Query (Q) and Key (K) dot products compute token similarity scores. Dividing by sqrt(d_k) prevents vanishing gradients in softmax for large vector dimensions. Softmax normalizes scores into probability weights applied to Value (V) vectors.',
    hints: 'Detail dot-product scaling, softmax gradient stability, and multi-head attention decomposition.'
  },

  // EDGE AI & EMBEDDED IOT
  {
    id: 'q-iot-1',
    domain: 'Edge AI',
    difficulty: 'medium',
    question_text: 'How do quantization and INT8 precision optimization enable real-time inference on edge microcontrollers?',
    model_answer: 'Quantization maps 32-bit floating point (FP32) weights to 8-bit integer (INT8) representations, reducing model size by 75% and enabling execution on hardware SIMD/NPU accelerators without float unit hardware.',
    hints: 'Mention post-training quantization (PTQ), scale & zero-point parameters, and TensorRT/TFLite Micro.'
  },

  // AUTOMOTIVE & VLSI
  {
    id: 'q-auto-1',
    domain: 'Automotive',
    difficulty: 'hard',
    question_text: 'Explain CAN bus arbitration and collision handling in automotive ECU communications.',
    model_answer: 'CAN uses bitwise non-destructive arbitration. Dominant bits (0) overwrite recessive bits (1). If an ECU transmits a recessive bit but reads a dominant bit on the bus, it immediately halts transmission without corrupting the higher priority message.',
    hints: 'Focus on dominant vs recessive bits, CAN ID priority (lower ID = higher priority), and differential signaling.'
  }
];
