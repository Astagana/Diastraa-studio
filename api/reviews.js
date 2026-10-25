const { db, isAdmin, handler } = require('./_lib');
module.exports = handler(async (req, res) => {
  let list = (await db.get('reviews')) || [];
  if (req.method === 'GET') return res.json(list);
  if (req.method === 'POST') {
    const b = req.body || {};
    const r = { id: Date.now(), name: String(b.name || '').trim().slice(0, 40), rating: Math.round(+b.rating), comment: String(b.comment || '').trim().slice(0, 500), date: new Date().toISOString() };
    if (!r.name || !(r.rating >= 1 && r.rating <= 5) || r.comment.length < 3) return res.status(400).json({ error: 'Isi nama, bintang, dan ulasan dengan benar' });
    list = [r, ...list].slice(0, 200);
  } else if (req.method === 'DELETE') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Khusus admin' });
    list = list.filter(r => r.id !== +req.query.id);
  } else return res.status(405).end();
  await db.set('reviews', list);
  res.json(list);
});
