export const INITIAL_USERS = [
  {
    id: 'user-barath',
    googleId: 'google-101',
    name: 'BARATHKRISHNA H',
    email: 'barathkrishna@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#38bdf8',
    initials: 'BK',
    roles: ['student', 'mentor'],
    domain: 'FULLSTACK',
    bootcampId: 'bootcamp-1',
    bio: 'Dual-role mentor & lead student building fullstack AI platforms.'
  },
  {
    id: 'user-abinav',
    googleId: 'google-105',
    name: 'ABINAVBRUNDHAN S',
    email: 'abinav@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#f472b6',
    initials: 'AB',
    roles: ['student'],
    domain: 'VLSI',
    bootcampId: 'bootcamp-2',
    bio: 'Embedded AI systems & TinyML builder.'
  },
  {
    id: 'user-shankar',
    googleId: 'google-102',
    name: 'SHANKAR S',
    email: 'shankar@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#fb923c',
    initials: 'SK',
    roles: ['student'],
    domain: 'AUTOMOTIVE',
    bootcampId: 'bootcamp-1',
    bio: 'Automotive systems & React developer.'
  },
  {
    id: 'user-gowtham',
    googleId: 'google-104',
    name: 'GOWTHAM',
    email: 'gowtham@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#a78bfa',
    initials: 'GT',
    roles: ['student'],
    domain: 'UIUX',
    bootcampId: 'bootcamp-1',
    bio: 'UI/UX design & machine learning practitioner.'
  },
  {
    id: 'user-akshaya',
    googleId: 'google-106',
    name: 'AKSHAYAPRIYA S',
    email: 'akshaya@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#facc15',
    initials: 'AK',
    roles: ['student'],
    domain: 'EDGEAI',
    bootcampId: 'bootcamp-2',
    bio: 'Edge AI hardware researcher.'
  },
  {
    id: 'user-navin',
    googleId: 'google-107',
    name: 'NAVIN V',
    email: 'navin@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#fb7185',
    initials: 'NV',
    roles: ['student'],
    domain: 'EDGEAI',
    bootcampId: 'bootcamp-1',
    bio: 'Edge AI & neural net practitioner.'
  },
  {
    id: 'user-kanika',
    googleId: 'google-103',
    name: 'KANIKA R',
    email: 'kanika@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#34d399',
    initials: 'KN',
    roles: ['student'],
    domain: 'FULLSTACK',
    bootcampId: 'bootcamp-1',
    bio: 'Fullstack web developer.'
  }
];

export const INITIAL_RESUME_PROFILES = {
  'user-shankar': {
    fullName: 'SHANKAR S',
    dob: '2004-05-15',
    nativeLocation: 'Chennai, Tamil Nadu, India',
    email: 'shankar@powerhub.dev',
    phone: '+91 98765 43210',
    linkedinUrl: 'https://linkedin.com/in/shankar-s',
    githubUrl: 'https://github.com/shankar',
    portfolioUrl: 'https://shankar.dev',
    summary: 'Passionate Automotive & React developer focused on vehicle telematics, embedded systems, CAN bus protocols, and fullstack web applications.',
    skills: ['React.js', 'JavaScript (ES6+)', 'Node.js', 'CAN Bus Protocol', 'Embedded C++', 'TailwindCSS', 'Git / GitHub', 'REST APIs'],
    talents: ['System Architecture', 'Problem Solving', 'Team Leadership', 'Fast Learner'],
    degree: 'B.E. Automotive Engineering',
    institution: 'Chennai Institute of Technology',
    gradYear: '2026',
    cgpa: '8.8 / 10',
    experienceRole: 'Automotive Software Intern',
    experienceCompany: 'Mobility Tech Labs',
    experienceDuration: 'Jun 2025 - Aug 2025',
    experienceDesc: 'Developed CAN bus telemetry decoding tools and real-time dashboard components using React and C++.'
  },
  'user-barath': {
    fullName: 'BARATHKRISHNA H',
    dob: '2003-11-20',
    nativeLocation: 'Coimbatore, Tamil Nadu, India',
    email: 'barathkrishna@powerhub.dev',
    phone: '+91 91234 56789',
    linkedinUrl: 'https://linkedin.com/in/barathkrishna-h',
    githubUrl: 'https://github.com/barathkrishna',
    portfolioUrl: 'https://barathkrishna.dev',
    summary: 'Fullstack AI engineer and mentor with expertise in React, Node.js, WebSockets, Python ML, and scalable cloud applications.',
    skills: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Python', 'PyTorch', 'Docker'],
    talents: ['Fullstack Architecture', 'Technical Mentorship', 'AI Model Integration', 'Agile Leadership'],
    degree: 'B.Tech Computer Science & Engineering',
    institution: 'PSG College of Technology',
    gradYear: '2025',
    cgpa: '9.2 / 10',
    experienceRole: 'Lead Fullstack Developer Intern',
    experienceCompany: 'Powerhub AI Tech',
    experienceDuration: 'Jan 2025 - Present',
    experienceDesc: 'Architected real-time gamified learning dashboard and mentor review queue for 500+ students.'
  }
};

export const EMOJI_COMBOS = [
  { emoji: '🐉🔥', name: 'CyberDragons' },
  { emoji: '🚀🧠', name: 'AlgoRockets' }
];

export const AI_TEAM_AVATARS = [
  {
    id: 'avatar-cyberdragons',
    name: 'CyberDragons AI',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    badgeTag: '⚡ CYBER AI'
  },
  {
    id: 'avatar-algorockets',
    name: 'AlgoRockets AI',
    avatarUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80',
    badgeTag: '🚀 QUANTUM AI'
  },
  {
    id: 'avatar-codefoxes',
    name: 'CodeFoxes AI',
    avatarUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=300&q=80',
    badgeTag: '🦊 HYPER AI'
  },
  {
    id: 'avatar-titanlions',
    name: 'TitanLions AI',
    avatarUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=80',
    badgeTag: '🦁 TITAN AI'
  }
];

export const INITIAL_TEAMS = [];

export const INITIAL_BOOTCAMPS = [
  {
    id: 'bootcamp-1',
    name: 'Fullstack & AI Master Cohort 2026',
    startDate: '2026-08-01',
    endDate: '2027-03-31',
    activeRound: 'Month 1: Foundation & Git Workflows',
    status: 'active'
  }
];

export const INITIAL_GOOGLE_MEET_CONFIG = {
  topic: 'Daily Mentorship & Live Code Review',
  timing: '8:00 PM - 9:30 PM IST',
  meetUrl: 'https://meet.google.com/powerhub-cohort-daily'
};

export const INITIAL_GOOGLE_DRIVE_URL = 'https://drive.google.com/drive/folders/powerhub-cohort-slides';
export const INITIAL_GOOGLE_CLASSROOM_URL = 'https://classroom.google.com/c/powerhub-assignments-2026';

export const SCHEDULE_MONTHS = [
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'February 2027',
  'March 2027'
];

export const MONTHLY_DAILY_SCHEDULES = {
  'August 2026': [
    { day: 'Mon', dateLabel: 'Aug 3', isPast: true, isActive: false, studyDone: true, submitDone: false },
    { day: 'Tue', dateLabel: 'Aug 4', isPast: true, isActive: false, studyDone: true, submitDone: false },
    { day: 'Wed', dateLabel: 'Aug 5', isPast: false, isActive: true, studyDone: true, submitDone: false },
    { day: 'Thu', dateLabel: 'Aug 6', isPast: false, isActive: false, studyDone: false, submitDone: false },
    { day: 'Fri', dateLabel: 'Aug 7', isPast: false, isActive: false, studyDone: false, submitDone: false },
    { day: 'Sat', dateLabel: 'Aug 8', isPast: false, isActive: false, studyDone: false, submitDone: false },
    { day: 'Sun', dateLabel: 'Aug 9', isPast: false, isActive: false, studyDone: false, submitDone: false }
  ]
};

export const INITIAL_SUBMISSIONS = [];

export const INITIAL_SKILL_RATINGS = [];

export const INITIAL_ANNOUNCEMENTS = [];


export const INITIAL_AUDIT_LOGS = [];

export const DOMAIN_ROADMAPS = {
  'FULLSTACK': [
    { 
      month: 1, 
      phase: 'Frontend Foundations',
      topics: 'HTML, CSS, JavaScript, npm', 
      checkpoints: [
        { title: 'Checkpoint - Static Webpages', desc: 'Build responsive landing pages with raw HTML5 & CSS3' },
        { title: 'Checkpoint - Interactivity & External Packages', desc: 'DOM Manipulation, Fetch API, Axios, npm package management' }
      ],
      milestone: 'Static & Interactive Web Portfolio' 
    },
    { 
      month: 2, 
      phase: 'Modern Frontend & Version Control',
      topics: 'Git, GitHub, React.js, Tailwind CSS', 
      checkpoints: [
        { title: 'Checkpoint - Collaborative Work', desc: 'Git branching, Pull Requests, merge conflict resolution' },
        { title: 'Checkpoint - Frontend Apps', desc: 'Multi-page SPA with React hooks, state & Tailwind styling' }
      ],
      milestone: 'React + Tailwind Web Application' 
    },
    { 
      month: 3, 
      phase: 'Backend Core Development',
      topics: 'Node.js, Express.js, RESTful APIs', 
      checkpoints: [
        { title: 'Checkpoint - CLI Apps', desc: 'Command line utilities & Node.js scripts' },
        { title: 'Checkpoint - Simple CRUD Apps', desc: 'RESTful API endpoints, request validation, middleware' }
      ],
      milestone: 'RESTful Express Backend API' 
    },
    { 
      month: 4, 
      phase: 'Databases & Security Architecture',
      topics: 'PostgreSQL, JWT Auth, Redis Caching', 
      checkpoints: [
        { title: 'Checkpoint - Complete App', desc: 'End-to-end fullstack app with relational DB, JWT authentication, and Redis caching' }
      ],
      milestone: 'Fullstack App with Auth & PostgreSQL' 
    },
    { 
      month: 5, 
      phase: 'DevOps & AWS Cloud Infrastructure',
      topics: 'Linux Basics, AWS (EC2, VPC, S3, Route53, SES)', 
      checkpoints: [
        { title: 'Checkpoint - Deployment', desc: 'Deploying Node/Postgres stack on AWS EC2, custom domain setup, Nginx reverse proxy' }
      ],
      milestone: 'AWS EC2 Deployed Web Platform' 
    },
    { 
      month: 6, 
      phase: 'CI/CD Pipelines & Server Monitoring',
      topics: 'Monit, GitHub Actions, Ansible Configuration', 
      checkpoints: [
        { title: 'Checkpoint - CI / CD & Monitoring', desc: 'Automated test suite execution, GitHub Actions deployment workflow, server health monitoring with Monit' }
      ],
      milestone: 'Automated CI/CD Pipeline & Monitoring' 
    },
    { 
      month: 7, 
      phase: 'Infrastructure as Code & Cloud Capstone',
      topics: 'Terraform, Cloud Automation, Production Capstone', 
      checkpoints: [
        { title: 'Checkpoint - Infrastructure & Automation', desc: 'Terraform scripts for automated cloud provisioning & final enterprise fullstack capstone deployment' }
      ],
      milestone: 'Production-Grade Cloud Capstone Architecture' 
    }
  ],
  'EDGEAI': [
    { month: 1, phase: 'Edge Computing', topics: 'Edge computing, embedded systems overview', milestone: 'Cloud AI vs edge AI comparison' },
    { month: 2, phase: 'Model Optimization', topics: 'Model optimization — quantization, pruning, TinyML', milestone: 'Optimize pretrained model size/speed' },
    { month: 3, phase: 'Edge Frameworks', topics: 'Edge AI frameworks — TFLite, ONNX Runtime', milestone: 'Convert model via TFLite/ONNX' },
    { month: 4, phase: 'Hardware Deployment', topics: 'Hardware platforms — Raspberry Pi, Jetson Nano', milestone: 'Deploy model onto Pi/Jetson' },
    { month: 5, phase: 'Computer Vision', topics: 'Computer vision on edge devices', milestone: 'Real-time object detection inference' },
    { month: 6, phase: 'Pipeline Power', topics: 'Deployment pipelines, power optimization', milestone: 'Optimized on-device benchmark' },
    { month: 7, phase: 'Edge Capstone', topics: 'Capstone: full edge AI application', milestone: 'Deployed edge AI camera demo' }
  ],
  'AUTOMOTIVE': [
    { month: 1, phase: 'ECU Architectures', topics: 'Automotive industry overview, ECUs, vehicle network basics', milestone: 'Report on vehicle electronic architecture' },
    { month: 2, phase: 'CAN Protocols', topics: 'CAN bus, LIN, automotive protocols', milestone: 'CAN bus simulation project' },
    { month: 3, phase: 'AUTOSAR Architecture', topics: 'AUTOSAR basics, embedded software architecture', milestone: 'AUTOSAR-style module design' },
    { month: 4, phase: 'ADAS Sensors', topics: 'ADAS fundamentals — camera, radar, lidar sensor overview', milestone: 'ADAS sensor-data analysis project' },
    { month: 5, phase: 'CARLA Simulator', topics: 'Automotive AI/perception basics, simulation tools (CARLA)', milestone: 'Basic perception model in a simulator' },
    { month: 6, phase: 'ISO 26262 & Diagnostics', topics: 'Functional safety (ISO 26262), diagnostics (UDS, OBD-II)', milestone: 'OBD-II data read mini-project' },
    { month: 7, phase: 'Automotive Capstone', topics: 'Capstone: automotive systems project', milestone: 'End-to-end automotive software capstone' }
  ]
};
