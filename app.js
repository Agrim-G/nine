const $ = s => document.querySelector(s);
const app = $('#app');
const KEY = 'eventify.demo.bookings';
const inr = n => n === 0 ? 'Free' : '₹' + n.toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const when = e => { const d = new Date(); d.setDate(d.getDate() + e.d); return d; };
const fmt = e => when(e).toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short', year:'numeric'});
const minPrice = e => Math.min(...e.tix.map(t => t[1]));
const grad = e => `background:linear-gradient(135deg,${e.c[0]},${e.c[1]})`;
const find = id => EVENTS.find(e => e.id === id);
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const save = b => { try { localStorage.setItem(KEY, JSON.stringify(b)); return true; } catch { return false; } };
let cart = null; // {id, q:[qty per ticket type]}

const total = () => { const e = find(cart.id); return e.tix.reduce((s, t, i) => s + t[1] * cart.q[i], 0); };
const count = () => cart.q.reduce((a, b) => a + b, 0);

const card = e => `<a class="card" href="#/event/${e.id}">
  <div class="banner" style="${grad(e)}"><span>${e.emoji}</span><b class="tag">${e.cat}</b></div>
  <div class="cb"><h3>${esc(e.title)}</h3><p>📅 ${fmt(e)} · ${e.time}</p><p>📍 ${esc(e.venue)}, ${e.city}</p>
  <p class="pr">${minPrice(e) === 0 ? 'Free entry' : 'From ' + inr(minPrice(e))}</p></div></a>`;

function home() {
  const cats = [...new Set(EVENTS.map(e => e.cat))];
  const feat = EVENTS.filter(e => e.f);
  app.innerHTML = `
  <section class="hero"><h1>Find your next <span>great night out</span></h1>
    <p>Concerts, workshops, tech meetups, comedy and community days. Browse the sample lineup and try a full demo booking.</p></section>
  <section class="wrap"><h2>Featured</h2>
    <div class="feat">${feat.map(e => `<a class="fcard" href="#/event/${e.id}" style="${grad(e)}"><span class="big">${e.emoji}</span>
      <div><b class="tag">${e.cat}</b><h3>${esc(e.title)}</h3><p>${fmt(e)} · ${esc(e.venue)}, ${e.city}</p><p class="pr">${minPrice(e) === 0 ? 'Free entry' : 'From ' + inr(minPrice(e))}</p></div></a>`).join('')}</div>
  </section>
  <section class="wrap" id="all"><h2>Upcoming events <small id="count"></small></h2>
    <div class="filters">
      <input id="q" type="search" placeholder="Search by event name or venue" aria-label="Search events">
      <select id="cat" aria-label="Category"><option value="">All categories</option>${cats.map(c => `<option>${c}</option>`).join('')}</select>
      <select id="rng" aria-label="Date range"><option value="">Any date</option><option value="7">Next 7 days</option><option value="14">Next 14 days</option><option value="30">Next 30 days</option></select>
      <button class="ghost" id="clr">Clear</button>
    </div>
    <div class="grid" id="grid"></div></section>`;
  ['q', 'cat', 'rng'].forEach(i => $('#' + i).addEventListener('input', grid));
  $('#clr').onclick = () => { $('#q').value = ''; $('#cat').value = ''; $('#rng').value = ''; grid(); };
  grid();
}

function grid() {
  const q = $('#q').value.toLowerCase().trim(), c = $('#cat').value, r = $('#rng').value;
  const list = EVENTS.filter(e => (!q || (e.title + ' ' + e.venue).toLowerCase().includes(q)) && (!c || e.cat === c) && (!r || e.d <= +r)).sort((a, b) => a.d - b.d);
  $('#count').textContent = `(${list.length})`;
  $('#grid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty">No events match your search. Try a different keyword, category or date range.</p>';
}

function eventPage(id) {
  const e = find(id); if (!e) return notFound();
  if (!cart || cart.id !== id) cart = {id, q: e.tix.map(() => 0)};
  app.innerHTML = `
  <div class="ebanner" style="${grad(e)}"><div class="wrap"><a class="back" href="#/">← All events</a><span class="big">${e.emoji}</span>
    <b class="tag">${e.cat}</b><h1>${esc(e.title)}</h1><p>📅 ${fmt(e)} · ${e.time} &nbsp; 📍 ${esc(e.venue)}, ${e.city}</p></div></div>
  <div class="wrap two">
    <section><h2>About this event</h2><p>${esc(e.desc)}</p>
      <h2>Venue</h2><p><b>${esc(e.venue)}</b><br>${e.city}, India<br><small>Sample venue for demonstration purposes.</small></p></section>
    <aside class="panel"><h2>Tickets</h2>
      ${e.tix.map((t, i) => `<div class="trow"><div><b>${esc(t[0])}</b><small>${esc(t[2])}</small><span>${inr(t[1])}</span></div>
        <div class="qty"><button onclick="chg(${i},-1)" aria-label="Decrease ${esc(t[0])}">−</button><output id="q${i}">${cart.q[i]}</output><button onclick="chg(${i},1)" aria-label="Increase ${esc(t[0])}">+</button></div></div>`).join('')}
      <div class="sum"><span><span id="cnt"></span></span><b id="tot"></b></div>
      <button class="btn" id="go" onclick="location.hash='#/checkout'">Continue to checkout</button>
      <p class="hint" id="hint"></p></aside></div>`;
  upd();
}
function chg(i, n) { cart.q[i] = Math.max(0, Math.min(10, cart.q[i] + n)); upd(); }
function upd() {
  cart.q.forEach((v, i) => { const o = $('#q' + i); if (o) o.textContent = v; });
  const n = count();
  $('#cnt').textContent = n + (n === 1 ? ' ticket' : ' tickets');
  $('#tot').textContent = inr(total());
  $('#go').disabled = !n;
  $('#hint').textContent = n ? 'Maximum 10 per ticket type. Demo only: no payment is taken.' : 'Select at least one ticket to continue.';
}

function lines(items) { return items.map(i => `<li><span>${i.qty} × ${esc(i.name)}</span><span>${inr(i.qty * i.price)}</span></li>`).join(''); }

function checkout() {
  if (!cart || !count()) { location.hash = cart ? '#/event/' + cart.id : '#/'; return; }
  const e = find(cart.id);
  const items = e.tix.map((t, i) => ({name: t[0], price: t[1], qty: cart.q[i]})).filter(i => i.qty);
  app.innerHTML = `<div class="wrap two"><section><a class="back dark" href="#/event/${e.id}">← Back to event</a><h1>Checkout</h1>
    <p class="note">This is a demo. No payment is taken and no real ticket is issued.</p>
    <form id="f" novalidate>
      <label>Full name<input id="nm" autocomplete="name" placeholder="e.g. Aarav Sharma"><span class="err" id="e1"></span></label>
      <label>Email<input id="em" type="email" autocomplete="email" placeholder="you@example.com"><span class="err" id="e2"></span></label>
      <button class="btn" type="submit">Confirm demo booking · ${inr(total())}</button></form></section>
    <aside class="panel"><h2>Order summary</h2><p><b>${esc(e.title)}</b><br><small>${fmt(e)} · ${e.time}<br>${esc(e.venue)}, ${e.city}</small></p>
      <ul class="lines">${lines(items)}</ul><div class="sum"><span>Total</span><b>${inr(total())}</b></div></aside></div>`;
  $('#f').onsubmit = ev => {
    ev.preventDefault();
    const name = $('#nm').value.trim(), email = $('#em').value.trim();
    const n = name.length < 2 ? 'Please enter your full name (at least 2 characters).' : '';
    const m = !email ? 'Please enter your email address.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'Please enter a valid email, like name@example.com.' : '';
    $('#e1').textContent = n; $('#e2').textContent = m;
    if (n || m) return;
    const ref = 'DEMO-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 6).toUpperCase();
    const b = load();
    b.unshift({ref, title: e.title, date: fmt(e), time: e.time, venue: e.venue + ', ' + e.city, items, total: total(), name, email, at: new Date().toISOString()});
    if (!save(b)) { $('#e2').textContent = 'Could not save the demo booking in this browser (storage is unavailable).'; return; }
    cart = null; location.hash = '#/confirm/' + ref;
  };
}

function ticketBox(b, extra = '') {
  return `<div class="bk"><div class="bkh"><div><b>${esc(b.title)}</b><small>${esc(b.date)} · ${esc(b.time)} · ${esc(b.venue)}</small></div><code>${esc(b.ref)}</code></div>
    <ul class="lines">${lines(b.items)}</ul><div class="sum"><span>${esc(b.name)} · ${esc(b.email)}</span><b>${inr(b.total)}</b></div>${extra}</div>`;
}

function confirmPage(ref) {
  const b = load().find(x => x.ref === ref); if (!b) return notFound();
  app.innerHTML = `<div class="wrap narrow center"><div class="ok">✓</div><h1>Demo booking confirmed</h1>
    <p>Your demo reference is <code class="big-ref">${esc(b.ref)}</code></p>
    <p class="note">This is a simulated booking for a portfolio demo. No real ticket was purchased, no payment was taken, and no venue or organiser has been notified.</p>
    ${ticketBox(b)}<p><a class="btn" href="#/bookings">View My Bookings</a> <a class="ghost" href="#/">Browse more events</a></p></div>`;
}

function bookings() {
  const b = load();
  app.innerHTML = `<div class="wrap narrow"><h1>My Bookings</h1><p class="note">Demo reservations made in this browser only. They are not real tickets.</p>
    ${b.length ? b.map(x => ticketBox(x, `<button class="ghost" onclick="del('${esc(x.ref)}')">Remove</button>`)).join('') :
    '<p class="empty">You have no demo bookings yet. <a href="#/">Find an event</a>.</p>'}</div>`;
}
function del(ref) { if (window.confirm('Remove this demo booking from this browser?')) { save(load().filter(x => x.ref !== ref)); route(); } }

function notFound() { app.innerHTML = '<div class="wrap narrow center"><h1>Page not found</h1><p><a href="#/">Back to events</a></p></div>'; }

function route() {
  const [, p, a] = location.hash.split('/');
  window.scrollTo(0, 0);
  if (p === "event") eventPage(a); else if (p === "checkout") checkout(); else if (p === "confirm") confirmPage(a);
  else if (p === 'bookings') bookings(); else home();
  $('#bc').textContent = load().length;
}
window.addEventListener('hashchange', route);
route();
