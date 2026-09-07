// ============================================
// MARVY CAKES - Customer Authentication
// ============================================

// ============================================
// GET CURRENT SESSION
// ============================================

async function getCustomerSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('Session error:', error);
        return null;
    }
}

// ============================================
// CHECK IF USER IS LOGGED IN
// ============================================

async function isCustomerLoggedIn() {
    const session = await getCustomerSession();
    return !!session;
}

// ============================================
// GET CURRENT USER
// ============================================

async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Get user error:', error);
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// ============================================
// CUSTOMER SIGN UP
// ============================================

async function customerSignUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            console.error('Signup error:', error);
            return { error };
        }

        console.log('✅ Signup successful:', data);
        return { data };
    } catch (error) {
        console.error('Signup error:', error);
        return { error };
    }
}

// ============================================
// CUSTOMER LOGIN
// ============================================

async function customerLogin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Login error:', error);
            return { error };
        }

        console.log('✅ Login successful:', data);
        return { data };
    } catch (error) {
        console.error('Login error:', error);
        return { error };
    }
}

// ============================================
// CUSTOMER LOGOUT
// ============================================

async function customerLogout() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            return { error };
        }

        console.log('✅ Logout successful');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { error };
    }
}

// ============================================
// GET CUSTOMER ORDERS
// ============================================

async function getCustomerOrders(email) {
    try {
        if (!email) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get orders error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get orders error:', error);
        return [];
    }
}

// ============================================
// UPDATE CUSTOMER PROFILE
// ============================================

async function updateCustomerProfile(updates) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) {
            console.error('Update profile error:', error);
            return { error };
        }

        console.log('✅ Profile updated:', data);
        return { data };
    } catch (error) {
        console.error('Update profile error:', error);
        return { error };
    }
}

// ============================================
// PASSWORD RESET
// ============================================

async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });

        if (error) {
            console.error('Reset password error:', error);
            return { error };
        }

        console.log('✅ Password reset email sent');
        return { data };
    } catch (error) {
        console.error('Reset password error:', error);
        return { error };
    }
}

// ============================================
// UPDATE PASSWORD
// ============================================

async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Update password error:', error);
            return { error };
        }

        console.log('✅ Password updated');
        return { data };
    } catch (error) {
        console.error('Update password error:', error);
        return { error };
    }
}

console.log('✅ Customer auth module loaded');