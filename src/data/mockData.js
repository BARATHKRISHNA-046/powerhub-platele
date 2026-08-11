export const BATCHES = [
  'Batch A - Aug 2026 (Fullstack & AI)',
  'Batch B - Aug 2026 (VLSI & Embedded)',
  'Batch C - Aug 2026 (Automotive & IoT)'
];

export const MILESTONE_BADGES = [
  { id: 'badge-3', title: '🔥 3-Day Starter', description: 'Completed 3 consecutive days of Study & Submission!', reqStreak: 3, icon: '🔥', bg: '#fff7ed', text: '#c2410c' },
  { id: 'badge-7', title: '🏆 7-Day Champion', description: 'Achieved a full 7-day uninterrupted streak!', reqStreak: 7, icon: '🏆', bg: '#fef3c7', text: '#b45309' },
  { id: 'badge-30', title: '🌟 30-Day Master', description: 'Completed 30 consecutive days of habits & submissions!', reqStreak: 30, icon: '🌟', bg: '#f0fdf4', text: '#15803d' },
  { id: 'badge-100', title: '🎖️ 100% Monthly Compliance', description: 'Maintained 100% habit compliance for the entire month!', reqStreak: 30, icon: '🎖️', bg: '#eff6ff', text: '#1d4ed8' }
];

export const INITIAL_USERS = [
  {
    id: 'user-barath',
    googleId: 'google-101',
    name: 'BARATHKRISHNA H',
    email: 'barathkrishna@powerhub.dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    avatarBg: '#38bdf8',
    initials: 'BK',
    roles: ['student', 'mentor', 'admin'],
    domain: 'FULLSTACK',
    batch: 'Batch A - Aug 2026 (Fullstack & AI)',
    mentorBatches: ['Batch A - Aug 2026 (Fullstack & AI)', 'Batch B - Aug 2026 (VLSI & Embedded)', 'Batch C - Aug 2026 (Automotive & IoT)'],
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
    batch: 'Batch B - Aug 2026 (VLSI & Embedded)',
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
    batch: 'Batch C - Aug 2026 (Automotive & IoT)',
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
    batch: 'Batch A - Aug 2026 (Fullstack & AI)',
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
    batch: 'Batch B - Aug 2026 (VLSI & Embedded)',
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
    batch: 'Batch A - Aug 2026 (Fullstack & AI)',
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
    batch: 'Batch C - Aug 2026 (Automotive & IoT)',
    bootcampId: 'bootcamp-1',
    bio: 'Fullstack AI & React developer.'
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

export const INITIAL_GOOGLE_DRIVE_URL = 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
export const INITIAL_GOOGLE_CLASSROOM_URL = 'https://classroom.google.com/c/powerhub-assignments-2026';
export const INITIAL_COMMUNITY_HUB_URL = 'https://chat.whatsapp.com/PowerhubCommunity2026';

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

export const getISTDateDetails = () => {
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const getPart = type => parts.find(p => p.type === type)?.value;

  const yyyy = getPart('year') || '2026';
  const mm = getPart('month') || '08';
  const dd = getPart('day') || '07';
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const hours = parseInt(getPart('hour') || '0', 10);
  const minutes = parseInt(getPart('minute') || '0', 10);
  const seconds = parseInt(getPart('second') || '0', 10);

  const isPast11PM = hours >= 23;

  let secondsTo11PM = 0;
  if (!isPast11PM) {
    secondsTo11PM = ((22 - hours) * 3600) + ((59 - minutes) * 60) + (60 - seconds);
  }

  return {
    todayStr,
    hours,
    minutes,
    seconds,
    isPast11PM,
    secondsTo11PM
  };
};


export const PASTEL_PALETTE = [
  { bg: '#ffedd5', border: '#fed7aa', text: '#9a3412' }, // Soft Peach
  { bg: '#e0f2fe', border: '#bae6fd', text: '#0369a1' }, // Sky Blue
  { bg: '#fef9c3', border: '#fef08a', text: '#854d0e' }, // Warm Yellow
  { bg: '#f3e8ff', border: '#e9d5ff', text: '#6b21a8' }, // Soft Lavender
  { bg: '#fce7f3', border: '#fbcfe8', text: '#9d174d' }, // Soft Pink
  { bg: '#ffe4e6', border: '#fecdd3', text: '#9f1239' }, // Coral Rose
  { bg: '#c9f6fc', border: '#a5f3fc', text: '#0e7490' }, // Cyan
  { bg: '#e0e7ff', border: '#c7d2fe', text: '#3730a3' }  // Periwinkle
];

export const getPastelColorForDate = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTE.length;
  return PASTEL_PALETTE[index];
};

export const generateCalendarDays = () => {
  const days = [];
  // Loop through Aug 1, 2026 to Mar 31, 2027 (8 months / 243 days)
  const start = new Date(2026, 7, 1); // 7 = August (0-indexed)
  const end = new Date(2027, 2, 31);   // 2 = March

  const curr = new Date(start);
  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[curr.getMonth()]} ${yyyy}`;

    const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayShort = dayShorts[curr.getDay()];

    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateLabel = `${monthShorts[curr.getMonth()]} ${curr.getDate()}`;

    const pastel = getPastelColorForDate(dateStr);

    days.push({
      dateStr,
      monthName,
      day: dayShort,
      dateLabel,
      pastel
    });

    curr.setDate(curr.getDate() + 1);
  }
  return days;
};

// CLEAN SCORE RESET: Start with 0 habit deductions so all students begin at 0 points
export const INITIAL_DAILY_HABIT_STATES = {};


export const MONTHLY_DAILY_SCHEDULES = generateCalendarDays();


export const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-kanika-222631',
    studentId: 'user-kanika',
    student_id: 'user-kanika',
    studentName: 'KANIKA R',
    student_name: 'KANIKA R',
    date: '2026-08-11',
    bootcampId: 'bootcamp-1',
    roundName: 'Sprint Deliverable',
    round_name: 'Sprint Deliverable',
    githubUrl: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    github_url: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    imageAttachment: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    submittedAt: '2026-08-11T22:26:31.000Z',
    createdAt: '2026-08-11T22:26:31.000Z',
    isProject: true,
    isFirstSubmitter: false,
    status: 'pending',
    isOnTime: true
  },
  {
    id: 'sub-navin-222619',
    studentId: 'user-navin',
    student_id: 'user-navin',
    studentName: 'NAVIN V',
    student_name: 'NAVIN V',
    date: '2026-08-11',
    bootcampId: 'bootcamp-1',
    roundName: 'Sprint Deliverable',
    round_name: 'Sprint Deliverable',
    githubUrl: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    github_url: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    imageAttachment: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    submittedAt: '2026-08-11T22:26:19.000Z',
    createdAt: '2026-08-11T22:26:19.000Z',
    isProject: true,
    isFirstSubmitter: false,
    status: 'pending',
    isOnTime: true
  },
  {
    id: 'sub-akshaya-222605',
    studentId: 'user-akshaya',
    student_id: 'user-akshaya',
    studentName: 'AKSHAYAPRIYA S',
    student_name: 'AKSHAYAPRIYA S',
    date: '2026-08-11',
    bootcampId: 'bootcamp-1',
    roundName: 'Sprint Deliverable',
    round_name: 'Sprint Deliverable',
    githubUrl: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    github_url: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    imageAttachment: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    submittedAt: '2026-08-11T22:26:05.000Z',
    createdAt: '2026-08-11T22:26:05.000Z',
    isProject: true,
    isFirstSubmitter: false,
    status: 'pending',
    isOnTime: true
  },
  {
    id: 'sub-gowtham-222552',
    studentId: 'user-gowtham',
    student_id: 'user-gowtham',
    studentName: 'GOWTHAM',
    student_name: 'GOWTHAM',
    date: '2026-08-11',
    bootcampId: 'bootcamp-1',
    roundName: 'Sprint Deliverable',
    round_name: 'Sprint Deliverable',
    githubUrl: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    github_url: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    imageAttachment: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    submittedAt: '2026-08-11T22:25:52.000Z',
    createdAt: '2026-08-11T22:25:52.000Z',
    isProject: true,
    isFirstSubmitter: false,
    status: 'pending',
    isOnTime: true
  },
  {
    id: 'sub-abinav-222527',
    studentId: 'user-abinav',
    student_id: 'user-abinav',
    studentName: 'ABINAVBRUNDHAN S',
    student_name: 'ABINAVBRUNDHAN S',
    date: '2026-08-11',
    bootcampId: 'bootcamp-1',
    roundName: 'Sprint Deliverable',
    round_name: 'Sprint Deliverable',
    githubUrl: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    github_url: 'https://github.com/BARATHKRISHNA-046/powerhub-platele',
    imageAttachment: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    submittedAt: '2026-08-11T22:25:27.000Z',
    createdAt: '2026-08-11T22:25:27.000Z',
    isProject: true,
    isFirstSubmitter: false,
    status: 'pending',
    isOnTime: true
  },
  {
    id: 'sub-1786203245791',
    studentId: 'user-shankar',
    student_id: 'user-shankar',
    studentName: 'SHANKAR S',
    student_name: 'SHANKAR S',
    date: '2026-08-08',
    bootcampId: 'bootcamp-1',
    roundName: 'Sprint Deliverable',
    round_name: 'Sprint Deliverable',
    githubUrl: 'https://github.com/BARATHKRISHNA-046',
    github_url: 'https://github.com/BARATHKRISHNA-046',
    imageAttachment: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    submittedAt: '2026-08-08T15:34:05.791Z',
    createdAt: '2026-08-08T15:34:05.791Z',
    isProject: true,
    isFirstSubmitter: false,
    status: 'pending',
    isOnTime: true
  }
];

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
