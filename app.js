// Diastraa Studio - Frontend Application Script (app.js)
// Connected with Cloudflare Pages Functions API (/api/products & /api/reviews)

const WA_NUMBER = "6282253507804";
let products = [];
let reviews = [];
let cart = [];
let isAdmin = false;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    checkAdminSession();
    await loadProducts();
    await loadReviews();
    setupEventListeners();
}

// --- Admin Session Check ---
function checkAdminSession() {
    isAdmin = sessionStorage.getItem('diastraa_admin') === 'true';
    updateAdminUI();
}

function updateAdminUI() {
    const adminBtn = document.getElementById('admin-login-btn') || document.querySelector('button:has-text("Login"), button:has-text("Logout")');
    const addProductBtn = document.getElementById('add-product-btn');
    
    if (adminBtn) {
        adminBtn.innerText = isAdmin ? 'Logout Admin' : 'Login Penjual';
        adminBtn.onclick = isAdmin ? logoutAdmin : showLoginModal;
    }
    
    if (addProductBtn) {
        addProductBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    
    renderProducts(products);
}

function showLoginModal() {
    const user = prompt("Masukkan Username Admin:");
    const pass = prompt("Masukkan Password Admin:");
    if (user === "User" && pass === "user123") {
        sessionStorage.setItem('diastraa_admin', 'true');
        isAdmin = true;
        alert("Login Admin Berhasil!");
        updateAdminUI();
    } else if (user !== null || pass !== null) {
        alert("Username atau Password salah!");
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('diastraa_admin');
    isAdmin = false;
    alert("Logout Berhasil!");
    updateAdminUI();
}

// --- Data Fetching dari D1 Database ---
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        products = await res.json();
        renderProducts(products);
    } catch (err) {
        console.error("Gagal mengambil data produk dari D1 Database:", err);
        const container = document.getElementById('product-list') || document.querySelector('.grid');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-400 bg-gray-800/50 rounded-lg border border-red-500/30">
                    <p class="font-semibold">Gagal memuat produk dari D1 Database</p>
                    <p class="text-xs text-gray-400 mt-1">${err.message}</p>
                </div>
            `;
        }
    }
}

async function loadReviews() {
    try {
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        reviews = await res.json();
        renderReviews(reviews);
    } catch (err) {
        console.error("Gagal mengambil data ulasan dari D1 Database:", err);
    }
}

// --- Render Products ---
function renderProducts(items) {
    const container = document.getElementById('product-list') || document.querySelector('.grid');
    const countEl = document.getElementById('product-count');
    
    if (countEl) {
        countEl.innerText = `Menampilkan ${items.length} dari ${items.length} template`;
    }
    
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-400 text-lg">Tidak ada template yang ditemukan</p>
                ${isAdmin ? `<button onclick="showAddProductModal()" class="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium">+ Tambah Template Pertama</button>` : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(p => `
        <div class="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col justify-between shadow-lg hover:border-indigo-500 transition duration-300">
            <div>
                <div class="relative">
                    <img src="https://picsum.photos/seed/${p.img}/400/250" alt="${p.title}" class="w-full h-48 object-cover">
                    <span class="absolute top-3 right-3 text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-full shadow">
                        ${p.category}
                    </span>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-xl text-white mb-2">${p.title}</h3>
                    <p class="text-gray-400 text-sm line-clamp-3 mb-4">${p.desc}</p>
                </div>
            </div>
            
            <div class="p-5 pt-0 border-t border-gray-700/50 mt-auto">
                <div class="flex items-center justify-between mt-4">
                    <div>
                        <span class="text-xs text-gray-400 block">Harga</span>
                        <span class="font-bold text-emerald-400 text-xl">Rp ${Number(p.price).toLocaleString('id-ID')}</span>
                    </div>
                    <button onclick="addToCart(${p.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                        + Keranjang
                    </button>
                </div>
                ${isAdmin ? `
                    <div class="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                        <button onclick="editProduct(${p.id})" class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-1 rounded text-xs font-medium">Edit</button>
                        <button onclick="deleteProduct(${p.id})" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-xs font-medium">Hapus</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// --- Render Reviews ---
function renderReviews(items) {
    const container = document.getElementById('review-list');
    const avgEl = document.getElementById('avg-rating');
    const totalEl = document.getElementById('total-reviews');
    
    if (items && items.length > 0) {
        const avg = (items.reduce((acc, r) => acc + Number(r.rating), 0) / items.length).toFixed(1);
        if (avgEl) avgEl.innerText = avg;
        if (totalEl) totalEl.innerText = `${items.length} Ulasan Pembeli`;
    } else {
        if (avgEl) avgEl.innerText = "0.0";
        if (totalEl) totalEl.innerText = "0 Ulasan Pembeli";
    }

    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-center py-4">Belum ada ulasan. Berikan ulasan pertama Anda!</p>`;
        return;
    }

    container.innerHTML = items.map(r => `
        <div class="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-3 shadow">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-white text-base">${r.name}</span>
                <div class="flex items-center text-yellow-400 text-sm font-semibold">
                    ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                    <span class="ml-1 text-xs text-gray-300">(${r.rating}.0)</span>
                </div>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed">${r.comment}</p>
            <span class="text-xs text-gray-500 mt-2 block">${r.date}</span>
        </div>
    `).join('');
}

// --- Cart & WA Checkout ---
function addToCart(id) {
    const item = products.find(p => p.id === id);
    if (!item) return;
    cart.push(item);
    updateCartUI();
    alert(`"${item.title}" berhasil ditambahkan ke keranjang!`);
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge') || document.querySelector('.bg-indigo-600.rounded-full');
    if (badge) {
        badge.innerText = cart.length;
    }
}

function checkoutWA() {
    if (cart.length === 0) {
        alert("Keranjang belanja Anda masih kosong!");
        return;
    }
    
    let msg = `Halo Diastraa Studio, saya ingin memesan produk berikut:\n\n`;
    let total = 0;
    cart.forEach((item, index) => {
        msg += `${index + 1}. *${item.title}* (${item.category})\n   Harga: Rp ${Number(item.price).toLocaleString('id-ID')}\n`;
        total += Number(item.price);
    });
    
    msg += `\n------------------------------\n`;
    msg += `*Total Pembayaran: Rp ${total.toLocaleString('id-ID')}*\n\n`;
    msg += `Mohon instruksi pembayaran & penyerahan source code. Terima kasih!`;
    
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// --- Admin CRUD Operations ---
async function showAddProductModal() {
    if (!isAdmin) return;
    const title = prompt("Judul Template:");
    if (!title) return;
    const category = prompt("Kategori (misal: SaaS & App, E-Commerce, Portfolio):", "SaaS & App");
    const price = parseInt(prompt("Harga (Rp):", "150000"));
    const desc = prompt("Deskripsi Singkat:");
    const img = prompt("ID Gambar (1-10):", "1");

    if (!title || isNaN(price) || !desc) {
        alert("Data produk tidak lengkap!");
        return;
    }

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, img: img || "1", price, category: category || "General", desc })
        });
        if (res.ok) {
            alert("Produk berhasil ditambahkan ke D1 Database!");
            await loadProducts();
        } else {
            alert("Gagal menambahkan produk.");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function deleteProduct(id) {
    if (!isAdmin) return;
    if (!confirm("Yakin ingin menghapus produk ini dari database D1?")) return;

    try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Produk berhasil dihapus!");
            await loadProducts();
        } else {
            alert("Gagal menghapus produk.");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function editProduct(id) {
    if (!isAdmin) return;
    const p = products.find(item => item.id === id);
    if (!p) return;

    const title = prompt("Edit Judul:", p.title);
    if (!title) return;
    const category = prompt("Edit Kategori:", p.category);
    const price = parseInt(prompt("Edit Harga (Rp):", p.price));
    const desc = prompt("Edit Deskripsi:", p.desc);
    const img = prompt("Edit ID Gambar:", p.img);

    try {
        const res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, title, img, price, category, desc })
        });
        if (res.ok) {
            alert("Produk berhasil diperbarui!");
            await loadProducts();
        } else {
            alert("Gagal memperbarui produk.");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// --- Submit Review ---
async function submitReview() {
    const name = prompt("Nama Anda:");
    if (!name) return;
    const rating = parseInt(prompt("Rating Bintang (1 - 5):", "5"));
    const comment = prompt("Komentar Ulasan:");
    if (!comment || isNaN(rating) || rating < 1 || rating > 5) {
        alert("Ulasan tidak valid!");
        return;
    }

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, rating, comment, date: today })
        });
        if (res.ok) {
            alert("Ulasan Anda berhasil disimpan ke database!");
            await loadReviews();
        } else {
            alert("Gagal mengirim ulasan.");
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query)
            );
            renderProducts(filtered);
        });
    }

    const addReviewBtn = document.getElementById('add-review-btn') || document.querySelector('button:has-text("Ulasan")');
    if (addReviewBtn) {
        addReviewBtn.onclick = submitReview;
    }
}
