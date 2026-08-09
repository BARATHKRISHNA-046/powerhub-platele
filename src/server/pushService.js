/**
 * PowerHub Backend Push Notification Service using web-push & VAPID keys
 */

import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BMXSW1Ay2IImYyFWcU6kf-9y6QLDlJFQxI7FS9-FUFSsdM51Xoebm4-ywQpBrQtwwSwVkxwNKwCLSBmqQRweNpw';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'PbjQ9gPewwormXm18y3IfVdbTCqYX_wHbCaANwwKUDo';

// Configure VAPID details for Web Push
webpush.setVapidDetails(
  'mailto:admin@powerhub.dev',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const STORE_PATH = path.resolve(process.cwd(), 'server_db_store.json');

function readStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function writeStore(data) {
  try {
    const current = readStore();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(STORE_PATH, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('[Push Service] Error writing store:', e);
    return null;
  }
}

/**
 * Dispatches a Web Push Notification to target subscriptions.
 * 
 * @param {Object} opts
 * @param {string} opts.title - Notification title
 * @param {string} opts.message - Notification body text
 * @param {string} opts.target - "ALL", "BATCH", or specific studentId
 * @param {string} [opts.batchName] - Specific batch name if target === 'BATCH'
 * @param {string} [opts.studentId] - Specific studentId if target === 'STUDENT'
 * @param {string} [opts.url] - Optional navigation URL when clicked
 * @param {string} [opts.sentBy] - Name of admin/mentor sending notification
 */
export async function sendWebPushNotification({ title, message, target = 'ALL', batchName, studentId, url = '/', sentBy = 'Admin' }) {
  console.log(`📡 [Push Service] Dispatching Web Push: "${title}" to target: ${target}`);
  const store = readStore();
  const users = store.users || [];
  const subscriptions = store.pushSubscriptions || [];
  const notifLogs = store.notificationLogs || [];

  // Filter subscriptions based on target
  let targetSubscriptions = [];

  if (target === 'ALL') {
    targetSubscriptions = subscriptions;
  } else if (target === 'BATCH' && batchName) {
    const batchStudentIds = users
      .filter(u => (u.batch || '').toUpperCase().includes(batchName.toUpperCase()) || (u.domain || '').toUpperCase() === batchName.toUpperCase())
      .map(u => u.id);
    targetSubscriptions = subscriptions.filter(sub => batchStudentIds.includes(sub.studentId));
  } else if (studentId) {
    targetSubscriptions = subscriptions.filter(sub => sub.studentId === studentId);
  }

  const payload = JSON.stringify({
    title: title || '⚡ PowerHub Alert',
    body: message || 'You have a new update on PowerHub.',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=PowerHub',
    url: url || '/'
  });

  let successCount = 0;
  let expiredCount = 0;
  const expiredEndpoints = [];

  for (const sub of targetSubscriptions) {
    try {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: sub.keys
      };
      await webpush.sendNotification(pushSub, payload);
      successCount++;
    } catch (err) {
      console.warn(`⚠️ [Push Service] Failed to send push to endpoint: ${sub.endpoint.substring(0, 30)}... Code: ${err.statusCode}`);
      // Remove expired/invalid subscriptions (404 Not Found or 410 Gone)
      if (err.statusCode === 404 || err.statusCode === 410) {
        expiredCount++;
        expiredEndpoints.push(sub.endpoint);
      }
    }
  }

  // Purge expired subscriptions if any
  if (expiredEndpoints.length > 0) {
    const cleanedSubs = subscriptions.filter(s => !expiredEndpoints.includes(s.endpoint));
    writeStore({ pushSubscriptions: cleanedSubs });
    console.log(`🧹 [Push Service] Cleaned ${expiredCount} expired push subscription(s).`);
  }

  // Log to notification_logs table in server store
  const logEntry = {
    id: `notiflog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    message,
    target,
    sentBy,
    sentAt: new Date().toISOString(),
    totalDispatched: targetSubscriptions.length,
    successCount
  };

  writeStore({
    notificationLogs: [logEntry, ...notifLogs]
  });

  return {
    success: true,
    totalTargeted: targetSubscriptions.length,
    successCount,
    expiredCount
  };
}
