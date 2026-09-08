// ============================================
// MARVY CAKES - Customer Authentication
// ============================================

console.log('✅ auth.js loaded!');

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
// GET CURRENT USER EMAIL
// ============================================

async function getCurrentUserEmail() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            return session.user.email;
        }
        return null;
    } catch (error) {
        console.error('Get user email error:', error);
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
// GET CUSTOMER ORDERS BY EMAIL
// ============================================

async function getCustomerOrders(email) {
    try {
        if (!email) return [];

        // First try to get orders by user_id (for logged-in users)
        const { data: { session } } = await supabase.auth.getSession();
        
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (session) {
            // If logged in, get orders by user_id
            query = query.eq('user_id', session.user.id);
        } else {
            // Fallback to email for guest orders
            query = query.eq('customer_email', email);
        }

        const { data, error } = await query;

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
// GET USER ORDERS BY USER ID
// ============================================

async function getUserOrdersByUserId(userId) {
    try {
        if (!userId) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get user orders error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get user orders error:', error);
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
// UPDATE USER METADATA
// ============================================

async function updateUserMetadata(metadata) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata
        });

        if (error) {
            console.error('Update metadata error:', error);
            return { error };
        }

        console.log('✅ Metadata updated:', data);
        return { data };
    } catch (error) {
        console.error('Update metadata error:', error);
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

// ============================================
// GET USER BY ID
// ============================================

async function getUserById(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Get user by ID error:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Get user by ID error:', error);
        return null;
    }
}

// ============================================
// GET USER ORDERS WITH DETAILS
// ============================================

async function getUserOrdersWithDetails(userId) {
    try {
        if (!userId) return [];

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Get user orders with details error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Get user orders with details error:', error);
        return [];
    }
}

// ============================================
// LOGOUT FROM ALL DEVICES
// ============================================

async function logoutAllDevices() {
    try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });

        if (error) {
            console.error('Logout all devices error:', error);
            return { error };
        }

        console.log('✅ Logged out from all devices');
        return { success: true };
    } catch (error) {
        console.error('Logout all devices error:', error);
        return { error };
    }
}

// ============================================
// CHECK IF EMAIL EXISTS
// ============================================

async function checkEmailExists(email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Check email error:', error);
            return { exists: false, error };
        }

        return { exists: !!data, data };
    } catch (error) {
        console.error('Check email error:', error);
        return { exists: false, error };
    }
}

console.log('✅ Customer auth module fully loaded!');