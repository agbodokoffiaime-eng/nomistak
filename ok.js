document.addEventListener('DOMContentLoaded', () => {
    
    const WHATSAPP_PHONE = '22891402840';
    const LS_CART_KEY = 'msp_cart_v2';
    
    // ===== Menu mobile =====
    const menuToggle = document.getElementById('menuToggle');
    const categoriesNav = document.getElementById('categoriesNav');
    if (menuToggle && categoriesNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = categoriesNav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (!icon) return;
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        });
    }
    
    // ===== Tabs =====
    const tabButtons = document.querySelectorAll('.tab-button');
    const grids = document.querySelectorAll('.products-grid[id]');
    if (tabButtons.length && grids.length) {
        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                tabButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                grids.forEach((g) => g.classList.toggle('active', g.id === targetId));
            });
        });
    }
    
    // ===== Toast =====
    function ensureToast() {
        let t = document.getElementById('toast');
        if (t) return t;
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast';
        document.body.appendChild(t);
        return t;
    }
    
    let toastTimer = null;
    function showToast(html) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        const t = ensureToast();
        t.innerHTML = html;
        t.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 1200);
    }
    
    // ===== PANIER =====
    const cartCountEls = document.querySelectorAll('.cart-count');
    
    function safeText(el) {
        return el ? (el.textContent || '').trim() : '';
    }
    
    function parsePriceNumber(priceText) {
        const digits = String(priceText || '').match(/[0-9]+/g);
        return digits ? Number(digits.join('')) : 0;
    }
    
    function getProductInfo(card) {
        const title = safeText(card?.querySelector('.product-title')) || 'Produit';
        const priceText = safeText(card?.querySelector('.price-current')) || '';
        const priceNumber = parsePriceNumber(priceText);
        const imgSrc = card?.querySelector('.product-image img')?.getAttribute('src') || '';
        return { title, priceText, priceNumber, imgSrc };
    }
    
    function getProductId(card) {
        const { title, priceNumber, imgSrc } = getProductInfo(card);
        return `${title}||${priceNumber}||${imgSrc}`.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    
    function loadCart() {
        try {
            const raw = localStorage.getItem(LS_CART_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }
    
    function saveCart(cartArr) {
        localStorage.setItem(LS_CART_KEY, JSON.stringify(cartArr));
    }
    
    function isInCart(cartArr, id) {
        return cartArr.some((p) => p.id === id);
    }
    
    function addToCart(cartArr, card) {
        const id = getProductId(card);
        const info = getProductInfo(card);
        cartArr.push({
            id,
            title: info.title,
            priceText: info.priceText,
            priceNumber: info.priceNumber,
            imgSrc: info.imgSrc,
            qty: 1
        });
        return cartArr;
    }
    
    function removeFromCart(cartArr, id) {
        return cartArr.filter((p) => p.id !== id);
    }
    
    function updateBadge(cartArr) {
        const count = cartArr.length;
        cartCountEls.forEach((el) => {
            el.textContent = String(count);
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
    }
    
    function bumpBadge() {
        cartCountEls.forEach((el) => {
            el.classList.add('bump');
            setTimeout(() => el.classList.remove('bump'), 300);
        });
    }
    
    function setHeartUI(btn, active) {
        const icon = btn?.querySelector('i');
        if (!btn || !icon) return;
        btn.classList.toggle('active', active);
        icon.classList.toggle('fas', active);
        icon.classList.toggle('far', !active);
    }
    
    // ===== Fonction pour construire l'URL de l'image =====
    function buildImageUrl(imgSrc) {
        if (!imgSrc) return '';
        if (imgSrc.startsWith('http')) return imgSrc;
        const baseUrl = window.location.origin;
        const cleanSrc = imgSrc.startsWith('/') ? imgSrc : '/' + imgSrc;
        return baseUrl + cleanSrc;
    }
    
    // ===== Initialisation du panier =====
    let cartArr = loadCart();
    updateBadge(cartArr);
    
    // ===== Restaurer l'état des coeurs =====
    document.querySelectorAll('.product-card').forEach((card) => {
        const heartBtn = card.querySelector('.favorite-btn');
        if (!heartBtn) return;
        const id = getProductId(card);
        setHeartUI(heartBtn, isInCart(cartArr, id));
    });
    
    // ===== Click global =====
    document.addEventListener('click', (e) => {
        const heartBtn = e.target.closest('.favorite-btn');
        const moreBtn = e.target.closest('.add-to-cart-btn');
        
        // 1) COEUR => Ajout / retrait panier
        if (heartBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = heartBtn.closest('.product-card');
            if (!card) return;
            
            const id = getProductId(card);
            const { title } = getProductInfo(card);
            const already = isInCart(cartArr, id);
            
            if (!already) {
                cartArr = addToCart(cartArr, card);
                saveCart(cartArr);
                setHeartUI(heartBtn, true);
                updateBadge(cartArr);
                bumpBadge();
                showToast(`✅ <strong>Ajouté au panier</strong><br>${title}`);
            } else {
                cartArr = removeFromCart(cartArr, id);
                saveCart(cartArr);
                setHeartUI(heartBtn, false);
                updateBadge(cartArr);
                bumpBadge();
                showToast(`🗑️ Retiré du panier<br>${title}`);
            }
            return;
        }
        
        // 2) "En savoir plus" => WhatsApp avec image
        if (moreBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = moreBtn.closest('.product-card');
            if (!card) return;
            
            const { title, priceText, imgSrc } = getProductInfo(card);
            const imageUrl = buildImageUrl(imgSrc);
            
            const message = 
                `Bonjour No Mistake 👋\n\n` +
                `Je suis intéressé(e) par le produit suivant :\n\n` +
                `📦 Produit : ${title}\n` +
                `💰 Prix : ${priceText || 'À la demande'}\n\n` +
                `🖼️ Voir le produit : ${imageUrl}\n\n` +
                `Merci de me confirmer la disponibilité et les modalités de livraison.`;
            
            const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
            
            window.open(url, '_blank');
        }
    }, true);
    
});