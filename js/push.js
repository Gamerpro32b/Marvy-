// ============================================
// MARVY CAKES - WEB PUSH NOTIFICATIONS
// ============================================

const VAPID_PUBLIC_KEY = 'BDULpZQvy36bjN33EFqmjf_wLvYvTB1ogR4c27VvdoWgQPEBSHfKVaLy5L_JfsggBoix12j_wXX7js2ENw3KJL0';

// ============================================
// REGISTER SERVICE WORKER
// ============================================

async function registerServiceWorker() {
    try {
        if (!('serviceWorker' in navigator)) {
            console.error('❌ Service Workers not supported');
            return false;
        }

        // Try root path first, then cake/ if needed
        let registration;
        try {
            registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            console.log('✅ Service Worker registered at root scope:', registration.scope);
        } catch (e) {
            console.log('⚠️ Root registration failed, trying /cake/ path...');
            registration = await navigator.serviceWorker.register('/cake/sw.js', {
                scope: '/cake/'
            });
            console.log('✅ Service Worker registered at /cake/ scope:', registration.scope);
        }

        return registration;

    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        return false;
    }
}

// ============================================
// SUBSCRIBE TO PUSH NOTIFICATIONS
// ============================================

async function subscribeToPush() {
    try {
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            console.log('❌ Service Workers not supported');
            return false;
        }

        // Check if push is supported
        if (!('PushManager' in window)) {
            console.log('❌ Push API not supported');
            return false;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('❌ Notification permission denied');
            return false;
        }

        // Register service worker if not already
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            registration = await registerServiceWorker();
            if (!registration) {
                console.log('❌ Service Worker registration failed');
                return false;
            }
        }

        // Wait for service worker to be ready
        registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');

        // Check existing subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            console.log('✅ Already subscribed');
            return subscription;
        }

        // Create new subscription
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('✅ Push subscription created');

        // Save subscription to Supabase
        await saveSubscriptionToSupabase(subscription);

        return subscription;
    } catch (error) {
        console.error('❌ Push subscription failed:', error);
        return false;
    }
}

// ============================================
// UNSUBSCRIBE FROM PUSH NOTIFICATIONS
// ============================================

async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            console.log('ℹ️ No active subscription found');
            return true;
        }

        // Unsubscribe from push
        const unsubscribed = await subscription.unsubscribe();
        
        if (unsubscribed) {
            console.log('✅ Unsubscribed from push');
            await removeSubscriptionFromSupabase();
            return true;
        } else {
            console.log('❌ Unsubscribe failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Unsubscribe error:', error);
        return false;
    }
}

// ============================================
// SAVE SUBSCRIPTION TO SUPABASE
// ============================================

async function saveSubscriptionToSupabase(subscription) {
    try {
        // Convert keys to base64
        const p256dhKey = subscription.getKey('p256dh');
        const authKey = subscription.getKey('auth');
        
        const subscriptionData = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(p256dhKey))),
                auth: btoa(String.fromCharCode.apply(null, new Uint8Array(authKey)))
            }
        };

        // Save to Supabase
        const { data, error } = await supabase
            .from('push_subscriptions')
            .upsert({
                id: 1,
                subscription: subscriptionData,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('❌ Error saving subscription:', error);
            return false;
        }

        console.log('✅ Subscription saved to Supabase');
        return true;
    } catch (error) {
        console.error('❌ Save subscription error:', error);
        return false;
    }
}

// ============================================
// REMOVE SUBSCRIPTION FROM SUPABASE
// ============================================

async function removeSubscriptionFromSupabase() {
    try {
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', 1);

        if (error) {
            console.error('❌ Error removing subscription:', error);
            return false;
        }

        console.log('✅ Subscription removed from Supabase');
        return true;
    } catch (error) {
        console.error('❌ Remove subscription error:', error);
        return false;
    }
}

// ============================================
// GET PUSH STATUS
// ============================================

async function getPushStatus() {
    try {
        console.log('🔍 Checking push status...');

        // Check browser support
        if (!('serviceWorker' in navigator)) {
            console.log('❌ Service Workers not supported');
            return { supported: false, subscribed: false };
        }

        if (!('PushManager' in window)) {
            console.log('❌ Push API not supported');
            return { supported: false, subscribed: false };
        }

        if (!('Notification' in window)) {
            console.log('❌ Notifications not supported');
            return { supported: false, subscribed: false };
        }

        // Get existing registration
        let registration = await navigator.serviceWorker.getRegistration();

        // Register if none exists
        if (!registration) {
            console.log('⏳ Registering Service Worker...');
            registration = await registerServiceWorker();
            if (!registration) {
                return { supported: false, subscribed: false };
            }
        }

        // Wait until ready
        registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker ready');

        // Check current subscription
        const subscription = await registration.pushManager.getSubscription();

        console.log('📱 Push subscription:', subscription ? 'Active' : 'None');

        return {
            supported: true,
            subscribed: !!subscription,
            subscription: subscription || null,
            permission: Notification.permission
        };

    } catch (error) {
        console.error('❌ Error checking push status:', error);
        return {
            supported: false,
            subscribed: false,
            error: error.message
        };
    }
}

// ============================================
// UTILITY: Convert base64 to Uint8Array
// ============================================

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// ============================================
// AUTO-REGISTER SERVICE WORKER ON LOAD
// ============================================

// Register service worker when this script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        registerServiceWorker();
    });
} else {
    registerServiceWorker();
}

console.log('✅ Push notification module loaded');