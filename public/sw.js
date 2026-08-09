/**
 * PowerHub Service Worker for Web Push Notifications & Background Events
 */

self.addEventListener('install', (event) => {
  console.log('⚡ [PowerHub Service Worker] Installed successfully.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('⚡ [PowerHub Service Worker] Activated.');
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push events from backend web-push
self.addEventListener('push', (event) => {
  console.log('🔔 [PowerHub SW] Push notification received:', event);

  let data = {
    title: '⚡ PowerHub Notification',
    body: 'You have a new update on PowerHub!',
    icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=PowerHub',
    badge: 'https://api.dicebear.com/7.x/identicon/svg?seed=PowerHubBadge',
    url: '/'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open PowerHub 🚀' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click / tap behavior
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [PowerHub SW] Notification clicked:', event);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
