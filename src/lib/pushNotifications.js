/**
 * PowerHub Web Push Notification Permission & Subscription Manager
 */

export const VAPID_PUBLIC_KEY = 'BMXSW1Ay2IImYyFWcU6kf-9y6QLDlJFQxI7FS9-FUFSsdM51Xoebm4-ywQpBrQtwwSwVkxwNKwCLSBmqQRweNpw';

// Helper to convert base64 VAPID public key to Uint8Array required by PushManager
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if browser supports Web Push & Service Workers
export function isPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Request Notification Permission and Subscribe browser to Push Service
export async function subscribeStudentToPush(studentId) {
  if (!isPushSupported()) {
    console.warn('⚠️ Web Push is not supported in this browser environment.');
    return { success: false, error: 'Web Push not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ Push notification permission denied by user.');
      return { success: false, error: 'Permission denied', permission };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    const subJson = subscription.toJSON();

    const subRecord = {
      id: `sub-${studentId}-${Date.now()}`,
      studentId,
      endpoint: subJson.endpoint,
      keys: subJson.keys,
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString()
    };

    console.log('⚡ [Push Subscription] Successfully created push subscription for student:', studentId);
    return { success: true, subscription: subRecord };
  } catch (err) {
    console.error('❌ [Push Subscription Error]', err);
    return { success: false, error: err.message };
  }
}
