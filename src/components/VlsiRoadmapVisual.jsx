import React, { useState } from 'react';
import { 
  Cpu, Layers, Zap, ExternalLink, ArrowRight, CheckCircle2, Shield, Activity 
} from 'lucide-react';

export default function VlsiRoadmapVisual() {
  const [selectedTrack, setSelectedTrack] = useState('all');

  const vlsiNodes = [
    {
      stage: '1. Digital Logic & Verilog HDL',
      track: 'rtl',
      topics: [
        { name: 'Boolean Algebra', desc: 'Logic gates, Karnaugh maps & minimization' },
        { name: 'Combinational Logic', desc: 'Adders, MUX, Decoders & Encoders' },
        { name: 'Sequential Circuits', desc: 'Flip-flops, Latches & Registers' },
        { name: 'Verilog HDL', desc: 'RTL modeling, Always blocks & Assignments' }
      ],
      checkpoints: [
        { name: 'Verilog ALU & Decoder Checkpoint', desc: 'Design and simulate an 8-bit Arithmetic Logic Unit (ALU) in Verilog' }
      ]
    },
    {
      stage: '2. Finite State Machines & Testbenches',
      track: 'rtl',
      topics: [
        { name: 'Mealy & Moore FSMs', desc: 'State encoding & transition tables' },
        { name: 'Testbenches', desc: 'Self-checking testbenches & stimulus generation' },
        { name: 'Clock Domain Crossing', desc: 'CDC synchronizers & metastability' }
      ],
      checkpoints: [
        { name: 'FSM Controller Simulation Checkpoint', desc: 'Create a verified FSM controller with self-checking testbenches' }
      ]
    },
    {
      stage: '3. CMOS Transistor Physics & Layout',
      track: 'physical',
      topics: [
        { name: 'CMOS Fabrication', desc: 'N-Well, P-Well, Lithography & Etching' },
        { name: 'MOSFET Physics', desc: 'IV characteristics, threshold voltage & capacitance' },
        { name: 'Standard Cell Layout', desc: 'Stick diagrams, DRC & LVS checks' }
      ],
      checkpoints: [
        { name: 'CMOS Inverter Layout Checkpoint', desc: 'Draw custom CMOS inverter layouts and run DRC/LVS verification' }
      ]
    },
    {
      stage: '4. ASIC Design Flow & Logic Synthesis',
      track: 'asic',
      topics: [
        { name: 'ASIC Flow', desc: 'RTL to GDSII execution roadmap' },
        { name: 'Logic Synthesis', desc: 'Synopsys Design Compiler / Yosys netlists' },
        { name: 'Cell Mapping', desc: 'Mapping Verilog to target foundry standard cells' }
      ],
      checkpoints: [
        { name: 'Gate-Level Netlist Checkpoint', desc: 'Synthesize Verilog code into gate-level netlists with timing constraints' }
      ]
    },
    {
      stage: '5. FPGA Prototyping & SystemVerilog',
      track: 'fpga',
      topics: [
        { name: 'FPGA Architecture', desc: 'LUTs, CLBs, DSP Slices & BRAMs' },
        { name: 'SystemVerilog', desc: 'Interfaces, OOP testbenches & Assertions (SVA)' },
        { name: 'Xilinx Vivado / Quartus', desc: 'Bitstream generation & hardware programming' }
      ],
      checkpoints: [
        { name: 'FPGA Hardware Demo Checkpoint', desc: 'Implement and verify digital logic core on physical FPGA development board' }
      ]
    },
    {
      stage: '6. Static Timing Analysis (STA) & Low Power',
      track: 'asic',
      topics: [
        { name: 'Setup & Hold Time', desc: 'Timing slack & path delays' },
        { name: 'Clock Skew / Jitter', desc: 'Tree synthesis & clock buffers' },
        { name: 'Low Power Design', desc: 'Clock gating, power gating & UPF' }
      ],
      checkpoints: [
        { name: 'STA Timing Closure Checkpoint', desc: 'Perform static timing analysis and resolve setup/hold violations' }
      ]
    },
    {
      stage: '7. RISC-V Processor Core Capstone',
      track: 'rtl',
      topics: [
        { name: 'RISC-V ISA', desc: 'Instruction Set Architecture RV32I' },
        { name: 'Pipeline Execution', desc: '5-stage pipeline, hazards & forwarding' },
        { name: 'Tapeout Prep', desc: 'GDSII layout stream & DRC signoff' }
      ],
      checkpoints: [
        { name: '32-bit RISC-V Core Capstone Checkpoint', desc: 'Design, synthesize, and test a 32-bit pipelined RISC-V CPU core' }
      ]
    }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '2px solid #06b6d4' }}>
      
      {/* HEADER SECTION MATCHING VLSI DESIGN ROADMAP */}
      <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '12px', height: '28px', backgroundColor: '#0891b2', borderRadius: '4px' }}></div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                VLSI & Semiconductor Design Engineering Roadmap
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem', maxWidth: '720px' }}>
              Structured 7-month curriculum covering Verilog HDL, FSMs, CMOS Layouts, ASIC Synthesis, SystemVerilog, FPGA Vivado Prototyping, STA & RISC-V CPU Core Tapeout.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ background: '#0891b2', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>vlsi-roadmap.org</span> <ExternalLink size={14} />
            </div>

            {/* LEGEND BADGES MATCHING IMAGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#fef08a', border: '2px solid #ca8a04', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#854d0e' }}>RTL & VLSI Topics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>Silicon Checkpoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACK FILTER PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Focus Track:</span>
          {[
            { id: 'all', label: 'All VLSI Modules' },
            { id: 'rtl', label: 'RTL & Verilog' },
            { id: 'asic', label: 'ASIC & Synthesis' },
            { id: 'fpga', label: 'FPGA Prototyping' },
            { id: 'physical', label: 'Physical Layout' }
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
                backgroundColor: selectedTrack === track.id ? '#0891b2' : '#f1f5f9',
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
        {vlsiNodes
          .filter(node => selectedTrack === 'all' || node.track === selectedTrack)
          .map((node, idx) => (
            <div 
              key={idx}
              style={{
                background: '#ecfeff',
                border: '1.5px solid #cffaff',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#0891b2', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                    STAGE {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {node.stage}
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase', background: '#cffaff', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  Month {idx + 1} Target
                </span>
              </div>

              {/* TOPIC YELLOW BOXES ROW */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#854d0e', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  🟨 HARDWARE / RTL TOPICS TO MASTER:
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
                        <ArrowRight size={16} style={{ color: '#0891b2' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* BLACK CHECKPOINT BOXES ROW */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  ⬛ SILICON / RTL CHECKPOINT:
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
                        borderLeft: '4px solid #06b6d4',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#67e8f9', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} style={{ color: '#67e8f9' }} /> {cp.name}
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
