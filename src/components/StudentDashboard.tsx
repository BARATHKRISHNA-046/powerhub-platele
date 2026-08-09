import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Submission,
  Team,
  Announcement,
  DailyHabit,
  ScoreAuditLog,
  MeetSession,
  fetchSubmissionsFromSupabase,
  fetchTeamsFromSupabase,
  fetchAnnouncementsFromSupabase,
  fetchDailyHabitsFromSupabase,
  fetchScoreAuditLogsFromSupabase,
  fetchMeetSessionFromSupabase,
  createSubmissionInSupabase,
  upsertDailyHabitInSupabase,
  uploadImageToSupabaseStorage,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';
import { calculateStudentScore, ScoreBreakdown } from '../lib/scoring';
import { ResumeBuilder } from './ResumeBuilder';
import {
  Calendar as CalendarIcon,
  Video,
  Megaphone,
  Users,
  Trophy,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Award
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface StudentDashboardProps {
  activeProfile: UserProfile;
}

// Shuffled pastel palette colors for day cards
const PASTEL_PALETTE = [
  '#fbe9d1', // peach
  '#cae6fe', // blue
  '#fffcd1', // yellow
  '#c9f6fc', // cyan
  '#c8d6fd', // periwinkle
  '#cbf5c7', // green
  '#9ff384', // bright green
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeProfile }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dailyHabits, setDailyHabits] = useState<DailyHabit[]>([]);
  const [scoreAuditLogs, setScoreAuditLogs] = useState<ScoreAuditLog[]>([]);
  const [meetSession, setMeetSession] = useState<MeetSession | null>(null);

  // Form states for submission panel
  const [githubUrl, setGithubUrl] = useState('');
  const [roundName, setRoundName] = useState('Daily Sprint');
  const [isProject, setIsProject] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  // Leaderboard filters & active modal state
  const [cohortFilter, setCohortFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'resume'>('overview');

  // Calendar pagination state (show 14 days per page out of ~240 days)
  const [calendarOffset, setCalendarOffset] = useState(0);

  // Fetch all shared data fresh from Supabase (Rule 1 & Rule 3)
  const loadData = async () => {
    try {
      const [subs, tms, anns, habs, logs, meet] = await Promise.all([
        fetchSubmissionsFromSupabase(),
        fetchTeamsFromSupabase(),
        fetchAnnouncementsFromSupabase(),
        fetchDailyHabitsFromSupabase(activeProfile.id),
        fetchScoreAuditLogsFromSupabase(),
        fetchMeetSessionFromSupabase(),
      ]);

      setSubmissions(subs);
      setTeams(tms);
      setAnnouncements(anns);
      setDailyHabits(habs);
      setScoreAuditLogs(logs);
      setMeetSession(meet);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();

    let channel: any = null;
    // Supabase Real-time Subscriptions (Architecture Rule 4)
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('student_dashboard_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          fetchAnnouncementsFromSupabase().then(setAnnouncements);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
          fetchTeamsFromSupabase().then(setTeams);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
          fetchSubmissionsFromSupabase().then(setSubmissions);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'meet_sessions' }, () => {
          fetchMeetSessionFromSupabase().then(setMeetSession);
        })
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeProfile.id]);

  // Compute student score
  const scoreBreakdown: ScoreBreakdown = calculateStudentScore(
    activeProfile.id,
    submissions,
    teams,
    scoreAuditLogs,
    dailyHabits
  );

  // Derive Skill Radar Data from evaluated submissions
  const skillRatings: Record<string, number> = {};
  submissions
    .filter((s) => s.student_id === activeProfile.id && s.skills_rated)
    .forEach((sub) => {
      if (sub.skills_rated) {
        Object.entries(sub.skills_rated).forEach(([skill, val]) => {
          skillRatings[skill] = Math.max(skillRatings[skill] || 0, val);
        });
      }
    });

  // Fallback domain default skills if none rated yet
  if (Object.keys(skillRatings).length === 0) {
    skillRatings['Frontend / React'] = 4;
    skillRatings['TypeScript'] = 4;
    skillRatings['Supabase / SQL'] = 4;
    skillRatings['Git Workflow'] = 5;
    skillRatings['Architecture'] = 3;
  }

  const radarData = {
    labels: Object.keys(skillRatings),
    datasets: [
      {
        label: `${activeProfile.name}'s Skill Ratings`,
        data: Object.values(skillRatings),
        backgroundColor: 'rgba(39, 82, 221, 0.2)',
        borderColor: '#2752dd',
        borderWidth: 2,
        pointBackgroundColor: '#2752dd',
      },
    ],
  };

  // Generate 8-month Program Calendar (~240 days)
  const generateProgramCalendar = () => {
    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2); // Start 2 months ago for historical view

    for (let i = 0; i < 240; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const isPast = d.getTime() < new Date().setHours(0, 0, 0, 0);
      const status = isToday ? 'Today' : isPast ? 'Locked' : 'Scheduled';

      const habit = dailyHabits.find((h) => h.date_str === dateStr) || {
        id: `${activeProfile.id}_${dateStr}`,
        student_id: activeProfile.id,
        date_str: dateStr,
        study_done: false,
        submit_done: false,
      };

      // Assign deterministically shuffled pastel color based on dateStr hash
      const colorIndex = Math.abs(
        dateStr.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % PASTEL_PALETTE.length;
      const pastelBg = PASTEL_PALETTE[colorIndex];

      days.push({
        dateStr,
        dayNumber: i + 1,
        isToday,
        isPast,
        status,
        habit,
        pastelBg,
      });
    }
    return days;
  };

  const programDays = generateProgramCalendar();
  const paginatedDays = programDays.slice(calendarOffset, calendarOffset + 14);

  // Toggle habit checkbox (Study or Submission)
  const handleHabitToggle = async (dateStr: string, field: 'study_done' | 'submit_done') => {
    const existing = dailyHabits.find((h) => h.date_str === dateStr) || {
      id: `${activeProfile.id}_${dateStr}`,
      student_id: activeProfile.id,
      date_str: dateStr,
      study_done: false,
      submit_done: false,
    };

    const updated = {
      ...existing,
      [field]: !existing[field],
    };

    // Optimistic UI update + Supabase write
    setDailyHabits((prev) => {
      const idx = prev.findIndex((h) => h.date_str === dateStr);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    await upsertDailyHabitInSupabase(updated);
  };

  // Submit GitHub Link + Media
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError('');
    setSubmissionSuccess('');

    // Strict validation: Reject anything except https://github.com/... (Prompt instruction)
    const validGithubRegex = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
    if (!validGithubRegex.test(githubUrl.trim())) {
      setSubmissionError('Invalid GitHub URL! Must match exact pattern: https://github.com/username/repository');
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl = '';
      if (mediaFile) {
        mediaUrl = await uploadImageToSupabaseStorage(mediaFile, 'submissions');
      }

      await createSubmissionInSupabase({
        student_id: activeProfile.id,
        student_name: activeProfile.name,
        github_url: githubUrl.trim(),
        media_url: mediaUrl,
        round_name: roundName,
        is_project: isProject,
        skills_rated: {},
      });

      // Mark today's submission checkbox as done in daily habits
      const todayStr = new Date().toISOString().split('T')[0];
      await handleHabitToggle(todayStr, 'submit_done');

      setSubmissionSuccess('Submission uploaded successfully to Supabase!');
      setGithubUrl('');
      setMediaFile(null);
      await loadData();
    } catch (err: any) {
      setSubmissionError(`Submission failed: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Locate student team assignment
  const myTeam = teams.find((t) => t.member_ids.includes(activeProfile.id));

  return (
    <div className="space-y-8">
      {/* Sub-header Navigation Tabs (Overview / Resume Builder) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-heading font-semibold text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-brand-blue text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Student Dashboard
          </button>
        </div>
      </div>

      {activeTab === 'resume' ? (
        <ResumeBuilder
          profile={activeProfile}
          submissions={submissions}
          teams={teams}
          totalScore={scoreBreakdown.totalScore}
          leaderboardRank={1}
          skills={skillRatings}
        />
      ) : (
        <>
          {/* Top Banner Row: Live Meet Card & Mentor Announcements Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Google Meet Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-600 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Live Mentor Session
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{meetSession?.time_str}</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-slate-900 mb-1">
                  {meetSession?.topic || 'Daily Sync & Code Review'}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Join lead mentors live on Google Meet for live Q&A, submission feedback, and cohort announcements.
                </p>
              </div>
              <a
                href={meetSession?.meet_url || 'https://meet.google.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-md transition-all text-sm"
              >
                <Video className="w-4 h-4" />
                Join Google Meet Now
              </a>
            </div>

            {/* Real-time Mentor Announcements Card (Architecture Rule 4) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-brand-blue flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" /> Pinned Announcements
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {announcements.length} Notices
                  </span>
                </div>

                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {announcements.length === 0 ? (
                    <p className="text-xs text-slate-400">No active announcements from mentors.</p>
                  ) : (
                    announcements.map((ann) => (
                      <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="font-bold text-slate-900 mb-0.5">{ann.title}</div>
                        <div className="text-slate-600 leading-relaxed">{ann.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          By {ann.author_name} • {new Date(ann.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 8-Month Daily Habit & Submission Calendar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-heading font-bold text-brand-slate flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-brand-blue" />
                  Daily Habit & Submission Calendar (8-Month Program)
                </h3>
                <p className="text-xs text-slate-500">
                  Track your 7:00 PM Study session and 11:00 PM Submission every day. Colors tie to status.
                </p>
              </div>

              {/* Calendar Controls */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 14))}
                  disabled={calendarOffset === 0}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-700">
                  Days {calendarOffset + 1} – {calendarOffset + 14} of 240
                </span>
                <button
                  onClick={() => setCalendarOffset(Math.min(226, calendarOffset + 14))}
                  disabled={calendarOffset >= 226}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Day Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {paginatedDays.map((day) => (
                <div
                  key={day.dateStr}
                  style={{ backgroundColor: day.isToday ? '#ffffff' : day.pastelBg }}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition-all ${
                    day.isToday
                      ? 'border-brand-blue ring-2 ring-brand-blue/30 shadow-md scale-105'
                      : 'border-slate-200/80 hover:shadow'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Day {day.dayNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        day.isToday
                          ? 'bg-brand-blue text-white'
                          : day.isPast
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-white/80 text-slate-700'
                      }`}
                    >
                      {day.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600">{day.dateStr}</div>

                  {/* Habit Checkboxes */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-900/10">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={day.habit.study_done}
                        onChange={() => handleHabitToggle(day.dateStr, 'study_done')}
                        className="accent-brand-blue rounded"
                      />
                      7 PM Study
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={day.habit.submit_done}
                        onChange={() => handleHabitToggle(day.dateStr, 'submit_done')}
                        className="accent-emerald-600 rounded"
                      />
                      11 PM Submit
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: My Team Card & My Submission Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Assigned Team Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-brand-blue" />
                  My Assigned Team
                </h3>

                {myTeam ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                      <span className="text-3xl">{myTeam.emoji_combo}</span>
                      <div>
                        <div className="font-heading font-bold text-sm text-slate-900">{myTeam.name}</div>
                        <div className="text-xs text-slate-500">{myTeam.member_ids.length} Students Assigned</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">GitHub Shared Repo</div>
                      <a
                        href={myTeam.github_url || 'https://github.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-brand-blue underline truncate block"
                      >
                        {myTeam.github_url || 'https://github.com/powerhub-cohort/team-repo'}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">No Team Assigned Yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">Mentors assign teams of 2+ students.</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Submission Panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2 mb-1">
                <Upload className="w-5 h-5 text-brand-blue" />
                Submit My Work
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Submissions automatically update your score and radar ratings once evaluated by mentors.
              </p>

              {submissionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submissionError}
                </div>
              )}

              {submissionSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {submissionSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label>
                    <input
                      type="text"
                      disabled
                      value={activeProfile.name}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 cursor-not-allowed font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Round / Deliverable Name</label>
                    <input
                      type="text"
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-brand-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    GitHub Link <span className="text-red-500">* (Strict Validation: https://github.com/...)</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:border-brand-blue focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProject}
                      onChange={(e) => setIsProject(e.target.checked)}
                      className="accent-brand-blue rounded"
                    />
                    Is Major Project Deliverable (+20 Project Submitter Bonus)
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Optional Media:</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-blue hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Uploading to Supabase...' : 'Submit Work to Supabase'}
                </button>
              </form>
            </div>
          </div>

          {/* Row 4: Scoreboard & Skill Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Scoreboard */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  My Scoreboard Breakdown
                </h3>
                <span className="text-xs font-extrabold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                  Total: {scoreBreakdown.totalScore} Points
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-slate-500 font-medium block">Submissions</span>
                  <span className="text-base font-bold text-brand-blue">+{scoreBreakdown.submissionPoints}</span>
                </div>
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                  <span className="text-slate-500 font-medium block">Team Points</span>
                  <span className="text-base font-bold text-purple-700">+{scoreBreakdown.teamPoints}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 font-medium block">Leadership</span>
                  <span className="text-base font-bold text-emerald-700">+{scoreBreakdown.leadershipPoints}</span>
                </div>
                <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100">
                  <span className="text-slate-500 font-medium block">Project Submitter</span>
                  <span className="text-base font-bold text-cyan-700">+{scoreBreakdown.projectSubmitterPoints}</span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="text-slate-500 font-medium block">First Submitter</span>
                  <span className="text-base font-bold text-amber-700">+{scoreBreakdown.firstSubmitterPoints}</span>
                </div>
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                  <span className="text-slate-500 font-medium block">Missed Penalties</span>
                  <span className="text-base font-bold text-red-600">-{scoreBreakdown.penaltyPoints}</span>
                </div>
              </div>
            </div>

            {/* My Skill Radar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-base font-heading font-bold text-brand-slate flex items-center gap-2 mb-2 self-start">
                <Sparkles className="w-5 h-5 text-brand-blue" />
                My Skill Radar Chart
              </h3>
              <div className="w-full max-w-xs h-64">
                <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* Row 5: Global Student Leaderboard & Bootcamp Scoped Leaderboard */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-heading font-bold text-brand-slate flex items-center gap-2">
                <Award className="w-5 h-5 text-brand-blue" />
                Student Leaderboard
              </h3>

              <div className="flex items-center gap-3 text-xs">
                {/* Cohort Dropdown Filter */}
                <select
                  value={cohortFilter}
                  onChange={(e) => setCohortFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold"
                >
                  <option value="all">All Cohorts</option>
                  <option value="Cohort 2026">Cohort 2026</option>
                </select>

                {/* Time Filter Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 font-semibold">
                  <button
                    onClick={() => setTimeFilter('week')}
                    className={`px-3 py-1 rounded-lg ${timeFilter === 'week' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-600'}`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setTimeFilter('month')}
                    className={`px-3 py-1 rounded-lg ${timeFilter === 'month' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-600'}`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setTimeFilter('all')}
                    className={`px-3 py-1 rounded-lg ${timeFilter === 'all' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-600'}`}
                  >
                    All-Time
                  </button>
                </div>
              </div>
            </div>

            {/* Ranked Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Cohort</th>
                    <th className="p-3">On-Time %</th>
                    <th className="p-3 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr
                    onClick={() => setSelectedStudentForModal(activeProfile)}
                    className="hover:bg-blue-50/50 cursor-pointer font-medium"
                  >
                    <td className="p-3 font-extrabold text-brand-blue flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> #1
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <img src={activeProfile.profile_pic_url} alt={activeProfile.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-slate-900">{activeProfile.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-semibold">
                        {activeProfile.domain}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{activeProfile.batch}</td>
                    <td className="p-3 text-emerald-600 font-bold">100%</td>
                    <td className="p-3 text-right font-extrabold text-brand-blue text-sm">
                      {scoreBreakdown.totalScore} pts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
