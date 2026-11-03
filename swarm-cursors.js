/* Swarm Build v3
   Layar gelap kosong -> beberapa kursor menyeret, menekan, mengetik, dan menyusun halaman
   (bagian, teks, gambar, layout) sambil auto-scroll, lalu halaman tampil normal.
   Lewati: tombol "Lewati", tombol Esc, atau tambahkan ?intro=0 di URL. */
(() => {
'use strict';
const root = document.documentElement;
const unlock = () => root.classList.remove('swarm-build-pending', 'swarm-build-active');
if (matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]intro=0\b/.test(location.search)) { unlock(); return; }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const linear = t => t;

/* ---- pengaturan tempo (ms) ---- */
const T = { move: 240, press: 90, block: 430, shell: 480, textBase: 260, flash: 170, stagger: 260, blank: 700 };
const SCROLL_MAX = 11;          // px per frame (maks. kecepatan auto-scroll)
const SCROLL_EASE = .05;        // makin kecil = makin lembut

const M = 16;
const COLORS = ['#c4b5fd', '#7ee7c0', '#f0abfc', '#fcd34d', '#fb923c', '#60a5fa'];
const LABEL = { shell: 'MEMBUAT BAGIAN', text: 'MENULIS TEKS', media: 'MENAMPILKAN GAMBAR', block: 'MEMBANGUN LAYOUT' };
const AGENTS = innerWidth < 700 ? 3 : 6;

const UNIT_SEL = [
  'nav .brand', 'nav .roleswitch', 'nav .navlinks', 'nav .navtoggle',
  '.hero-text .rolepick', '.hero-text h1', '.hero-text .hero-sub', '.hero-text .hero-btns', '.hero-text .avail', '.tagwrap',
  '.rc-card', '.rc-actions', '.facts', '.skill-card', '.project .p-text', '.project .p-visual',
  '.flow .steps', '.flow .panels', '.dash-title-row', '.dash-toolbar', '.dash-kpi', '.dash-panel', '.insight-grid', '.dash-insight',
  '.contact-btns', '.contact-links'
].join(',');
const LEAF_SEL = 'h1,h2,h3,h4,h5,h6,p,li,img,canvas,svg,figure,table,pre,blockquote,dl,button,a,select,label';

let aborted = false, cleaned = false, following = true;
const jobs = [], shells = [], agents = [];
let totalUnits = 0, doneUnits = 0, head = 0, next = 0, rafId = 0;

/* ---------- UI ---------- */
const ui = (tag, cls) => { const n = document.createElement(tag); n.className = (cls ? cls + ' ' : '') + 'sw-ui'; return n; };
const status = ui('div', 'sw-status');
status.innerHTML = '<span class="sw-dot"></span><span class="sw-label">MENYIAPKAN</span><b class="sw-pct">0%</b><i class="sw-bar"><u></u></i>';
const label = status.querySelector('.sw-label');
const pctEl = status.querySelector('.sw-pct');
const barEl = status.querySelector('.sw-bar u');
const skipBtn = ui('button', 'sw-skip');
skipBtn.type = 'button';
skipBtn.textContent = 'LEWATI ›';
skipBtn.setAttribute('aria-label', 'Lewati animasi pembuka');
skipBtn.addEventListener('click', () => skip());

function setProgress() {
  const p = Math.min(100, Math.round(doneUnits / Math.max(totalUnits, 1) * 100));
  pctEl.textContent = p + '%';
  barEl.style.transform = 'scaleX(' + (p / 100) + ')';
}

function makeAgent(i) {
  const c = COLORS[i % COLORS.length];
  const node = ui('div', 'sw-cursor');
  node.style.setProperty('--c', c);
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = '<svg viewBox="0 0 20 24"><path d="M1.5 1.2V19l4.8-4.4 3.3 7.4 3.4-1.4-3.2-7.3h6.7z"/></svg><span class="sw-tag"></span>';
  const frame = ui('div', 'sw-frame');
  frame.style.setProperty('--c', c);
  frame.setAttribute('aria-hidden', 'true');
  frame.innerHTML = '<em class="sw-dim"></em>';
  const dim = frame.firstChild;
  const a = {
    color: c, node, frame, dim, tok: 0, dir: i % 2 ? 1 : -1, tag: node.querySelector('.sw-tag'), x: 0, y: 0,
    place(x, y) { a.x = x; a.y = y; node.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; },
    say(t) { a.tag.textContent = t; },
    down(b) { node.classList.toggle('is-down', b); },
    rect(x, y, w, h, showDim) {
      frame.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      frame.style.width = Math.max(0, w).toFixed(1) + 'px';
      frame.style.height = Math.max(0, h).toFixed(1) + 'px';
      if (showDim) dim.textContent = Math.round(w) + ' × ' + Math.round(h);
    }
  };
  a.place(innerWidth * (.1 + .16 * i), -40);
  return a;
}

function ripple(x, y, c, big) {
  const d = ui('div', 'sw-ripple');
  d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.setProperty('--c', c);
  document.body.appendChild(d);
  const k = d.animate([
    { transform: 'translate(-50%,-50%) scale(.2)', opacity: .95 },
    { transform: 'translate(-50%,-50%) scale(' + (big ? 3.2 : 2.3) + ')', opacity: 0 }
  ], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' });
  k.onfinish = k.oncancel = () => d.remove();
}

/* ---------- loop animasi + auto-scroll ---------- */
const tweens = new Set();
function tween(dur, ease, fn) {
  return new Promise(res => {
    if (aborted) { res(); return; }
    tweens.add({ start: performance.now(), dur: Math.max(16, dur), ease, fn, done: res });
  });
}

/* geometri di-cache (koordinat dokumen) supaya tidak membaca layout tiap frame */
function refresh(it) {
  const r = it.el.getBoundingClientRect();
  it.l = r.left + (it.fixed ? 0 : scrollX); it.t = r.top + (it.fixed ? 0 : scrollY); it.w = r.width; it.h = r.height;
}
function geo(it) {
  return it.fixed ? { l: it.l, t: it.t, w: it.w, h: it.h } : { l: it.l - scrollX, t: it.t - scrollY, w: it.w, h: it.h };
}

function stepScroll() {
  if (!following) return;
  while (head < jobs.length && jobs[head].done) head++;
  const j = jobs[head];
  if (!j) return;
  const max = Math.max(0, root.scrollHeight - innerHeight);
  const top = geo(j).t;
  const anchor = innerHeight * .3;
  if (top <= anchor) return;
  const diff = clamp(scrollY + top - anchor, 0, max) - scrollY;
  if (Math.abs(diff) < .5) return;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), Math.max(.8, Math.min(SCROLL_MAX, Math.abs(diff) * SCROLL_EASE)));
  window.scrollTo(0, scrollY + step);
}
function loop(now) {
  if (cleaned) return;
  try {
    stepScroll();
    tweens.forEach(tw => {
      const t = clamp((now - tw.start) / tw.dur, 0, 1);
      tw.fn(tw.ease(t));
      if (t >= 1) { tweens.delete(tw); tw.done(); }
    });
  } catch (e) { fail(e); return; }
  rafId = requestAnimationFrame(loop);
}

/* ---------- target ---------- */
const hasBox = el => { if (!el.getClientRects().length) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
function collect(scope) {
  const cand = Array.from(scope.querySelectorAll(UNIT_SEL + ',' + LEAF_SEL)).filter(el => hasBox(el) && !el.closest('.sr-only'));
  const set = new Set(cand);
  return cand.filter(el => { for (let p = el.parentElement; p && p !== scope; p = p.parentElement) if (set.has(p)) return false; return true; });
}
function kindOf(el) {
  if (/^(IMG|CANVAS|SVG|FIGURE|PICTURE|VIDEO)$/i.test(el.tagName) || el.matches('.p-visual,.tagwrap,.dash-chart')) return 'media';
  if (/^(H[1-6]|P|LI|BLOCKQUOTE)$/.test(el.tagName) || el.matches('.hero-sub,.avail')) return 'text';
  return 'block';
}
function linesOf(el, h) {
  const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 16, lh = parseFloat(cs.lineHeight) || fs * 1.3;
  return Math.max(1, Math.round(h / lh));
}
function shellName(el) {
  if (el.tagName === 'NAV') return 'MENYUSUN · NAVIGASI';
  if (el.tagName === 'HEADER') return 'MENYUSUN · HERO';
  if (el.tagName === 'FOOTER') return 'MENYUSUN · FOOTER';
  return 'MENYUSUN · ' + (el.id || 'BAGIAN').replace(/-/g, ' ').toUpperCase();
}
function prepare() {
  /* fase 1: hanya membaca (tanpa menulis) supaya layout tidak dihitung berulang */
  const paper = getComputedStyle(root).getPropertyValue('--paper').trim() || '#ffffff';
  const list = [document.querySelector('nav'), document.querySelector('.hero'), ...document.querySelectorAll('main > section'), document.querySelector('footer')]
    .filter(el => el && hasBox(el));
  list.forEach(el => {
    const s = { el, name: shellName(el), promise: null, fixed: !!el.closest('nav'), transparent: /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(el).backgroundColor) };
    refresh(s);
    shells.push(s);
    collect(el).forEach(t => {
      const kind = kindOf(t);
      const it = { el: t, kind, shell: s, done: false, fixed: !!t.closest('nav') };
      refresh(it);
      it.lines = kind === 'text' ? linesOf(t, it.h) : 1;
      jobs.push(it);
    });
  });
  /* fase 2: hanya menulis */
  shells.forEach(s => {
    if (s.transparent) s.el.style.backgroundColor = paper;
    s.el.style.visibility = 'hidden';
    s.el.dataset.swarm = '1';
  });
  jobs.forEach(j => { j.el.style.visibility = 'hidden'; j.el.dataset.swarm = '1'; });
  totalUnits = jobs.length + shells.length;
}

/* ---------- geometri + gambar ---------- */
const clampPt = (x, y) => [clamp(x, 10, innerWidth - 28), clamp(y, 10, innerHeight - 86)];
function startPt(it, kind) {
  const g = geo(it);
  const lh = it.h / (it.lines || 1);
  const x = g.l + Math.min(10, g.w * .1);
  const y = kind === 'text' ? g.t + Math.min(lh, 30) * .5 : g.t + Math.min(10, g.h * .1);
  return clampPt(x, y);
}
function paint(it, kind, p) {
  const el = it.el, w = it.w, h = it.h;
  if (p >= 1) { el.style.clipPath = ''; if (kind === 'media') el.style.opacity = ''; return; }
  const m = kind === 'shell' ? 0 : M;
  let clip;
  if (kind === 'shell') clip = 'inset(0px 0px ' + (h - p * h).toFixed(1) + 'px 0px)';
  else if (kind === 'text' && it.lines > 1) {
    /* efek mengetik: baris demi baris, kiri ke kanan */
    const L = it.lines, lh = h / L, lp = p * L, k = Math.min(L - 1, Math.floor(lp)), f = lp - k;
    const yFull = k === 0 ? -m : k * lh, yNext = k === L - 1 ? h + m : (k + 1) * lh, xCur = -m + f * (w + 2 * m);
    clip = 'polygon(' + (-m) + 'px ' + (-m) + 'px,' + (w + m) + 'px ' + (-m) + 'px,' + (w + m) + 'px ' + yFull.toFixed(1) + 'px,' + xCur.toFixed(1) + 'px ' + yFull.toFixed(1) + 'px,' + xCur.toFixed(1) + 'px ' + yNext.toFixed(1) + 'px,' + (-m) + 'px ' + yNext.toFixed(1) + 'px)';
  }
  else if (kind === 'text') clip = 'inset(' + (-m) + 'px ' + (w + m - p * (w + 2 * m)).toFixed(1) + 'px ' + (-m) + 'px ' + (-m) + 'px)';
  else clip = 'inset(' + (-m) + 'px ' + (w + m - p * (w + 2 * m)).toFixed(1) + 'px ' + (h + m - p * (h + 2 * m)).toFixed(1) + 'px ' + (-m) + 'px)';
  el.style.clipPath = clip;
  if (kind === 'media') el.style.opacity = (.35 + .65 * p).toFixed(2);
}

/* ---------- satu aksi: gerak melengkung -> tekan -> seret (+ isi muncul) -> lepas ---------- */
async function build(agent, it, kind) {
  const el = it.el;
  agent.say(LABEL[kind]);
  refresh(it);
  const from = [agent.x, agent.y];
  const tok = ++agent.tok;
  const arcDir = agent.dir = -agent.dir;
  await tween(T.move, easeInOut, t => {
    const s = startPt(it, kind);
    const dx = s[0] - from[0], dy = s[1] - from[1], d = Math.hypot(dx, dy) || 1;
    const arc = Math.min(70, d * .16) * arcDir * Math.sin(Math.PI * t);
    agent.place(lerp(from[0], s[0], t) + (-dy / d) * arc, lerp(from[1], s[1], t) + (dx / d) * arc);
  });
  if (aborted) return;

  el.style.transition = 'none';
  paint(it, kind, 0);
  el.style.visibility = kind === 'shell' ? 'visible' : '';
  const g0 = geo(it), s0 = startPt(it, kind);
  agent.rect(g0.l, g0.t, 0, kind === 'shell' ? 2 : 0, false);
  agent.frame.className = 'sw-frame sw-ui on' + (kind === 'shell' ? ' line' : (kind === 'text' ? ' nodim' : ''));
  agent.down(true);
  ripple(s0[0], s0[1], agent.color, false);
  await tween(T.press, linear, () => { const q = startPt(it, kind); agent.place(q[0], q[1]); });
  if (aborted) return;

  const L = it.lines;
  const dur = kind === 'text'
    ? (L > 1 ? Math.min(320 + L * 120, 1200) : T.textBase + Math.min(it.w, 700) * .2)
    : (kind === 'shell' ? T.shell : T.block);
  await tween(dur, kind === 'text' ? linear : easeInOut, p => {
    const g = geo(it);
    let fw, fh, ft = g.t, cx, cy;
    if (kind === 'text' && L === 1) { fw = p * g.w; fh = g.h; cx = g.l + fw; cy = g.t + Math.min(g.h, 30) * .5; }
    else if (kind === 'text') {
      const lh = g.h / L, lp = p * L, k = Math.min(L - 1, Math.floor(lp)), f = lp - k;
      fw = g.w; fh = Math.min(g.h, (k + 1) * lh); cx = g.l + f * g.w; cy = g.t + (k + .5) * lh;
    }
    else if (kind === 'shell') { fw = g.w; fh = 2; ft = g.t + p * g.h; cx = g.l + 14; cy = g.t + p * g.h; }
    else { fw = p * g.w; fh = p * g.h; cx = g.l + fw; cy = g.t + fh; }
    const c = clampPt(cx, cy);
    agent.place(c[0], c[1]);
    agent.rect(g.l, ft, fw, fh, kind !== 'text' && kind !== 'shell');
    paint(it, kind, p);
  });

  agent.down(false);
  ripple(agent.x, agent.y, agent.color, true);
  el.style.clipPath = ''; el.style.filter = ''; el.style.opacity = ''; el.style.transition = '';
  if (kind !== 'shell') el.style.visibility = '';
  if (kind !== 'shell' && kind !== 'text') {
    const g = geo(it);
    agent.rect(g.l, g.t, g.w, g.h, true);
    agent.frame.classList.add('flash');
    setTimeout(() => { if (agent.tok === tok) agent.frame.classList.remove('on', 'flash'); }, T.flash);
  } else agent.frame.classList.remove('on');
}

function ensureShell(s, agent) {
  if (!s.promise) s.promise = (async () => {
    label.textContent = s.name;
    await build(agent, s, 'shell');
    doneUnits++; setProgress();
  })();
  return s.promise;
}

async function waitInView(it) {
  const t0 = performance.now();
  while (!aborted && performance.now() - t0 < 3000) {
    const g = geo(it);
    if (g.t < innerHeight - 8 && g.t + g.h > 0) return;
    await sleep(30);
  }
}

async function worker(agent, i) {
  await sleep(i * T.stagger);
  if (aborted) return;
  agent.node.classList.add('on');
  while (!aborted && next < jobs.length) {
    const job = jobs[next++];
    await ensureShell(job.shell, agent);
    await waitInView(job);
    if (aborted) break;
    await build(agent, job, job.kind);
    if (aborted) break;
    job.done = true; doneUnits++; setProgress();
  }
}

/* ---------- selesai / lewati / bersih-bersih ---------- */
const lockKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
const blockScroll = e => { e.preventDefault(); };
const onKey = e => {
  if (e.key === 'Escape') { skip(); return; }
  if (lockKeys.indexOf(e.key) > -1 && e.target !== skipBtn) e.preventDefault();
};
function cleanup() {
  if (cleaned) return;
  cleaned = true; aborted = true; following = false;
  cancelAnimationFrame(rafId);
  tweens.forEach(t => t.done()); tweens.clear();
  removeEventListener('wheel', blockScroll); removeEventListener('touchmove', blockScroll); removeEventListener('keydown', onKey);
  document.querySelectorAll('[data-swarm]').forEach(el => {
    el.style.visibility = ''; el.style.clipPath = ''; el.style.filter = ''; el.style.opacity = ''; el.style.transition = ''; el.style.backgroundColor = '';
    delete el.dataset.swarm;
  });
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  agents.forEach(a => { a.node.remove(); a.frame.remove(); });
  document.querySelectorAll('.sw-ripple').forEach(n => n.remove());
  status.remove(); skipBtn.remove();
  root.style.scrollBehavior = '';
  try { history.scrollRestoration = 'auto'; } catch (_) {}
  unlock();
}
function skip() {
  if (cleaned) return;
  window.scrollTo(0, 0);
  cleanup();
}
function fail(e) { try { console.warn('swarm intro dihentikan:', e); } catch (_) {} cleanup(); }

async function finish() {
  following = false;
  doneUnits = totalUnits; setProgress();
  label.textContent = 'SELESAI';
  await sleep(350);
  if (aborted) return;
  const y0 = scrollY;
  if (y0 > 2) {
    const dur = clamp(600 + y0 * .12, 900, 1800);
    await tween(dur, easeInOut, t => window.scrollTo(0, y0 * (1 - t)));
  }
  if (aborted) return;
  agents.forEach(a => { a.down(false); a.node.classList.remove('on'); a.frame.classList.remove('on', 'flash'); });
  status.classList.add('done'); skipBtn.classList.remove('on');
  await sleep(450);
  cleanup();
}

/* tunggu halaman benar-benar siap (font, gambar, grafik) agar animasi tidak patah di awal */
async function ready() {
  const cap = new Promise(r => setTimeout(r, 2500));
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  await Promise.race([Promise.all([loaded, fonts]), cap]);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await sleep(250);
}

async function run() {
  await ready();
  try { history.scrollRestoration = 'manual'; } catch (_) {}
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  prepare();
  root.classList.add('swarm-build-active');
  root.classList.remove('swarm-build-pending');       // semua sudah disembunyikan inline -> layar tetap kosong & gelap
  document.body.appendChild(status);
  document.body.appendChild(skipBtn);
  for (let i = 0; i < AGENTS; i++) { const a = makeAgent(i); agents.push(a); document.body.append(a.frame, a.node); }
  addEventListener('wheel', blockScroll, { passive: false });
  addEventListener('touchmove', blockScroll, { passive: false });
  addEventListener('keydown', onKey);
  setTimeout(() => { if (!cleaned) skip(); }, 90000);   // jaring pengaman

  await sleep(T.blank);                                  // layar benar-benar kosong sebentar
  if (aborted) return;
  status.classList.add('on'); skipBtn.classList.add('on');
  setProgress();
  rafId = requestAnimationFrame(loop);
  await Promise.all(agents.map((a, i) => worker(a, i)));
  if (!aborted) await finish();
}

run().catch(fail);
})();
