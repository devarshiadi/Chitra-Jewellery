// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE & CONFIG ---
    let cart = [];
    let currentProducts = [...products];
    const MOBILE_BREAKPOINT = 768;
    let mobileVisibleCount = 4;

    // --- DOM ELEMENT SELECTORS ---
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const countdown = { d: document.getElementById('days'), h: document.getElementById('hours'), m: document.getElementById('minutes'), s: document.getElementById('seconds') };
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const cartElements = {
        toggleBtn: document.getElementById('cart-toggle-btn'),
        countBadge: document.getElementById('cart-count-badge'),
        sidebar: document.getElementById('cart-sidebar'),
        overlay: document.getElementById('cart-overlay'),
        closeBtn: document.getElementById('cart-close-btn'),
        itemsContainer: document.getElementById('cart-items-container'),
        totalPrice: document.getElementById('cart-total-price'),
        finalizeWhatsappBtn: document.getElementById('finalize-whatsapp'),
        finalizeInstagramBtn: document.getElementById('finalize-instagram'),
    };
    const reviewCarousel = document.getElementById('review-carousel');
    const instaModal = {
        overlay: document.getElementById('instagram-modal'),
        closeBtn: document.getElementById('modal-close-btn'),
        proceedBtn: document.getElementById('modal-proceed-btn'),
    };

    // --- INITIALIZATION ---
    const init = () => {
        setupPreloader();
        setupCountdown();
        setupEventListeners();
        setupFooter();
        renderProducts();
        renderReviews();
        setupScrollAnimations();
    };

    // --- SETUP FUNCTIONS ---
    function setupPreloader() {
        // Total animation time is 3.3s (3s CSS anim + 0.3s fade)
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.addEventListener('transitionend', () => preloader.classList.add('hidden'), { once: true });
            
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '0';
            requestAnimationFrame(() => {
                mainContent.style.opacity = '1';
            });
            cartElements.toggleBtn.classList.remove('hidden');
        }, 3300);
    }

    function setupCountdown() {
        const targetDate = new Date(config.rakshaBandhanDate).getTime();
        const update = () => {
            const now = new Date().getTime();
            const dist = targetDate - now;

            if (dist < 0) {
                Object.values(countdown).forEach(el => el.textContent = '00');
                clearInterval(interval); return;
            }
            countdown.d.textContent = Math.floor(dist / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            countdown.h.textContent = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            countdown.m.textContent = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            countdown.s.textContent = Math.floor((dist % (1000 * 60)) / 1000).toString().padStart(2, '0');
        };
        update();
        const interval = setInterval(update, 1000);
    }
    
    function setupFooter() {
        const creditEl = document.querySelector('.developer-credit');
        creditEl.innerHTML = `Website lovingly crafted by <a href="${config.developerLink || '#'}" target="_blank" rel="noopener noreferrer">${config.developerName}</a>`;
        document.getElementById('footer-instagram').href = `https://www.instagram.com/${config.instagramUsername}/`;
        document.getElementById('footer-whatsapp').href = `https://wa.me/${config.whatsappNumber}`;
    }

    function setupEventListeners() {
        categoryFilter.addEventListener('change', handleFilterAndSort);
        sortBy.addEventListener('change', handleFilterAndSort);
        loadMoreBtn.addEventListener('click', handleLoadMore);

        productGrid.addEventListener('click', handleProductCardInteraction);
        
        cartElements.toggleBtn.addEventListener('click', toggleCart);
        cartElements.closeBtn.addEventListener('click', toggleCart);
        cartElements.overlay.addEventListener('click', toggleCart);
        cartElements.itemsContainer.addEventListener('click', handleCartItemRemoval);
        cartElements.finalizeWhatsappBtn.addEventListener('click', finalizeOnWhatsApp);
        cartElements.finalizeInstagramBtn.addEventListener('click', handleInstagramFinalize);
        
        instaModal.closeBtn.addEventListener('click', closeInstagramModal);
        instaModal.proceedBtn.addEventListener('click', proceedToInstagram);
    }
    
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    // --- RENDER & DISPLAY ---
    function renderProducts() {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const productsToRender = isMobile ? currentProducts.slice(0, mobileVisibleCount) : currentProducts;
        productGrid.innerHTML = productsToRender.length === 0 
            ? `<p class="empty-message">No products match your criteria.</p>`
            : productsToRender.map(p => `
                <div class="product-card" data-id="${p.id}">
                    <img src="${p.image}" alt="${p.alt}" class="product-image" loading="lazy">
                    <div class="product-details">
                        <h3>${p.name}</h3>
                        <p class="product-price">₹${p.price}</p>
                        <div class="product-actions">
                            <div class="quantity-selector">
                                <button class="quantity-btn quantity-btn-minus" aria-label="Decrease quantity">-</button>
                                <span class="quantity-display">1</span>
                                <button class="quantity-btn quantity-btn-plus" aria-label="Increase quantity">+</button>
                            </div>
                            <button class="add-to-order-btn">Add to Order</button>
                        </div>
                    </div>
                </div>`).join('');
        updateLoadMoreButton();
    }
    
    function renderReviews() {
        reviewCarousel.innerHTML = reviews.map(r => `
            <div class="review-card">
                <p>"${r.text}"</p>
                <p class="author">- ${r.author}</p>
            </div>`).join('');
    }

    // --- EVENT HANDLERS ---
    function handleFilterAndSort() {
        let filtered = (categoryFilter.value === 'all') ? [...products] : products.filter(p => p.category === categoryFilter.value);
        switch (sortBy.value) {
            case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
            case 'popularity': filtered.sort((a, b) => b.popularity - a.popularity); break;
        }
        currentProducts = filtered;
        mobileVisibleCount = 4;
        renderProducts();
    }
    
    function handleProductCardInteraction(e) {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const id = parseInt(card.dataset.id), qDisplay = card.querySelector('.quantity-display');
        let quantity = parseInt(qDisplay.textContent);
        if (e.target.classList.contains('quantity-btn-minus') && quantity > 1) qDisplay.textContent = --quantity;
        else if (e.target.classList.contains('quantity-btn-plus')) qDisplay.textContent = ++quantity;
        else if (e.target.classList.contains('add-to-order-btn')) addToCart(id, quantity);
    }
    
    function handleCartItemRemoval(e) {
        if (e.target.classList.contains('cart-item-remove-btn')) removeFromCart(parseInt(e.target.dataset.id));
    }

    function handleLoadMore() {
        mobileVisibleCount += 4;
        renderProducts();
    }

    function updateLoadMoreButton() {
        loadMoreBtn.classList.toggle('hidden', !(window.innerWidth <= MOBILE_BREAKPOINT && mobileVisibleCount < currentProducts.length));
    }
    
    // --- CART LOGIC ---
    function addToCart(productId, quantity) {
        const existing = cart.find(item => item.id === productId);
        if (existing) existing.quantity += quantity;
        else cart.push({ id: productId, quantity });
        updateCartUI();
        showCartConfirmation(productId);
    }
    
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    }
    
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartElements.countBadge.textContent = totalItems;
        cartElements.countBadge.classList.toggle('hidden', totalItems === 0);

        if (cart.length === 0) {
            cartElements.itemsContainer.innerHTML = `<p class="cart-empty-message">Your order list is empty.</p>`;
            cartElements.totalPrice.textContent = '₹0';
            return;
        }

        cartElements.itemsContainer.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return `<div class="cart-item">
                        <img src="${product.image}" alt="${product.alt}" class="cart-item-img">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${product.name}</p>
                            <p class="cart-item-price">₹${product.price}</p>
                            <p class="cart-item-quantity">Quantity: ${item.quantity}</p>
                        </div>
                        <button class="cart-item-remove-btn" data-id="${product.id}" aria-label="Remove">×</button>
                    </div>`;
        }).join('');
        
        const total = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id).price * item.quantity), 0);
        cartElements.totalPrice.textContent = `₹${total}`;
    }

    function toggleCart() {
        cartElements.sidebar.classList.toggle('active');
        cartElements.overlay.classList.toggle('active');
    }
    
    function showCartConfirmation(productId) {
        const btn = document.querySelector(`.product-card[data-id="${productId}"] .add-to-order-btn`);
        if (btn) {
            btn.textContent = 'Added!';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.textContent = 'Add to Order';
                btn.style.background = '';
            }, 1500);
        }
    }
    
    // --- FINALIZATION & MODAL LOGIC ---
    function generateOrderMessage() {
        if (cart.length === 0) return "Hello Chitra Jewellery! I'd like to inquire about your beautiful Rakhi collection.";
        let message = "Hello Chitra Jewellery! ✨\nI would like to place an order for the following items:\n\n";
        const total = cart.reduce((sum, item) => {
            const p = products.find(p => p.id === item.id);
            message += `• ${p.name} (x${item.quantity}) - ₹${p.price * item.quantity}\n`;
            return sum + (p.price * item.quantity);
        }, 0);
        message += `\n*Total: ₹${total}*\n\nThank you!`;
        return message;
    }

    function finalizeOnWhatsApp() {
        if (cart.length === 0) return;
        const message = encodeURIComponent(generateOrderMessage());
        window.open(`https://wa.me/${config.whatsappNumber}?text=${message}`, '_blank');
    }
    
    function handleInstagramFinalize() {
        if (cart.length === 0) return;
        instaModal.overlay.classList.remove('hidden');
    }
    
    function closeInstagramModal() {
        instaModal.overlay.classList.add('hidden');
    }
    
    function proceedToInstagram() {
        navigator.clipboard.writeText(generateOrderMessage()).then(() => {
            window.open(`https://www.instagram.com/${config.instagramUsername}/`, '_blank');
            closeInstagramModal();
        }).catch(err => {
            console.error('Could not copy text: ', err);
            // Fallback for older browsers
            window.open(`https://www.instagram.com/${config.instagramUsername}/`, '_blank');
            closeInstagramModal();
        });
    }

    init(); // Run the application
});