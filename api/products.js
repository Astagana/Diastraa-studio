const { db, isAdmin, handler } = require('./_lib');
const S = (id, title, category, price, sold, desc) => ({ id, img: String(id), title, category, price, sold, desc });
const SEED = [
  S(8, 'Warung Digital', 'E-Commerce', 175000, 42, 'Toko online UMKM lengkap: katalog, keranjang, checkout WhatsApp, dan halaman produk.'),
  S(7, 'Klinik Sehat', 'Company Profile', 125000, 31, 'Profil klinik dengan jadwal dokter, layanan, dan tombol janji temu.'),
  S(6, 'Peluncur', 'Landing Page', 99000, 67, 'Satu halaman untuk meluncurkan produk: hero, fitur, harga, FAQ, dan form pendaftaran.'),
  S(5, 'Dasbor Kasir', 'SaaS & App', 450000, 12, 'Aplikasi kasir web dengan stok, laporan harian, dan cetak struk.'),
  S(4, 'Folio Kreatif', 'Portfolio', 110000, 38, 'Portfolio fotografer dan desainer dengan galeri masonry dan lightbox.'),
  S(3, 'Katering Nusantara', 'E-Commerce', 185000, 19, 'Pesan menu katering per paket, atur tanggal kirim, pembayaran via WhatsApp.'),
  S(2, 'Kelas Online', 'Landing Page', 135000, 25, 'Landing page kursus dengan kurikulum, profil mentor, testimoni, dan pendaftaran.'),
  S(1, 'Properti Kita', 'Company Profile', 210000, 9, 'Listing rumah dengan filter lokasi, galeri foto, dan tombol hubungi agen.')
];
const clean = b => ({
  title: String(b.title || '').trim().slice(0, 80),
  img: String(b.img || '').trim().slice(0, 300),
  price: Math.max(0, parseInt(b.price) || 0),
  category: String(b.category || 'Lainnya').slice(0, 40),
  desc: String(b.desc || '').trim().slice(0, 400),
  sold: Math.max(0, parseInt(b.sold) || 0),
  demo: /^https?:\/\//.test(String(b.demo || '')) ? String(b.demo).trim().slice(0, 300) : ''
});
module.exports = handler(async (req, res) => {
  let list = await db.get('products');
  if (!list) { list = SEED; await db.set('products', list); }
  if (req.method === 'GET') { res.setHeader('Cache-Control', 's-maxage=10'); return res.json(list); }
  if (!isAdmin(req)) return res.status(401).json({ error: 'Sesi admin berakhir, silakan login lagi' });
  const b = req.body || {};
  if (req.method === 'POST') {
    const p = { id: Date.now(), ...clean(b) };
    if (!p.title) return res.status(400).json({ error: 'Judul wajib diisi' });
    list.unshift(p);
  } else if (req.method === 'PUT') list = list.map(p => p.id === +b.id ? { ...p, ...clean(b) } : p);
  else if (req.method === 'DELETE') list = list.filter(p => p.id !== +req.query.id);
  else return res.status(405).end();
  await db.set('products', list);
  res.json(list);
});
