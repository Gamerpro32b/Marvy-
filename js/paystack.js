// ============================================
// MARVY CAKES - PAYSTACK PAYMENT INTEGRATION
// ============================================

const PAYSTACK_PUBLIC_KEY =
    'pk_live_41f7818b5a45bf3b5b9addcd4c20e65f4beaf9e0';

// ============================================
// INITIALIZE PAYMENT
// ============================================

function initializePayment(orderData, orderId) {
    return new Promise((resolve, reject) => {
        const amount = Number(orderData.total) * 100;

        if (typeof PaystackPop === 'undefined') {
            console.error('❌ Paystack SDK is not available.');

            reject({
                status: 'error',
                message: 'Paystack not loaded. Please refresh and try again.'
            });

            return;
        }

        let handler;

        try {
            handler = PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,

                email:
                    orderData.customer_email ||
                    'customer@example.com',

                amount: amount,

                currency: 'NGN',

                ref: orderData.order_number,

                channels: [
                    'bank_transfer',
                    'ussd'
                ],

                callback: function(response) {
                    console.log(
                        '✅ Paystack payment completed:',
                        response.reference
                    );

                    verifyPaymentOnServer(
                        response.reference,
                        orderId
                    )
                        .then(function(result) {
                            resolve({
                                status: 'success',
                                reference: response.reference,
                                transaction: response.transaction,
                                orderId: orderId,
                                verified: result
                            });
                        })
                        .catch(function(error) {
                            console.error(
                                '❌ Payment verification failed:',
                                error
                            );

                            reject({
                                status: 'error',
                                message:
                                    'Payment verification failed: ' +
                                    error.message
                            });
                        });
                },

                onClose: function() {
                    console.log(
                        '⚠️ Paystack payment window closed.'
                    );

                    checkPaymentStatus(
                        orderData.order_number,
                        orderId
                    )
                        .then(function(result) {
                            if (result.status === 'success') {
                                resolve({
                                    status: 'success',
                                    reference: result.reference,
                                    transaction: result.transaction,
                                    orderId: orderId,
                                    verified: true
                                });
                            } else {
                                reject({
                                    status: 'cancelled',
                                    message: 'Payment was cancelled'
                                });
                            }
                        })
                        .catch(function() {
                            reject({
                                status: 'cancelled',
                                message: 'Payment was cancelled'
                            });
                        });
                }
            });

            handler.openIframe();
        } catch (error) {
            console.error(
                '❌ Could not open Paystack:',
                error
            );

            reject({
                status: 'error',
                message:
                    'Unable to open payment window: ' +
                    error.message
            });
        }
    });
}

// ============================================
// VERIFY PAYMENT ON SUPABASE EDGE FUNCTION
// ============================================

async function verifyPaymentOnServer(reference, orderId) {
    try {
        const { data, error } =
            await supabase.functions.invoke(
                'verify-payment',
                {
                    body: {
                        type: 'verify_payment',
                        reference: reference,
                        order_id: orderId
                    }
                }
            );

        if (error) {
            console.error(
                '❌ Verification error:',
                error
            );

            throw new Error(error.message);
        }

        console.log(
            '✅ Payment verified successfully:',
            data
        );

        return data;
    } catch (error) {
        console.error(
            '❌ Verification failed:',
            error
        );

        throw error;
    }
}

// ============================================
// CHECK PAYMENT STATUS
// ============================================

async function checkPaymentStatus(orderNumber, orderId) {
    try {
        const { data, error } =
            await supabase.functions.invoke(
                'verify-payment',
                {
                    body: {
                        type: 'check_payment',
                        order_number: orderNumber,
                        order_id: orderId
                    }
                }
            );

        if (error) {
            console.error(
                '❌ Payment status check error:',
                error
            );

            return {
                status: 'pending'
            };
        }

        return data;
    } catch (error) {
        console.error(
            '❌ Payment status check failed:',
            error
        );

        return {
            status: 'pending'
        };
    }
}

console.log(
    '✅ Paystack integration loaded successfully!'
);
