// ============================================
// MARVY CAKES - Supabase Functions
// ============================================

// Get all products from database
async function getProducts() {
    try {
        const { data, error } = await supabase
            .from('product')
            .select('*');
        
        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        
        console.log('✅ Products loaded:', data.length);
        return data || [];
    } catch (error) {
        console.error('Error in getProducts:', error);
        return [];
    }
}

// Get a single product by ID
async function getProductById(id) {
    try {
        const { data, error } = await supabase
            .from('product')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        
        if (error) {
            console.error('Error fetching product:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error in getProductById:', error);
        return null;
    }
}

// Get sizes for a product
function getProductSizes(product) {
    if (product.sizes && typeof product.sizes === 'object') {
        return product.sizes;
    }
    return null;
}

// Get price for a specific size
function getSizePrice(product, size) {
    if (product.sizes && product.sizes[size]) {
        return product.sizes[size];
    }
    return product.price;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(title, message, icon = '✨', type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('slide-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 400);
    }, 4000);

    toast.addEventListener('click', function(e) {
        if (!e.target.closest('.toast-close')) {
            toast.classList.add('slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 400);
        }
    });
}

// ============================================
// SHOPPING CART
// ============================================

// Cart array (in memory)
let cart = [];

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem('marvyCart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
            return cart;
        } catch (e) {
            cart = [];
            return [];
        }
    }
    cart = [];
    return [];
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('marvyCart', JSON.stringify(cart));
}

// Get cart
function getCart() {
    return loadCart();
}

// Add to cart
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    
    showToast(
        'Added to Cart ✨',
        `${product.name} added to cart`,
        '🎂',
        'success'
    );
    
    console.log('🛒 Cart:', cart);
    return cart;
}

// Remove from cart
function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    
    showToast(
        'Removed from Cart',
        `${removedItem.name} removed`,
        '🗑️',
        'success'
    );
    
    return cart;
}

// Update quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartCount();
    }
    return cart;
}

// Clear cart
function clearCart() {
    cart = [];
    localStorage.removeItem('marvyCart');
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = '0';
    });
    
    console.log('🛒 Cart cleared');
}

// Update cart count badge
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Render cart (for cart.html)
function renderCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart-luxury">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Browse our luxury collection and add some beautiful products.</p>
                <a href="shop.html" class="btn-luxury-empty">Start Shopping →</a>
                <div class="empty-cart-suggestions">
                    <span>🎂 Cakes</span>
                    <span>📦 Hampers</span>
                    <span>🎁 Surprise Packages</span>
                </div>
            </div>
        `;
        if (summary) summary.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        document.getElementById('subtotal').textContent = '₦0.00';
        document.getElementById('total').textContent = '₦0.00';
        return;
    }

    if (summary) summary.style.display = 'block';
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    let subtotal = 0;

    container.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="cart-item-luxury" data-index="${index}">
                <div class="cart-item-image-luxury">
                    ${item.image_url ? 
                        `<img src="${item.image_url}" alt="${item.name}">` :
                        '🎂'
                    }
                </div>
                <div class="cart-item-details-luxury">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price-luxury">₦${item.price.toLocaleString()}</p>
                    <div class="cart-item-actions-luxury">
                        <div class="qty-control-luxury">
                            <button class="qty-btn-luxury" onclick="updateQuantity(${index}, -1)">−</button>
                            <span class="qty-number-luxury">${item.quantity}</span>
                            <button class="qty-btn-luxury" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="remove-btn-luxury" onclick="removeFromCart(${index})">🗑️ Remove</button>
                    </div>
                </div>
                <div class="cart-item-total-luxury">
                    <span>₦${itemTotal.toLocaleString()}</span>
                </div>
            </div>
        `;
    }).join('');

    const deliveryFee = subtotal > 10000 ? 0 : 1000;
    const total = subtotal + deliveryFee;

    document.getElementById('subtotal').textContent = `₦${subtotal.toLocaleString()}`;
    document.getElementById('deliveryFee').textContent = deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`;
    document.getElementById('total').textContent = `₦${total.toLocaleString()}`;

    if (cart.length === 0 && checkoutBtn) {
        checkoutBtn.style.display = 'none';
    }
}

// ============================================
// ORDER FUNCTIONS
// ============================================

// Save order to Supabase
async function saveOrder(orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();
        
        if (error) {
            console.error('Error saving order:', error);
            return { error };
        }
        
        console.log('✅ Order saved:', data);
        return { data };
    } catch (error) {
        console.error('Error in saveOrder:', error);
        return { error };
    }
}

// Get orders by customer email/phone
async function getCustomerOrders(identifier) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`customer_email.eq.${identifier},customer_phone.eq.${identifier}`)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('Error in getCustomerOrders:', error);
        return [];
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', orderId)
            .select();
        
        if (error) {
            console.error('Error updating order:', error);
            return { error };
        }
        
        console.log('✅ Order status updated:', data);
        return { data };
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        return { error };
    }
}

// ============================================
// FAVOURITES FUNCTIONS
// ============================================

// Check if a product is in favourites
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

// Add a product to favourites
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

// Remove a product from favourites
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

// Toggle favourite (add or remove)
async function toggleFavourite(productId) {
    const { isFavourite: currentlyFav } = await isFavourite(productId);
    
    if (currentlyFav) {
        return await removeFavourite(productId);
    } else {
        return await addFavourite(productId);
    }
}

// Get all favourites for the current user
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

// ============================================
// LOAD CART ON PAGE LOAD
// ============================================

// Load cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
});

console.log('✅ Marvy Cakes functions loaded!');