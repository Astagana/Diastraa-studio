const crypto = require('crypto');
const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const secret = () => process.env.ADMIN_PASSWORD || '';
const sign = x => crypto.createHmac('sha256', secret()).update(x).digest('hex');

async function cmd(...c) {
  const r = await fetch(U, { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(c) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
exports.db = {
  get: async k => { const v = await cmd('GET', k); return v ? JSON.parse(v) : null; },
  set: (k, v) => cmd('SET', k, JSON.stringify(v))
};
exports.makeToken = () => { const e = String(Date.now() + 6048e5); return e + '.' + sign(e); };
exports.isAdmin = req => {
  const [e, s] = (req.headers.authorization || '').slice(7).split('.');
  if (!secret() || !e || !s || +e < Date.now()) return false;
  const x = sign(e);
  return s.length === x.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(x));
};
exports.handler = fn => async (req, res) => {
  try { await fn(req, res); }
  catch (e) { console.error(e); res.status(500).json({ error: U ? 'Server bermasalah, coba lagi' : 'Database belum terhubung (lihat panduan deploy)' }); }
};
