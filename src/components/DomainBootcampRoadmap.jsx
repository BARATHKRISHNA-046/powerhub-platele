import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, CheckCircle2, ArrowRight, ExternalLink, Calendar, 
  Award, Shield, Sparkles, BookOpen, Layers, Laptop, Globe, Flame
} from 'lucide-react';

export default function DomainBootcampRoadmap() {
  const { currentUser } = useApp();
  const [selectedStage, setSelectedStage] = useState('all');

  // Track 30-day practice/submission grid state per stage (1 to 7)
  const [stageProgressMap, setStageProgressMap] = useState(() => {
    // Default initial mock green days for Github-style cheerup grid
    const initialMap = {};
    for (let s = 1; s <= 7; s++) {
      // 30 days per stage
      const days = Array(30).fill(false);
      if (s === 1) {
        // Stage 1 active with multiple green submission days
        [0, 1, 2, 4, 7, 8, 11, 14, 15, 18, 21, 22, 27, 28, 29].forEach(idx => days[idx] = true);
      } else if (s === 2) {
        [0, 1, 3, 5, 9, 12].forEach(idx => days[idx] = true);
      } else {
        [0, 1].forEach(idx => days[idx] = true);
      }
      initialMap[s] = days;
    }
    return initialMap;
  });

  const toggleStageDay = (stageNum, dayIndex) => {
    setStageProgressMap(prev => {
      const currentDays = [...(prev[stageNum] || Array(30).fill(false))];
      currentDays[dayIndex] = !currentDays[dayIndex];
      return { ...prev, [stageNum]: currentDays };
    });
  };

  const domainConfigs = {
    'FULLSTACK': {
      title: 'Full Stack Web Development Bootcamp',
      description: 'Industry-led Full Stack Training designed to help you transition to the next phase of your software career with a proven track record of success.',
      logos: ['https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'],
      pills: [
        { name: 'HTML', bg: '#ffedd5', color: '#9a3412' },
        { name: 'CSS', bg: '#e0f2fe', color: '#0369a1' },
        { name: 'JavaScript', bg: '#fef08a', color: '#713f12' },
        { name: 'TailwindCSS', bg: '#cffaff', color: '#0e7490' },
        { name: 'ReactJS', bg: '#dbeafe', color: '#1e40af' },
        { name: 'NodeJS', bg: '#dcfce7', color: '#166534' },
        { name: 'ExpressJS', bg: '#f1f5f9', color: '#334155' },
        { name: 'PostgreSQL', bg: '#bbf7d0', color: '#14532d' }
      ],
      stages: [
        {
          stage: 1,
          title: 'Stage 1: Web & Frontend Foundations',
          topics: ['HTML5', 'CSS3 Flexbox/Grid', 'JavaScript ES6+', 'npm Packages'],
          desc: 'Build responsive landing pages and interactive DOM applications.'
        },
        {
          stage: 2,
          title: 'Stage 2: Modern Frontend & Version Control',
          topics: ['Git', 'GitHub Workflows', 'React Hooks & State', 'Tailwind CSS'],
          desc: 'Team PR workflows, component libraries, and SPA architecture.'
        },
        {
          stage: 3,
          title: 'Stage 3: Backend Core & API Design',
          topics: ['Node.js Event Loop', 'Express Middleware', 'RESTful API Design', 'Input Validation'],
          desc: 'Develop robust backend APIs with middleware and JSON payloads.'
        },
        {
          stage: 4,
          title: 'Stage 4: Databases & Authentication Architecture',
          topics: ['PostgreSQL / MongoDB', 'Prisma / Mongoose ORM', 'JWT Tokens', 'Redis Caching'],
          desc: 'Implement user auth, database relations, and caching layers.'
        },
        {
          stage: 5,
          title: 'Stage 5: Linux & AWS Cloud Infrastructure',
          topics: ['Linux Bash Shell', 'AWS EC2', 'VPC & S3', 'Route53 & Nginx Reverse Proxy'],
          desc: 'Deploy fullstack app onto AWS EC2 with custom domain and SSL.'
        },
        {
          stage: 6,
          title: 'Stage 6: CI/CD Pipelines & Server Monitoring',
          topics: ['GitHub Actions CI/CD', 'Automated Unit Tests', 'Monit Health Check', 'Docker Containers'],
          desc: 'Automate build, test, and release pipelines with health alerts.'
        },
        {
          stage: 7,
          title: 'Stage 7: Infrastructure as Code & Micro-SaaS Capstone',
          topics: ['Terraform IaC', 'Cloud Architecture', 'System Scaling', 'Production Capstone'],
          desc: 'Final end-to-end fullstack SaaS application deployed on cloud.'
        }
      ]
    },
    'EDGEAI': {
      title: 'AI & Edge Computing Systems Bootcamp',
      description: 'Industry-led Edge AI & Neural Network Training designed for deploying high-performance ML models directly onto embedded hardware.',
      logos: ['https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg'],
      pills: [
        { name: 'Python', bg: '#fef08a', color: '#713f12' },
        { name: 'PyTorch', bg: '#ffedd5', color: '#9a3412' },
        { name: 'TinyML', bg: '#e0f2fe', color: '#0369a1' },
        { name: 'TFLite', bg: '#ffe4e6', color: '#9f1239' },
        { name: 'ONNX Runtime', bg: '#dcfce7', color: '#166534' },
        { name: 'Raspberry Pi', bg: '#f1f5f9', color: '#334155' },
        { name: 'Jetson Nano', bg: '#cffaff', color: '#0e7490' },
        { name: 'OpenCV Vision', bg: '#bbf7d0', color: '#14532d' }
      ],
      stages: [
        {
          stage: 1,
          title: 'Stage 1: Edge Computing & Hardware Overview',
          topics: ['Edge Computing Basics', 'Embedded Linux Systems', 'Edge vs Cloud AI', 'Hardware Architectures'],
          desc: 'Compare cloud inference latency vs local edge hardware execution.'
        },
        {
          stage: 2,
          title: 'Stage 2: Model Optimization & Quantization',
          topics: ['INT8 Quantization', 'Model Pruning', 'Knowledge Distillation', 'TinyML Optimization'],
          desc: 'Shrink neural network footprint by 75% while preserving accuracy.'
        },
        {
          stage: 3,
          title: 'Stage 3: Edge AI Frameworks & Runtime Engines',
          topics: ['TensorFlow Lite', 'ONNX Runtime', 'OpenVINO', 'TensorRT Engines'],
          desc: 'Convert PyTorch models into optimized TFLite and ONNX binaries.'
        },
        {
          stage: 4,
          title: 'Stage 4: Hardware Platform Deployment',
          topics: ['Raspberry Pi 5', 'NVIDIA Jetson Nano', 'GPIO Interfaces', 'Thermal Management'],
          desc: 'Deploy compiled vision model onto Jetson Nano / Raspberry Pi.'
        },
        {
          stage: 5,
          title: 'Stage 5: Real-time Computer Vision Inference',
          topics: ['OpenCV Pipeline', 'YOLO Object Detection', 'MediaPipe Tracking', 'FPS Optimization'],
          desc: 'Build 30+ FPS real-time object tracking camera pipeline on edge.'
        },
        {
          stage: 6,
          title: 'Stage 6: Low-Power Pipelines & OTA Updates',
          topics: ['Power Consumption Profiling', 'Battery Benchmarks', 'OTA Model Deployments', 'Edge Security'],
          desc: 'Optimize power draw under continuous inference workloads.'
        },
        {
          stage: 7,
          title: 'Stage 7: Edge AI Camera Application Capstone',
          topics: ['End-to-End Edge Solution', 'Hardware Enclosure', 'Web Dashboard Interop', 'Production Capstone'],
          desc: 'Deploy standalone smart camera system with live web telemetry.'
        }
      ]
    },
    'AUTOMOTIVE': {
      title: 'Automotive & Embedded Systems Engineering Bootcamp',
      description: 'Industry-standard Automotive Electronics & ECU Firmware Training covering C/C++, CAN Bus, FreeRTOS, AUTOSAR, and HIL Testing.',
      logos: ['https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/embeddedc/embeddedc-original.svg'],
      pills: [
        { name: 'C', bg: '#fef08a', color: '#713f12' },
        { name: 'C++', bg: '#dbeafe', color: '#1e40af' },
        { name: 'STM32 MCU', bg: '#ffedd5', color: '#9a3412' },
        { name: 'CAN Bus', bg: '#ffe4e6', color: '#9f1239' },
        { name: 'LIN Protocol', bg: '#e0f2fe', color: '#0369a1' },
        { name: 'FreeRTOS', bg: '#dcfce7', color: '#166534' },
        { name: 'AUTOSAR', bg: '#f1f5f9', color: '#334155' },
        { name: 'HIL Testing', bg: '#bbf7d0', color: '#14532d' }
      ],
      stages: [
        {
          stage: 1,
          title: 'Stage 1: Embedded C/C++ & State Machines',
          topics: ['C/C++ Pointers & Memory', 'Registers & Bitwise Ops', 'Finite State Machines', 'Bare-Metal Firmware'],
          desc: 'Write bare-metal drivers for sensor inputs and state machines in C.'
        },
        {
          stage: 2,
          title: 'Stage 2: Microcontroller Hardware Peripherals',
          topics: ['GPIO & Timers', 'ADC/DAC Reading', 'PWM Motor Control', 'Interrupts & DMA'],
          desc: 'Implement DMA transfers for analog sensor sampling with PWM outputs.'
        },
        {
          stage: 3,
          title: 'Stage 3: Automotive CAN Bus & LIN Communication',
          topics: ['CAN 2.0B Protocol', 'CAN Transceivers', 'DBC Frame Decoding', 'LIN Bus Subnetworks'],
          desc: 'Establish CAN bus communication between two microcontrollers with DBC decoding.'
        },
        {
          stage: 4,
          title: 'Stage 4: FreeRTOS & Real-Time Task Scheduling',
          topics: ['FreeRTOS Tasks', 'Mutexes & Semaphores', 'Queue Messaging', 'Task Priorities'],
          desc: 'Schedule deterministic real-time tasks for motor and CAN message processing.'
        },
        {
          stage: 5,
          title: 'Stage 5: ADAS Sensors & CARLA Simulator Interop',
          topics: ['Radar/Lidar Basics', 'Ultrasonic Sensors', 'CARLA Simulator', 'Vehicle Telematics'],
          desc: 'Process simulated obstacle distance telemetry in automotive simulator.'
        },
        {
          stage: 6,
          title: 'Stage 6: ISO 26262 Functional Safety & HIL Testing',
          topics: ['ISO 26262 ASIL', 'UDS / OBD-II Diagnostics', 'Hardware-in-the-Loop (HIL)', 'Fault Injection'],
          desc: 'Automate hardware-in-the-loop test suite with error status decoding.'
        },
        {
          stage: 7,
          title: 'Stage 7: AUTOSAR ECU Control Unit Capstone',
          topics: ['AUTOSAR BSW Layers', 'RTE Interface', 'Complex Drivers', 'Production ECU Capstone'],
          desc: 'Final ECU controller software verified with CAN bus telemetry dashboard.'
        }
      ]
    },
    'UIUX': {
      title: 'UI/UX & Product Design Strategy Bootcamp',
      description: 'Industry-led Product Design Training covering Color Theory, Figma Auto-Layout, User Research, Wireframing, Design Systems, and UX Case Studies.',
      logos: ['https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xd/xd-plain.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg'],
      pills: [
        { name: 'Color Theory', bg: '#fef08a', color: '#713f12' },
        { name: 'Typography', bg: '#dbeafe', color: '#1e40af' },
        { name: 'Figma Auto-Layout', bg: '#ffe4e6', color: '#9f1239' },
        { name: 'User Personas', bg: '#ffedd5', color: '#9a3412' },
        { name: 'Wireframing', bg: '#e0f2fe', color: '#0369a1' },
        { name: 'Design Systems', bg: '#dcfce7', color: '#166534' },
        { name: 'Smart Animate', bg: '#f1f5f9', color: '#334155' },
        { name: 'WCAG 2.1', bg: '#bbf7d0', color: '#14532d' }
      ],
      stages: [
        {
          stage: 1,
          title: 'Stage 1: Visual Hierarchy & Design Tokens',
          topics: ['Color Contrast Ratios', 'Typography Scales', '8pt Grid Systems', 'Figma Vector Tools'],
          desc: 'Redesign existing mobile interface applying strict visual hierarchy.'
        },
        {
          stage: 2,
          title: 'Stage 2: User Research & Empathy Mapping',
          topics: ['User Personas', 'Empathy Maps', 'User Journey Mapping', 'Information Architecture'],
          desc: 'Document user interviews, pain points, and product sitemaps.'
        },
        {
          stage: 3,
          title: 'Stage 3: Wireframing & Low-Fidelity Layouts',
          topics: ['Paper Sketches', 'Low-Fi Figma Wireframes', 'User Flow Diagrams', 'Content Structure'],
          desc: 'Create interactive low-fidelity wireframe prototype for early testing.'
        },
        {
          stage: 4,
          title: 'Stage 4: High-Fidelity UI & Design Systems',
          topics: ['Figma Auto-Layout 5.0', 'Tokens & Variables', 'Variants & Properties', 'Dark Mode / Glassmorphism'],
          desc: 'Build full component library with buttons, inputs, modals & tokens.'
        },
        {
          stage: 5,
          title: 'Stage 5: Advanced Prototyping & Usability Testing',
          topics: ['Figma Smart Animate', 'Micro-interactions', 'Usability Testing Sessions', 'A/B Testing Metrics'],
          desc: 'Run testing sessions on clickable prototypes and optimize UX flow.'
        },
        {
          stage: 6,
          title: 'Stage 6: Accessibility (WCAG 2.1) & Responsive UI',
          topics: ['WCAG AA Standards', 'Color Contrast Compliance', 'Responsive Breakpoints', 'Screen Reader Labels'],
          desc: 'Audit and redesign web/mobile screens to achieve WCAG compliance.'
        },
        {
          stage: 7,
          title: 'Stage 7: Portfolio Case Study Capstone',
          topics: ['Developer Handoff (Figma Inspect)', 'Zeplin Export', 'UX Case Study Documentation', 'Portfolio Presentation'],
          desc: 'Publish complete UX case study from research to high-fidelity prototype.'
        }
      ]
    },
    'VLSI': {
      title: 'VLSI & Semiconductor Design Engineering Bootcamp',
      description: 'Industry-led Chip Design & RTL Training covering Verilog HDL, FSMs, CMOS Layouts, ASIC Synthesis, SystemVerilog, FPGA Vivado, STA & RISC-V CPU Core Tapeout.',
      logos: ['https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg'],
      pills: [
        { name: 'Verilog HDL', bg: '#fef08a', color: '#713f12' },
        { name: 'SystemVerilog', bg: '#dbeafe', color: '#1e40af' },
        { name: 'Mealy / Moore FSM', bg: '#ffedd5', color: '#9a3412' },
        { name: 'CMOS Layout', bg: '#ffe4e6', color: '#9f1239' },
        { name: 'ASIC Synthesis', bg: '#e0f2fe', color: '#0369a1' },
        { name: 'Xilinx Vivado', bg: '#dcfce7', color: '#166534' },
        { name: 'STA Timing', bg: '#f1f5f9', color: '#334155' },
        { name: 'RISC-V ISA', bg: '#bbf7d0', color: '#14532d' }
      ],
      stages: [
        {
          stage: 1,
          title: 'Stage 1: Digital Logic & Verilog HDL Foundations',
          topics: ['Boolean Algebra & K-Maps', 'Combinational Logic', 'Sequential Logic', 'Verilog RTL Modeling'],
          desc: 'Design and simulate an 8-bit Arithmetic Logic Unit in Verilog.'
        },
        {
          stage: 2,
          title: 'Stage 2: Finite State Machines & Self-Checking Testbenches',
          topics: ['FSM State Encoding', 'Self-Checking Testbenches', 'Clock Domain Crossing', 'Reset Synchronizers'],
          desc: 'Create verified FSM controller with automated stimulus testbenches.'
        },
        {
          stage: 3,
          title: 'Stage 3: CMOS Transistor Physics & Physical Layout',
          topics: ['CMOS Fabrication Flow', 'MOSFET Physics & Thresholds', 'Stick Diagrams', 'DRC & LVS Verification'],
          desc: 'Draw custom CMOS inverter layouts and run DRC/LVS signoff.'
        },
        {
          stage: 4,
          title: 'Stage 4: ASIC Design Flow & Logic Synthesis',
          topics: ['RTL to GDSII Flow', 'Synopsys Design Compiler / Yosys', 'Gate-Level Netlists', 'Standard Cell Mapping'],
          desc: 'Synthesize Verilog RTL code into gate-level netlists with constraints.'
        },
        {
          stage: 5,
          title: 'Stage 5: FPGA Prototyping & SystemVerilog Assertions',
          topics: ['FPGA LUTs & BRAMs', 'Xilinx Vivado / Quartus', 'SystemVerilog OOP', 'SVA Assertions'],
          desc: 'Implement and verify digital logic core on physical FPGA board.'
        },
        {
          stage: 6,
          title: 'Stage 6: Static Timing Analysis (STA) & Low Power Design',
          topics: ['Setup & Hold Slack', 'Clock Skew / Jitter', 'SDC Constraints', 'Clock Gating & UPF'],
          desc: 'Perform static timing analysis and resolve setup/hold violations.'
        },
        {
          stage: 7,
          title: 'Stage 7: 32-bit RISC-V Processor Core Tapeout Capstone',
          topics: ['RISC-V ISA Architecture', '5-Stage Pipelining', 'Hazard Detection', 'Tapeout GDSII Signoff'],
          desc: 'Design, synthesize, and test 32-bit pipelined RISC-V CPU core.'
        }
      ]
    }
  };

  const currentDomain = currentUser.domain || 'FULLSTACK';
  const config = domainConfigs[currentDomain] || domainConfigs['FULLSTACK'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* TOP BOOTCAMP DOMAIN CARD MATCHING UPLOADED PICTURE PATTERN */}
      <div 
        className="card" 
        style={{ 
          background: '#ffffff', 
          border: '1.5px solid #bfdbfe', 
          borderRadius: '16px', 
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', maxWidth: '720px' }}>
            {/* Domain Logo Stack Icon */}
            <div style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}>
              <Layers size={28} />
            </div>

            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                {config.title}
              </h1>
              <p style={{ fontSize: '0.92rem', color: '#475569', marginTop: '0.4rem', lineHeight: '1.55' }}>
                {config.description}
              </p>
            </div>
          </div>

          {/* Right-aligned Technology Logos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {config.logos.map((logoUrl, i) => (
              <img 
                key={i} 
                src={logoUrl} 
                alt="Tech Logo" 
                style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
              />
            ))}
          </div>

        </div>

        {/* PASTEL TECH TAG PILLS ROW MATCHING UPLOADED PICTURE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {config.pills.map((pill, i) => (
            <span 
              key={i} 
              style={{ 
                backgroundColor: pill.bg, 
                color: pill.color, 
                fontWeight: '800', 
                fontSize: '0.85rem', 
                padding: '0.4rem 1rem', 
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              {pill.name}
            </span>
          ))}
        </div>

        {/* BOTTOM META BAR & ENROLL BUTTON MATCHING UPLOADED PICTURE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></span> ((•)) Online Cohort
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🕒 7 Months
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              💼 Placement Assistance
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              👨‍🏫 Live Mentor Support
            </span>
          </div>

          <button 
            style={{ 
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '0.65rem 1.6rem', 
              fontSize: '0.9rem', 
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            Active Cohort Enrolled ✔
          </button>
        </div>

      </div>

      {/* STAGE 1 TO STAGE 7 VISUAL ROADMAP TIMELINE */}
      <div className="card" style={{ padding: '2rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="section-label">CURRICULUM ROADMAP</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginTop: '0.2rem' }}>
              Stage 1 to 7 Master Roadmap: {currentDomain}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sequential stage-by-stage progression curriculum. Each stage contains core topics and a 30-day GitHub learning cheerup grid.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setSelectedStage('all')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '800',
                border: 'none',
                backgroundColor: selectedStage === 'all' ? '#2563eb' : '#f1f5f9',
                color: selectedStage === 'all' ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              All 7 Stages
            </button>
          </div>
        </div>

        {/* STAGE CARDS GRID — LIGHT WHITE STAGE BOXES MATCHING USER REQUEST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {config.stages.map((stg) => {
            const stageDays = stageProgressMap[stg.stage] || Array(30).fill(false);
            const greenCount = stageDays.filter(Boolean).length;

            return (
              <div 
                key={stg.stage}
                style={{
                  background: '#ffffff', // LIGHT WHITE STAGE BOX BACKGROUND
                  border: '1.5px solid #e2e8f0', // CLEAN BORDER
                  borderRadius: '14px',
                  padding: '1.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.1rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}
              >
                {/* Stage Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ 
                      background: stg.stage === 1 ? '#2563eb' : '#475569', 
                      color: '#ffffff', 
                      padding: '0.3rem 0.85rem', 
                      borderRadius: '6px', 
                      fontSize: '0.82rem', 
                      fontWeight: '900' 
                    }}>
                      STAGE {stg.stage}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                      {stg.title}
                    </h3>
                  </div>

                  {stg.stage === 1 ? (
                    <span style={{ background: '#fef08a', border: '1px solid #ca8a04', color: '#713f12', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800' }}>
                      ★ CURRENT ACTIVE STAGE
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>
                      Month {stg.stage} Target
                    </span>
                  )}
                </div>

                {/* Key Stage Topics in Pastel Pills */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '0.45rem' }}>
                    🟨 Key Stage Topics:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {stg.topics.map((t, idx) => {
                      const theme = [
                        { bg: '#ffedd5', border: '#fed7aa', color: '#9a3412' }, // Peach
                        { bg: '#e0f2fe', border: '#bae6fd', color: '#0369a1' }, // Sky Blue
                        { bg: '#fef08a', border: '#fde047', color: '#713f12' }, // Yellow
                        { bg: '#cffaff', border: '#a5f3fc', color: '#0e7490' }, // Cyan
                        { bg: '#dbeafe', border: '#bfdbfe', color: '#1e40af' }, // Soft Blue
                        { bg: '#dcfce7', border: '#bbf7d0', color: '#166534' }, // Mint Green
                        { bg: '#ffe4e6', border: '#fecdd3', color: '#9f1239' }  // Rose Pink
                      ][(stg.stage + idx) % 7];

                      return (
                        <span 
                          key={idx} 
                          style={{ 
                            backgroundColor: theme.bg, 
                            border: '1.5px solid ' + theme.border, 
                            color: theme.color, 
                            padding: '0.45rem 0.95rem', 
                            borderRadius: '8px', 
                            fontSize: '0.85rem', 
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* GITHUB-STYLE 30-DAY LEARNING & PRACTICE CHEERUP GRID MATCHING FIRST UPLOADED PICTURE */}
                <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Flame size={16} style={{ color: '#22c55e' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>
                        30-Day Stage Learning & Daily Submission Grid
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#166534', background: '#dcfce7', padding: '0.2rem 0.65rem', borderRadius: '6px' }}>
                      {greenCount} / 30 Days Green ✔
                    </span>
                  </div>

                  {/* 30 MINI SQUARES GRID MATCHING GITHUB GRAPH & SUBMISSION STATUS */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '0.75rem' }}>
                    {stageDays.map((isSubmitted, dayIdx) => {
                      // Automatic status check: Dark Green with White Tick (✔) if submitted, Light Green with Soft Green Tick (✓) if not submitted
                      const isDarkGreen = isSubmitted;

                      return (
                        <div 
                          key={dayIdx}
                          onClick={() => toggleStageDay(stg.stage, dayIdx)}
                          title={`Stage ${stg.stage} - Day ${dayIdx + 1}: ${isDarkGreen ? 'Work Submitted in Panel (Dark Green Tick ✔)' : 'Not Submitted Yet (Light Green Tick ✓)'}`}
                          style={{
                            width: '21px',
                            height: '21px',
                            borderRadius: '4px',
                            backgroundColor: isDarkGreen ? '#15803d' : '#dcfce7',
                            border: '1.5px solid ' + (isDarkGreen ? '#166534' : '#86efac'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isDarkGreen ? '0 2px 4px rgba(21, 128, 61, 0.35)' : 'none'
                          }}
                        >
                          <span style={{ 
                            color: isDarkGreen ? '#ffffff' : '#15803d', 
                            fontSize: '11px', 
                            fontWeight: '900',
                            lineHeight: '1'
                          }}>
                            ✓
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* GITHUB LEGEND FOOTER MATCHING FIRST UPLOADED PICTURE */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                    <span>✓ Light Green = Not Submitted | ✔ Dark Green Tick = Work Submitted in Panel</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Not Submitted</span>
                      <span style={{ width: '12px', height: '12px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontSize: '8px', fontWeight: '900' }}>✓</span>
                      <span>→ Submitted</span>
                      <span style={{ width: '12px', height: '12px', backgroundColor: '#15803d', borderRadius: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '8px', fontWeight: '900' }}>✓</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
