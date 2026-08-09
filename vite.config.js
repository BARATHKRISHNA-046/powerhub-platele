import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { initAutomationCronScheduler } from './src/server/automationCron.js';
import { sendWebPushNotification } from './src/server/pushService.js';

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
      const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
      fs.writeFileSync(storePath, JSON.stringify(updated, null, 2), 'utf8');
      return updated;
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
