// ============================================
// MARVY CAKES - Favourites Functions
// ============================================

console.log('✅ Favourites module loading...');

// ============================================
// HANDLE FAVOURITE CLICK (Shop Page)
// ============================================

async function handleFavourite(productId, event) {
    if (event) event.stopPropagation();
    
    try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            showToast(
                '💖 Sign In Required',
                'Please sign in to save your favourites.',
                '💖',
                'warning'
            );
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Toggle favourite
        const result = await toggleFavourite(productId);
        
        if (result.error) {
            console.error('Favourite error:', result.error);
            showToast('Error', 'Something went wrong. Please try again.', '❌', 'error');
            return;
        }

        // ✅ FIX: Check if the product is now favourited (add) or not (remove)
        const { isFavourite: currentlyFav } = await isFavourite(productId);
        
        if (currentlyFav) {
            // Product was added
            updateFavButton(productId, true);
            showToast('Added!', 'Product saved to favourites 💖', '❤️', 'success');
        } else {
            // Product was removed
            updateFavButton(productId, false);
            showToast('Removed', 'Removed from favourites', '♡', 'success');
        }

    } catch (error) {
        console.error('Favourite error:', error);
        showToast('Error', 'Something went wrong. Please try again.', '❌', 'error');
    }
}

// ============================================
// UPDATE FAVOURITE BUTTON STATE (FIXED)
// ============================================

function updateFavButton(productId, isFav) {
    console.log('Updating favourite button:', productId, isFav);
    
    document.querySelectorAll(`.fav-btn[data-product-id="${productId}"]`).forEach(btn => {
        const icon = btn.querySelector('.fav-icon');
        if (icon) {
            // Use innerHTML to handle any nested spans
            icon.innerHTML = isFav ? '❤️' : '♡';
            if (isFav) {
                btn.classList.add('fav-active');
            } else {
                btn.classList.remove('fav-active');
            }
            console.log('✅ Button updated for product:', productId, 'to', isFav ? '❤️' : '♡');
        } else {
            console.warn('⚠️ No .fav-icon found for product:', productId);
        }
    });
}

// ============================================
// HANDLE FAVOURITE CLICK (Product Details Page)
// ============================================

async function handleFavouriteDetail(productId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            showToast(
                '💖 Sign In Required',
                'Please sign in to save favourites.',
                '💖',
                'warning'
            );
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        const result = await toggleFavourite(productId);
        
        if (result.error) {
            console.error('Favourite error:', result.error);
            showToast('Error', 'Something went wrong.', '❌', 'error');
            return;
        }

        // ✅ FIX: Check if the product is now favourited
        const { isFavourite: currentlyFav } = await isFavourite(productId);
        
        if (currentlyFav) {
            updateFavButton(productId, true);
            showToast('Added!', 'Product saved to favourites 💖', '❤️', 'success');
        } else {
            updateFavButton(productId, false);
            showToast('Removed', 'Removed from favourites', '♡', 'success');
        }

    } catch (error) {
        console.error('Favourite error:', error);
        showToast('Error', 'Something went wrong.', '❌', 'error');
    }
}

// ============================================
// LOAD FAVOURITE STATES (Shop Page)
// ============================================

async function loadFavouriteStates() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            console.log('ℹ️ Not logged in, skipping favourite states');
            return;
        }

        const userId = session.user.id;

        // Get all favourites for the user
        const { data, error } = await supabase
            .from('favourites')
            .select('product_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Load favourites error:', error);
            return;
        }

        console.log('✅ Loading favourite states for', data.length, 'products');

        // Update all favourite buttons
        data.forEach(fav => {
            updateFavButton(fav.product_id, true);
        });

    } catch (error) {
        console.error('Load favourites error:', error);
    }
}

// ============================================
// LOAD FAVOURITE STATE (Product Details Page)
// ============================================

async function loadFavouriteState(productId) {
    try {
        if (!productId) return;

        const { isFavourite } = await isFavourite(productId);
        
        if (isFavourite) {
            updateFavButton(productId, true);
        }

    } catch (error) {
        console.error('Load favourite state error:', error);
    }
}

// ============================================
// CHECK IF PRODUCT IS FAVOURITED
// ============================================

async function isFavourite(productId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return { isFavourite: false };
        }

        const userId = session.user.id;

        const { data, error } = await supabase
            .from('favourites')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Check favourite error:', error);
            return { isFavourite: false };
        }

        return { isFavourite: !!data };
    } catch (error) {
        console.error('Check favourite error:', error);
        return { isFavourite: false };
    }
}

// ============================================
// ADD TO FAVOURITES
// ============================================

async function addFavourite(productId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return { 
                error: { message: 'Please sign in to save favourites.' },
                loggedOut: true 
            };
        }

        const userId = session.user.id;

        // Check if already favourited
        const { data: existing, error: checkError } = await supabase
            .from('favourites')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Check favourite error:', checkError);
            return { error: checkError };
        }

        if (existing) {
            return { error: { message: 'Already in favourites' } };
        }

        const { data, error } = await supabase
            .from('favourites')
            .insert([{ user_id: userId, product_id: productId }])
            .select();

        if (error) {
            console.error('Add favourite error:', error);
            return { error };
        }

        console.log('✅ Added to favourites:', data);
        return { data };
    } catch (error) {
        console.error('Add favourite error:', error);
        return { error };
    }
}

// ============================================
// REMOVE FROM FAVOURITES
// ============================================

async function removeFavourite(productId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return { 
                error: { message: 'Please sign in to manage favourites.' },
                loggedOut: true 
            };
        }

        const userId = session.user.id;

        const { data, error } = await supabase
            .from('favourites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
            .select();

        if (error) {
            console.error('Remove favourite error:', error);
            return { error };
        }

        console.log('✅ Removed from favourites:', data);
        return { data };
    } catch (error) {
        console.error('Remove favourite error:', error);
        return { error };
    }
}

// ============================================
// TOGGLE FAVOURITE (Add or Remove)
// ============================================

async function toggleFavourite(productId) {
    const { isFavourite: currentlyFav } = await isFavourite(productId);
    
    if (currentlyFav) {
        return await removeFavourite(productId);
    } else {
        return await addFavourite(productId);
    }
}

// ============================================
// GET ALL FAVOURITES FOR CURRENT USER
// ============================================

async function getFavourites() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            return { data: [], error: null };
        }

        const userId = session.user.id;

        // First get the favourite product IDs
        const { data: favData, error: favError } = await supabase
            .from('favourites')
            .select('product_id')
            .eq('user_id', userId);

        if (favError) {
            console.error('Get favourites error:', favError);
            return { data: [], error: favError };
        }

        if (favData.length === 0) {
            return { data: [], error: null };
        }

        // Then get the product details
        const productIds = favData.map(f => f.product_id);
        
        const { data: products, error: productError } = await supabase
            .from('product')
            .select('*')
            .in('id', productIds);

        if (productError) {
            console.error('Get favourite products error:', productError);
            return { data: [], error: productError };
        }

        return { data: products, error: null };
    } catch (error) {
        console.error('Get favourites error:', error);
        return { data: [], error };
    }
}

console.log('✅ Favourites module loaded');