// --- Initial State & Config ---
const PHONE_NUMBER = '6282253507804';
const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let searchQuery = '';
let selectedRatingScore = 5;
let isAdminLoggedIn = false;

// Default products data
const DEFAULT_PRODUCTS = [
    { id: 1, title: "SaaS Application Landing Page", img: "1", price: 150000, category: "SaaS & App", desc: "Landing page modern khusus aplikasi SaaS, startup tech, dan produk digital." },
    { id: 2, title: "E-Commerce Toko Digital Pro", img: "2", price: 250000, category: "E-Commerce", desc: "Source code toko online siap pakai lengkap dengan keranjang belanja & WA checkout." },
    { id: 3, title: "Corporate & Agency Business", img: "3", price: 180000, category: "Company Profile", desc: "Website profil perusahaan dan agensi kreatif dengan tampilan super profesional." },
    { id: 4, title: "Developer & Designer Portfolio", img: "4", price: 120000, category: "Portfolio", desc: "Website portofolio interaktif dengan animasi halus dan pameran karya terbaik." },
    { id: 5, title: "Restaurant & Cafe Digital Menu", img: "5", price: 175000, category: "Landing Page", desc: "Website restoran lengkap dengan daftar menu digital dan reservasi WhatsApp." },
    { id: 6, title: "Online Course & EdTech Portal", img: "6", price: 290000, category: "E-Commerce", desc: "Landing page penjualan kursus online dan materi edukasi digital modern." },
    { id: 7, title: "Real Estate & Property Listing", img: "7", price: 220000, category: "Company Profile", desc: "Katalog properti, rumah, dan apartemen lengkap dengan penawaran langsung." },
    { id: 8, title: "Fitness & Personal Trainer", img: "8", price: 140000, category: "Landing Page", desc: "Website promosi gym, trainer, dan program kesehatan kelas atas." }
];

// Initialize Storage
let products = JSON.parse(localStorage.getItem('Diastraa_products')) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem('Diastraa_cart')) || [];
let reviews = JSON.parse(localStorage.getItem('Diastraa_reviews')) || [];

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    renderReviews();
});

// Helper Image Placeholder
function getImageUrl(img) {
    if(!img) return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80';
    return `${img}.jpg`;
}

function handleImgError(el) {
    el.onerror = null;
    el.src = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80';
}

// --- Format Currency ---
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// --- Render Products & Pagination ---
function renderProducts() {
    const grid = document.getElementById('productGrid');
    const filtered = products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    document.getElementById('productCountInfo').innerText = `Menampilkan ${paginatedProducts.length} dari ${filtered.length} template`;

    if (paginatedProducts.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: #94a3b8;">
            <p style="font-size: 1.1rem; font-weight: 600;">Tidak ada template yang ditemukan</p>
        </div>`;
    } else {
        grid.innerHTML = paginatedProducts.map(p => `
            <div class="product-card">
                <div class="card-img-wrap">
                    <span class="category-tag">${p.category}</span>
                    <img src="${getImageUrl(p.img)}" alt="${p.title}" class="card-img" onerror="handleImgError(this)">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc">${p.desc}</p>
                    <div class="card-footer">
                        <div class="price-box">
                            <span class="price-label">Harga Template</span>
                            <span class="price-value">${formatRupiah(p.price)}</span>
                        </div>
                        <button class="btn btn-primary" onclick="addToCart(${p.id})">+ Keranjang</button>
                    </div>
                    ${isAdminLoggedIn ? `
                        <div class="admin-actions">
                            <button class="btn btn-outline btn-block" style="font-size:0.75rem;" onclick="openEditProductModal(${p.id})">✏️ Edit</button>
                            <button class="btn btn-danger btn-block" style="font-size:0.75rem;" onclick="deleteProduct(${p.id})">🗑️ Hapus</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('paginationContainer');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

function handleSearch() {
    searchQuery = document.getElementById('searchInput').value;
    currentPage = 1;
    renderProducts();
}

// --- Cart Logic ---
function addToCart(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...prod, qty: 1 });
    }

    saveCart();
    renderCart();
    toggleCart(true);
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('Diastraa_cart', JSON.stringify(cart));
}

function renderCart() {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartBadge');
    const totalEl = document.getElementById('cartTotalPrice');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    badge.innerText = totalQty;
    totalEl.innerText = formatRupiah(totalPrice);

    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: #94a3b8; margin: auto 0;">
            <p>Keranjang belanja masih kosong.</p>
        </div>`;
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${getImageUrl(item.img)}" class="cart-img" onerror="handleImgError(this)">
            <div class="cart-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${formatRupiah(item.price)}</div>
                <div class="qty-controls">
                    <button class="btn-qty" onclick="updateQty(${item.id}, -1)">-</button>
                    <span style="font-size:0.85rem; font-weight:700; min-width: 18px; text-align:center;">${item.qty}</span>
                    <button class="btn-qty" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleCart(forceOpen = false) {
    const modal = document.getElementById('cartModal');
    if (forceOpen) {
        modal.classList.add('active');
    } else {
        modal.classList.toggle('active');
    }
}

function checkoutWA() {
    if (cart.length === 0) {
        alert('Keranjang belanja Anda masih kosong!');
        return;
    }

    let message = "Halo Diastraa Studio, saya ingin membeli template website berikut:\n\n";
    let total = 0;

    cart.forEach((item, idx) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `${idx + 1}. *${item.title}*\n   - Jumlah: ${item.qty} x ${formatRupiah(item.price)}\n   - Subtotal: ${formatRupiah(subtotal)}\n\n`;
    });

    message += `*TOTAL PEMBAYARAN: ${formatRupiah(total)}*\n\n`;
    message += "Mohon petunjuk untuk proses pembayaran dan pengiriman source code. Terima kasih!";

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encoded}`, '_blank');
}

// --- Admin Dashboard Logic ---
function toggleAdminModal() {
    if (isAdminLoggedIn) {
        isAdminLoggedIn = false;
        document.getElementById('adminBtnText').innerText = 'Login Penjual';
        document.getElementById('addProductAdminArea').style.display = 'none';
        renderProducts();
        alert('Anda telah logout dari mode penjual.');
        return;
    }
    document.getElementById('adminModal').classList.toggle('active');
}

function handleAdminLogin(e) {
    e.preventDefault();
    const u = document.getElementById('adminUsername').value;
    const p = document.getElementById('adminPassword').value;

    if (u === 'User' && p === 'user123') {
        isAdminLoggedIn = true;
        document.getElementById('adminBtnText').innerText = 'Logout Admin';
        document.getElementById('addProductAdminArea').style.display = 'block';
        document.getElementById('adminModal').classList.remove('active');
        renderProducts();
        alert('Berhasil login sebagai Penjual/Admin!');
    } else {
        alert('Username atau Password yang Anda masukkan salah!');
    }
}

function openAddProductModal() {
    document.getElementById('productModalTitle').innerText = 'Tambah Template Baru';
    document.getElementById('editProductId').value = '';
    document.getElementById('prodTitle').value = '';
    document.getElementById('prodImg').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodDesc').value = '';
    document.getElementById('productModal').classList.add('active');
}

function openEditProductModal(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('productModalTitle').innerText = 'Edit Template';
    document.getElementById('editProductId').value = prod.id;
    document.getElementById('prodTitle').value = prod.title;
    document.getElementById('prodImg').value = prod.img;
    document.getElementById('prodPrice').value = prod.price;
    document.getElementById('prodCategory').value = prod.category;
    document.getElementById('prodDesc').value = prod.desc;
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function handleSaveProduct(e) {
    e.preventDefault();
    const editId = document.getElementById('editProductId').value;
    const title = document.getElementById('prodTitle').value;
    const img = document.getElementById('prodImg').value;
    const price = parseInt(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const desc = document.getElementById('prodDesc').value;

    if (editId) {
        const idx = products.findIndex(p => p.id == editId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], title, img, price, category, desc };
        }
    } else {
        const newProduct = {
            id: Date.now(),
            title,
            img,
            price,
            category,
            desc
        };
        products.unshift(newProduct);
    }

    localStorage.setItem('Diastraa_products', JSON.stringify(products));
    closeProductModal();
    renderProducts();
}

function deleteProduct(id) {
    if (confirm('Yakin ingin menghapus template ini dari katalog?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('Diastraa_products', JSON.stringify(products));
        renderProducts();
    }
}

// --- Reviews & Ratings Logic ---
function renderReviews() {
    const list = document.getElementById('reviewsList');
    const totalCountEl = document.getElementById('totalReviewsCount');
    const avgScoreEl = document.getElementById('avgRatingScore');
    const avgStarsRow = document.getElementById('avgStarsRow');

    const total = reviews.length;
    totalCountEl.innerText = `${total} Ulasan Pembeli`;

    if (total === 0) {
        avgScoreEl.innerText = '0.0';
        avgStarsRow.innerHTML = '★ ★ ★ ★ ★';
        list.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 24px;">Belum ada ulasan pembeli. Jadilah yang pertama memberikan ulasan!</div>`;

        for (let i = 1; i <= 5; i++) {
            document.getElementById(`count${i}`).innerText = '0';
            document.getElementById(`bar${i}`).style.width = '0%';
        }
        return;
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);
    avgScoreEl.innerText = avg;

    const filledStars = Math.round(avg);
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        starsHtml += i <= filledStars ? '★ ' : '☆ ';
    }
    avgStarsRow.innerHTML = starsHtml;

    // Breakdown
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => counts[r.rating] = (counts[r.rating] || 0) + 1);

    for (let i = 1; i <= 5; i++) {
        const cnt = counts[i];
        const pct = ((cnt / total) * 100).toFixed(0);
        document.getElementById(`count${i}`).innerText = cnt;
        document.getElementById(`bar${i}`).style.width = `${pct}%`;
    }

    list.innerHTML = reviews.map(r => `
        <div class="review-item">
            <div class="review-head">
                <span class="reviewer-name">${r.name}</span>
                <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p class="review-text">${r.comment}</p>
            <div class="review-date">${r.date}</div>
        </div>
    `).join('');
}

function openReviewModal() {
    setRating(5);
    document.getElementById('revName').value = '';
    document.getElementById('revComment').value = '';
    document.getElementById('reviewModal').classList.add('active');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.remove('active');
}

function setRating(rating) {
    selectedRatingScore = rating;
    const stars = document.querySelectorAll('#starPicker span');
    stars.forEach((s, idx) => {
        if (idx < rating) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('revName').value;
    const comment = document.getElementById('revComment').value;

    const newReview = {
        id: Date.now(),
        name,
        rating: selectedRatingScore,
        comment,
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    reviews.unshift(newReview);
    localStorage.setItem('Diastraa_reviews', JSON.stringify(reviews));

    closeReviewModal();
    renderReviews();
    alert('Terima kasih! Ulasan Anda telah terpublikasi.');
     }
     
