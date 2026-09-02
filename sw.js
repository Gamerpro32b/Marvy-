// ============================================
// MARVY CAKES - SERVICE WORKER
// ============================================

self.addEventListener('install', function(event) {
    console.log('📦 Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('✅ Service Worker activated');
    return self.clients.claim();
});

self.addEventListener('push', function(event) {
    console.log('🔔 Push event received');

    let data = {
        title: '🔔 New Order — Marvy Cakes',
        body: 'New order received! Check admin panel.',
        icon: '🎂',
        url: '/admin/orders.html'
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '🎂',
        badge: data.icon || '🎂',
        tag: 'marvy-order',
        requireInteraction: true,
        data: {
            url: data.url || '/admin/orders.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data?.url || '/admin/orders.html';
    event.waitUntil(
        clients.openWindow(url)
    );
});

console.log('✅ Service Worker loaded');