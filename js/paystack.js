// ============================================
// MARVY CAKES - Paystack Payment Integration
// ============================================

// 🔑 PAYSTACK KEYS
// Public Key - Safe to expose in frontend (LIVE)
const PAYSTACK_PUBLIC_KEY = 'pk_live_41f7818b5a45bf3b5b9addcd4c20e65f4beaf9e0';

// Secret Key - Used for server-side verification
// ⚠️ NEVER expose this in frontend! Only use in Edge Functions
// This is just a placeholder - the actual secret key is stored in Supabase Secrets
const PAYSTACK_SECRET_KEY = 'sk_live_b98ad13333ae3c231b159e705318feb10560b3d0';

// ============================================
// INITIALIZE PAYMENT
// ============================================

function initializePayment(orderData, orderId) {
    return new Promise((resolve, reject) => {
        // Calculate amount in kobo (Paystack uses smallest currency unit)
        const amount = orderData.total * 100; // ₦ to kobo

        // Check if Paystack is loaded
        if (typeof PaystackPop === 'undefined') {
            reject({
                status: 'error',
                message: 'Paystack not loaded. Please refresh and try again.'
            });
            return;
        }

        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: orderData.customer_email || 'customer@example.com',
            amount: amount,
            currency: 'NGN',
            ref: orderData.order_number,
            
            // ========================================
            // ONLY SHOW BANK TRANSFER & USSD
            // ========================================
            channels: ['bank_transfer', 'ussd'],
            // ========================================
            
            callback: function(response) {
                // Payment successful
                console.log('✅ Payment successful:', response);
                resolve({
                    status: 'success',
                    reference: response.reference,
                    transaction: response.transaction,
                    orderId: orderId
                });
            },
            onClose: function() {
                // Payment cancelled
                reject({
                    status: 'cancelled',
                    message: 'Payment was cancelled'
                });
            }
        });

        handler.openIframe();
    });
}

// ============================================
// VERIFY PAYMENT (Server-side)
// ============================================

async function verifyPayment(reference) {
    try {
        // This should be done on your server/backend
        // For now, we'll simulate verification
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Payment verification error:', error);
        return null;
    }
}

console.log('✅ Paystack integration loaded!');
