// ============================================
// MARVY CAKES - Favourites Functions
// ============================================

// Check if current user has favourited a product
async function isFavourite(productId) {
    try {
        if (!productId) return { isFavourite: false };

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return { isFavourite: false };
        }

        const { data, error } = await supabase
            .from('favourites')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .maybeSingle();

        if (error) {
            console.error('Check favourite error:', error);
            return { isFavourite: false, error };
        }

        return {
            isFavourite: !!data
        };

    } catch (error) {
        console.error('Check favourite error:', error);
        return {
            isFavourite: false,
            error
        };
    }
}


// ============================================
// ADD FAVOURITE
// ============================================

async function addFavourite(productId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return {
                error: { message: 'Please sign in' },
                loggedOut: true
            };
        }

        const { data, error } = await supabase
            .from('favourites')
            .insert([{
                user_id: session.user.id,
                product_id: productId
            }])
            .select();

        if (error) {
            return { error };
        }

        return { data };

    } catch (error) {
        console.error('Add favourite error:', error);
        return { error };
    }
}


// ============================================
// REMOVE FAVOURITE
// ============================================

async function removeFavourite(productId) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return {
                error: { message: 'Please sign in' },
                loggedOut: true
            };
        }

        const { data, error } = await supabase
            .from('favourites')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .select();

        if (error) {
            return { error };
        }

        return { data };

    } catch (error) {
        console.error('Remove favourite error:', error);
        return { error };
    }
}


// ============================================
// TOGGLE FAVOURITE
// ============================================

async function toggleFavourite(productId) {
    try {
        const result = await isFavourite(productId);

        if (result.error) {
            return { error: result.error };
        }

        if (result.isFavourite) {
            return await removeFavourite(productId);
        }

        return await addFavourite(productId);

    } catch (error) {
        console.error('Toggle favourite error:', error);
        return { error };
    }
}


// ============================================
// UPDATE FAVOURITE BUTTON
// ============================================

function updateFavButton(productId, isFav) {

    document
        .querySelectorAll(`.fav-btn[data-product-id="${productId}"]`)
        .forEach(btn => {

            const icon = btn.querySelector('.fav-icon');

            if (!icon) return;

            if (isFav) {
                icon.textContent = '❤️';
                btn.classList.add('fav-active');
                btn.setAttribute('aria-label', 'Remove from favourites');
            } else {
                icon.textContent = '♡';
                btn.classList.remove('fav-active');
                btn.setAttribute('aria-label', 'Add to favourites');
            }
        });


    // Product details page
    const detailIcon = document.getElementById('favDetailIcon');
    const detailText = document.getElementById('favDetailText');

    if (detailIcon) {
        detailIcon.textContent = isFav ? '❤️' : '♡';
    }

    if (detailText) {
        detailText.textContent = isFav
            ? 'Remove from Favourites'
            : 'Add to Favourites';
    }
}


// ============================================
// HANDLE FAVOURITE CLICK
// ============================================

async function handleFavourite(productId, event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    try {

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session) {

            if (typeof showToast === 'function') {
                showToast(
                    '💖 Sign In Required',
                    'Please sign in to save favourites.',
                    '💖',
                    'warning'
                );
            } else {
                alert('Please sign in to save favourites.');
            }

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

            return;
        }


        const result = await toggleFavourite(productId);

        if (result.error) {

            console.error('Favourite error:', result.error);

            if (typeof showToast === 'function') {
                showToast(
                    'Error',
                    'Something went wrong. Please try again.',
                    '❌',
                    'error'
                );
            }

            return;
        }


        const nowFavourite =
            result.data && result.data.length > 0;

        updateFavButton(productId, nowFavourite);


        if (typeof showToast === 'function') {

            if (nowFavourite) {
                showToast(
                    'Added!',
                    'Product saved to favourites 💖',
                    '❤️',
                    'success'
                );
            } else {
                showToast(
                    'Removed',
                    'Removed from favourites',
                    '♡',
                    'success'
                );
            }
        }

    } catch (error) {

        console.error('Favourite error:', error);

        if (typeof showToast === 'function') {
            showToast(
                'Error',
                'Something went wrong. Please try again.',
                '❌',
                'error'
            );
        }
    }
}


// ============================================
// LOAD FAVOURITE STATES
// ============================================

async function loadFavouriteStates() {

    try {

        const { data: { session } } =
            await supabase.auth.getSession();

        if (!session) return;


        const { data, error } = await supabase
            .from('favourites')
            .select('product_id')
            .eq('user_id', session.user.id);


        if (error) {
            console.error('Load favourites error:', error);
            return;
        }


        if (!data) return;


        data.forEach(favourite => {
            updateFavButton(
                favourite.product_id,
                true
            );
        });

    } catch (error) {
        console.error('Load favourites error:', error);
    }
}


// ============================================
// PRODUCT DETAILS FAVOURITE
// ============================================

async function handleFavouriteDetail(productId) {

    return await handleFavourite(productId);
}


// ============================================
// LOAD SINGLE FAVOURITE STATE
// ============================================

async function loadFavouriteState(productId) {

    try {

        if (!productId) return;


        // IMPORTANT:
        // Do not create a variable called "isFavourite"
        // because that shadows the function with the same name.

        const result = await isFavourite(productId);


        if (result.error) {
            console.error(
                'Load favourite state error:',
                result.error
            );
            return;
        }


        updateFavButton(
            productId,
            result.isFavourite
        );

    } catch (error) {

        console.error(
            'Load favourite state error:',
            error
        );
    }
}


console.log('✅ Favourites module loaded');