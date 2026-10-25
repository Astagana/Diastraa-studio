const { db, isAdmin, handler } = require('./_lib');
const COUPONS = { DIAS10: 10, BARU15: 15 };
const ST = ['Menunggu pembayaran', 'Dibayar', 'Terkirim', 'Dibatalkan'];
module.exports = handler(async (req, res) => {
  let list = (await db.get('orders')) || [];
  if (req.method === 'GET') {
    if (req.query.code) {
      const o = list.find(x => x.code === String(req.query.code).toUpperCase().trim());
      if (!o) return res.status(404).json({ error: 'Kode pesanan tidak ditemukan' });
      return res.json({ code: o.code, status: o.status, total: o.total, items: o.items });
    }
    if (!isAdmin(req)) return res.status(401).json({ error: 'Khusus admin' });
    return res.json(list);
  }
  if (req.method === 'POST') {
    const b = req.body || {}, prods = (await db.get('products')) || [];
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 20).map(i => {
      const p = prods.find(p => p.id === +i.id);
      return p && { id: p.id, title: p.title, price: p.price, qty: Math.min(Math.max(parseInt(i.qty) || 1, 1), 20) };
    }).filter(Boolean);
    if (!items.length) return res.status(400).json({ error: 'Keranjang kosong' });
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0), c = String(b.coupon || '').toUpperCase(), pct = COUPONS[c] || 0;
    const total = sub - Math.round(sub * pct / 100);
    const o = { id: Date.now(), code: 'DS-' + Math.random().toString(36).slice(2, 8).toUpperCase(), name: String(b.name || '').trim().slice(0, 60), items, coupon: pct ? c : '', total, status: ST[0], date: new Date().toISOString() };
    await db.set('orders', [o, ...list].slice(0, 500));
    return res.json({ code: o.code, total });
  }
  if (req.method === 'PUT') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Khusus admin' });
    const b = req.body || {};
    if (!ST.includes(b.status)) return res.status(400).json({ error: 'Status tidak valid' });
    list = list.map(o => o.id === +b.id ? { ...o, status: b.status } : o);
    await db.set('orders', list);
    return res.json(list);
  }
  res.status(405).end();
});
