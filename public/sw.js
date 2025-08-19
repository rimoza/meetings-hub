// Service Worker for Meeting Reminders
const CACHE_NAME = 'meetings-hub-v1';
const CACHE_URLS = [
  '/',
  '/favicon.svg',
  '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_URLS))
      .catch((error) => console.error('[SW] Cache installation failed:', error))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for notifications (when available)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'reminder-sync') {
    event.waitUntil(checkAndSendReminders());
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Extract meeting data from notification
  const notificationData = event.notification.data || {};
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    scheduleReminderNotification(event.data.payload);
  } else if (event.data && event.data.type === 'CANCEL_REMINDER') {
    cancelReminderNotification(event.data.reminderId);
  }
});

// Store scheduled reminders
const scheduledReminders = new Map();

function scheduleReminderNotification(reminderData) {
  const { meeting, reminderTime, delayMs, reminderId } = reminderData;
  
  console.log(`[SW] Scheduling reminder for ${meeting.title} in ${delayMs}ms`);
  
  // Clear existing reminder if it exists
  if (scheduledReminders.has(reminderId)) {
    clearTimeout(scheduledReminders.get(reminderId));
  }
  
  // Schedule new reminder
  const timeoutId = setTimeout(() => {
    showServiceWorkerNotification(meeting, reminderTime);
    scheduledReminders.delete(reminderId);
  }, delayMs);
  
  scheduledReminders.set(reminderId, timeoutId);
}

function cancelReminderNotification(reminderId) {
  console.log(`[SW] Cancelling reminder: ${reminderId}`);
  
  if (scheduledReminders.has(reminderId)) {
    clearTimeout(scheduledReminders.get(reminderId));
    scheduledReminders.delete(reminderId);
  }
}

function showServiceWorkerNotification(meeting, reminderTime) {
  const timeLabel = getTimeLabel(reminderTime);
  const meetingTime = `${meeting.date} at ${meeting.time}`;
  
  const notificationOptions = {
    body: `${meeting.title}\n${meetingTime}\nLocation: ${meeting.location}`,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: `meeting-${meeting.id}-${reminderTime}`,
    requireInteraction: false,
    silent: false,
    timestamp: Date.now(),
    data: {
      meetingId: meeting.id,
      reminderTime: reminderTime,
      meetingTime: meetingTime,
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Meeting'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  console.log('[SW] Showing notification:', `Meeting Reminder - ${timeLabel}`);
  
  return self.registration.showNotification(
    `Meeting Reminder - ${timeLabel}`,
    notificationOptions
  ).catch((error) => {
    console.error('[SW] Failed to show notification:', error);
  });
}

function getTimeLabel(minutes) {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

function checkAndSendReminders() {
  // This function could check for any pending reminders
  // and send them if needed (useful for background sync)
  console.log('[SW] Checking for pending reminders');
  return Promise.resolve();
}

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const notificationOptions = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, notificationOptions)
    );
  }
});