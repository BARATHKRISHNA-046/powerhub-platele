import React, { useState } from 'react';
import { 
  Cpu, Wrench, Shield, Zap, ExternalLink, ArrowRight, CheckCircle2, Radio, Activity 
} from 'lucide-react';

export default function EmbeddedRoadmapVisual() {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'software' | 'mcu' | 'protocols' | 'os' | 'hardware'

  const embeddedNodes = [
    {
      stage: '1. Software & Programming Fundamentals',
      category: 'software',
      topics: [
        { name: 'C', level: 'required', desc: 'Core programming language for embedded systems' },
        { name: 'C++', level: 'required', desc: 'Object-oriented C++ for embedded firmware' },
        { name: 'Python', level: 'recommended', desc: 'Automation, scripting & test suite harness' },
        { name: 'State Machines', level: 'required', desc: 'FSM design for microcontroller behavior' },
        { name: 'Memory Management', level: 'required', desc: 'Stack, Heap, pointer safety & DMA memory buffers' }
      ],
      checkpoints: [
        { name: 'Firmware Fundamentals Checkpoint', desc: 'Write bare-metal C drivers for data structures and state machines on MCU' }
      ]
    },
    {
      stage: '2. Microcontroller Hardware Peripherals',
      category: 'mcu',
      topics: [
        { name: 'GPIO', level: 'required', desc: 'General Purpose Input/Output control' },
        { name: 'ADC / DAC', level: 'required', desc: 'Analog to digital / digital to analog conversion' },
        { name: 'Timers & PWM', level: 'required', desc: 'Pulse width modulation for motor & sensor control' },
        { name: 'Interrupts & DMA', level: 'required', desc: 'Hardware interrupt service routines & Direct Memory Access' },
        { name: 'Watchdog & Clock', level: 'required', desc: 'System clocks & watchdog safety reset' }
      ],
      checkpoints: [
        { name: 'Peripherals Checkpoint', desc: 'Implement multi-channel ADC reading with DMA transfers and PWM signal generation' }
      ]
    },
    {
      stage: '3. Communication Interfaces & Protocols',
      category: 'protocols',
      topics: [
        { name: 'UART / I2C / SPI', level: 'required', desc: 'Standard serial communication buses' },
        { name: 'CAN Bus', level: 'required', desc: 'Controller Area Network (Crucial for Automotive ECU communication)' },
        { name: 'LIN / FlexRay', level: 'recommended', desc: 'Automotive sub-networks & fault-tolerant buses' },
        { name: 'Ethernet & USB', level: 'recommended', desc: 'High-speed data communication' }
      ],
      checkpoints: [
        { name: 'Automotive CAN Bus Checkpoint', desc: 'Build a dual-node CAN bus network decoding vehicle telemetry frames in real-time' }
      ]
    },
    {
      stage: '4. Real-Time OS & Embedded Linux',
      category: 'os',
      topics: [
        { name: 'RTOS Basics', level: 'required', desc: 'Tasks, schedulers, semaphores, mutexes & queues' },
        { name: 'FreeRTOS / Zephyr', level: 'required', desc: 'Industry-standard open source RTOS' },
        { name: 'Linux Kernel & Drivers', level: 'possibility', desc: 'Embedded Linux kernel modules & character drivers' },
        { name: 'AUTOSAR', level: 'recommended', desc: 'Automotive open system architecture standard' }
      ],
      checkpoints: [
        { name: 'FreeRTOS Task Scheduler Checkpoint', desc: 'Deploy a multi-threaded FreeRTOS application with inter-task queue messaging' }
      ]
    },
    {
      stage: '5. Build Systems, Debugging & Testing',
      category: 'software',
      topics: [
        { name: 'Compilers / GCC & Make', level: 'required', desc: 'Cross-compilers (arm-none-eabi-gcc) & Makefile automation' },
        { name: 'JTAG / SWD & GDB', level: 'required', desc: 'Hardware debugging with OpenOCD & GDB breakpoints' },
        { name: 'TDD & Unit Testing', level: 'required', desc: 'Test Driven Development (Unity/CMock framework)' },
        { name: 'SIL / HIL Testing', level: 'recommended', desc: 'Software-in-the-loop & Hardware-in-the-loop automotive testing' }
      ],
      checkpoints: [
        { name: 'HIL & Debugging Checkpoint', desc: 'Set up automated Unit Test execution with GDB hardware breakpoint debugging' }
      ]
    },
    {
      stage: '6. Hardware & Test Equipment',
      category: 'hardware',
      topics: [
        { name: 'Electronics Fundamentals', level: 'required', desc: 'Circuits, Ohm law, transistors, op-amps & schematics' },
        { name: 'Oscilloscope & Logic Analyzer', level: 'required', desc: 'Signal measurement & protocol decoding' },
        { name: 'PCB Design & EMC', level: 'recommended', desc: 'Printed circuit board layout in KiCad / Altium' }
      ],
      checkpoints: [
        { name: 'Hardware Testing Checkpoint', desc: 'Measure CAN/SPI bus waveforms using Logic Analyzer and verify timing margins' }
      ]
    }
  ];

  return (
    <div className="card" style={{ padding: '2rem', background: '#ffffff', border: '2px solid #f97316' }}>
      
      {/* HEADER SECTION MATCHING EMBEDDED SYSTEMS ENGINEERING ROADMAP */}
      <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '12px', height: '28px', backgroundColor: '#ea580c', borderRadius: '4px' }}></div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Embedded Systems & Automotive Engineering Roadmap
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.35rem', maxWidth: '720px' }}>
              Curated hardware & software roadmap for Automotive ECUs, Microcontrollers (C/C++), CAN Bus, FreeRTOS, AUTOSAR, and HIL Testing.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ background: '#ea580c', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>github.com/m3y54m/Embedded-Engineering-Roadmap</span> <ExternalLink size={14} />
            </div>

            {/* LEGEND BADGES MATCHING IMAGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#fef08a', border: '2px solid #ca8a04', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#854d0e' }}>Required</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#ffedd5', border: '2px solid #c2410c', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#9a3412' }}>Recommended</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '14px', height: '14px', backgroundColor: '#1e293b', borderRadius: '3px' }}></span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>Checkpoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Filter Domain:</span>
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'software', label: 'C / C++ & Software' },
            { id: 'mcu', label: 'Microcontrollers' },
            { id: 'protocols', label: 'CAN Bus & Protocols' },
            { id: 'os', label: 'RTOS & Embedded Linux' },
            { id: 'hardware', label: 'Hardware & Test Equipment' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.4rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '800',
                border: 'none',
                backgroundColor: selectedCategory === cat.id ? '#ea580c' : '#f1f5f9',
                color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* VISUAL FLOWCHART DIAGRAM SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {embeddedNodes
          .filter(node => selectedCategory === 'all' || node.category === selectedCategory)
          .map((node, idx) => (
            <div 
              key={idx}
              style={{
                background: '#fff7ed',
                border: '1.5px solid #ffedd5',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#ea580c', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900' }}>
                    MODULE {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {node.stage}
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#c2410c', textTransform: 'uppercase', background: '#ffedd5', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                  Month {idx + 1} Target
                </span>
              </div>

              {/* TOPIC YELLOW & ORANGE BOXES ROW */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9a3412', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  ⚡ CORE HARDWARE / SOFTWARE TOPICS:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                  {node.topics.map((t, i) => {
                    const isRequired = t.level === 'required';
                    return (
                      <React.Fragment key={t.name}>
                        <div 
                          title={t.desc}
                          style={{
                            backgroundColor: isRequired ? '#fef08a' : '#ffedd5',
                            border: '2px solid ' + (isRequired ? '#ca8a04' : '#ea580c'),
                            color: isRequired ? '#713f12' : '#9a3412',
                            fontWeight: '900',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(234, 88, 12, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {t.name}
                        </div>
                        {i < node.topics.length - 1 && (
                          <ArrowRight size={16} style={{ color: '#ea580c' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* BLACK CHECKPOINT BOXES ROW */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                  ⬛ EMBEDDED PROJECT CHECKPOINT:
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
                        borderLeft: '4px solid #f97316',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#fdba74', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} style={{ color: '#fdba74' }} /> {cp.name}
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

      {/* FOOTER AUTOMOTIVE DOMAIN TARGETS */}
      <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '0.65rem' }}>
          Embedded Systems Application Fields:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['AUTOMOTIVE', 'CONSUMER ELECTRONICS', 'TELECOMMUNICATIONS', 'ROBOTICS', 'AEROSPACE'].map(domain => (
            <span key={domain} style={{ background: '#ea580c', color: '#ffffff', padding: '0.45rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}>
              {domain}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
