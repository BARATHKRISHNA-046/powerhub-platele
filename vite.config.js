import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { initAutomationCronScheduler } from './src/server/automationCron.js';
import { sendWebPushNotification } from './src/server/pushService.js';

function mergeEntityArrays(existingArr = [], incomingArr = []) {
  if (!Array.isArray(existingArr)) existingArr = [];
  if (!Array.isArray(incomingArr)) incomingArr = [];

  const map = new Map();
  existingArr.forEach(item => {
    if (item && item.id) map.set(String(item.id), item);
  });
  incomingArr.forEach(item => {
    if (item && item.id) {
      const key = String(item.id);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, item);
      } else {
        const existingTime = new Date(existing.updatedAt || existing.submittedAt || existing.createdAt || existing.created_at || 0).getTime();
        const incomingTime = new Date(item.updatedAt || item.submittedAt || item.createdAt || item.created_at || 0).getTime();
        if (incomingTime >= existingTime || (item.status && item.status !== existing.status)) {
          map.set(key, { ...existing, ...item });
        }
      }
    }
  });

  return Array.from(map.values());
}

function powerhubSyncPlugin() {
  const storePath = path.resolve(__dirname, 'server_db_store.json');
  let cronInitialized = false;

  const readStore = () => {
    try {
      if (fs.existsSync(storePath)) {
        return JSON.parse(fs.readFileSync(storePath, 'utf8'));
      }
    } catch (e) {}
    return null;
  };

  const writeStore = (data) => {
    try {
      const current = readStore() || {};
      const arrayFields = [
        'submissions', 'announcements', 'users', 'teams', 
        'problemStatements', 'hackathonTeams', 'teamMembers', 
        'ideaSubmissions', 'certificates', 'mockInterviews', 
        'peerReviews', 'pointsLedger', 'automationLogs'
      ];

      const mergedData = { ...current };

      Object.keys(data).forEach(key => {
        if (arrayFields.includes(key) && Array.isArray(data[key])) {
          mergedData[key] = mergeEntityArrays(current[key], data[key]);
        } else if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          mergedData[key] = { ...(current[key] || {}), ...data[key] };
        } else {
          mergedData[key] = data[key];
        }
      });

      mergedData.updatedAt = new Date().toISOString();
      fs.writeFileSync(storePath, JSON.stringify(mergedData, null, 2), 'utf8');
      return mergedData;
    } catch (e) {
      console.error('Error writing server store:', e);
      return null;
    }
  };

  return {
    name: 'powerhub-sync-plugin',
    configureServer(server) {
      if (!cronInitialized) {
        cronInitialized = true;
        try {
          initAutomationCronScheduler();
        } catch (e) {
          console.error('[Vite Plugin] Failed to initialize cron scheduler:', e);
        }
      }

      server.middlewares.use('/api/notifications/send', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await sendWebPushNotification(payload);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, ...result }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });

      server.middlewares.use('/api/sync', (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const store = readStore() || {};
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: store }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const updated = writeStore(payload);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: updated }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), powerhubSyncPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false
  }
});
