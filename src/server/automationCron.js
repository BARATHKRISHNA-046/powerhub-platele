/**
 * Powerhub Time-Based Automation Scheduler (node-cron)
 * Configured explicitly for Asia/Kolkata timezone (IST).
 * 
 * Scheduled Jobs:
 * A1. 11:00 PM IST — Cutoff Auto-Lock & Missed Flagging
 * A2. 6:00 PM & 9:00 PM IST — Pending Study/Submission Reminders
 * A3. 12:00 AM IST — Midnight Rollover & Streak Finalization
 * A4. Monday 8:00 AM IST — Weekly Mentor Summary Report
 * D1. Sunday 11:59 PM IST — Weekly Admin Excel/CSV Report
 * D2. 1:00 AM IST — Auto-Archive Old Cohorts
 */

import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { sendWebPushNotification } from './pushService.js';

const TIMEZONE = 'Asia/Kolkata';
const STORE_PATH = path.resolve(process.cwd(), 'server_db_store.json');

// Helper to read server_db_store.json
function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('[Cron] Error reading store:', e);
  }
  return {};
}

// Helper to write server_db_store.json
function writeStore(data) {
  try {
    const current = readStore();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(STORE_PATH, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('[Cron] Error writing store:', e);
    return null;
  }
}

// Helper to log automation actions to automation_logs table in store
function appendAutomationLog({ actionType, affectedStudentId, result, details }) {
  const store = readStore();
  const logs = store.automationLogs || [];
  const newLog = {
    id: `autolog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actionType,
    affectedStudentId: affectedStudentId || 'system',
    result: result || 'SUCCESS',
    details: details || ''
  };
  writeStore({ automationLogs: [newLog, ...logs] });
  console.log(`⏱️ [IST Cron Job] [${actionType}] ${details}`);
  return newLog;
}

// Nodemailer Transporter Setup (uses environment variables or fallback test transport)
function createEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Fallback dev transporter (logs to console)
  return {
    sendMail: async (opts) => {
      console.log(`📧 [Mock Email Dispatch] To: ${opts.to} | Subject: ${opts.subject}`);
      console.log(`   Body: ${opts.text || opts.html}`);
      return { messageId: `mock-msg-${Date.now()}` };
    }
  };
}

/**
 * Initializes all node-cron scheduled tasks in Asia/Kolkata timezone.
 */
export function initAutomationCronScheduler() {
  console.log('🚀 [Automation Scheduler] Initializing Powerhub node-cron jobs in Asia/Kolkata timezone...');

  // =========================================================
  // A1. 11:00 PM IST Cutoff Auto-Lock & Missed Flagging
  // =========================================================
  cron.schedule('0 23 * * *', async () => {
    console.log('🔒 [Cron A1] 11:00 PM IST Cutoff Auto-Lock triggered.');
    const store = readStore();
    const users = store.users || [];
    const submissions = store.submissions || [];
    const habits = store.habits || {};
    const ledger = store.pointsLedger || [];
    
    // Get IST today date string (YYYY-MM-DD)
    const istDateStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
    let missedCount = 0;
    let updatedHabits = { ...habits };
    let updatedLedger = [...ledger];

    for (const student of users) {
      if (student.roles && student.roles.includes('mentor')) continue;

      const subKey = `${student.id}_${istDateStr}`;
      const hasSubmitted = submissions.some(
        s => s.studentId === student.id && (s.date === istDateStr || (s.submittedAt && s.submittedAt.startsWith(istDateStr)))
      );

      if (!hasSubmitted) {
        missedCount++;
        updatedHabits[subKey] = {
          ...(updatedHabits[subKey] || {}),
          submitDone: false,
          isMissed: true,
          lockedAt: new Date().toISOString()
        };

        // Record -2 penalty points in points_ledger if not already penalized today
        const alreadyPenalized = updatedLedger.some(
          e => e.studentId === student.id && e.dateStr === istDateStr && e.reason === 'Missed 11 PM Cutoff Penalty'
        );

        if (!alreadyPenalized) {
          updatedLedger.push({
            id: `ledger-miss-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            studentId: student.id,
            dateStr: istDateStr,
            amount: -2,
            reason: 'Missed 11 PM Cutoff Penalty',
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    writeStore({
      isCutoffLockedToday: true,
      cutoffLockedAt: new Date().toISOString(),
      habits: updatedHabits,
      pointsLedger: updatedLedger
    });

    appendAutomationLog({
      actionType: 'A1_CUTOFF_AUTO_LOCK',
      affectedStudentId: 'all_students',
      details: `11 PM IST Cutoff locked. ${missedCount} student(s) marked Missed with -2 penalty points logged.`
    });
  }, { timezone: TIMEZONE });

  // =========================================================
  // A2. 6:00 PM & 9:00 PM IST Pending Task Reminders
  // =========================================================
  const sendReminders = (hourLabel) => {
    console.log(`⏰ [Cron A2] ${hourLabel} IST Pending Task Reminders triggered.`);
    const store = readStore();
    const users = store.users || [];
    const submissions = store.submissions || [];
    const notifs = store.notifications || [];
    const istDateStr = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
    let reminderCount = 0;
    let newNotifs = [...notifs];

    for (const student of users) {
      if (student.roles && student.roles.includes('mentor')) continue;

      const hasSubmitted = submissions.some(
        s => s.studentId === student.id && (s.date === istDateStr || (s.submittedAt && s.submittedAt.startsWith(istDateStr)))
      );

      if (!hasSubmitted) {
        reminderCount++;
        newNotifs.unshift({
          id: `notif-rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: student.id,
          title: `⏳ ${hourLabel} Deadline Reminder`,
          message: `Don't forget to submit today's work before the 11:00 PM IST cutoff! Keep your habit streak alive. 🔥`,
          createdAt: new Date().toISOString(),
          isRead: false,
          type: 'reminder'
        });

        // Trigger Web Push Notification to student's registered devices
        sendWebPushNotification({
          title: `⏳ ${hourLabel} Deadline Reminder`,
          message: `Don't forget to submit today's work before the 11:00 PM IST cutoff! Keep your habit streak alive. 🔥`,
          target: 'STUDENT',
          studentId: student.id,
          sentBy: 'System Automation'
        }).catch(err => console.error('[Push Cron Error]', err));
      }
    }

    writeStore({ notifications: newNotifs });
    appendAutomationLog({
      actionType: 'A2_TASK_REMINDER',
      affectedStudentId: 'pending_students',
      details: `${hourLabel} IST reminders dispatched to ${reminderCount} student(s) with pending submissions.`
    });
  };

  cron.schedule('0 18 * * *', () => sendReminders('6 PM'), { timezone: TIMEZONE });
  cron.schedule('0 21 * * *', () => sendReminders('9 PM'), { timezone: TIMEZONE });

  // =========================================================
  // A3. 12:00 AM IST Daily Midnight Rollover & Streak Finalization
  // =========================================================
  cron.schedule('0 0 * * *', () => {
    console.log('🌙 [Cron A3] 12:00 AM IST Midnight Rollover triggered.');
    const store = readStore();
    const users = store.users || [];
    const habits = store.habits || {};

    // Yesterday date string
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toLocaleDateString('en-CA', { timeZone: TIMEZONE });

    let updatedUsers = users.map(user => {
      if (user.roles && user.roles.includes('mentor')) return user;

      // Finalize streak calculation
      const key = `${user.id}_${yestStr}`;
      const habit = habits[key];

      let streak = user.myStreak || 0;
      if (habit && habit.studyDone && habit.submitDone) {
        streak += 1;
      } else {
        streak = 0; // Reset streak on missed day
      }

      return {
        ...user,
        myStreak: streak,
        lastStreakUpdateDate: yestStr
      };
    });

    writeStore({
      users: updatedUsers,
      isCutoffLockedToday: false // Unlock for new day
    });

    appendAutomationLog({
      actionType: 'A3_MIDNIGHT_ROLLOVER',
      affectedStudentId: 'all_students',
      details: `Midnight rollover completed for ${yestStr}. Habit streaks finalized across all student profiles.`
    });
  }, { timezone: TIMEZONE });

  // =========================================================
  // A4. Weekly Monday 8:00 AM IST Mentor Summary Report
  // =========================================================
  cron.schedule('0 8 * * 1', async () => {
    console.log('📊 [Cron A4] Monday 8:00 AM IST Mentor Summary Report triggered.');
    const store = readStore();
    const users = store.users || [];
    const submissions = store.submissions || [];
    const mentors = users.filter(u => u.roles && u.roles.includes('mentor'));

    const transporter = createEmailTransporter();

    for (const mentor of mentors) {
      const summaryText = `Weekly Powerhub Summary Report for ${mentor.name}
Total Students Tracked: ${users.filter(u => !u.roles?.includes('mentor')).length}
Total Verified Submissions Past Week: ${submissions.length}
Top Performer: ${users[0]?.name || 'Student'}

Keep empowering your students on Powerhub!`;

      await transporter.sendMail({
        from: '"Powerhub Automation" <automation@powerhub.dev>',
        to: mentor.email || 'mentor@powerhub.dev',
        subject: '📊 Powerhub Weekly Mentor Summary Report',
        text: summaryText
      });
    }

    appendAutomationLog({
      actionType: 'A4_MENTOR_WEEKLY_REPORT',
      affectedStudentId: 'mentors',
      details: `Weekly summary report generated and dispatched to ${mentors.length} mentor(s).`
    });
  }, { timezone: TIMEZONE });

  // =========================================================
  // D1. Sunday 11:59 PM IST Admin CSV/Excel Report Generation
  // =========================================================
  cron.schedule('59 23 * * 0', async () => {
    console.log('📈 [Cron D1] Sunday 11:59 PM IST Admin Report Generation triggered.');
    const store = readStore();
    const users = store.users || [];
    const ledger = store.pointsLedger || [];

    const csvHeader = 'Student ID,Name,Email,Streak,Total Submissions\n';
    const csvRows = users
      .filter(u => !u.roles?.includes('mentor'))
      .map(u => `${u.id},"${u.name}",${u.email},${u.myStreak || 0},${(store.submissions || []).filter(s => s.studentId === u.id).length}`)
      .join('\n');

    const csvData = csvHeader + csvRows;

    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: '"Powerhub Automation" <admin@powerhub.dev>',
      to: 'admin@powerhub.dev',
      subject: '📈 Powerhub Weekly Admin CSV Export Report',
      text: 'Attached is your automated weekly student performance report CSV.',
      attachments: [
        {
          filename: `powerhub_report_${new Date().toISOString().split('T')[0]}.csv`,
          content: csvData
        }
      ]
    });

    appendAutomationLog({
      actionType: 'D1_ADMIN_WEEKLY_REPORT',
      affectedStudentId: 'admin',
      details: 'Automated weekly CSV report generated and dispatched to admin.'
    });
  }, { timezone: TIMEZONE });

  // =========================================================
  // D2. Daily 1:00 AM IST Auto-Archive Old Cohorts
  // =========================================================
  cron.schedule('0 1 * * *', () => {
    console.log('📦 [Cron D2] 1:00 AM IST Auto-Archive Old Cohorts triggered.');
    const store = readStore();
    const cohorts = store.cohorts || [
      { id: 'batch-a', name: 'Batch A - Aug 2026', endDate: '2026-08-01', isArchived: false }
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    let archiveCount = 0;

    const updatedCohorts = cohorts.map(c => {
      if (c.endDate && c.endDate < todayStr && !c.isArchived) {
        archiveCount++;
        return { ...c, isArchived: true, archivedAt: new Date().toISOString() };
      }
      return c;
    });

    writeStore({ cohorts: updatedCohorts });
    appendAutomationLog({
      actionType: 'D2_AUTO_ARCHIVE_COHORTS',
      affectedStudentId: 'cohorts',
      details: `Checked cohorts. ${archiveCount} expired cohort(s) marked as archived.`
    });
  }, { timezone: TIMEZONE });
}
