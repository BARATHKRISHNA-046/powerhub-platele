import { Submission, Team, ScoreAuditLog, DailyHabit } from './supabase';

export interface ScoreBreakdown {
  submissionPoints: number;
  teamPoints: number;
  leadershipPoints: number;
  projectSubmitterPoints: number;
  firstSubmitterPoints: number;
  penaltyPoints: number;
  totalScore: number;
}

/**
 * Calculates complete student score breakdown from authoritative Supabase records.
 */
export function calculateStudentScore(
  studentId: string,
  submissions: Submission[],
  teams: Team[],
  auditLogs: ScoreAuditLog[],
  dailyHabits: DailyHabit[]
): ScoreBreakdown {
  const studentSubs = submissions.filter((s) => s.student_id === studentId && s.status === 'approved');

  // 1. On-time submission points (+10 each)
  const submissionPoints = studentSubs.length * 10;

  // 2. Team participation points (+5 per team membership)
  const assignedTeams = teams.filter((t) => t.member_ids.includes(studentId));
  const teamPoints = assignedTeams.length * 5;

  // 3. Leadership points (+15 if assigned as Team Lead)
  const leadTeams = teams.filter((t) => t.lead_student_id === studentId);
  const leadershipPoints = leadTeams.length * 15;

  // 4. Project Submitter bonus (+20 for project submissions)
  const projectSubs = studentSubs.filter((s) => s.is_project);
  const projectSubmitterPoints = projectSubs.length * 20;

  // 5. First Submitter bonus (+10 if first approved submission of the day)
  let firstSubmitterPoints = 0;
  studentSubs.forEach((sub) => {
    const subDateStr = new Date(sub.created_at).toISOString().split('T')[0];
    const sameDaySubs = submissions
      .filter((s) => s.status === 'approved' && new Date(s.created_at).toISOString().split('T')[0] === subDateStr)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (sameDaySubs.length > 0 && sameDaySubs[0].student_id === studentId) {
      firstSubmitterPoints += 10;
    }
  });

  // 6. Missed submission penalty (-15 each, strictly only for past dates where a habit record was tracked as missed)
  // Architecture Rule / Scoring Requirement: "Only apply a missed-submission penalty for a date that has actually passed with no submission recorded — do not auto-generate penalties for dates with no habit tracking data at all"
  const missedHabits = dailyHabits.filter((h) => {
    const isPast = new Date(h.date_str).getTime() < new Date().setHours(0, 0, 0, 0);
    return isPast && h.study_done && !h.submit_done;
  });
  const penaltyPoints = missedHabits.length * 15;

  // 7. Manual overrides from Score Audit Logs
  const manualOverrides = auditLogs
    .filter((log) => log.student_id === studentId && log.component === 'manual_override')
    .reduce((sum, log) => sum + log.points_change, 0);

  const rawTotal =
    submissionPoints +
    teamPoints +
    leadershipPoints +
    projectSubmitterPoints +
    firstSubmitterPoints +
    manualOverrides -
    penaltyPoints;

  // Total score never drops below 0
  const totalScore = Math.max(0, rawTotal);

  return {
    submissionPoints,
    teamPoints,
    leadershipPoints,
    projectSubmitterPoints,
    firstSubmitterPoints,
    penaltyPoints,
    totalScore
  };
}
