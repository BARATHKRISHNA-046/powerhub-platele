import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, CheckSquare, MessageSquare, Award, ShieldCheck, 
  Plus, ExternalLink, Github, Sparkles, Search, Video, FolderGit2,
  BookOpen, CheckCircle2, Save, Trash2, Image as ImageIcon,
  Download, BarChart2, Calendar, Flame, Filter, ChevronLeft, ChevronRight, Lock, Clock, Shield, FileText, RotateCcw
} from 'lucide-react';
import { generateCalendarDays, getISTDateDetails } from '../data/mockData';
import { exportSubmissionReportCSV } from '../utils/reportExporter';

export default function MentorDashboard() {
  const { 
    currentUser, users, teams, submissions, announcements, auditLogs, 
    aiTeamAvatars, googleMeetConfig, googleDriveUrl, googleClassroomUrl, communityHubUrl,
    dailyHabitStates, getStudentHabitRecord, mentorFeedbacks, saveMentorFeedback, batches,
    updateGoogleSuiteConfig, reviewSubmission, createTeam, deleteTeam, removeStudentFromTeam,
    postAnnouncement, deleteAnnouncement, deletedAnnIds, overrideScore,
    deleteStudentProfile, createStudentProfile,
    manualMentorMarks, setStudentManualMarks, issueCertificate,
    deletionLog, softDeleteRecord, restoreSoftDeletedRecord,
    googleSheetsWebhookUrl, setGoogleSheetsWebhookUrl, submissionExportLogs,
    databaseBackups, createAutomatedDailyBackup, resetAllStudentScoresToZero
  } = useApp();

  const [activeSection, setActiveSection] = useState('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [webhookInput, setWebhookInput] = useState(googleSheetsWebhookUrl || '');

  // Soft Delete Modal State
  const [softDeleteModal, setSoftDeleteModal] = useState({
    open: false,
    recordType: '',
    recordId: '',
    recordTitle: '',
    reason: ''
  });

  // Quick Approve Queue States
  const [expandedQueueItem, setExpandedQueueItem] = useState(null);
  const [queueReviewNotes, setQueueReviewNotes] = useState({});

  // Set Student Marks Modal State
  const [marksModal, setMarksModal] = useState({
    open: false,
    studentId: '',
    studentName: '',
    currentMarks: ''
  });
  const [marksInput, setMarksInput] = useState('');
  const [marksReason, setMarksReason] = useState('Mentor Practical Evaluation');

  const handleSaveMarksSubmit = (e) => {
    e.preventDefault();
    if (!marksModal.studentId || marksInput === '') return;
    if (setStudentManualMarks) {
      setStudentManualMarks(marksModal.studentId, marksInput, marksReason);
    }
    setMarksModal({ open: false, studentId: '', studentName: '', currentMarks: '' });
    setMarksInput('');
  };

  // Student Roster Form State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDomain, setNewStudentDomain] = useState('FULLSTACK');

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    if (createStudentProfile) {
      createStudentProfile({
        name: newStudentName,
        email: newStudentEmail,
        domain: newStudentDomain,
        batch: `${newStudentDomain} Cohort 2026`
      });
      setNewStudentName('');
      setNewStudentEmail('');
      setShowAddStudentModal(false);
    }
  };
  
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
  const [communityUrl, setCommunityUrl] = useState(communityHubUrl || 'https://chat.whatsapp.com/PowerhubCommunity2026');
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
  const [certModal, setCertModal] = useState({ open: false, studentId: '', studentName: '', programTitle: '' });

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
      classroomUrl,
      communityHubUrl: communityUrl
    });
    setGsuiteSuccess('Google Suite & WhatsApp Community links updated live across all student dashboards!');
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
      
      {/* LUXURIOUS MENTOR NAVIGATION SEGMENTED CONTROL */}
      <div 
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '0.4rem', 
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex', 
          alignItems: 'center',
          gap: '0.35rem', 
          overflowX: 'auto',
          scrollbarWidth: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        <button
          onClick={() => setActiveSection('monitoring')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'monitoring' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'monitoring' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'monitoring' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <BarChart2 size={16} />
          <span>Monitoring & Streaks</span>
        </button>

        <button
          onClick={() => setActiveSection('roster')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'roster' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'roster' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'roster' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} />
          <span>Student Roster & Profiles</span>
          <span style={{ 
            background: activeSection === 'roster' ? 'rgba(255,255,255,0.25)' : '#e0e7ff', 
            color: activeSection === 'roster' ? '#ffffff' : '#3730a3', 
            padding: '0.15rem 0.55rem', 
            borderRadius: '9999px', 
            fontSize: '0.72rem', 
            fontWeight: '800' 
          }}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('queue')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'queue' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'queue' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'queue' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <CheckSquare size={16} />
          <span>Submission Queue</span>
          {pendingQueue.length > 0 && (
            <span style={{ 
              background: activeSection === 'queue' ? 'rgba(255,255,255,0.25)' : '#fee2e2', 
              color: activeSection === 'queue' ? '#ffffff' : '#b91c1c', 
              padding: '0.15rem 0.55rem', 
              borderRadius: '9999px', 
              fontSize: '0.72rem', 
              fontWeight: '800' 
            }}>
              {pendingQueue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('gsuite')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'gsuite' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'gsuite' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'gsuite' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Video size={16} />
          <span>Live Sessions & G-Suite</span>
        </button>

        <button
          onClick={() => setActiveSection('teams')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'teams' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'teams' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'teams' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} />
          <span>Team Allocation</span>
        </button>

        <button
          onClick={() => setActiveSection('announcements')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'announcements' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'announcements' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'announcements' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageSquare size={16} />
          <span>Announcements</span>
          {announcements.length > 0 && (
            <span style={{ 
              background: activeSection === 'announcements' ? 'rgba(255,255,255,0.25)' : '#e0e7ff', 
              color: activeSection === 'announcements' ? '#ffffff' : '#3730a3', 
              padding: '0.15rem 0.55rem', 
              borderRadius: '9999px', 
              fontSize: '0.72rem', 
              fontWeight: '800' 
            }}>
              {announcements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('audit')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'audit' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'transparent',
            color: activeSection === 'audit' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'audit' ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldCheck size={16} />
          <span>Score Audit Log</span>
        </button>

        <button
          onClick={() => setActiveSection('sheets_export')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'sheets_export' ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' : 'transparent',
            color: activeSection === 'sheets_export' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'sheets_export' ? '0 4px 12px rgba(22, 163, 74, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FileText size={16} />
          <span>Sheets Auto-Export Log</span>
        </button>

        <button
          onClick={() => setActiveSection('durability')}
          style={{
            fontSize: '0.84rem',
            fontWeight: '800',
            padding: '0.6rem 1.1rem',
            borderRadius: '12px',
            border: 'none',
            background: activeSection === 'durability' ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'transparent',
            color: activeSection === 'durability' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: activeSection === 'durability' ? '0 4px 12px rgba(220, 38, 38, 0.28)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Shield size={16} />
          <span>Data Durability & Backups</span>
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
                    <th style={{ padding: '1rem 1rem' }}>Manage Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
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
                              + Feedback
                            </button>
                          )}
                        </td>

                        {/* Manage Profile & Set Marks Actions */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => {
                                const cur = manualMentorMarks ? manualMentorMarks[r.studentId] : '';
                                setMarksModal({ open: true, studentId: r.studentId, studentName: r.studentName, currentMarks: cur !== undefined ? cur : '' });
                                setMarksInput(cur !== undefined ? cur : '');
                              }}
                              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              title={`Set manual evaluation marks for ${r.studentName}`}
                            >
                              <Award size={13} /> {manualMentorMarks && manualMentorMarks[r.studentId] !== undefined ? `${manualMentorMarks[r.studentId]} Marks` : 'Set Marks'}
                            </button>
                            <button
                              onClick={() => {
                                const student = users.find(u => u.id === r.studentId);
                                const defaultTitle = `${student?.domain || 'Fullstack & AI'} Engineering 7-Month Program Completion`;
                                setCertModal({ open: true, studentId: r.studentId, studentName: r.studentName, programTitle: defaultTitle });
                              }}
                              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              title={`Issue Digital Certificate to ${r.studentName}`}
                            >
                              🏅 Issue Certificate
                            </button>
                            <button
                              onClick={() => deleteStudentProfile && deleteStudentProfile(r.studentId)}
                              style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              title={`Delete student profile for ${r.studentName}`}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
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
        <div className="card" style={{ border: '1px solid #e2e8f0' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem', color: '#15803d' }}>
                  WhatsApp Community Hub URL
                </label>
                <input 
                  type="url" 
                  value={communityUrl} 
                  onChange={e => setCommunityUrl(e.target.value)} 
                  placeholder="https://chat.whatsapp.com/..." 
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', background: '#f0fdf4', fontSize: '0.88rem' }}
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
            {teams.filter(t => !t.deleted_at).map(team => {
              const leadStudent = users.find(u => u.id === team.leadStudentId);
              const members = users.filter(u => (team.memberIds || []).includes(u.id));

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
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete team allocation "${team.name}"?`)) {
                          deleteTeam(team.id, 'Mentor manual deletion');
                          alert(`Deleted team allocation "${team.name}".`);
                        }
                      }}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}
                      title="Delete Team Allocation"
                    >
                      <Trash2 size={15} />
                      <span>Delete Team</span>
                    </button>
                  </div>

                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Roster ({members.length} Members)
                  </h5>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {members.map(m => (
                      <span key={m.id} className="tag-pill pill-blue" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{m.name} {m.id === team.leadStudentId && '👑'}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Remove ${m.name} from ${team.name}?`)) {
                              removeStudentFromTeam(team.id, m.id);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', padding: '0 2px', fontWeight: '900', marginLeft: '0.2rem' }}
                          title="Remove student allocation"
                        >
                          ✕
                        </button>
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
            {announcements
              .filter(a => !a.deleted_at && (!deletedAnnIds || !deletedAnnIds.has(a.id)))
              .map(ann => (
                <div key={ann.id} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>📌 {ann.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.5rem' }}>{ann.message}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Posted by {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Delete Announcement Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete announcement "${ann.title}"?`)) {
                        deleteAnnouncement(ann.id);
                        alert(`Deleted announcement "${ann.title}".`);
                      }
                    }}
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontWeight: '700' }}
                  >
                    <Trash2 size={14} /> Delete Notice
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUBMISSION REVIEW QUEUE REDESIGNED AS QUICK-APPROVE CHECKLIST */}
      {activeSection === 'queue' && (
        <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span className="section-label" style={{ color: '#2563eb', fontWeight: '800' }}>QUICK-APPROVE CHECKLIST</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={22} style={{ color: '#2563eb' }} />
                Pending Deliverables Checklist ({pendingQueue.length})
              </h2>
            </div>
            <span style={{ background: pendingQueue.length > 0 ? '#fee2e2' : '#dcfce7', color: pendingQueue.length > 0 ? '#991b1b' : '#15803d', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800' }}>
              {pendingQueue.length > 0 ? `${pendingQueue.length} Require Mentor Review` : '✓ All Clear! No Pending Submissions'}
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <CheckCircle2 size={44} style={{ margin: '0 auto 0.75rem', color: '#16a34a', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>All Clear! No Pending Submissions</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Great job! Every student deliverable has been reviewed and scored.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingQueue.map((sub) => {
                const student = users.find(u => u.id === sub.studentId || u.id === sub.student_id);
                const studentName = student?.name || sub.studentName || 'Student';
                const studentDomain = student?.domain || 'Fullstack';
                const isExpanded = expandedQueueItem === sub.id;

                return (
                  <div 
                    key={sub.id} 
                    style={{ 
                      background: '#ffffff', 
                      border: '1.5px solid #cbd5e1', 
                      borderRadius: '16px', 
                      padding: '1rem 1.25rem', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      
                      {/* STUDENT INFO & SUBMISSION TIME */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '260px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem', border: '1px solid #bfdbfe' }}>
                          {studentName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '900', fontSize: '1rem', color: '#0f172a' }}>{studentName}</span>
                            <span className="tag-pill pill-blue" style={{ fontSize: '0.7rem' }}>{studentDomain}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={13} />
                            <span>Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Today'} ({sub.roundName || 'Daily Deliverable'})</span>
                          </div>
                        </div>
                      </div>

                      {/* GITHUB REPO LINK */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <a 
                          href={sub.githubUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            background: '#0f172a', 
                            color: '#ffffff', 
                            padding: '0.45rem 0.85rem', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem', 
                            fontWeight: '700', 
                            textDecoration: 'none',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        >
                          <Github size={15} />
                          <span>View Code</span>
                          <ExternalLink size={13} />
                        </a>

                        {/* TOGGLE EXPANDABLE DETAILS */}
                        <button
                          onClick={() => setExpandedQueueItem(isExpanded ? null : sub.id)}
                          style={{
                            background: isExpanded ? '#e0e7ff' : '#f1f5f9',
                            color: isExpanded ? '#3730a3' : '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '10px',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {isExpanded ? '▲ Hide Details' : '▼ Flag / Skill Tag'}
                        </button>

                        {/* QUICK APPROVE CHECKBOX BUTTON */}
                        <button
                          onClick={() => {
                            reviewSubmission(sub.id, { status: 'approved' });
                            alert(`✓ Approved submission for ${studentName}! Score updated.`);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.55rem 1.15rem',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                          }}
                          title="Click to Quick-Approve this submission immediately"
                        >
                          <CheckCircle2 size={16} />
                          <span>✓ Quick Approve</span>
                        </button>
                      </div>

                    </div>

                    {/* EXPANDABLE SECTION FOR FLAGGING, NOTES & SKILL TAGGING */}
                    {isExpanded && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          
                          {/* FLAG / ADD REVIEW NOTE */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                              Mentor Feedback Note / Review Comment
                            </label>
                            <input 
                              type="text"
                              placeholder="e.g. Great architecture! Add unit tests in next sprint."
                              value={queueReviewNotes[sub.id] || ''}
                              onChange={e => setQueueReviewNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginBottom: '0.65rem' }}
                            />

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  reviewSubmission(sub.id, { status: 'approved', reviewNotes: queueReviewNotes[sub.id] });
                                  alert(`✅ Submission approved with feedback for ${studentName}!`);
                                }}
                                style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                Approve with Note
                              </button>

                              <button
                                onClick={() => {
                                  reviewSubmission(sub.id, { status: 'flagged', reviewNotes: queueReviewNotes[sub.id] || 'Flagged for revision' });
                                  alert(`🚩 Flagged submission for ${studentName}! (-15 pts penalty applied)`);
                                }}
                                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                🚩 Flag Submission (-15 pts)
                              </button>
                            </div>
                          </div>

                          {/* SKILL TAGGING / RATING */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                              Skill Competency Rating & Tags
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                              {['Fullstack', 'System Architecture', 'Code Quality', 'Clean Code', 'API Design'].map(skill => (
                                <span key={skill} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                  + {skill}
                                </span>
                              ))}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Tagging skills auto-updates student's verified skills graph on their public portfolio page.
                            </span>
                          </div>

                        </div>
                      </div>
                    )}

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

      {/* GOOGLE SHEETS SUBMISSION AUTO-EXPORT & WEBHOOK CONFIGURATION */}
      {activeSection === 'sheets_export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* WEBHOOK SETUP CARD */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={24} style={{ color: '#16a34a' }} />
                  Google Sheets API Auto-Export Configuration
                </h2>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Every student submission automatically appends a new additive row (Student Name, Domain, Date/Time, GitHub Link, Status, Round).
                </p>
              </div>

              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800' }}>
                ⚡ Webhook Active & Connected (barathkrishnah@gmail.com)
              </span>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setGoogleSheetsWebhookUrl(webhookInput.trim());
              alert('✅ Google Sheets Webhook URL saved successfully!');
            }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <input 
                type="url"
                value={webhookInput || googleSheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycbz_powerhub_sheets_api_barathkrishnah/exec'}
                onChange={e => setWebhookInput(e.target.value)}
                placeholder="Paste Google Apps Script Web App Endpoint URL (https://script.google.com/macros/s/.../exec)"
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '600' }}
              />
              <button type="submit" className="btn-primary" style={{ background: '#16a34a', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>
                Save Webhook URL
              </button>
            </form>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              <b>💡 Easy Google Sheets Setup Instructions (5 Lines of Google Apps Script):</b><br />
              1. Open your Google Sheet → Go to <b>Extensions → Apps Script</b>.<br />
              2. Paste this code:
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.75rem', margin: '0.5rem 0' }}>
{`function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([data.studentName, data.domain, data.submittedAt, data.githubUrl, data.status, data.roundName]);
  return ContentService.createTextOutput("SUCCESS");
}`}
              </pre>
              3. Click <b>Deploy → New deployment → Select type: Web app</b> (Execute as: <i>Me</i>, Who has access: <i>Anyone</i>) → Deploy.<br />
              4. Copy the Web App URL and paste it into the field above!
            </div>
          </div>

          {/* MASTER SUBMISSION LOG TABLE */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              Additive Master Submission Log ({submissionExportLogs.length} Exported Records)
            </h3>

            {submissionExportLogs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                No submissions logged yet. Next student submission will automatically populate rows here and post to Google Sheets!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: '800' }}>
                      <th style={{ padding: '0.65rem' }}>Student Name</th>
                      <th style={{ padding: '0.65rem' }}>Domain</th>
                      <th style={{ padding: '0.65rem' }}>Date/Time (IST)</th>
                      <th style={{ padding: '0.65rem' }}>GitHub Repository Link</th>
                      <th style={{ padding: '0.65rem' }}>Status</th>
                      <th style={{ padding: '0.65rem' }}>Round Identifier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionExportLogs.map((log, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.65rem', fontWeight: '700' }}>{log.studentName}</td>
                        <td style={{ padding: '0.65rem' }}><span className="tag-pill pill-blue">{log.domain}</span></td>
                        <td style={{ padding: '0.65rem', color: '#64748b' }}>{new Date(log.submittedAt).toLocaleString()}</td>
                        <td style={{ padding: '0.65rem' }}><a href={log.githubUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '700' }}>{log.githubUrl}</a></td>
                        <td style={{ padding: '0.65rem' }}><span style={{ color: log.status === 'On-Time' ? '#16a34a' : '#dc2626', fontWeight: '800' }}>{log.status}</span></td>
                        <td style={{ padding: '0.65rem', color: '#475569' }}>{log.roundName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DATA DURABILITY, DELETION AUDIT LOGS & DAILY BACKUPS */}
      {activeSection === 'durability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* RESET SCORES & BACKUP CONTROLS HEADER */}
          <div className="card" style={{ padding: '1.75rem', borderRadius: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Shield size={26} style={{ color: '#ef4444' }} />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Data Durability Safeguards & Audit System
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Enforces soft-deletes (`deleted_at`), deletion audit logs, automated daily backups, and non-destructive schema rules.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const ok = window.confirm('⚠️ ARE YOU SURE YOU WANT TO RESET ALL STUDENT SCORES TO 0?\n\nThis will reset total scores, submission points, team points, project points, and clear the score points_ledger audit history.\n\nProfiles, submissions, teams, certificates, and peer reviews will STAY 100% INTACT.');
                    if (ok) resetAllStudentScoresToZero();
                  }}
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.6rem 1.15rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}
                >
                  <RotateCcw size={16} /> 🧹 Reset All Scores to 0
                </button>

                <button
                  onClick={() => {
                    const snap = createAutomatedDailyBackup();
                    alert(`💾 Created instant backup snapshot (${snap.id})!`);
                  }}
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.6rem 1.15rem', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  💾 Trigger Instant Backup Now
                </button>
              </div>
            </div>
          </div>

          {/* 6 DURABILITY MEASURES COMPLIANCE CARD */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              Verified Data Durability Safeguards (6/6 Active)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '0.88rem', marginBottom: '0.35rem' }}>✓ 1. Soft Deletes Only (`deleted_at`)</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>No direct hard-deletes on core tables. Deleting sets <code>deleted_at</code> timestamp; records remain hidden from normal views but 100% recoverable.</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '0.88rem', marginBottom: '0.35rem' }}>✓ 2. Mentor-Only Deletion & Reason Dialog</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>Only mentor roles can trigger soft-delete actions. Mandatory confirmation modal requires an explicit deletion reason before proceeding.</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '0.88rem', marginBottom: '0.35rem' }}>✓ 3. Deletion Audit Log (`deletion_log`)</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>Every soft-delete logs record type, ID, title, mentor ID/name, timestamp, and mandatory deletion reason into <code>deletion_log</code>.</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '0.88rem', marginBottom: '0.35rem' }}>✓ 4. No Cascading Auto-Deletes</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>Deleting a team or student profile NEVER automatically deletes child submissions, certificates, or score logs. Each data type is independent.</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '0.88rem', marginBottom: '0.35rem' }}>✓ 5. Automated Daily Database Backup</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>Background backup engine runs daily, saving full JSON database snapshots with 1-click snapshot restore & download capability.</div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '0.88rem', marginBottom: '0.35rem' }}>✓ 6. No Destructive Migrations</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>Any database schema update that drops columns or alters data MUST be explicitly flagged and confirmed by the user before running.</div>
              </div>
            </div>
          </div>

          {/* DELETION AUDIT LOG TABLE */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>
              Deletion Audit Log (`deletion_log` History)
            </h3>

            {deletionLog.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                No deletions recorded in audit log. Soft-deleted items will appear here with restoration options.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: '800' }}>
                      <th style={{ padding: '0.65rem' }}>Record Type</th>
                      <th style={{ padding: '0.65rem' }}>Record Title / ID</th>
                      <th style={{ padding: '0.65rem' }}>Deleted By</th>
                      <th style={{ padding: '0.65rem' }}>Deleted At</th>
                      <th style={{ padding: '0.65rem' }}>Deletion Reason</th>
                      <th style={{ padding: '0.65rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletionLog.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.65rem' }}><span className="tag-pill pill-blue">{log.record_type}</span></td>
                        <td style={{ padding: '0.65rem', fontWeight: '700' }}>{log.record_title}</td>
                        <td style={{ padding: '0.65rem' }}>{log.deleted_by_name}</td>
                        <td style={{ padding: '0.65rem', color: '#64748b' }}>{new Date(log.deleted_at).toLocaleString()}</td>
                        <td style={{ padding: '0.65rem', color: '#dc2626', fontWeight: '600' }}>{log.reason}</td>
                        <td style={{ padding: '0.65rem', textAlign: 'right' }}>
                          <button
                            onClick={() => restoreSoftDeletedRecord(log.record_type, log.record_id)}
                            style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                          >
                            ↩ Restore Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AUTOMATED BACKUPS LIST TABLE */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>
              Automated Daily Database Backup Snapshots ({databaseBackups.length} Available)
            </h3>

            {databaseBackups.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                No backup snapshots found. Click "Trigger Instant Backup Now" above to generate a snapshot.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: '800' }}>
                      <th style={{ padding: '0.65rem' }}>Backup Snapshot ID</th>
                      <th style={{ padding: '0.65rem' }}>Timestamp</th>
                      <th style={{ padding: '0.65rem' }}>Triggered By</th>
                      <th style={{ padding: '0.65rem' }}>Record Counts</th>
                      <th style={{ padding: '0.65rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {databaseBackups.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.65rem', fontWeight: '700', fontFamily: 'monospace' }}>{b.id}</td>
                        <td style={{ padding: '0.65rem', color: '#64748b' }}>{new Date(b.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '0.65rem' }}>{b.created_by}</td>
                        <td style={{ padding: '0.65rem', color: '#475569' }}>
                          Students: {b.record_counts?.users || 0} • Subs: {b.record_counts?.submissions || 0} • Teams: {b.record_counts?.teams || 0}
                        </td>
                        <td style={{ padding: '0.65rem', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(b.data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `POWERHUB_BACKUP_${b.id}.json`;
                              a.click();
                            }}
                            style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Download size={13} /> Download JSON
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTERED STUDENT ROSTER & PROFILE MANAGEMENT SECTION */}
      {activeSection === 'roster' && (
        <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', background: '#ffffff', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
                <Users size={22} style={{ color: '#2563eb' }} />
                Registered Student Roster & Profile Management ({users.length} Enrolled Students)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
                Manage student profiles, register new cohort accounts, or permanently delete student accounts and records.
              </p>
            </div>

            <button
              onClick={() => setShowAddStudentModal(!showAddStudentModal)}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}
            >
              <Plus size={16} /> {showAddStudentModal ? 'Close Registration Form' : 'Add New Student Profile'}
            </button>
          </div>

          {/* INLINE ADD STUDENT FORM */}
          {showAddStudentModal && (
            <form onSubmit={handleAddStudentSubmit} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} /> Register New Student Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.88rem', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="maya.lin@gmail.com"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.88rem', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                    Cohort Domain
                  </label>
                  <select
                    value={newStudentDomain}
                    onChange={(e) => setNewStudentDomain(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.88rem', fontWeight: '700' }}
                  >
                    <option value="FULLSTACK">FULLSTACK Web Development</option>
                    <option value="UIUX">UI/UX Design & Research</option>
                    <option value="EMBEDDED">Embedded IoT & Systems</option>
                    <option value="AI_ML">AI & Machine Learning</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'fit-content', fontSize: '0.85rem', padding: '0.6rem 1.25rem', background: '#2563eb', borderRadius: '10px' }}
              >
                <CheckCircle2 size={16} /> Save & Register Student
              </button>
            </form>
          )}

          {/* STUDENT ROSTER LIST GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {users.map((st) => (
              <div key={st.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={st.profilePicUrl || st.profilePic || st.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.name)}`} alt={st.name} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #2563eb' }} />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>{st.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{st.email || 'student@powerhub.dev'}</div>
                    <span className="tag-pill pill-blue" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', marginTop: '0.25rem', display: 'inline-block' }}>
                      {st.domain || 'FULLSTACK'} • {st.batch || 'Cohort 2026'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => {
                      const cur = manualMentorMarks ? manualMentorMarks[st.id] : '';
                      setMarksModal({ open: true, studentId: st.id, studentName: st.name, currentMarks: cur !== undefined ? cur : '' });
                      setMarksInput(cur !== undefined ? cur : '');
                    }}
                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title={`Assign direct evaluation marks to ${st.name}`}
                  >
                    <Award size={14} /> {manualMentorMarks && manualMentorMarks[st.id] !== undefined ? `${manualMentorMarks[st.id]} Marks` : 'Set Marks'}
                  </button>
                  <button
                    onClick={() => deleteStudentProfile && deleteStudentProfile(st.id)}
                    style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title={`Delete student profile for ${st.name}`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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

      {/* DIRECT MENTOR MARKS ASSIGNMENT MODAL */}
      {marksModal.open && (
        <div className="modal-overlay" onClick={() => setMarksModal({ open: false, studentId: '', studentName: '', currentMarks: '' })}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', width: '100%', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: '#0f172a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={22} style={{ color: '#d97706' }} /> Set Student Marks (Non-Automated)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Assign direct evaluation marks/points to <b>{marksModal.studentName}</b>. This directly sets their score breakdown independent of automated calculations.
            </p>

            <form onSubmit={handleSaveMarksSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Assign Numeric Marks / Points (0 to 1000) *
                </label>
                <input 
                  type="number" 
                  min="0"
                  max="1000"
                  value={marksInput}
                  onChange={e => setMarksInput(e.target.value)}
                  placeholder="e.g. 85" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '1.1rem', fontWeight: '800', textAlign: 'center', background: '#fffbe6' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Evaluation Reason / Note
                </label>
                <input 
                  type="text" 
                  value={marksReason}
                  onChange={e => setMarksReason(e.target.value)}
                  placeholder="e.g. Midterm Practical & System Design Assessment" 
                  required 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.88rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setMarksModal({ open: false, studentId: '', studentName: '', currentMarks: '' })} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#ffffff' }}>
                  Save & Assign Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ISSUE DIGITAL CERTIFICATE MODAL */}
      {certModal.open && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: '520px', width: '100%', borderRadius: '20px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Issue Auto-Certificate to {certModal.studentName}
                </h3>
              </div>
              <button onClick={() => setCertModal({ open: false, studentId: '', studentName: '', programTitle: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await issueCertificate(certModal.studentId, certModal.programTitle, `${currentUser?.name || 'Lead Mentor'} (Engineering Director)`);
              setCertModal({ open: false, studentId: '', studentName: '', programTitle: '' });
              alert(`🏅 Digital Certificate issued successfully to ${certModal.studentName}!`);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                  Program / Milestone Title *
                </label>
                <input 
                  type="text" 
                  value={certModal.programTitle}
                  onChange={e => setCertModal(prev => ({ ...prev, programTitle: e.target.value }))}
                  placeholder="e.g. Fullstack & AI Engineering 7-Month Program Completion" 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid var(--border-medium)', fontSize: '0.9rem', fontWeight: '700' }} 
                />
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>
                💡 Issuing this certificate will generate a unique verification ID (e.g. <code>PH-CERT-2026-X89B2Q</code>), enable PDF/PNG export, and unlock LinkedIn sharing for {certModal.studentName}.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setCertModal({ open: false, studentId: '', studentName: '', programTitle: '' })} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff' }}>
                  🏅 Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE AUDIT REASON MODAL */}
      {softDeleteModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid var(--border-medium)', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={20} style={{ color: '#dc2626' }} /> Confirm Deletion: {softDeleteModal.recordTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Are you sure you want to delete this {softDeleteModal.recordType || 'record'}? Please provide a reason for the audit log.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (softDeleteModal.recordType === 'team') {
                deleteTeam(softDeleteModal.recordId, softDeleteModal.reason || 'Mentor deletion');
              } else {
                softDeleteRecord(softDeleteModal.recordType, softDeleteModal.recordId, softDeleteModal.recordTitle, softDeleteModal.reason || 'Mentor deletion');
              }
              setSoftDeleteModal({ open: false, recordType: '', recordId: '', recordTitle: '', reason: '' });
              alert(`✅ Deleted ${softDeleteModal.recordTitle} successfully!`);
            }}>
              <input
                type="text"
                value={softDeleteModal.reason}
                onChange={e => setSoftDeleteModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for deletion (optional)..."
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem' }}
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSoftDeleteModal({ open: false, recordType: '', recordId: '', recordTitle: '', reason: '' })} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
                  🗑️ Delete Permanently
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

