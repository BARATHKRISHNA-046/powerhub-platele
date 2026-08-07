import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, CheckSquare, MessageSquare, Award, ShieldCheck, 
  Plus, ExternalLink, Github, Sparkles, Search, Video, FolderGit2,
  BookOpen, CheckCircle2, Save, Trash2, Image as ImageIcon,
  Download, BarChart2, Calendar, Flame, Filter, ChevronLeft, ChevronRight, Lock, Clock
} from 'lucide-react';
import { generateCalendarDays, getISTDateDetails } from '../data/mockData';
import { exportSubmissionReportCSV } from '../utils/reportExporter';

export default function MentorDashboard() {
  const { 
    currentUser, users, teams, submissions, announcements, auditLogs, 
    aiTeamAvatars, googleMeetConfig, googleDriveUrl, googleClassroomUrl, 
    dailyHabitStates, getStudentHabitRecord, mentorFeedbacks, saveMentorFeedback, batches,
    updateGoogleSuiteConfig, reviewSubmission, createTeam, deleteTeam, 
    postAnnouncement, deleteAnnouncement, overrideScore 
  } = useApp();


  const [activeSection, setActiveSection] = useState('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Monitoring Filters & Pagination State
  const { todayStr, isPast11PM } = getISTDateDetails();
  const [filterDate, setFilterDate] = useState(todayStr);
  const [studentSearch, setStudentSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Google Suite Mentor Inputs
  const [meetTopic, setMeetTopic] = useState(googleMeetConfig.topic);
  const [meetTiming, setMeetTiming] = useState(googleMeetConfig.timing);
  const [meetUrl, setMeetUrl] = useState(googleMeetConfig.meetUrl);
  const [driveUrl, setDriveUrl] = useState(googleDriveUrl);
  const [classroomUrl, setClassroomUrl] = useState(googleClassroomUrl);
  const [gsuiteSuccess, setGsuiteSuccess] = useState('');

  // Review Queue Selection
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [skillRatingsInput, setSkillRatingsInput] = useState({
    Frontend: 4.5,
    Backend: 4.0,
    DevOps: 3.5,
    DSA: 4.0,
    Teamwork: 5.0
  });

  // New Team Form Modal State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedAiAvatar, setSelectedAiAvatar] = useState(aiTeamAvatars[0].avatarUrl);
  const [teamLeadId, setTeamLeadId] = useState(users[0]?.id || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState([users[0]?.id || '', users[1]?.id || '']);

  // New Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Score Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideStudentId, setOverrideStudentId] = useState(users[0]?.id || '');
  const [overrideReason, setOverrideReason] = useState('');

  const pendingQueue = submissions.filter(s => s.status === 'pending');

  const isAdmin = currentUser?.roles?.includes('admin');
  const allowedBatches = currentUser?.mentorBatches || batches || [];

  // Filter students based on Batch Access Control (Admin sees all; Mentor sees assigned batches)
  const accessibleUsers = useMemo(() => {
    if (isAdmin) return users;
    return users.filter(u => !u.batch || allowedBatches.includes(u.batch));
  }, [users, isAdmin, allowedBatches]);

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState({ open: false, studentId: '', studentName: '', dateStr: '', text: '' });

  // STREAK CALCULATOR
  const studentStreaks = useMemo(() => {
    const streaks = {};
    const calendarDays = generateCalendarDays();
    const pastAndTodayDays = calendarDays.filter(d => d.dateStr <= todayStr).reverse();

    accessibleUsers.forEach(student => {
      let streak = 0;
      for (const day of pastAndTodayDays) {
        const habit = getStudentHabitRecord(student.id, day.dateStr);
        if (habit.studyDone && habit.submitDone) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
      streaks[student.id] = streak;
    });

    return streaks;
  }, [accessibleUsers, dailyHabitStates, todayStr]);


  // ALL MONITORING RECORDS COMPUTATION
  const allMonitoringRecords = useMemo(() => {
    const calendarDays = generateCalendarDays();
    const records = [];

    // Reverse chronological order
    const relevantDays = calendarDays.filter(d => d.dateStr <= todayStr).reverse();

    relevantDays.forEach(day => {
      accessibleUsers.forEach(student => {
        const habit = getStudentHabitRecord(student.id, day.dateStr);
        const feedback = mentorFeedbacks ? mentorFeedbacks[`${student.id}_${day.dateStr}`] : '';

        let status = 'Pending';
        if (habit.submitDone) {
          status = 'Submitted';
        } else if (habit.isMissed) {
          status = 'Missed';
        } else if (day.dateStr === todayStr && !isPast11PM) {
          status = 'Pending';
        }

        records.push({
          studentId: student.id,
          studentName: student.name,
          avatarUrl: student.profilePicUrl || student.profilePic || student.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`,
          domain: student.domain || 'FULLSTACK',
          batch: student.batch || 'Batch A',
          dateStr: day.dateStr,
          monthName: day.monthName,
          dayShort: day.day,
          studyDone: habit.studyDone,
          submitDone: habit.submitDone,
          isMissed: habit.isMissed,
          status,
          streak: studentStreaks[student.id] || 0,
          feedback
        });
      });
    });

    return records;
  }, [accessibleUsers, dailyHabitStates, todayStr, isPast11PM, studentStreaks, mentorFeedbacks]);


  // FILTERED RECORDS
  const filteredRecords = useMemo(() => {
    return allMonitoringRecords.filter(r => {
      if (filterDate && r.dateStr !== filterDate) return false;
      if (studentSearch && !r.studentName.toLowerCase().includes(studentSearch.toLowerCase())) return false;
      if (domainFilter !== 'ALL' && r.domain !== domainFilter) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      return true;
    });
  }, [allMonitoringRecords, filterDate, studentSearch, domainFilter, statusFilter]);

  // PAGINATED RECORDS
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  // TODAY'S OVERVIEW METRICS
  const todayRecords = useMemo(() => {
    return users.map(student => {
      const habit = getStudentHabitRecord(student.id, todayStr);
      let status = 'Pending';
      if (habit.submitDone) status = 'Submitted';
      else if (habit.isMissed) status = 'Missed';
      return { student, habit, status };
    });
  }, [users, todayStr, dailyHabitStates, isPast11PM]);

  const totalStudentsCount = users.length;
  const submittedTodayCount = todayRecords.filter(r => r.habit.submitDone).length;
  const missedTodayCount = todayRecords.filter(r => r.status === 'Missed').length;
  const pendingTodayCount = todayRecords.filter(r => r.status === 'Pending').length;

  const handleSaveGsuite = (e) => {
    e.preventDefault();
    updateGoogleSuiteConfig({
      topic: meetTopic,
      timing: meetTiming,
      meetUrl,
      driveUrl,
      classroomUrl
    });
    setGsuiteSuccess('Google Meet, Google Drive & Google Classroom details updated live across all student dashboards!');
    setTimeout(() => setGsuiteSuccess(''), 4000);
  };

  const handleReviewSubmit = (e, status) => {
    e.preventDefault();
    if (!selectedSubId) return;

    reviewSubmission(selectedSubId, {
      status,
      skillRatingsObj: skillRatingsInput,
      reviewNotes: 'Reviewed by mentor',
      isProject: true,
      isFirstSubmitter: false
    });

    setSelectedSubId(null);
  };

  const handleCreateTeamSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !teamLeadId) return;
    const members = Array.from(new Set([teamLeadId, ...selectedMemberIds]));
    createTeam({
      name: teamName,
      teamAvatarUrl: selectedAiAvatar,
      leadStudentId: teamLeadId,
      memberIds: members
    });
    setShowTeamModal(false);
    setTeamName('');
  };

  const handlePostAnnSubmit = (e) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    postAnnouncement({ title: annTitle, message: annMessage, bootcampId: 'bootcamp-1' });
    setShowAnnModal(false);
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    if (!overrideReason) return;
    overrideScore({
      studentId: overrideStudentId,
      fieldChanged: 'Manual Override',
      oldValue: '-15 pts',
      newValue: '0 pts (Excused)',
      reason: overrideReason
    });
    setShowOverrideModal(false);
    setOverrideReason('');
  };

  const toggleMemberSelection = (id) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(m => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* MENTOR NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSection('monitoring')}
          className={activeSection === 'monitoring' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <BarChart2 size={16} /> Submission Monitoring & Streaks
        </button>

        <button
          onClick={() => setActiveSection('gsuite')}
          className={activeSection === 'gsuite' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <Video size={16} /> Google Suite & Live Sessions
        </button>

        <button
          onClick={() => setActiveSection('queue')}
          className={activeSection === 'queue' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <CheckSquare size={16} /> Submission Queue ({pendingQueue.length})
        </button>

        <button
          onClick={() => setActiveSection('teams')}
          className={activeSection === 'teams' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <Users size={16} /> Team Allocation
        </button>

        <button
          onClick={() => setActiveSection('announcements')}
          className={activeSection === 'announcements' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <MessageSquare size={16} /> Announcements Feed ({announcements.length})
        </button>

        <button
          onClick={() => setActiveSection('audit')}
          className={activeSection === 'audit' ? 'btn-primary' : 'btn-outline'}
          style={{ fontSize: '0.85rem' }}
        >
          <ShieldCheck size={16} /> Score Audit Log
        </button>
      </div>

      {/* SUBMISSION MONITORING SECTION */}
      {activeSection === 'monitoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TODAY'S OVERVIEW SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {/* Total Students */}
            <div className="card" style={{ borderLeft: '5px solid #2563eb', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Total Students</span>
                <Users size={22} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                {totalStudentsCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Enrolled Cohort Members</span>
            </div>

            {/* Submitted Today */}
            <div className="card" style={{ borderLeft: '5px solid #059669', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Submitted Today</span>
                <CheckCircle2 size={22} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', fontFamily: 'var(--font-heading)', color: '#059669' }}>
                {submittedTodayCount} / {totalStudentsCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
                {Math.round((submittedTodayCount / totalStudentsCount) * 100)}% Completion Rate
              </span>
            </div>

            {/* Missed Today */}
            <div className="card" style={{ borderLeft: '5px solid #dc2626', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Missed Today</span>
                <Lock size={22} style={{ color: '#dc2626' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', fontFamily: 'var(--font-heading)', color: '#dc2626' }}>
                {missedTodayCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                {isPast11PM ? 'Passed 11 PM IST Cutoff' : 'Past Cutoff Submissions'}
              </span>
            </div>

            {/* Pending Today */}
            <div className="card" style={{ borderLeft: '5px solid #d97706', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Pending Today</span>
                <Clock size={22} style={{ color: '#d97706' }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.5rem', fontFamily: 'var(--font-heading)', color: '#d97706' }}>
                {pendingTodayCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#d97706' }}>
                {isPast11PM ? 'Cutoff Reached' : 'Awaiting 11 PM IST Submission'}
              </span>
            </div>
          </div>

          {/* COHORT COMPLETION TREND CHART */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BarChart2 size={24} style={{ color: '#2563eb' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>Cohort Weekly Submission Completion %</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Overall submission compliance trend across active weeks</p>
                </div>
              </div>
              <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800' }}>
                Cohort Avg: 88.5%
              </span>
            </div>

            {/* SIMPLE VISUAL RECHARTS/BAR CHART */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '140px', paddingTop: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              {[
                { week: 'Wk 1 (Aug 1-7)', rate: 92, count: '6.4/7' },
                { week: 'Wk 2 (Aug 8-14)', rate: 86, count: '6.0/7' },
                { week: 'Wk 3 (Aug 15-21)', rate: 95, count: '6.6/7' },
                { week: 'Wk 4 (Aug 22-28)', rate: 89, count: '6.2/7' },
                { week: 'Wk 5 (Current)', rate: 90, count: '6.3/7' }
              ].map((w, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', marginBottom: '0.25rem' }}>{w.rate}%</span>
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: '44px',
                      height: `${w.rate}%`, 
                      background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)', 
                      borderRadius: '6px 6px 0 0',
                      boxShadow: '0 4px 10px rgba(37,99,235,0.2)'
                    }} 
                  />
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>{w.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TABLE FILTERS & EXPORT REPORT BAR */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                  Filter & Search Student Records ({filteredRecords.length})
                </h3>
              </div>

              {/* EXPORT REPORT (.XLSX / CSV) BUTTON */}
              <button 
                onClick={() => exportSubmissionReportCSV(filteredRecords)}
                className="btn-primary" 
                style={{ background: '#059669', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
              >
                <Download size={16} /> Export Excel / CSV Report (.xlsx)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {/* Date Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.35rem' }}>
                  Filter by Date
                </label>
                <input 
                  type="date" 
                  value={filterDate} 
                  onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Student Search Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.35rem' }}>
                  Search Student Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search name..." 
                    value={studentSearch} 
                    onChange={e => { setStudentSearch(e.target.value); setCurrentPage(1); }}
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.2rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Domain / Cohort Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.35rem' }}>
                  Filter by Domain
                </label>
                <select 
                  value={domainFilter} 
                  onChange={e => { setDomainFilter(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="ALL">All Domains / Cohorts</option>
                  <option value="FULLSTACK">Fullstack & AI</option>
                  <option value="VLSI">VLSI & Embedded AI</option>
                  <option value="AUTOTRONICS">Automotive & IoT</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.35rem' }}>
                  Filter by Status
                </label>
                <select 
                  value={statusFilter} 
                  onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Missed">Missed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* SUBMISSION MONITORING PAGINATED TABLE */}
          <div className="card" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Student Name</th>
                    <th style={{ padding: '1rem 1rem' }}>Date</th>
                    <th style={{ padding: '1rem 1rem' }}>7 PM Study</th>
                    <th style={{ padding: '1rem 1rem' }}>11 PM Submission</th>
                    <th style={{ padding: '1rem 1rem' }}>Overall Status</th>
                    <th style={{ padding: '1rem 1rem' }}>Streak</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Mentor Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No records match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r, idx) => (
                      <tr key={`${r.studentId}_${r.dateStr}_${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Student Name */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={r.avatarUrl} alt={r.studentName} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #2563eb' }} />
                            <div>
                              <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{r.studentName}</div>
                              <span className="tag-pill pill-blue" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>{r.domain}</span>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>
                          {r.dateStr}
                        </td>

                        {/* 7 PM Study */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {r.studyDone ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              ✓ Completed
                            </span>
                          ) : (
                            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                              — Pending
                            </span>
                          )}
                        </td>

                        {/* 11 PM Submission */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {r.submitDone ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              ✓ Submitted
                            </span>
                          ) : r.isMissed ? (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              ❌ Missed
                            </span>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                              ⌛ Pending
                            </span>
                          )}
                        </td>

                        {/* Overall Status */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {r.status === 'Submitted' && (
                            <span style={{ background: '#059669', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800' }}>
                              Submitted ✓
                            </span>
                          )}
                          {r.status === 'Missed' && (
                            <span style={{ background: '#dc2626', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800' }}>
                              Missed ❌
                            </span>
                          )}
                          {r.status === 'Pending' && (
                            <span style={{ background: '#d97706', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800' }}>
                              Pending ⌛
                            </span>
                          )}
                        </td>

                        {/* Streak */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Flame size={14} style={{ color: '#ea580c' }} /> {r.streak} Days
                          </span>
                        </td>

                        {/* Mentor Feedback */}
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {r.feedback ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '700', fontStyle: 'italic', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.feedback}>
                                "{r.feedback}"
                              </span>
                              <button 
                                onClick={() => setFeedbackModal({ open: true, studentId: r.studentId, studentName: r.studentName, dateStr: r.dateStr, text: r.feedback })}
                                className="btn-outline"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setFeedbackModal({ open: true, studentId: r.studentId, studentName: r.studentName, dateStr: r.dateStr, text: '' })}
                              className="btn-outline"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <MessageSquare size={13} /> Add Feedback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>


            {/* PAGINATION CONTROLS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>
                Showing Page {currentPage} of {totalPages} ({filteredRecords.length} Total Records)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* GOOGLE SUITE & LIVE MEETINGS MANAGER */}
      {activeSection === 'gsuite' && (
        <div className="card" style={{ borderColor: '#10b981', borderWidth: '1.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Video size={24} style={{ color: '#059669' }} />
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Google Meet, Drive & Classroom Management</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Configure live meeting topics, timings, Google Meet URLs, Google Drive slide folders, and Google Classroom links for all students.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveGsuite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Google Meet Topic
                </label>
                <input 
                  type="text" 
                  value={meetTopic} 
                  onChange={e => setMeetTopic(e.target.value)} 
                  placeholder="e.g. Daily Mentorship & Live Code Review" 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Live Session Timing (IST)
                </label>
                <input 
                  type="text" 
                  value={meetTiming} 
                  onChange={e => setMeetTiming(e.target.value)} 
                  placeholder="e.g. 8:00 PM - 9:30 PM IST" 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Google Meet Join URL
              </label>
              <input 
                type="url" 
                value={meetUrl} 
                onChange={e => setMeetUrl(e.target.value)} 
                placeholder="https://meet.google.com/abc-defg-hij" 
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Google Drive Resource Folder URL
                </label>
                <input 
                  type="url" 
                  value={driveUrl} 
                  onChange={e => setDriveUrl(e.target.value)} 
                  placeholder="https://drive.google.com/drive/folders/..." 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Google Classroom URL
                </label>
                <input 
                  type="url" 
                  value={classroomUrl} 
                  onChange={e => setClassroomUrl(e.target.value)} 
                  placeholder="https://classroom.google.com/c/..." 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {gsuiteSuccess && (
              <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> {gsuiteSuccess}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ backgroundColor: '#059669' }}>
                <Save size={16} /> Save & Broadcast Google Links to Students
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEAM ALLOCATION (Assign & Delete across students) */}
      {activeSection === 'teams' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span className="section-label">TEAM ALLOCATION</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Team Allocation & Assignments (Delete & Reassign Supported)</h2>
            </div>

            <button onClick={() => setShowTeamModal(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Create New Team Allocation
            </button>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {teams.map(team => {
              const leadStudent = users.find(u => u.id === team.leadStudentId);
              const members = users.filter(u => team.memberIds.includes(u.id));

              return (
                <div key={team.id} style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img 
                        src={team.teamAvatarUrl} 
                        alt={team.name} 
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #2752dd' }} 
                      />
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{team.name}</h3>
                        <span className="tag-pill pill-yellow" style={{ fontSize: '0.72rem' }}>
                          Lead: {leadStudent ? leadStudent.name : 'None'} (+15 pts)
                        </span>
                      </div>
                    </div>

                    {/* Delete Team Button */}
                    <button
                      onClick={() => deleteTeam(team.id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      title="Delete Team"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Roster ({members.length} Members)
                  </h5>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {members.map(m => (
                      <span key={m.id} className="tag-pill pill-blue" style={{ fontSize: '0.75rem' }}>
                        {m.name} {m.id === team.leadStudentId && '👑'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS FEED WITH DELETION SUPPORT */}
      {activeSection === 'announcements' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span className="section-label">COMMUNICATION</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Mentor Announcements (Delete Supported)</h2>
            </div>

            <button onClick={() => setShowAnnModal(true)} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Post New Announcement
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(ann => (
              <div key={ann.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>📌 {ann.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.5rem' }}>{ann.message}</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Posted by {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Delete Announcement Button */}
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                >
                  <Trash2 size={14} /> Delete Notice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMISSION REVIEW QUEUE */}
      {activeSection === 'queue' && (
        <div className="card">
          <span className="section-label">REVIEW QUEUE</span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>
            Pending Deliverables ({pendingQueue.length})
          </h2>

          {pendingQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckSquare size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: '600' }}>All clear! No pending submissions requiring review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingQueue.map((sub) => {
                const student = users.find(u => u.id === sub.studentId);
                return (
                  <div key={sub.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: '700' }}>{student?.name}</span>
                    <a href={sub.githubUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '1rem', color: 'var(--primary-blue)' }}>{sub.githubUrl}</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STUDENT ROSTER */}
      {activeSection === 'roster' && (
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Enrolled Student Roster</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Student</th>
                  <th style={{ padding: '0.75rem' }}>Domain</th>
                </tr>
              </thead>
              <tbody>
                {users.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700' }}>{student.name}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}><span className="tag-pill pill-blue">{student.domain}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOG */}
      {activeSection === 'audit' && (
        <div className="card">
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Score Audit Trail</h2>
          {auditLogs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No audit logs recorded yet.</p> : null}
        </div>
      )}

      {/* CREATE TEAM MODAL WITH HUMAN AI AVATAR PICKER */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Form New Human AI Team</h3>
            
            <form onSubmit={handleCreateTeamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Team Name</label>
                <input 
                  type="text" 
                  value={teamName} 
                  onChange={e => setTeamName(e.target.value)} 
                  placeholder="e.g. TitanLions AI" 
                  required 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Select Human AI Team Picture</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {aiTeamAvatars.map(avatar => (
                    <div
                      key={avatar.id}
                      onClick={() => setSelectedAiAvatar(avatar.avatarUrl)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: selectedAiAvatar === avatar.avatarUrl ? '3px solid #2752dd' : '1px solid var(--border-medium)',
                        overflow: 'hidden'
                      }}
                    >
                      <img src={avatar.avatarUrl} alt={avatar.name} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Assign Team Lead (+15 pts)</label>
                <select value={teamLeadId} onChange={e => setTeamLeadId(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
                  {users.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.domain})</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Select Team Members (Across Students)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                  {users.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedMemberIds.includes(u.id)} 
                        onChange={() => toggleMemberSelection(u.id)} 
                      />
                      {u.name} ({u.domain})
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowTeamModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="modal-overlay" onClick={() => setShowAnnModal(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Post Announcement</h3>
            <form onSubmit={handlePostAnnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Title</label>
                <input type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Title..." required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.3rem' }}>Message</label>
                <textarea rows="4" value={annMessage} onChange={e => setAnnMessage(e.target.value)} placeholder="Message..." required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAnnModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENTOR FEEDBACK ON SUBMISSION MODAL */}
      {feedbackModal.open && (
        <div className="modal-overlay" onClick={() => setFeedbackModal({ open: false, studentId: '', studentName: '', dateStr: '', text: '' })}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '0.35rem' }}>
              💬 Mentor Feedback on Submission
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Add direct feedback for <b>{feedbackModal.studentName}</b> on <b>{feedbackModal.dateStr}</b>. This will display on the student's calendar card.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveMentorFeedback(feedbackModal.studentId, feedbackModal.dateStr, feedbackModal.text);
              setFeedbackModal({ open: false, studentId: '', studentName: '', dateStr: '', text: '' });
              alert(`Mentor feedback saved cleanly for ${feedbackModal.studentName}!`);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Feedback / Comment Notes
                </label>
                <textarea 
                  rows="4" 
                  value={feedbackModal.text} 
                  onChange={e => setFeedbackModal(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g. Excellent work on the 11 PM submission! Clean React architecture..." 
                  required 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.88rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setFeedbackModal({ open: false, studentId: '', studentName: '', dateStr: '', text: '' })} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#2563eb' }}>
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

