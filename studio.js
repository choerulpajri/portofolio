/* Studio canvas: memberi tiap bagian halaman label nama (seperti nama frame di aplikasi desain).
   Murni dekoratif (aria-hidden); judul asli tetap h2 di dalam bagian. */
(() => {
'use strict';
const NAMES = { top: 'Beranda', ringkasan: 'Ringkasan', tentang: 'Tentang', keahlian: 'Keahlian', 'keahlian-data': 'Keahlian', proyek: 'Proyek', dashboard: 'Dashboard', analisis: 'Analisis', proses: 'Proses', metode: 'Metode', kontak: 'Kontak' };
document.querySelectorAll('header.hero, main > section, body > footer').forEach(el => {
  const tag = document.createElement('div');
  tag.className = 'st-frame-tag';
  tag.setAttribute('aria-hidden', 'true');
  const name = document.createElement('b');
  name.textContent = NAMES[el.id] || (el.tagName === 'FOOTER' ? 'Footer' : 'Bagian');
  tag.appendChild(name);
  el.insertBefore(tag, el.firstChild);
});
})();
