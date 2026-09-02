// ============================================
// WEALTH-NAILS - Paystack Payment Integration
// ============================================

// 🔑 PAYSTACK KEYS
const PAYSTACK_PUBLIC_KEY = 'pk_test_63073c32c8b7d569bfd956607ff9589547bf507c';
const PAYSTACK_SECRET_KEY = 'sk_test_9ed197b08b32acf4b7c52bd6c05e3faef99c60ba';

// ============================================
// INITIALIZE PAYMENT
// ============================================

function initializePayment(orderData, orderId) {
    return new Promise((resolve, reject) => {
        const amount = orderData.total * 100;

        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: orderData.customer_email || 'customer@example.com',
            amount: amount,
            currency: 'NGN',
            ref: orderData.order_number,
            
            // ========================================
            // 🔥 ONLY SHOW BANK TRANSFER & USSD
            // ========================================
            channels: ['bank_transfer', 'ussd'],
            // ========================================
            
            callback: function(response) {
                resolve({
                    status: 'success',
                    reference: response.reference,
                    transaction: response.transaction,
                    orderId: orderId
                });
            },
            onClose: function() {
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
// VERIFY PAYMENT
// ============================================

async function verifyPayment(reference) {
    try {
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