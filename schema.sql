-- Database Schema Cloudflare D1 untuk Diastraa Studio

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    img TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    desc TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data Awal jika database kosong
INSERT INTO products (title, img, price, category, desc) VALUES
('SaaS Application Landing Page', '1', 150000, 'SaaS & App', 'Landing page modern khusus aplikasi SaaS, startup tech, dan produk digital.'),
('E-Commerce Toko Digital Pro', '2', 250000, 'E-Commerce', 'Source code toko online siap pakai lengkap dengan keranjang belanja & WA checkout.'),
('Corporate & Agency Business', '3', 180000, 'Company Profile', 'Website profil perusahaan dan agensi kreatif dengan tampilan super profesional.'),
('Developer & Designer Portfolio', '4', 120000, 'Portfolio', 'Website portofolio interaktif dengan animasi halus dan pameran karya terbaik.'),
('Restaurant & Cafe Digital Menu', '5', 175000, 'Landing Page', 'Website restoran lengkap dengan daftar menu digital dan reservasi WhatsApp.'),
('Online Course & EdTech Portal', '6', 290000, 'E-Commerce', 'Landing page penjualan kursus online dan materi edukasi digital modern.');
