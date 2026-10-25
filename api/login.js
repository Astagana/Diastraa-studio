const crypto = require('crypto');
const { makeToken, handler } = require('./_lib');
const h = s => crypto.createHash('sha256').update(String(s)).digest();
module.exports = handler(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real || !crypto.timingSafeEqual(h((req.body || {}).password || ''), h(real)))
    return res.status(401).json({ error: 'Password salah' });
  res.json({ token: makeToken() });
});
