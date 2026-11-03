/* =====================================================================
   Studio canvas — situs sebagai berkas desain yang disusun beramai-ramai.
   Tiap bagian = bingkai bernama di atas kanvas bertitik; navbar = toolbar
   melayang; kotak seleksi bergagang dan tag kursor = bahasa visual yang
   sama dengan animasi pembuka. Dimuat setelah portfolio-redesign.css.
   ===================================================================== */
:root{
  --st-canvas:#07050d; --st-frame:#0e0b18; --st-raise:#14101f; --st-raise-2:#1a1528;
  --st-line:rgba(196,181,253,.15); --st-line-2:rgba(196,181,253,.3);
  --st-violet:#8b5cf6; --st-lav:#c4b5fd; --st-mint:#7ee7c0; --st-pink:#f0abfc;
  --st-text:#f4f0ff; --st-mute:#a79dba; --st-pad:clamp(10px,2vw,28px);
  --st-r:clamp(18px,2.2vw,26px);
}
html{background:var(--st-canvas);scrollbar-width:thin;scrollbar-color:#3a2d62 var(--st-canvas);scroll-padding-top:96px}
body{background:transparent;color:var(--st-text);overflow-x:clip}

/* kanvas: titik + cahaya lembut (satu lapis tetap, murah) */
body::before{
  content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
  background:
    radial-gradient(900px 620px at 88% -6%,rgba(139,92,246,.17),transparent 62%),
    radial-gradient(760px 520px at -4% 46%,rgba(91,33,182,.13),transparent 62%),
    radial-gradient(rgba(196,181,253,.2) 1px,transparent 1.35px) 0 0/26px 26px;
  transition:opacity 1.3s ease;
}

/* ---------- bingkai ---------- */
header.hero,main>section,body>footer{
  position:relative;isolation:isolate;
  margin:0 var(--st-pad) clamp(14px,2vw,22px);
  border:1px solid var(--st-line)!important;
  border-radius:var(--st-r);
  background:var(--st-frame)!important;
  overflow:visible!important;
}
.hero::before,.contact::before{border-radius:inherit}

.st-frame-tag{
  position:absolute;left:clamp(16px,2.4vw,30px);top:0;transform:translateY(-50%);z-index:5;
  display:flex;align-items:center;gap:10px;padding:6px 12px 6px 10px;border-radius:9px;
  background:#171222;border:1px solid var(--st-line-2);box-shadow:0 8px 24px rgba(0,0,0,.45);
  font:600 12px/1 var(--body);color:#ece4ff;white-space:nowrap;pointer-events:none;letter-spacing:0
}
.st-frame-tag b{display:inline-flex;align-items:center;gap:8px;font-weight:600}
.st-frame-tag b::before{content:"";width:10px;height:10px;border:1.5px solid var(--st-lav);border-radius:2px;background:linear-gradient(var(--st-lav),var(--st-lav)) center/3px 3px no-repeat}
.st-frame-tag i{font-style:normal;font-weight:500;color:#8f84a6;font-variant-numeric:tabular-nums}
.st-frame-tag i:empty{display:none}

/* ---------- tipografi ---------- */
h1,h2,h3{font-family:var(--display)}
h2{font-size:clamp(30px,4.2vw,56px);line-height:1;letter-spacing:-.05em;font-weight:800;color:#fff}
.lead,.lead-light{color:var(--st-mute);font-size:17px;max-width:58ch}
.link{color:var(--st-lav);text-decoration-thickness:1px;text-decoration-color:rgba(196,181,253,.5);text-underline-offset:5px}
.link:hover{color:#fff;text-decoration-color:#fff}
.rc-label{text-transform:none!important;letter-spacing:0!important;font-size:13px!important;font-weight:600;color:var(--st-lav)!important}

/* ---------- toolbar (navbar) ---------- */
nav{top:0;z-index:30;padding:10px var(--st-pad) 0;background:transparent!important;border:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
nav .wrap{
  position:relative;width:100%;max-width:1180px;height:58px;margin:0 auto;padding:0 10px 0 20px;
  border:1px solid var(--st-line-2);border-radius:16px;background:rgba(14,11,24,.94);
  box-shadow:0 18px 50px -22px rgba(0,0,0,.9)
}
.brand{font-size:18px}
.navlinks{gap:4px;font-size:13.5px;top:calc(100% + 8px)}
.navlinks a{padding:7px 11px;border-radius:9px;transition:background .15s,color .15s}
.navlinks a:not(.cta):hover,.navlinks a.active{background:rgba(196,181,253,.1);color:#fff}
.navlinks .cta{padding:9px 16px;border-radius:10px;font-weight:600;background:var(--st-lav);color:#10091c;margin-left:6px}
.navlinks .cta:hover{background:#fff;color:#10091c}
.navlinks.open{border:1px solid var(--st-line-2);border-radius:16px;background:#0e0b18;padding:14px;box-shadow:0 24px 60px rgba(0,0,0,.6)}
.roleswitch{padding:3px;border:1px solid var(--st-line);border-radius:12px;background:rgba(255,255,255,.04)}
.roleswitch a{border-radius:9px;padding:6px 13px;font-size:13px;color:#b9b0ca}
.roleswitch a[aria-current="true"]{background:var(--st-lav);color:#10091c}
.navtoggle{border-radius:10px}

/* ---------- tombol ---------- */
.btn{border:1px solid transparent;border-radius:12px;padding:13px 22px;font:600 15px/1.2 var(--body);box-shadow:none;transition:transform .12s ease,box-shadow .2s ease,background .2s ease,border-color .2s}
.btn-yellow{background:linear-gradient(180deg,#d4c8ff,#a78bfa);color:#10091c;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 14px 34px -12px rgba(139,92,246,.85)}
.btn-yellow:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 20px 40px -12px rgba(139,92,246,.95)}
.btn-line{background:rgba(196,181,253,.05);border-color:var(--st-line-2);color:#efe9ff}
.btn-line:hover{background:rgba(196,181,253,.14);border-color:var(--st-lav)}
.btn-ink{background:var(--st-raise-2);border-color:var(--st-line-2);color:#efe9ff}
.btn-ink:hover{background:#221b35}
.btn:active{transform:scale(.96);box-shadow:none}

/* ---------- hero: momen yang diingat ---------- */
.hero{
  background:
    radial-gradient(ellipse at 78% 18%,rgba(139,92,246,.26),transparent 40%),
    radial-gradient(ellipse at 6% 96%,rgba(76,29,149,.3),transparent 42%),
    var(--st-frame)!important;
}
.hero::before{background-size:52px 52px;opacity:.5}
h1{font-size:clamp(38px,6.1vw,86px);line-height:.95;letter-spacing:-.058em;font-weight:800;color:#fff}
h1 span:nth-child(2),h1 span:nth-child(3){padding-left:0}
.rolepick-label{text-transform:none!important;letter-spacing:0!important;font-size:13px!important;color:var(--st-mute)!important;font-weight:500}
.rp{border-radius:12px;padding:11px 15px;border:1px solid var(--st-line-2);background:rgba(196,181,253,.04)}
.rp:hover{border-color:var(--st-lav);background:rgba(139,92,246,.14);transform:none}
.rp-title{font-size:15px;color:#fff}
.rp-sub{font-size:12.5px;color:var(--st-mute)}
.rp[aria-current="true"]{background:rgba(139,92,246,.22);border-color:var(--st-lav);box-shadow:0 0 0 3px rgba(139,92,246,.18);color:#fff}
.rp[aria-current="true"] .rp-sub{color:#cfc6e0}
\.hero-sub{font-size:18px;line-height:1.6;max-width:50ch;color:#c9c0da}

/* kotak seleksi di sekeliling judul + tag kursor */
.hero-text h1{position:relative;width:fit-content;max-width:100%}
.hero-text h1::before{content:"";position:absolute;inset:-14px -20px -16px;z-index:-1;border:1px solid var(--st-violet);border-radius:4px;background:rgba(139,92,246,.05);pointer-events:none}
.hero-text h1::after{
  content:"";position:absolute;inset:-18px -24px -20px;pointer-events:none;
  background:
    linear-gradient(#fff,#fff) 0 0/8px 8px no-repeat,
    linear-gradient(#fff,#fff) 100% 0/8px 8px no-repeat,
    linear-gradient(#fff,#fff) 0 100%/8px 8px no-repeat,
    linear-gradient(#fff,#fff) 100% 100%/8px 8px no-repeat
}
h1 .st-cursor{position:absolute;right:-34px;bottom:-54px;display:flex;align-items:flex-start;padding:0;letter-spacing:0;font:600 12px/1 var(--body);pointer-events:none;filter:drop-shadow(0 6px 14px rgba(0,0,0,.55))}
.st-cursor svg{width:20px;height:24px;flex:none}
.st-cursor path{fill:var(--st-lav);stroke:#fff;stroke-width:1.3;stroke-linejoin:round}
.st-cursor em{margin:19px 0 0 -4px;padding:5px 10px;border-radius:7px;background:var(--st-lav);color:#10091c;font-style:normal;font-weight:700}

/* ---------- ringkasan untuk rekruter ---------- */
.rc-grid{grid-template-columns:1.35fr 1fr 1fr;gap:16px}
.rc-card{background:var(--st-raise);border:1px solid var(--st-line);border-radius:18px;box-shadow:none}
.rc-card:first-child{background:linear-gradient(160deg,rgba(139,92,246,.26),rgba(20,16,31,.96) 58%);border-color:rgba(196,181,253,.4)}
.rc-big{font:700 clamp(20px,2.1vw,26px)/1.18 var(--display);letter-spacing:-.035em;color:#fff;margin:12px 0 4px}
.rc-list{list-style:none;padding:0;margin-top:14px;display:grid;gap:9px;font-size:14.5px;line-height:1.55;color:var(--st-mute)}
.rc-list li{position:relative;padding-left:20px;font-size:14.5px;color:var(--st-mute)}
.rc-list li::before{content:"";position:absolute;left:0;top:.6em;width:7px;height:7px;border:0;border-radius:2px;background:var(--st-lav);transform:none}
.rc-link{color:var(--st-lav);font-size:14px;text-decoration-thickness:1px;text-underline-offset:5px}
.rc-link:hover{color:#fff}

/* ---------- tentang ---------- */
.about .wrap{grid-template-columns:minmax(0,5fr) minmax(0,6fr)}
.about h2{position:sticky;top:104px;align-self:start}
.about p{color:var(--st-mute);font-size:17px;line-height:1.7}
.about p strong{color:#fff}
.facts{border-top:1px solid var(--st-line);margin-top:36px}
.facts div{grid-template-columns:140px 1fr;border-bottom:1px solid var(--st-line)}
.facts dt{color:var(--st-lav);font-weight:600}
.facts dd{color:#d2c9e3}

/* ---------- keahlian: tata letak bento ---------- */
.skillgrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}
.skill-card{grid-column:span 2;display:flex;flex-direction:column;background:var(--st-raise);border:1px solid var(--st-line);border-radius:18px;box-shadow:none}
.skill-card:nth-child(1),.skill-card:nth-child(4){grid-column:span 4}
.skill-card:nth-child(5),.skill-card:nth-child(6){grid-column:span 3}
.skill-card:nth-child(1){background:linear-gradient(150deg,rgba(139,92,246,.2),rgba(20,16,31,.96) 60%)}
.skill-card h3{font:700 clamp(19px,1.9vw,24px)/1.18 var(--display);letter-spacing:-.035em;color:#fff}
.skill-card .sk-plain{margin-top:10px;font-size:15px;line-height:1.55;color:var(--st-mute)}
.sk-tools{margin-top:auto;padding-top:18px;gap:7px}
.sk-tools li,.sk-legend li{font-size:12.5px;display:inline-flex;align-items:center;gap:8px;padding:6px 11px;border-radius:7px;color:#e3d9fb}
.sk-tools li::before,.sk-legend li::before{content:"";width:7px;height:7px;border-radius:50%;flex:none;font-size:0}
li.lv-used::before{background:var(--st-lav);box-shadow:0 0 10px rgba(196,181,253,.8)}
li.lv-learn::before{background:linear-gradient(90deg,var(--st-lav) 50%,transparent 50%);border:1px solid var(--st-lav)}
li.lv-now::before{background:transparent;border:1.5px dashed var(--st-mint)}

/* ---------- proyek ---------- */
.project{grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);border-top:1px solid var(--st-line)}
.project:last-child{border-bottom:0}
.project:nth-of-type(even) .p-text{order:2}
.project h3{font-size:clamp(28px,3.6vw,44px);letter-spacing:-.05em;line-height:1.02;color:#fff}
.project p{color:var(--st-mute);font-size:16.5px;line-height:1.65}
.role{color:var(--st-lav)!important;font-size:15px}
.tag-pill{border-radius:7px;font-size:12.5px;padding:5px 11px}
.t-skripsi,.t-bisnis{background:rgba(139,92,246,.24);color:#e4d9ff;border:1px solid rgba(196,181,253,.35)}
.t-magang{background:rgba(126,231,192,.12);color:#a6f0d5;border:1px solid rgba(126,231,192,.3)}
.t-pribadi{background:rgba(240,171,252,.13);color:#f6cffd;border:1px solid rgba(240,171,252,.3)}
.t-lingkungan{background:rgba(126,231,192,.12);color:#a6f0d5;border:1px solid rgba(126,231,192,.3)}
.chips li{font-size:12.5px;padding:5px 11px}

.p-visual{position:relative}
.p-visual::before{content:"";position:absolute;inset:-12px;border:1px dashed rgba(196,181,253,.4);border-radius:10px;pointer-events:none}
.p-visual::after{
  content:"";position:absolute;inset:-16px;pointer-events:none;
  background:
    linear-gradient(#fff,#fff) 0 0/8px 8px no-repeat,
    linear-gradient(#fff,#fff) 100% 0/8px 8px no-repeat,
    linear-gradient(#fff,#fff) 0 100%/8px 8px no-repeat,
    linear-gradient(#fff,#fff) 100% 100%/8px 8px no-repeat
}
.win{background:var(--st-raise);border:1px solid var(--st-line-2);border-radius:16px;box-shadow:0 36px 90px -34px rgba(0,0,0,.9);overflow:hidden}
.win-bar{background:#181223;border-bottom:1px solid var(--st-line);color:#bfb5d2;font-weight:500}
.win-bar i{width:9px;height:9px;border:0;background:var(--st-lav)}
.win-bar i:nth-child(2){background:var(--st-violet)}
.win-bar i:nth-child(3){background:var(--st-mint)}
.hl li{border-bottom:1px solid var(--st-line)}
.hl b{color:#fff;background:linear-gradient(transparent 66%,rgba(139,92,246,.6) 66%)}
.hl span{color:var(--st-mute)}

/* ---------- proses & metode ---------- */
.process{background:#100c1d!important}
.steps button{border-radius:12px;border:1px solid var(--st-line);background:rgba(255,255,255,.03)}
.steps button:hover{background:rgba(196,181,253,.1)}
.steps .n{color:var(--st-lav)}
.steps button[aria-selected="true"]{background:var(--st-lav);border-color:var(--st-lav);color:#10091c}
.steps button[aria-selected="true"] .n{color:#10091c}
.panels{border:1px solid var(--st-line-2);border-radius:18px;background:var(--st-raise)}
.panels .ex{border-left:2px solid var(--st-violet)}

/* ---------- dashboard ---------- */
.dashboards{background:#0b0814!important}
.dash-guide li{border-radius:12px;border-color:var(--st-line);background:rgba(196,181,253,.04)}
.dash-guide b{background:var(--st-lav);color:#10091c}

/* ---------- kontak & footer ---------- */
.contact{
  background:
    radial-gradient(900px 420px at 82% 112%,rgba(139,92,246,.4),transparent 62%),
    radial-gradient(620px 300px at 0% 0%,rgba(76,29,149,.32),transparent 62%),
    var(--st-frame)!important;
}
.contact h2{font-size:clamp(40px,7vw,96px);letter-spacing:-.06em;line-height:.94;max-width:14ch}
.contact p{color:#c9c0da;font-size:18px}
.contact-links a{color:#efe9ff;text-decoration-thickness:1px;text-underline-offset:6px}
.contact-links a:hover{color:var(--st-lav)}
body>footer{padding:26px 0;border-radius:20px;color:var(--st-mute);font-size:14px;margin-bottom:var(--st-pad)}
.totop{border-radius:12px;background:var(--st-lav);color:#10091c}

/* ---------- responsif ---------- */
@media(max-width:1000px){
  .skillgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .skill-card,.skill-card:nth-child(n){grid-column:span 1}
  .skill-card:nth-child(1){grid-column:span 2}
  .rc-grid{grid-template-columns:1fr 1fr}
  .rc-card:first-child{grid-column:1/-1}
}
@media(max-width:900px){
  .hero .wrap{grid-template-columns:1fr}
  .about h2{position:static}
  .hero-text h1::before{inset:-10px -12px -12px}
  .hero-text h1::after{inset:-14px -16px -16px}
}
@media(max-width:860px){
  .project{grid-template-columns:1fr}
  .project:nth-of-type(even) .p-text{order:0}
  .p-visual{margin:12px 12px 0}
}
@media(max-width:700px){
  :root{--st-pad:10px;--st-r:18px}
  nav .wrap{height:54px;padding:0 8px 0 14px}
  .st-frame-tag{font-size:11px;padding:5px 10px 5px 8px}
  .st-frame-tag i{display:none}
  .rc-grid,.skillgrid{grid-template-columns:1fr}
  .skill-card,.skill-card:nth-child(n){grid-column:auto}
  .contact h2{font-size:clamp(36px,11vw,52px)}
}
@media(max-width:520px){
  h1 .st-cursor{display:none}
  .facts div{grid-template-columns:1fr;gap:2px}
}
@media(prefers-reduced-motion:reduce){body::before{transition:none}}
