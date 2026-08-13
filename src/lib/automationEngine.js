/**
 * Powerhub Core Automation Engine
 * Data-Driven & Alert Automations:
 * B1 (Auto-Tick Calendar), B2 (Auto-Calculate Streaks), B3 (Points Ledger),
 * B4 (Milestone Badges), C1 (Mentor Alert on 3+ Misses), C2 (Feedback Notification),
 * C3 (Rank Change Notification), D3 (GitHub Link Validation & Duplicate Flagging),
 * and System Auditing (automation_logs).
 */

// Helper to log automation actions to automation_logs store
export function logAutomationAction(currentLogs = [], { actionType, affectedStudentId, result, details }) {
  const newLog = {
    id: `autolog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actionType,
    affectedStudentId: affectedStudentId || 'system',
    result: result || 'SUCCESS',
    details: details || ''
  };
  console.log(`⚡ [Automation Log] [${actionType}] Student: ${affectedStudentId} -> ${details}`);
  return [newLog, ...currentLogs];
}

// B1: Auto-Tick Submission Calendar when student submits via Submission Panel (marks BOTH 7pm and 11pm boxes)
export function autoTickSubmissionCalendar(studentId, dateStr, habitsObj = {}) {
  const key = `${studentId}_${dateStr}`;
  const current = habitsObj[key] || { studyDone: false, submitDone: false };
  return {
    ...habitsObj,
    [key]: {
      ...current,
      studyDone: true,
      submitDone: true,
      updatedAt: new Date().toISOString()
    }
  };
}

// B3: Points Ledger - Append point entry and calculate total points
export function recordPointsLedgerEntry(currentLedger = [], { studentId, dateStr, amount, reason }) {
  // Idempotency check: prevent duplicate point entries for same student, date, and reason
  const duplicate = currentLedger.find(
    entry => entry.studentId === studentId && entry.dateStr === dateStr && entry.reason === reason
  );
  if (duplicate) {
    console.log(`ℹ️ [Points Ledger] Idempotent skip: ${reason} for ${studentId} on ${dateStr} already recorded.`);
    return { ledger: currentLedger, added: false };
  }

  const newEntry = {
    id: `ledger-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    dateStr,
    amount,
    reason,
    createdAt: new Date().toISOString()
  };

  const updatedLedger = [newEntry, ...currentLedger];
  return { ledger: updatedLedger, added: true, entry: newEntry };
}

// B3 Helper: Auto-sum total points from points_ledger for a student
export function calculateTotalPointsFromLedger(ledger = [], studentId) {
  return ledger
    .filter(entry => entry.studentId === studentId)
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

// B2: Recalculate Student Streak based on consecutive valid submission days (Strict Submissions Check)
export function recalculateStudentStreak(studentId, submissionsList = [], endDateStr = '') {
  const istEndDate = endDateStr || new Date().toISOString().split('T')[0];
  const nowHour = new Date().getHours();
  const isPast11PM = nowHour >= 23;

  // Filter valid (non-flagged, non-rejected, non-deleted) submissions for this student
  const studentValidSubs = (submissionsList || []).filter(s => 
    !s.deleted_at &&
    (s.studentId === studentId || s.student_id === studentId) &&
    s.status !== 'flagged' &&
    s.status !== 'rejected'
  );

  const validDates = new Set(
    studentValidSubs.map(s => {
      if (s.submittedAt) return s.submittedAt.split('T')[0];
      if (s.date) return s.date;
      return null;
    }).filter(Boolean)
  );

  let streak = 0;
  const curr = new Date(istEndDate);

  for (let i = 0; i < 365; i++) {
    const d = new Date(curr);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const hasSub = validDates.has(dateStr);

    if (i === 0 && dateStr === istEndDate) {
      if (hasSub) {
        streak++;
      } else if (isPast11PM) {
        break; // Missed today past cutoff
      }
      // If before 11 PM and no sub today, keep checking past days without breaking yesterday's streak
    } else {
      if (hasSub) {
        streak++;
      } else {
        // Missed past day -> Streak breaks to 0 immediately
        break;
      }
    }
  }

  return streak;
}

// B4: Auto-Award Milestone Badges (7-Day Streak, 30-Day Streak, 100% Monthly Completion)
export function checkAndAwardMilestoneBadges(studentId, currentStreak = 0, currentBadges = [], monthlySubmissionsCount = 0) {
  const awarded = [...currentBadges];
  const newBadges = [];

  // 1. 7-Day Streak Badge
  if (currentStreak >= 7 && !awarded.some(b => b.id === 'badge-7-day-streak')) {
    const b = {
      id: 'badge-7-day-streak',
      title: '🔥 7-Day Streak Warrior',
      description: 'Completed 7 consecutive days of Study & Submission uninterrupted!',
      awardedAt: new Date().toISOString()
    };
    awarded.push(b);
    newBadges.push(b);
  }

  // 2. 30-Day Streak Master
  if (currentStreak >= 30 && !awarded.some(b => b.id === 'badge-30-day-streak')) {
    const b = {
      id: 'badge-30-day-streak',
      title: '⚡ 30-Day Master',
      description: 'Maintained a flawless 30-day daily habit streak!',
      awardedAt: new Date().toISOString()
    };
    awarded.push(b);
    newBadges.push(b);
  }

  // 3. Perfect Month Completion
  if (monthlySubmissionsCount >= 20 && !awarded.some(b => b.id === 'badge-perfect-month')) {
    const b = {
      id: 'badge-perfect-month',
      title: '🏆 Perfect Month Accomplished',
      description: 'Achieved 100% submission completion for the month!',
      awardedAt: new Date().toISOString()
    };
    awarded.push(b);
    newBadges.push(b);
  }

  return { updatedBadges: awarded, newBadges };
}

// C1: Check 3+ Consecutive Misses and Flag Student for Mentor Alert
export function checkConsecutiveMissesAndAlertMentor(studentId, habitsObj = {}, endDateStr = '') {
  let consecutiveMisses = 0;
  const today = new Date(endDateStr || Date.now());

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const key = `${studentId}_${dateStr}`;
    const habit = habitsObj[key];

    if (!habit || (!habit.submitDone && !habit.studyDone)) {
      consecutiveMisses++;
    } else {
      break;
    }
  }

  const hasThreeMissesFlag = consecutiveMisses >= 3;
  return { consecutiveMisses, hasThreeMissesFlag };
}

// C2: Auto-Create In-App Notification when Mentor adds feedback
export function createMentorFeedbackNotification(studentId, submissionRoundName, reviewNotes) {
  return {
    id: `notif-fb-${Date.now()}`,
    userId: studentId,
    title: '📝 Mentor Feedback Available',
    message: `Your mentor reviewed '${submissionRoundName || 'Sprint Submission'}': "${(reviewNotes || 'Great work!').substring(0, 70)}..."`,
    createdAt: new Date().toISOString(),
    isRead: false,
    type: 'feedback'
  };
}

// C3: Detect Rank Changes and generate rank notifications
export function checkAndNotifyRankChange(studentId, oldRank, newRank) {
  if (!oldRank || oldRank === newRank) return null;

  if (newRank < oldRank) {
    return {
      id: `notif-rank-${Date.now()}`,
      userId: studentId,
      title: '🎉 Leaderboard Rank Improved!',
      message: `Awesome! You moved up from #${oldRank} to #${newRank} on the Global Leaderboard! 🚀`,
      createdAt: new Date().toISOString(),
      isRead: false,
      type: 'rank_up'
    };
  } else if (newRank > oldRank && (newRank - oldRank >= 2)) {
    return {
      id: `notif-rank-${Date.now()}`,
      userId: studentId,
      title: '⚡ Leaderboard Update',
      message: `Notice: You dropped to #${newRank} on the Leaderboard. Keep submitting to reclaim your top rank!`,
      createdAt: new Date().toISOString(),
      isRead: false,
      type: 'rank_down'
    };
  }

  return null;
}

// D3: Validate GitHub Link and Flag Duplicate Submissions across students
export function validateAndFlagDuplicateGithub(githubUrl, studentId, dateStr, existingSubmissions = []) {
  if (!githubUrl || typeof githubUrl !== 'string') {
    return { isValid: false, error: 'GitHub link is required.', isDuplicate: false };
  }

  const cleanUrl = githubUrl.trim().toLowerCase().replace(/\/$/, '');
  
  // Format validation
  const githubRegex = /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)*\/?$/;
  if (!githubRegex.test(cleanUrl)) {
    return { 
      isValid: false, 
      error: 'Invalid GitHub URL format. Example: https://github.com/username or https://github.com/username/repository', 
      isDuplicate: false 
    };
  }

  // Duplicate detection across DIFFERENT students on the same date or same repo
  const duplicate = existingSubmissions.find(sub => {
    if (sub.studentId === studentId) return false; // Ignore own re-submissions
    const subClean = (sub.githubUrl || '').trim().toLowerCase().replace(/\/$/, '');
    return subClean === cleanUrl;
  });

  return {
    isValid: true,
    error: null,
    isDuplicate: Boolean(duplicate),
    duplicateStudentName: duplicate ? duplicate.studentName : null
  };
}
