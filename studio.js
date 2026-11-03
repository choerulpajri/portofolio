/* Studio canvas: menambahkan nama bingkai + ukuran (seperti di aplikasi desain)
   dan tag kursor kecil di judul hero. Murni dekoratif (aria-hidden). */
(() => {
'use strict';
const NAMES = { top: 'Beranda', ringkasan: 'Ringkasan', tentang: 'Tentang', keahlian: 'Keahlian', 'keahlian-data': 'Keahlian', proyek: 'Proyek', dashboard: 'Dashboard', analisis: 'Analisis', proses: 'Proses', metode: 'Metode', kontak: 'Kontak' };
const frames = Array.from(document.querySelectorAll('header.hero, main > section, body > footer'));
const dims = new Map();

frames.forEach(el => {
  const tag = document.createElement('div');
  tag.className = 'st-frame-tag';
  tag.setAttribute('aria-hidden', 'true');
  const name = document.createElement('b');
  name.textContent = NAMES[el.id] || (el.tagName === 'FOOTER' ? 'Footer' : 'Bagian');
  const size = document.createElement('i');
  tag.append(name, size);
  el.insertBefore(tag, el.firstChild);
  dims.set(el, size);
});

const update = el => {
  const w = el.offsetWidth, h = el.offsetHeight;
  if (w && h) dims.get(el).textContent = w + ' × ' + h;
};
if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(list => list.forEach(e => update(e.target)));
  frames.forEach(f => ro.observe(f));
} else {
  addEventListener('resize', () => frames.forEach(update));
}
frames.forEach(update);

const cursorHTML = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M1.5 1.2V19l4.8-4.4 3.3 7.4 3.4-1.4-3.2-7.3h6.7z"/></svg><em>Choerul</em>';
document.querySelectorAll('.hero-text h1').forEach(h => {
  const s = document.createElement('span');
  s.className = 'st-cursor';
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = cursorHTML;
  h.appendChild(s);
});
})();
