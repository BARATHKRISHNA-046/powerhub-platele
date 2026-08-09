import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Submission,
  Team,
  Announcement,
  ScoreAuditLog,
  MeetSession,
  fetchProfilesFromSupabase,
  fetchSubmissionsFromSupabase,
  fetchTeamsFromSupabase,
  fetchAnnouncementsFromSupabase,
  fetchScoreAuditLogsFromSupabase,
  fetchMeetSessionFromSupabase,
  createAnnouncementInSupabase,
  deleteAnnouncementInSupabase,
  updateSubmissionInSupabase,
  upsertTeamInSupabase,
  addScoreAuditLogInSupabase,
  updateMeetSessionInSupabase,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Layers,
  Megaphone,
  Video,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  Shield,
  Star,
  FileCheck,
  RotateCcw,
  Zap
} from 'lucide-react';

import { useApp } from '../context/AppContext';

interface MentorDashboardProps {
  activeProfile: UserProfile;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ activeProfile }) => {
  const { automationLogs, pointsLedger, submissions: contextSubmissions, users: contextUsers, deleteStudentProfile, createStudentProfile } = useApp();
  const [showAutomationLogsModal, setShowAutomationLogsModal] = useState(false);
  const [submissionTab, setSubmissionTab] = useState<'pending' | 'all'>('pending');

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<ScoreAuditLog[]>([]);
  const [meetSession, setMeetSession] = useState<MeetSession | null>(null);

  // Student creation state
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDomain, setNewStudentDomain] = useState('FULLSTACK');

  const handleAddStudentSubmit = (e: React.FormEvent) => {
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
      setShowAddStudentForm(false);
    }
  };

  // Forms state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  const [meetTopic, setMeetTopic] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [meetUrl, setMeetUrl] = useState('');

  // Team creation modal state
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [leadStudentId, setLeadStudentId] = useState('');

  // Manual Score Override modal state
  const [overrideStudentId, setOverrideStudentId] = useState('');
  const [overridePoints, setOverridePoints] = useState(0);
  const [overrideReason, setOverrideReason] = useState('');

  // Web Push Broadcast state
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTarget, setPushTarget] = useState('ALL');
  const [pushTargetStudentId, setPushTargetStudentId] = useState('');
  const [pushStatusMsg, setPushStatusMsg] = useState('');
  const [isSendingPush, setIsSendingPush] = useState(false);

  const handleSendWebPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) {
      alert('Please enter a notification Title and Message.');
      return;
    }

    setIsSendingPush(true);
    setPushStatusMsg('');
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushTitle.trim(),
          message: pushMessage.trim(),
          target: pushTarget,
          studentId: pushTargetStudentId || undefined,
          sentBy: activeProfile.name || 'Mentor'
        })
      });

      const data = await res.json();
      if (data.success) {
        setPushStatusMsg(`✓ Web Push sent successfully to ${data.successCount} device(s)!`);
        setPushTitle('');
        setPushMessage('');
      } else {
        setPushStatusMsg(`❌ Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setPushStatusMsg(`❌ Network Error: ${err.message}`);
    } finally {
      setIsSendingPush(false);
    }
  };

  const loadData = async () => {
    try {
      const [profs, subs, tms, anns, logs, meet] = await Promise.all([
        fetchProfilesFromSupabase(),
        fetchSubmissionsFromSupabase(),
        fetchTeamsFromSupabase(),
        fetchAnnouncementsFromSupabase(),
        fetchScoreAuditLogsFromSupabase(),
        fetchMeetSessionFromSupabase()
      ]);

      setStudents(profs.filter((p) => p.roles.includes('student')));
      setSubmissions(subs);
      setTeams(tms);
      setAnnouncements(anns);
      setAuditLogs(logs);
      setMeetSession(meet);

      if (meet) {
        setMeetTopic(meet.topic);
        setMeetTime(meet.time_str);
        setMeetUrl(meet.meet_url);
      }
    } catch (err) {
      console.error('Failed loading mentor dashboard:', err);
    }
  };

  useEffect(() => {
    loadData();

    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('mentor_dashboard_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, loadData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, loadData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, loadData)
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Post Announcement (Real-time to all student devices)
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    await createAnnouncementInSupabase({
      author_id: activeProfile.id,
      author_name: `${activeProfile.name} (Mentor)`,
      bootcamp_id: 'all',
      title: annTitle.trim(),
      message: annMessage.trim(),
      is_pinned: true
    });

    setAnnTitle('');
    setAnnMessage('');
    await loadData();
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    await deleteAnnouncementInSupabase(id);
    await loadData();
  };

  // Update Live Meet Session
  const handleUpdateMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetSession) return;

    await updateMeetSessionInSupabase({
      ...meetSession,
      topic: meetTopic,
      time_str: meetTime,
      meet_url: meetUrl
    });

    alert('Live Meet Session updated on student dashboards!');
  };

  // Approve/Flag/Excuse Submission & Tag Skills
  const handleReviewSubmission = async (status: 'approved' | 'flagged' | 'excused') => {
    if (!reviewingSub) return;

    const existingSkills = reviewingSub.skills_rated || {};
    const updatedSkills = { ...existingSkills, [skillName]: skillRating };

    await updateSubmissionInSupabase(reviewingSub.id, {
      status,
      skills_rated: updatedSkills
    });

    // Log score audit event
    await addScoreAuditLogInSupabase({
      student_id: reviewingSub.student_id,
      points_change: status === 'approved' ? 10 : 0,
      reason: `Submission reviewed by ${activeProfile.name}: ${status}`,
      component: 'on_time',
      performed_by: activeProfile.name
    });

    setReviewingSub(null);
    await loadData();
  };

  // Create Team with Unique Emoji Combo
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || selectedMembers.length < 2 || !leadStudentId) {
      alert('A team must have a Name, at least 2 Student Members, and an assigned Team Lead!');
      return;
    }

    const EMOJI_COMBOS = ['🐉🔥', '⚡💻', '🚀🧠', '🛡️⚡', '🌐🔮', '🤖⚙️'];
    const randomEmoji = EMOJI_COMBOS[Math.floor(Math.random() * EMOJI_COMBOS.length)];

    await upsertTeamInSupabase({
      id: `team-${Date.now()}`,
      name: teamName.trim(),
      emoji_combo: randomEmoji,
      lead_student_id: leadStudentId,
      member_ids: selectedMembers,
      github_url: 'https://github.com/powerhub-cohort/team-repo',
      created_at: new Date().toISOString()
    });

    setTeamName('');
    setSelectedMembers([]);
    setLeadStudentId('');
    await loadData();
  };

  // Manual Score Override
  const handleManualScoreOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudentId || !overrideReason.trim()) {
      alert('Please select a student and provide a mandatory logged reason for score override.');
      return;
    }

    await addScoreAuditLogInSupabase({
      student_id: overrideStudentId,
      points_change: overridePoints,
      reason: overrideReason.trim(),
      component: 'manual_override',
      performed_by: activeProfile.name
    });

    alert('Manual score override logged in Score Audit Log!');
    setOverrideStudentId('');
    setOverridePoints(0);
    setOverrideReason('');
    await loadData();
  };

  // DB Backup Export (JSON)
  const handleExportDB = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      students,
      submissions,
      teams,
      announcements,
      auditLogs,
      meetSession
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `powerhub_supabase_backup_${Date.now()}.json`;
    a.click();
  };

  const mergedSubmissions = React.useMemo(() => {
    const map = new Map<string, any>();
    
    // First load contextSubmissions (live real-time app state & broadcast)
    (contextSubmissions || []).forEach((s: any) => {
      if (s && s.id) map.set(String(s.id), s);
    });

    // Merge Supabase submissions (if missing)
    (submissions || []).forEach((s: any) => {
      if (s && s.id) {
        const idKey = String(s.id);
        if (!map.has(idKey)) {
          map.set(idKey, s);
        }
      }
    });

    return Array.from(map.values()).sort((a: any, b: any) => 
      new Date(b.submittedAt || b.submitted_at || b.updatedAt || b.createdAt || b.created_at || 0).getTime() - 
      new Date(a.submittedAt || a.submitted_at || a.updatedAt || a.createdAt || a.created_at || 0).getTime()
    );
  }, [contextSubmissions, submissions]);

  const pendingSubmissions = mergedSubmissions.filter(
    (s: any) => s.status === 'pending' || s.status === 'submitted' || !s.status || s.status === 'under_review'
  );

  const displayedSubmissions = submissionTab === 'pending' ? pendingSubmissions : mergedSubmissions;

  const displayStudents = React.useMemo(() => {
    const map = new Map<string, any>();
    (contextUsers || []).forEach((u: any) => {
      const isStud = !u.role || u.role === 'student' || (u.roles && u.roles.includes('student'));
      if (isStud && u.role !== 'mentor' && u.email !== 'barathkrishna046@gmail.com') {
        map.set(u.id, u);
      }
    });
    (students || []).forEach((u: any) => {
      if (!map.has(u.id) && u.email !== 'barathkrishna046@gmail.com') {
        map.set(u.id, u);
      }
    });
    return Array.from(map.values());
  }, [contextUsers, students]);

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-slate-900">{students.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Active Students</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-slate-900">{pendingSubmissions.length}</div>
            <div className="text-xs text-slate-500 font-medium">Pending Review Queue</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-slate-900">{teams.length}</div>
            <div className="text-xs text-slate-500 font-medium">Active Student Teams</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-extrabold text-slate-900">{announcements.length}</div>
            <div className="text-xs text-slate-500 font-medium">Realtime Announcements</div>
          </div>
        </div>
      </div>

      {/* Submission Review Queue & Student Update Monitoring */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-heading font-bold text-brand-slate flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-blue" />
            Submission Monitoring Queue ({pendingSubmissions.length} Pending Review)
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSubmissionTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                submissionTab === 'pending'
                  ? 'bg-white text-brand-blue shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏳ Pending Queue ({pendingSubmissions.length})
            </button>
            <button
              onClick={() => setSubmissionTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                submissionTab === 'all'
                  ? 'bg-white text-brand-blue shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 All Submissions & Updates ({mergedSubmissions.length})
            </button>
          </div>
        </div>

        {displayedSubmissions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No submissions found for selected filter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedSubmissions.map((sub: any) => {
              const studentName = sub.student_name || sub.studentName || students.find(st => st.id === sub.studentId || st.id === sub.student_id)?.name || 'Student';
              const githubUrl = sub.github_url || sub.githubUrl || '';
              const mediaUrl = sub.media_url || sub.mediaUrl || sub.imageAttachment;
              const roundName = sub.round_name || sub.roundName || 'Sprint Submission';

              return (
                <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 relative">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      {studentName}
                      {sub.isUpdated && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          🔄 Resubmitted / Updated
                        </span>
                      )}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      sub.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {roundName} • {sub.status || 'Pending'}
                    </span>
                  </div>

                  {sub.isDuplicateFlagged && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] font-bold">
                      ⚠️ Duplicate GitHub Link Flagged ({sub.duplicateInfo || 'Matches existing submission'})
                    </div>
                  )}

                  <a href={githubUrl} target="_blank" rel="noreferrer" className="text-brand-blue underline truncate block font-mono">
                    {githubUrl}
                  </a>

                  {mediaUrl && (
                    <img src={mediaUrl} alt="Proof Media" className="w-full h-36 object-cover rounded-lg border" />
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-slate-400">
                      Submitted: {new Date(sub.submittedAt || sub.submitted_at || sub.createdAt || sub.created_at || Date.now()).toLocaleString()}
                    </span>
                    <button
                      onClick={() => setReviewingSub(sub)}
                      className="bg-brand-blue hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                    >
                      Evaluate & Tag Skill Rating
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Evaluate Submission: {reviewingSub.student_name}
            </h3>

            <div>
              <label className="font-semibold block mb-1">Select Skill Category to Tag</label>
              <select
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2"
              >
                <option value="React">React / Frontend</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Supabase">Supabase / Postgres</option>
                <option value="Git Workflow">Git Workflow</option>
                <option value="Architecture">Software Architecture</option>
                <option value="Embedded C++">Embedded C++</option>
                <option value="AI / ML">AI / ML</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Skill Rating (1 to 5 Stars)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={skillRating}
                onChange={(e) => setSkillRating(parseInt(e.target.value))}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl p-2 font-bold text-center"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleReviewSubmission('approved')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl"
              >
                Approve (+10 Pts)
              </button>
              <button
                onClick={() => handleReviewSubmission('flagged')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-xl"
              >
                Flag Revision
              </button>
              <button
                onClick={() => setReviewingSub(null)}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web Push Broadcast Panel */}
      <div className="bg-white rounded-2xl border border-brand-blue/30 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-blue" />
            Send Broadcast Web Push Notification (VAPID)
          </h3>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
            Realtime Mobile & PC Push
          </span>
        </div>

        <form onSubmit={handleSendWebPush} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. ⏰ 11 PM Cutoff Alert!"
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Target Audience</label>
              <select
                value={pushTarget}
                onChange={(e) => setPushTarget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              >
                <option value="ALL">All Students (All Devices)</option>
                <option value="FULLSTACK">FULLSTACK Cohort</option>
                <option value="UIUX">UI/UX Cohort</option>
                <option value="STUDENT">Specific Student...</option>
              </select>
            </div>
          </div>

          {pushTarget === 'STUDENT' && (
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Select Target Student</label>
              <select
                value={pushTargetStudentId}
                onChange={(e) => setPushTargetStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              >
                <option value="">Select Student...</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.domain})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Message Body</label>
            <textarea
              required
              rows={2}
              placeholder="Enter push notification message text for students' phones/laptops..."
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
            />
          </div>

          {pushStatusMsg && (
            <div className="p-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800">
              {pushStatusMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSendingPush}
            className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition"
          >
            {isSendingPush ? 'Sending Web Push...' : '🚀 Send Web Push Notification Now'}
          </button>
        </form>
      </div>

      {/* Row 2: Realtime Announcements Manager & Live Google Meet Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Announcement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand-blue" />
            Post Realtime Announcement
          </h3>

          <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Title</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Sprint 5 Guidance Released"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Message Content</label>
              <textarea
                required
                rows={3}
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Write message for all students..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow"
            >
              Post Announcement (Realtime Sync)
            </button>
          </form>

          {/* Delete List */}
          <div className="space-y-2 pt-2 max-h-36 overflow-y-auto">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-xs">
                <span className="font-semibold text-slate-800 truncate">{ann.title}</span>
                <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Meet Scheduler */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            Schedule Live Google Meet Session
          </h3>

          <form onSubmit={handleUpdateMeet} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Session Topic</label>
              <input
                type="text"
                required
                value={meetTopic}
                onChange={(e) => setMeetTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Scheduled Time Display</label>
              <input
                type="text"
                required
                value={meetTime}
                onChange={(e) => setMeetTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Google Meet URL</label>
              <input
                type="url"
                required
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl shadow"
            >
              Update Live Meet Info
            </button>
          </form>
        </div>
      </div>

      {/* Registered Student Roster & Profile Management (Add & Delete Profiles) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-heading font-bold text-brand-slate flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-blue" />
            Registered Student Roster & Profile Management ({displayStudents.length} Active Students)
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddStudentForm(!showAddStudentForm)}
              className="px-3 py-1.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddStudentForm ? 'Cancel Form' : 'Add New Student'}</span>
            </button>
            <span className="text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg">
              🛡️ Mentor Privilege: Manage & Delete Profiles
            </span>
          </div>
        </div>

        {/* INLINE ADD STUDENT FORM */}
        {showAddStudentForm && (
          <form onSubmit={handleAddStudentSubmit} className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-xs mb-4">
            <div className="font-extrabold text-blue-900 text-sm flex items-center gap-1.5">
              ➕ Create & Register New Student Profile
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="maya.lin@gmail.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Domain / Cohort</label>
                <select
                  value={newStudentDomain}
                  onChange={(e) => setNewStudentDomain(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold"
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
              className="bg-brand-blue hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow text-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Register Student Profile</span>
            </button>
          </form>
        )}

        {displayStudents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No student profiles registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayStudents.map((st: any) => (
              <div key={st.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs hover:border-slate-300 transition">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    {st.name}
                  </div>
                  <div className="text-slate-500 text-[11px] font-medium">{st.email || 'student@powerhub.dev'}</div>
                  <div className="text-[10px] text-purple-700 font-bold mt-0.5">
                    {st.domain || 'FULLSTACK'} • {st.batch || 'Cohort 2026'}
                  </div>
                </div>

                <button
                  onClick={() => deleteStudentProfile && deleteStudentProfile(st.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title={`Delete student profile for ${st.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Team Allocation & Lead Assignment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-heading font-bold text-brand-slate flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-blue" />
          Team Allocation & Leadership Assignment
        </h3>

        <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Team Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Cyber Dragons"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Student Members (2+ Required)</label>
            <select
              multiple
              value={selectedMembers}
              onChange={(e) =>
                setSelectedMembers(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 h-24"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Assign Team Lead (+15 Leadership Pts)</label>
            <select
              value={leadStudentId}
              onChange={(e) => setLeadStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 mb-3"
            >
              <option value="">Select Team Lead...</option>
              {selectedMembers.map((memId) => {
                const s = students.find((st) => st.id === memId);
                return (
                  <option key={memId} value={memId}>
                    {s?.name || memId}
                  </option>
                );
              })}
            </select>

            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow"
            >
              Create Team & Generate Emoji Combo
            </button>
          </div>
        </form>
      </div>

      {/* Row 4: Score Audit Log & DB Export/Restore */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Audit Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Score Audit Log (Timestamped Points Trail)
            </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAutomationLogsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition"
            >
              ⚡ View System Automation Logs ({automationLogs.length})
            </button>

            <button
              onClick={handleExportDB}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              <Download className="w-4 h-4" /> Export DB Backup JSON
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No point adjustments recorded yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800">{log.reason}</div>
                  <div className="text-[10px] text-slate-400">By {log.performed_by} • {new Date(log.created_at).toLocaleString()}</div>
                </div>
                <span className={`font-extrabold text-sm ${log.points_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {log.points_change >= 0 ? `+${log.points_change}` : log.points_change} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Override Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-brand-blue" />
          Manual Score Override
        </h3>

        <form onSubmit={handleManualScoreOverride} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Select Student</label>
            <select
              value={overrideStudentId}
              onChange={(e) => setOverrideStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
            >
              <option value="">Select Student...</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Points Delta (+ or -)</label>
            <input
              type="number"
              required
              value={overridePoints}
              onChange={(e) => setOverridePoints(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Required Reason (Logged)</label>
            <input
              type="text"
              required
              placeholder="e.g. Hackathon Winner Bonus"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-blue hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow"
          >
            Log Score Override
          </button>
        </form>
      </div>

      {/* SYSTEM AUTOMATION AUDIT LOGS MODAL */}
      {showAutomationLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                ⚡ Powerhub System Automation Audit Trail
              </h3>
              <button
                onClick={() => setShowAutomationLogsModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                Close
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Live audit trail of node-cron scheduled jobs, auto-lock events, instant point ledger entries, streak resets, and notifications.
            </p>

            <div className="space-y-2.5">
              {automationLogs.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-slate-400 text-center">
                  No automation events logged yet. (Cron jobs execute on schedule).
                </div>
              ) : (
                automationLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-brand-blue uppercase tracking-wider text-[11px]">
                        [{log.actionType}]
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{log.details}</p>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Status: {log.result} • Student ID: {log.affectedStudentId}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
