/* Swarm Build v2
   Layar gelap kosong -> beberapa kursor menyeret, menekan, dan menyusun halaman
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

const M = 16;                                   // margin clip supaya bayangan/outline tidak terpotong
const COLORS = ['#c4b5fd', '#7ee7c0', '#f0abfc', '#fcd34d'];
const LABEL = { shell: 'MEMBUAT BAGIAN', text: 'MENULIS TEKS', media: 'MENAMPILKAN GAMBAR', block: 'MEMBANGUN LAYOUT' };
const AGENTS = innerWidth < 700 ? 3 : 4;

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
let totalUnits = 0, doneUnits = 0, speed = 1, head = 0, next = 0, rafId = 0;

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
  const a = {
    color: c, node, frame, tag: node.querySelector('.sw-tag'), x: 0, y: 0,
    place(x, y) { a.x = x; a.y = y; node.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; },
    say(t) { a.tag.textContent = t; },
    down(b) { node.classList.toggle('is-down', b); },
    rect(x, y, w, h) {
      frame.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      frame.style.width = Math.max(0, w).toFixed(1) + 'px';
      frame.style.height = Math.max(0, h).toFixed(1) + 'px';
    }
  };
  a.place(innerWidth * (.18 + .2 * i), -40);
  return a;
}

function ripple(x, y, c, big) {
  const d = ui('div', 'sw-ripple');
  d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.setProperty('--c', c);
  document.body.appendChild(d);
  const k = d.animate([
    { transform: 'translate(-50%,-50%) scale(.2)', opacity: .95 },
    { transform: 'translate(-50%,-50%) scale(' + (big ? 3.2 : 2.3) + ')', opacity: 0 }
  ], { duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)' });
  k.onfinish = k.oncancel = () => d.remove();
}

/* ---------- loop animasi + auto-scroll ---------- */
const tweens = new Set();
function tween(dur, ease, fn, fixed) {
  return new Promise(res => {
    if (aborted) { res(); return; }
    tweens.add({ start: performance.now(), dur: Math.max(16, fixed ? dur : dur / speed), ease, fn, done: res });
  });
}
function stepScroll() {
  if (!following) return;
  while (head < jobs.length && jobs[head].done) head++;
  const j = jobs[head];
  if (!j) return;
  const max = Math.max(0, root.scrollHeight - innerHeight);
  const top = j.el.getBoundingClientRect().top;
  const anchor = innerHeight * .28;
  if (top <= anchor) return;
  const desired = clamp(scrollY + top - anchor, 0, max);
  const diff = desired - scrollY;
  if (Math.abs(diff) < .5) return;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), Math.max(2, Math.min(44, Math.abs(diff) * .14)));
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
const hasBox = el => { const r = el.getBoundingClientRect(); return el.getClientRects().length > 0 && r.width > 0 && r.height > 0; };
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
  const paper = getComputedStyle(root).getPropertyValue('--paper').trim() || '#ffffff';
  const list = [document.querySelector('nav'), document.querySelector('.hero'), ...document.querySelectorAll('main > section'), document.querySelector('footer')]
    .filter(el => el && hasBox(el));
  list.forEach(el => {
    const s = { el, name: shellName(el), promise: null, paper: false };
    const bg = getComputedStyle(el).backgroundColor;
    if (/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { el.style.backgroundColor = paper; s.paper = true; }
    el.style.visibility = 'hidden';
    el.dataset.swarm = '1';
    shells.push(s);
    collect(el).forEach(t => {
      t.style.visibility = 'hidden';
      t.dataset.swarm = '1';
      jobs.push({ el: t, kind: kindOf(t), shell: s, done: false });
    });
  });
  totalUnits = jobs.length + shells.length;
  speed = clamp(totalUnits / 120, 1, 1.4);
}

/* ---------- geometri + gambar ---------- */
const measure = el => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; };
const clampPt = (x, y) => [clamp(x, 10, innerWidth - 28), clamp(y, 10, innerHeight - 86)];
function startPt(el, kind) {
  const g = measure(el);
  const x = g.l + Math.min(10, g.w * .1);
  const y = kind === 'text' ? g.t + Math.min(g.h, 28) * .5 : g.t + Math.min(10, g.h * .1);
  return clampPt(x, y);
}
function paint(el, kind, p, g, multi) {
  const m = kind === 'shell' ? 0 : M;
  let right = -m, bottom = -m;
  if (kind === 'shell') bottom = g.h - p * g.h;
  else if (kind === 'text' && !multi) right = g.w + m - p * (g.w + 2 * m);
  else if (kind === 'text') bottom = g.h + m - p * (g.h + 2 * m);
  else { right = g.w + m - p * (g.w + 2 * m); bottom = g.h + m - p * (g.h + 2 * m); }
  el.style.clipPath = 'inset(' + (-m) + 'px ' + right.toFixed(1) + 'px ' + bottom.toFixed(1) + 'px ' + (-m) + 'px)';
  if (kind === 'media') el.style.filter = 'blur(' + ((1 - p) * 6).toFixed(1) + 'px) brightness(' + (1 + (1 - p) * .6).toFixed(2) + ')';
}

/* ---------- satu aksi: gerak -> tekan -> seret (+ isi muncul) -> lepas ---------- */
async function build(agent, el, kind, multi) {
  agent.say(LABEL[kind]);
  const from = [agent.x, agent.y];
  await tween(150, easeOut, t => { const s = startPt(el, kind); agent.place(lerp(from[0], s[0], t), lerp(from[1], s[1], t)); });
  if (aborted) return;

  const g0 = measure(el);
  el.style.transition = 'none';
  paint(el, kind, 0, g0, multi);
  el.style.visibility = kind === 'shell' ? 'visible' : '';
  const s0 = startPt(el, kind);
  agent.rect(g0.l, kind === 'shell' ? g0.t : g0.t, 0, kind === 'shell' ? 2 : 0);
  agent.frame.className = 'sw-frame sw-ui on' + (kind === 'shell' ? ' line' : '');
  agent.down(true);
  ripple(s0[0], s0[1], agent.color, false);
  await tween(60, linear, () => { const q = startPt(el, kind); agent.place(q[0], q[1]); });
  if (aborted) return;

  const dur = kind === 'text' ? 165 + Math.min(g0.w, 700) * .14 : (kind === 'shell' ? 290 : 240);
  await tween(dur, easeInOut, p => {
    const g = measure(el);
    let fw, fh, ft = g.t, cx, cy;
    if (kind === 'text' && !multi) { fw = p * g.w; fh = g.h; cx = g.l + fw; cy = g.t + Math.min(g.h, 28) * .5; }
    else if (kind === 'text') { fw = g.w; fh = p * g.h; cx = g.l + p * g.w; cy = g.t + fh; }
    else if (kind === 'shell') { fw = g.w; fh = 2; ft = g.t + p * g.h; cx = g.l + 14; cy = g.t + p * g.h; }
    else { fw = p * g.w; fh = p * g.h; cx = g.l + fw; cy = g.t + fh; }
    const c = clampPt(cx, cy);
    agent.place(c[0], c[1]);
    agent.rect(g.l, ft, fw, fh);
    paint(el, kind, p, g, multi);
  });

  agent.down(false);
  ripple(agent.x, agent.y, agent.color, true);
  agent.frame.classList.remove('on');
  el.style.clipPath = ''; el.style.filter = ''; el.style.transition = '';
  if (kind !== 'shell') el.style.visibility = '';
}

function ensureShell(s, agent) {
  if (!s.promise) s.promise = (async () => {
    label.textContent = s.name;
    await build(agent, s.el, 'shell', false);
    doneUnits++; setProgress();
  })();
  return s.promise;
}

async function waitInView(el) {
  const t0 = performance.now();
  while (!aborted && performance.now() - t0 < 1200) {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight - 8 && r.bottom > 0) return;
    await sleep(24);
  }
}

async function worker(agent, i) {
  await sleep(i * 160);
  if (aborted) return;
  agent.node.classList.add('on');
  while (!aborted && next < jobs.length) {
    const job = jobs[next++];
    await ensureShell(job.shell, agent);
    await waitInView(job.el);
    if (aborted) break;
    const g = measure(job.el);
    const multi = job.kind === 'text' && linesOf(job.el, g.h) > 1;
    await build(agent, job.el, job.kind, multi);
    if (aborted) break;
    job.done = true; doneUnits++; setProgress();
  }
}

/* ---------- selesai / lewati / bersih-bersih ---------- */
const lockKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
const blockScroll = e => { e.preventDefault(); };
const onKey = e => {
  if (e.key === 'Escape') { skip(); return; }
  if (lockKeys.indexOf(e.key) > -1 && !(e.target && e.target === skipBtn)) e.preventDefault();
};
function cleanup() {
  if (cleaned) return;
  cleaned = true; aborted = true; following = false;
  cancelAnimationFrame(rafId);
  tweens.forEach(t => t.done()); tweens.clear();
  removeEventListener('wheel', blockScroll); removeEventListener('touchmove', blockScroll); removeEventListener('keydown', onKey);
  document.querySelectorAll('[data-swarm]').forEach(el => {
    el.style.visibility = ''; el.style.clipPath = ''; el.style.filter = ''; el.style.transition = ''; el.style.backgroundColor = '';
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
  await sleep(150);
  if (aborted) return;
  const y0 = scrollY;
  if (y0 > 2) await tween(clamp(260 + y0 * .1, 350, 900), easeInOut, t => window.scrollTo(0, y0 * (1 - t)), true);
  if (aborted) return;
  agents.forEach(a => { a.down(false); a.node.classList.remove('on'); a.frame.classList.remove('on'); });
  status.classList.add('done'); skipBtn.classList.remove('on');
  await sleep(380);
  cleanup();
}

async function run() {
  history.scrollRestoration = 'manual';
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
  setTimeout(() => { if (!cleaned) skip(); }, 40000);   // jaring pengaman

  await sleep(520);                                      // layar benar-benar kosong sebentar
  if (aborted) return;
  status.classList.add('on'); skipBtn.classList.add('on');
  setProgress();
  rafId = requestAnimationFrame(loop);
  await Promise.all(agents.map((a, i) => worker(a, i)));
  if (!aborted) await finish();
}

run().catch(fail);
})();
