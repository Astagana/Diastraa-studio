const CFG = { wa: '6282253507804', step: 6, coupons: { DIAS10: 10, BARU15: 15 }, cats: ['E-Commerce', 'Company Profile', 'Landing Page', 'SaaS & App', 'Portfolio'] };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const rp = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const wa = m => `https://wa.me/${CFG.wa}?text=${encodeURIComponent(m)}`;
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const ST = ['Menunggu pembayaran', 'Dibayar', 'Terkirim', 'Dibatalkan'];
const S = { prod: [], rev: [], cat: 'Semua', q: '', sort: 'baru', show: CFG.step, cart: ld('dc', []), code: '', name: '', token: sessionStorage.getItem('dt') || '', rate: 5, fav: ld('df', []) };

async function api(path, method = 'GET', body) {
  const r = await fetch('/api/' + path, { method, headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) }, body: body && JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 401 && S.token) setToken(''); throw new Error(j.error || 'Terjadi kesalahan'); }
  return j;
}
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600); };
const dlg = (html, cls = '') => { const d = $('#dlg'); d.className = cls; d.innerHTML = html; if (!d.open) d.showModal(); };
const head = t => `<div class="dh"><h3>${t}</h3><button class="x" data-close aria-label="Tutup">×</button></div>`;
$('#dlg').addEventListener('click', e => { const d = $('#dlg'); if (e.target === d || e.target.closest('[data-close]')) d.close(); });
$('#dlg').addEventListener('input', e => { if (e.target.id === 'cn') S.name = e.target.value; if (e.target.id === 'cc') S.code = e.target.value.trim().toUpperCase(); });
['#waHero', '#waFoot', '#waFloat'].forEach(s => $(s).href = wa('Halo Diastraa Studio, saya mau tanya soal template website.'));

/* gambar: nomor repo (1 -> 1.jpg), URL penuh, atau sampul otomatis */
function cover(p) {
  const h = ((+p.id || 1) * 47) % 360, a = `hsl(${h} 70% 45%)`, bg = `hsl(${(h + 40) % 360} 80% 93%)`;
  const cards = [0, 1, 2].map(i => `<rect x='${24 + i * 120}' y='440' width='112' height='100' rx='8' fill='#fff'/><rect x='${34 + i * 120}' y='452' width='92' height='46' rx='5' fill='${a}' opacity='.35'/><rect x='${34 + i * 120}' y='510' width='60' height='8' rx='4' fill='#101b34' opacity='.5'/>`).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 640'><rect width='400' height='640' fill='${bg}'/><rect width='400' height='38' fill='#fff'/><rect x='16' y='14' width='64' height='10' rx='5' fill='${a}'/><rect x='270' y='15' width='34' height='8' rx='4' fill='#101b34' opacity='.25'/><rect x='316' y='15' width='34' height='8' rx='4' fill='#101b34' opacity='.25'/><rect x='24' y='76' width='240' height='24' rx='4' fill='#101b34'/><rect x='24' y='110' width='180' height='24' rx='4' fill='#101b34'/><rect x='24' y='152' width='210' height='8' rx='4' fill='#101b34' opacity='.3'/><rect x='24' y='172' width='120' height='34' rx='17' fill='${a}'/><rect x='24' y='236' width='352' height='170' rx='10' fill='${a}' opacity='.8'/>${cards}<rect x='0' y='580' width='400' height='60' fill='#101b34'/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
const src = p => { const i = String(p.img || '').trim(); return /^(https?:|\/)/.test(i) ? i : /^\d+$/.test(i) ? i + '.jpg' : cover(p); };
const img = p => `<img loading="lazy" src="${esc(src(p))}" alt="Tampilan ${esc(p.title)}" onerror="fb(this,${p.id})">`;
window.fb = (el, id) => { el.onerror = null; el.src = cover(S.prod.find(p => p.id == id) || { id }); };

/* katalog */
function list() {
  const a = S.prod.filter(p => (S.cat === 'Semua' || (S.cat === 'Favorit' ? S.fav.includes(p.id) : p.category === S.cat)) && (p.title + p.category + p.desc).toLowerCase().includes(S.q));
  const f = { baru: (x, y) => y.id - x.id, laris: (x, y) => (y.sold || 0) - (x.sold || 0), murah: (x, y) => x.price - y.price, mahal: (x, y) => y.price - x.price }[S.sort];
  return a.sort(f);
}
const top = () => [...S.prod].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 2).filter(p => p.sold).map(p => p.id);
const card = p => `<article class="card">
  <button class="frame" data-act="open" data-id="${p.id}" aria-label="Lihat ${esc(p.title)}"><i><u></u><u></u><u></u></i>${img(p)}<span class="price">${rp(p.price)}</span>${top().includes(p.id) ? '<span class="tag">Terlaris</span>' : ''}</button>
  <div class="cb"><div class="meta"><span>${esc(p.category)}</span><span>${p.sold ? `Terjual ${p.sold}` : ''}<button class="heart" data-act="fav" data-id="${p.id}" aria-pressed="${S.fav.includes(p.id)}" aria-label="Favorit">♥</button></span></div>
  <h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
  <div class="acts"><button class="btn sm" data-act="open" data-id="${p.id}">Detail</button><button class="btn pri sm" data-act="add" data-id="${p.id}">Tambah</button></div>
  ${S.token ? `<div class="acts"><button class="btn sm" data-act="edit" data-id="${p.id}">Edit</button><button class="btn sm dg" data-act="del" data-id="${p.id}">Hapus</button></div>` : ''}</div></article>`;
function renderGrid() {
  const a = list(), v = a.slice(0, S.show);
  $('#count').textContent = `${a.length} template`;
  $('#grid').innerHTML = v.length ? v.map(card).join('') : `<p class="empty">Belum ada template untuk “${esc(S.q || S.cat)}”. <a href="${wa('Halo, saya cari template website: ' + (S.q || S.cat))}" target="_blank" rel="noopener">Tanyakan lewat WhatsApp</a>, mungkin bisa dibuatkan.</p>`;
  $('#more').hidden = a.length <= S.show;
}
function chips() {
  const cs = ['Semua', 'Favorit', ...new Set([...CFG.cats, ...S.prod.map(p => p.category)])];
  $('#chips').innerHTML = cs.map(c => `<button class="chip" aria-pressed="${c === S.cat}" data-act="cat" data-v="${esc(c)}">${esc(c)}</button>`).join('');
}
function renderStack() { $('#stack').innerHTML = [...S.prod].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3).map(p => `<div class="frame"><i><u></u><u></u><u></u></i>${img(p)}</div>`).join(''); }

/* detail */
function detail(id) {
  const p = S.prod.find(x => x.id === id); if (!p) return;
  dlg(`${head(esc(p.title))}<div class="db det"><div class="shot">${img(p)}</div><div style="display:grid;gap:14px;align-content:start">
  <span class="meta">${esc(p.category)}${p.sold ? ' – terjual ' + p.sold : ''}</span><p>${esc(p.desc)}</p>
  <div class="big">${rp(p.price)}</div>
  <ul><li>Source code HTML, CSS, JS lengkap</li><li>Panduan ganti isi dan deploy</li><li>Revisi kecil gratis</li><li>Dukungan lewat WhatsApp</li></ul>
  <button class="btn pri blk" data-act="add" data-id="${p.id}">Tambah ke keranjang</button>
  <button class="btn wa blk" data-act="buy" data-id="${p.id}">Beli sekarang lewat WhatsApp</button>${/^https?:/.test(p.demo || '') ? `<a class="btn blk" href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer">Lihat demo langsung</a>` : ''}<button class="btn sm blk" data-act="share" data-id="${p.id}">Salin link template ini</button></div></div>`);
  history.replaceState(null, '', '#p=' + id);
}

/* keranjang */
const rows = () => S.cart.map(i => ({ ...i, p: S.prod.find(p => p.id === i.id) })).filter(i => i.p);
const off = () => CFG.coupons[S.code] || 0;
function totals() { const s = rows().reduce((t, i) => t + i.p.price * i.qty, 0), d = Math.round(s * off() / 100); return { s, d, t: s - d }; }
function renderCart() {
  localStorage.setItem('dc', JSON.stringify(S.cart));
  $('#cartN').textContent = S.cart.reduce((s, i) => s + i.qty, 0);
  const d = $('#dlg'); if (d.open && d.classList.contains('drawer')) cartView();
}
function cartView() {
  const r = rows(), { s, d, t } = totals();
  dlg(`${head('Keranjang')}<div class="db">${r.length ? r.map(i => `<div class="ci"><img src="${esc(src(i.p))}" alt="" onerror="fb(this,${i.p.id})"><div><strong>${esc(i.p.title)}</strong><div>${rp(i.p.price)}</div><div class="q"><button data-act="dec" data-id="${i.id}" aria-label="Kurangi">−</button>${i.qty}<button data-act="inc" data-id="${i.id}" aria-label="Tambah">+</button></div></div><button class="lnk" data-act="rm" data-id="${i.id}">Hapus</button></div>`).join('') : '<p class="empty">Keranjang masih kosong. Pilih template dari katalog dulu.</p>'}
  ${r.length ? `<label>Nama kamu<input class="inp" id="cn" value="${esc(S.name)}" placeholder="Nama untuk pesanan" autocomplete="name"></label>
  <label>Kode voucher<span style="display:flex;gap:8px"><input class="inp" id="cc" value="${esc(S.code)}" placeholder="Punya kode?"><button class="btn sm" data-act="coupon">Pakai</button></span></label>
  ${off() ? `<div class="ok">Voucher ${esc(S.code)} aktif, hemat ${off()}%</div>` : ''}
  <div class="tot"><span>Subtotal</span><span>${rp(s)}</span></div>${d ? `<div class="tot ok"><span>Diskon</span><span>−${rp(d)}</span></div>` : ''}
  <div class="tot"><span>Total</span><strong>${rp(t)}</strong></div>
  <button class="btn wa blk" data-act="checkout">Pesan lewat WhatsApp</button>` : ''}</div>`, 'drawer');
}
function add(id) { const i = S.cart.find(x => x.id === id); i ? i.qty++ : S.cart.push({ id, qty: 1 }); renderCart(); toast('Masuk keranjang'); }
async function checkout() {
  const r = rows(), { s, d, t } = totals(), w = window.open('', '_blank'); let code = '';
  try { code = (await api('orders', 'POST', { name: S.name, coupon: off() ? S.code : '', items: r.map(i => ({ id: i.id, qty: i.qty })) })).code; localStorage.setItem('do', JSON.stringify([code, ...ld('do', [])].slice(0, 5))); } catch (e) {}
  let m = `Halo Diastraa Studio, saya${S.name ? ' ' + S.name : ''} mau pesan template website:\n\n` + r.map((i, n) => `${n + 1}. *${i.p.title}* x${i.qty} = ${rp(i.p.price * i.qty)}`).join('\n') + `\n\nSubtotal: ${rp(s)}`;
  if (d) m += `\nVoucher ${S.code} (${off()}%): −${rp(d)}`;
  if (code) m += `\nKode pesanan: *${code}*`;
  const u = wa(m + `\n*Total: ${rp(t)}*\n\nMohon info cara pembayarannya. Terima kasih!`);
  w ? w.location = u : location.href = u;
  if (code) { S.cart = []; renderCart(); toast(`Pesanan ${code} tercatat`); }
}
function buyNow(id) { const p = S.prod.find(x => x.id === id); window.open(wa(`Halo Diastraa Studio, saya mau beli template *${p.title}* (${rp(p.price)}). Mohon info pembayarannya.`), '_blank'); }

/* ulasan */
function renderRev() {
  const r = S.rev, n = r.length, avg = n ? r.reduce((s, x) => s + x.rating, 0) / n : 0;
  $('#avg').textContent = n ? avg.toFixed(1) : '–'; $('#stars').textContent = stars(Math.round(avg)); $('#rn').textContent = n ? `dari ${n} ulasan` : 'Belum ada ulasan';
  $('#bars').innerHTML = [5, 4, 3, 2, 1].map(i => { const c = r.filter(x => x.rating === i).length; return `<div><span>${i}★</span><b><s style="width:${n ? c / n * 100 : 0}%"></s></b><span>${c}</span></div>`; }).join('');
  $('#rl').innerHTML = n ? r.map(x => `<blockquote><div class="rh"><strong>${esc(x.name)}</strong><span class="st">${stars(x.rating)}</span></div><p>${esc(x.comment)}</p><small>${new Date(x.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}${S.token ? ` <button class="lnk" data-act="delrev" data-id="${x.id}">Hapus</button>` : ''}</small></blockquote>`).join('') : '<p class="empty">Jadilah yang pertama menulis ulasan.</p>';
}
function setRate(n) { S.rate = n; document.querySelectorAll('#pick button').forEach((b, i) => b.classList.toggle('on', i < n)); }
function revForm() {
  dlg(`${head('Tulis ulasan')}<form class="db" data-form="rev"><label>Nama<input class="inp" name="name" required maxlength="40"></label>
  <div class="pick" id="pick">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-act="rate" data-id="${i}" aria-label="${i} bintang">★</button>`).join('')}</div>
  <label>Ulasan<textarea class="inp" name="comment" rows="3" required minlength="3" maxlength="500" placeholder="Ceritakan pengalamanmu"></textarea></label><button class="btn pri blk">Kirim ulasan</button></form>`, 'sm2');
  setRate(5);
}

/* admin */
function setToken(t) { S.token = t; t ? sessionStorage.setItem('dt', t) : sessionStorage.removeItem('dt'); document.body.classList.toggle('adm', !!t); $('#admBtn').textContent = t ? 'Keluar penjual' : 'Masuk penjual'; renderGrid(); renderRev(); }
function pform(id) {
  const p = S.prod.find(x => x.id === id) || { category: CFG.cats[0] }, v = k => esc(p[k] ?? '');
  dlg(`${head(id ? 'Edit template' : 'Template baru')}<form class="db" data-form="prod"><input type="hidden" name="id" value="${id || ''}">
  <label>Judul<input class="inp" name="title" required value="${v('title')}"></label>
  <label>Gambar (nomor repo seperti 1, atau URL gambar)<input class="inp" name="img" value="${v('img')}" placeholder="kosong = sampul otomatis"></label>
  <label>Harga (Rp)<input class="inp" name="price" type="number" min="0" required value="${v('price')}"></label>
  <label>Kategori<select class="inp" name="category">${CFG.cats.map(c => `<option${c === p.category ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
  <label>Jumlah terjual<input class="inp" name="sold" type="number" min="0" value="${v('sold') || 0}"></label>
  <label>Link demo (opsional)<input class="inp" name="demo" type="url" value="${v('demo')}" placeholder="https://"></label>
  <label>Deskripsi<textarea class="inp" name="desc" rows="3" required>${v('desc')}</textarea></label><button class="btn pri blk">Simpan</button></form>`, 'sm2');
}
const refresh = () => { chips(); renderGrid(); renderStack(); renderCart(); };

function setTheme(t) { document.documentElement.dataset.theme = t; localStorage.setItem('dth', t); $('#themeBtn').textContent = t === 'dark' ? 'Terang' : 'Gelap'; }
setTheme(document.documentElement.dataset.theme);
$('#dlg').addEventListener('close', () => { if (location.hash.startsWith('#p=')) history.replaceState(null, '', location.pathname); });

/* events */
const act = {
  open: id => detail(id), add, theme: () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'),
  fav: id => { S.fav = S.fav.includes(id) ? S.fav.filter(x => x !== id) : [...S.fav, id]; localStorage.setItem('df', JSON.stringify(S.fav)); renderGrid(); toast(S.fav.includes(id) ? 'Disimpan ke Favorit' : 'Dihapus dari Favorit'); },
  share: id => navigator.clipboard?.writeText(location.origin + location.pathname + '#p=' + id).then(() => toast('Link disalin'), () => toast('Gagal menyalin link')), buy: buyNow, cart: cartView, new: () => pform(0), edit: pform, revform: revForm, rate: setRate,
  inc: id => { S.cart.find(i => i.id === id).qty++; renderCart(); },
  dec: id => { const i = S.cart.find(x => x.id === id); if (--i.qty <= 0) S.cart = S.cart.filter(x => x !== i); renderCart(); },
  rm: id => { S.cart = S.cart.filter(i => i.id !== id); renderCart(); },
  coupon: () => { if (!off()) toast('Kode voucher tidak dikenal'); else toast(`Voucher aktif, hemat ${off()}%`); cartView(); },
  checkout,
  track: () => dlg(`${head('Cek pesanan')}<form class="db" data-form="track"><label>Kode pesanan<input class="inp" name="code" required placeholder="DS-XXXXXX" value="${esc(ld('do', [])[0] || '')}"></label><div id="tr"></div><button class="btn pri blk">Cek status</button></form>`, 'sm2'),
  orders: async () => {
    try {
      const o = S.orders = await api('orders'), paid = o.filter(x => x.status === ST[1] || x.status === ST[2]);
      dlg(`${head('Pesanan masuk')}<div class="db"><div class="stats"><div><b>${o.length}</b>Total pesanan</div><div><b>${rp(paid.reduce((a, x) => a + x.total, 0))}</b>Omzet (dibayar)</div><div><b>${o.filter(x => x.status === ST[0]).length}</b>Menunggu bayar</div></div>
      <button class="btn sm" data-act="csv">Unduh CSV</button>${o.map(x => `<div class="ord"><div><strong>${esc(x.code)}</strong> ${esc(x.name || 'tanpa nama')}<br><small>${new Date(x.date).toLocaleString('id-ID')}<br>${x.items.map(i => esc(i.title) + ' x' + i.qty).join(', ')}${x.coupon ? '<br>Voucher ' + esc(x.coupon) : ''}</small></div><div><strong>${rp(x.total)}</strong><select data-oid="${x.id}" aria-label="Status">${ST.map(t => `<option${t === x.status ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>`).join('') || '<p class="empty">Belum ada pesanan.</p>'}</div>`);
    } catch (e) { toast(e.message); }
  },
  csv: () => {
    const q = v => { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    const t = ['Kode,Tanggal,Nama,Pesanan,Total,Status', ...S.orders.map(o => [o.code, o.date, o.name, o.items.map(i => i.title + ' x' + i.qty).join('; '), o.total, o.status].map(q).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = 'pesanan.csv'; a.click();
  },
  login: () => S.token ? (setToken(''), toast('Keluar dari mode penjual')) : dlg(`${head('Masuk penjual')}<form class="db" data-form="login"><label>Password<input class="inp" type="password" name="password" required autocomplete="current-password"></label><button class="btn pri blk">Masuk</button></form>`, 'sm2'),
  del: async id => { if (!confirm('Hapus template ini dari katalog?')) return; try { S.prod = await api('products?id=' + id, 'DELETE'); refresh(); toast('Template dihapus'); } catch (e) { toast(e.message); } },
  delrev: async id => { try { S.rev = await api('reviews?id=' + id, 'DELETE'); renderRev(); } catch (e) { toast(e.message); } }
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'cat') { S.cat = b.dataset.v; S.show = CFG.step; chips(); return renderGrid(); }
  act[b.dataset.act]?.(+b.dataset.id);
});
document.addEventListener('submit', async e => {
  const f = e.target.dataset.form; if (!f) return; e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target)), btn = e.target.querySelector('button:last-child'); btn.disabled = true;
  try {
    if (f === 'login') { setToken((await api('login', 'POST', d)).token); $('#dlg').close(); toast('Mode penjual aktif'); }
    if (f === 'prod') { S.prod = await api('products', d.id ? 'PUT' : 'POST', d); $('#dlg').close(); refresh(); toast('Tersimpan'); }
    if (f === 'track') {
      const o = await api('orders?code=' + encodeURIComponent(d.code)), k = ST.indexOf(o.status);
      $('#tr').innerHTML = `<strong>${esc(o.code)}</strong>: ${esc(o.status)}<div class="steps">${[0, 1, 2].map(i => `<i class="${k >= i ? 'on' : ''}"></i>`).join('')}</div><small>${o.items.map(i => esc(i.title) + ' x' + i.qty).join(', ')}. Total ${rp(o.total)}</small>${k === 0 ? `<a class="btn wa blk" target="_blank" rel="noopener" href="${wa('Halo, saya sudah bayar untuk pesanan ' + o.code)}">Konfirmasi pembayaran</a>` : ''}`;
      btn.disabled = false;
    }
    if (f === 'rev') { S.rev = await api('reviews', 'POST', { ...d, rating: S.rate }); $('#dlg').close(); renderRev(); toast('Terima kasih atas ulasanmu!'); }
  } catch (err) { toast(err.message); btn.disabled = false; }
});
let qt; $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { S.q = e.target.value.trim().toLowerCase(); S.show = CFG.step; renderGrid(); }, 150); });
$('#sort').addEventListener('change', e => { S.sort = e.target.value; renderGrid(); });
$('#dlg').addEventListener('change', async e => { const id = e.target.dataset.oid; if (!id) return; try { S.orders = await api('orders', 'PUT', { id, status: e.target.value }); toast('Status diperbarui'); } catch (err) { toast(err.message); } });
document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !$('#dlg').open) { e.preventDefault(); $('#q').focus(); } });
$('#q').placeholder = 'Cari template (tekan /)';
$('#more').addEventListener('click', () => { S.show += CFG.step; renderGrid(); });

(async () => {
  document.body.classList.toggle('adm', !!S.token); $('#admBtn').textContent = S.token ? 'Keluar penjual' : 'Masuk penjual';
  try { [S.prod, S.rev] = await Promise.all([api('products'), api('reviews')]); }
  catch (e) { $('#grid').innerHTML = `<p class="empty">Katalog belum bisa dimuat. ${esc(e.message)}</p>`; return; }
  S.cart = S.cart.filter(i => S.prod.some(p => p.id === i.id));
  refresh(); renderRev();
  const m = location.hash.match(/^#p=(\d+)/); if (m) detail(+m[1]);
})();

const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .08 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));
