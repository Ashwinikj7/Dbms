
// ── Pulse of Hope Shared Nav, Footer & Styles ──
function injectStyles() {
  if (document.getElementById('bl-styles')) return;
  const style = document.createElement('style');
  style.id = 'bl-styles';
  style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --red:#dc2626;--red-dark:#b91c1c;--red-light:#ef4444;
  --red-pale:#fff1f1;--red-muted:rgba(220,38,38,0.08);
  --green:#10b981;--yellow:#f59e0b;--blue:#3b82f6;
  --dark:#111827;--gray:#6b7280;--gray2:#9ca3af;
  --light:#f9fafb;--border:#e5e7eb;--white:#fff;
  --font:'Nunito',sans-serif;--font-display:'Playfair Display',serif;
  --shadow:0 4px 20px rgba(0,0,0,0.08);--shadow-red:0 8px 32px rgba(220,38,38,0.18);
  --r:12px;--r-sm:8px;--r-lg:20px;--t:all 0.2s ease;
}
html{scroll-behavior:smooth;}
body{font-family:var(--font);background:var(--light);color:var(--dark);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased;}
a{text-decoration:none;color:inherit;}
input,select,textarea{font-family:var(--font);font-size:14px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-sm);color:var(--dark);padding:11px 14px;width:100%;transition:var(--t);outline:none;}
input:focus,select:focus,textarea:focus{border-color:var(--red);box-shadow:0 0 0 3px rgba(220,38,38,0.10);}
input::placeholder,textarea::placeholder{color:#d1d5db;}
select option{background:var(--white);color:var(--dark);}
label{display:block;font-size:11.5px;font-weight:700;color:var(--gray);margin-bottom:5px;letter-spacing:0.05em;text-transform:uppercase;}
.bl-nav{position:fixed;top:0;left:0;right:0;z-index:9999;height:64px;background:var(--white);border-bottom:1.5px solid var(--border);box-shadow:0 1px 8px rgba(0,0,0,0.06);}
.bl-nav-inner{max-width:1280px;margin:0 auto;height:100%;display:flex;align-items:center;padding:0 28px;gap:4px;}
.bl-brand{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--red);margin-right:16px;display:flex;align-items:center;gap:8px;white-space:nowrap;text-decoration:none;}
.bl-nav-links{display:flex;align-items:center;gap:2px;flex:1;}
.bl-nav-link{padding:7px 11px;border-radius:var(--r-sm);font-size:13px;font-weight:700;color:var(--gray);transition:var(--t);display:flex;align-items:center;gap:5px;white-space:nowrap;text-decoration:none;}
.bl-nav-link:hover{color:var(--red);background:var(--red-muted);}
.bl-nav-link.active{color:var(--red);background:var(--red-pale);}
.bl-nav-end{margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0;}
.bl-user-chip{display:flex;align-items:center;gap:7px;padding:5px 12px;border-radius:99px;background:var(--red-pale);border:1.5px solid rgba(220,38,38,0.15);font-size:12px;font-weight:700;color:var(--red);white-space:nowrap;}
.bl-user-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex-shrink:0;animation:blink 2s infinite;}
.bl-logout{display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:var(--r-sm);font-size:13px;font-weight:700;color:var(--gray);transition:var(--t);cursor:pointer;text-decoration:none;white-space:nowrap;}
.bl-logout:hover{color:var(--red);background:var(--red-muted);}
.bl-hamburger{display:none;background:transparent;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:20px;color:var(--gray);cursor:pointer;padding:5px 9px;line-height:1;}
.bl-mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;background:var(--white);border-bottom:1.5px solid var(--border);padding:10px;z-index:9998;box-shadow:0 4px 12px rgba(0,0,0,0.08);}
.bl-mobile-menu.open{display:flex;flex-direction:column;gap:3px;}
.bl-mobile-link{padding:10px 14px;border-radius:var(--r-sm);font-size:14px;font-weight:700;color:var(--gray);display:flex;align-items:center;gap:8px;text-decoration:none;transition:var(--t);}
.bl-mobile-link:hover,.bl-mobile-link.active{color:var(--red);background:var(--red-pale);}
.bl-footer{background:var(--dark);color:rgba(255,255,255,0.7);margin-top:80px;}
.bl-footer-inner{max-width:1280px;margin:0 auto;padding:52px 28px 40px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;}
.bl-footer-logo{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:8px;}
.bl-footer p{font-size:13.5px;line-height:1.7;}
.bl-footer-col{display:flex;flex-direction:column;gap:10px;}
.bl-footer-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);margin-bottom:4px;}
.bl-footer-col a,.bl-footer-col span{font-size:13.5px;color:rgba(255,255,255,0.6);transition:var(--t);display:flex;align-items:center;gap:7px;text-decoration:none;}
.bl-footer-col a:hover{color:#fff;}
.bl-footer-bottom{max-width:1280px;margin:0 auto;padding:18px 28px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:rgba(255,255,255,0.35);flex-wrap:wrap;gap:8px;}
.page-wrap{max-width:1280px;margin:0 auto;padding:40px 28px;padding-top:104px;}
.section-head{margin-bottom:32px;}
.section-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--red);margin-bottom:8px;}
.section-title{font-family:var(--font-display);font-size:2rem;font-weight:700;color:var(--dark);line-height:1.2;}
.section-sub{font-size:14px;color:var(--gray);margin-top:6px;}
.hero{background:linear-gradient(135deg,var(--red) 0%,var(--red-dark) 100%);color:#fff;padding:80px 28px 64px;margin-top:64px;}
.hero-inner{max-width:1280px;margin:0 auto;}
.hero h1{font-family:var(--font-display);font-size:3rem;font-weight:700;margin-bottom:14px;line-height:1.15;}
.hero p{font-size:16px;opacity:0.85;margin-bottom:28px;max-width:520px;}
.card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-lg);padding:24px;transition:var(--t);}
.card:hover{box-shadow:var(--shadow);transform:translateY(-2px);}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:var(--r-sm);font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;border:none;transition:var(--t);white-space:nowrap;text-decoration:none;}
.btn-red{background:var(--red);color:#fff;}
.btn-red:hover{background:var(--red-dark);transform:translateY(-1px);box-shadow:var(--shadow-red);}
.btn-outline{background:transparent;color:var(--dark);border:1.5px solid var(--border);}
.btn-outline:hover{border-color:var(--red);color:var(--red);background:var(--red-muted);}
.btn-green{background:rgba(16,185,129,0.1);color:var(--green);border:1.5px solid rgba(16,185,129,0.25);}
.btn-green:hover{background:var(--green);color:#fff;}
.btn-blue{background:rgba(59,130,246,0.1);color:var(--blue);border:1.5px solid rgba(59,130,246,0.25);}
.btn-blue:hover{background:var(--blue);color:#fff;}
.btn-lg{padding:14px 28px;font-size:15px;border-radius:var(--r);}
.btn-sm{padding:7px 14px;font-size:12px;}
.btn-full{width:100%;justify-content:center;}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;}
.badge-red{background:rgba(220,38,38,0.1);color:var(--red);border:1px solid rgba(220,38,38,0.2);}
.badge-green{background:rgba(16,185,129,0.1);color:var(--green);border:1px solid rgba(16,185,129,0.2);}
.badge-yellow{background:rgba(245,158,11,0.1);color:var(--yellow);border:1px solid rgba(245,158,11,0.2);}
.badge-blue{background:rgba(59,130,246,0.1);color:var(--blue);border:1px solid rgba(59,130,246,0.2);}
.badge-gray{background:#f3f4f6;color:var(--gray);border:1px solid var(--border);}
.form-group{margin-bottom:16px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.divider{height:1px;background:var(--border);margin:20px 0;}
.table-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:13.5px;}
thead tr{border-bottom:2px solid var(--border);}
th{padding:11px 14px;text-align:left;font-size:11px;font-weight:800;color:var(--gray);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;}
td{padding:13px 14px;border-bottom:1px solid #f3f4f6;vertical-align:middle;}
tbody tr:hover{background:#fafafa;}
tbody tr:last-child td{border-bottom:none;}
.blood-pill{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9px;background:var(--red-pale);border:1px solid rgba(220,38,38,0.18);font-size:11px;font-weight:800;color:var(--red);flex-shrink:0;}
.live-dot{display:inline-block;width:8px;height:8px;background:var(--green);border-radius:50%;animation:blink 2s infinite;margin-right:4px;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
.progress-track{height:8px;background:#f3f4f6;border-radius:99px;overflow:hidden;margin-top:8px;}
.progress-fill{height:100%;border-radius:99px;transition:width 0.8s ease;}
.sql-hint{background:#eff6ff;border:1px solid #bfdbfe;border-radius:var(--r-sm);padding:10px 14px;font-size:12px;color:#1e40af;font-weight:600;margin-bottom:16px;font-family:monospace;word-break:break-all;}
.filter-bar{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-lg);padding:18px 22px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:22px;}
.filter-bar .form-group{margin:0;min-width:130px;flex:1;}
@media(max-width:1024px){.bl-footer-inner{grid-template-columns:1fr 1fr;}}
@media(max-width:768px){
  .bl-nav-links{display:none;}
  .bl-hamburger{display:block;}
  .form-row,.form-row-3{grid-template-columns:1fr;}
  .hero h1{font-size:2rem;}
  .bl-footer-inner{grid-template-columns:1fr;gap:28px;}
  .page-wrap{padding:88px 16px 40px;}
  .hero{padding:64px 16px 48px;}
  .bl-nav-inner{padding:0 16px;}
}
  `;
  document.head.appendChild(style);
}

function injectNav() {
  const role = sessionStorage.getItem('bl_role') || '';
  const name = sessionStorage.getItem('bl_name') || 'User';
  const page = window.location.pathname.split('/').pop() || 'home.html';
  const links = [
    {href:'home.html',      icon:'🏠', label:'Home'},
    {href:'emergency.html', icon:'🚨', label:'Emergency'},
    {href:'hospitals.html', icon:'🏥', label:'Hospitals'},
    {href:'storage.html',   icon:'💉', label:'Blood Storage'},
    {href:'donors.html',    icon:'🩸', label:'Donors'},
    {href:'contact.html',   icon:'📞', label:'Contact'},
  ];
  const nav = document.createElement('nav');
  nav.className = 'bl-nav';
  nav.innerHTML = `
    <div class="bl-nav-inner">
      <a href="home.html" class="bl-brand">🩸 Pulse of Hope</a>
      <div class="bl-nav-links">
        ${links.map(l=>`<a href="${l.href}" class="bl-nav-link ${page===l.href?'active':''}">${l.icon} ${l.label}</a>`).join('')}
      </div>
      <div class="bl-nav-end">
        <div class="bl-user-chip">
          <span class="bl-user-dot"></span>
          <span>${name}</span>
          <span style="font-size:10px;background:rgba(220,38,38,0.15);padding:2px 7px;border-radius:99px;text-transform:uppercase;">${role}</span>
        </div>
        <a href="index.html" class="bl-logout" onclick="sessionStorage.clear()">⇤ Logout</a>
        <button class="bl-hamburger" onclick="document.getElementById('blMobile').classList.toggle('open')">☰</button>
      </div>
    </div>`;
  const mob = document.createElement('div');
  mob.className = 'bl-mobile-menu'; mob.id = 'blMobile';
  mob.innerHTML = links.map(l=>`<a href="${l.href}" class="bl-mobile-link ${page===l.href?'active':''}">${l.icon} ${l.label}</a>`).join('')
    + `<a href="index.html" class="bl-mobile-link" onclick="sessionStorage.clear()">⇤ Logout</a>`;
  document.body.insertBefore(mob, document.body.firstChild);
  document.body.insertBefore(nav, document.body.firstChild);

  const footer = document.createElement('footer');
  footer.className = 'bl-footer';
  footer.innerHTML = `
    <div class="bl-footer-inner">
      <div>
        <div class="bl-footer-logo">🩸 Pulse of Hope</div>
        <p>Smart Blood Donor Management System — connecting donors, hospitals and patients intelligently across Karnataka.</p>
        <p style="margin-top:8px;font-size:12px;opacity:0.5;">DBMS Project · NMAMIT Nitte · 2026</p>
      </div>
      <div class="bl-footer-col">
        <div class="bl-footer-title">Pages</div>
        ${links.map(l=>`<a href="${l.href}">${l.icon} ${l.label}</a>`).join('')}
      </div>
      <div class="bl-footer-col">
        <div class="bl-footer-title">Blood Groups</div>
        <span>A+, A−, B+, B−</span><span>O+, O−, AB+, AB−</span>
        <span style="font-size:12px;opacity:0.5;">O− = Universal Donor</span>
      </div>
      <div class="bl-footer-col">
        <div class="bl-footer-title">Emergency</div>
        <a href="tel:108">📞 108 — Ambulance</a>
        <a href="mailto:support@Pulse of Hope.in">✉️ support@Pulse of Hope.in</a>
        <span>📍 Karkala, Karnataka — 574110</span>
        <span style="font-size:12px;opacity:0.5;">Available 24 × 7</span>
      </div>
    </div>
    <div class="bl-footer-bottom">
      <span>© 2026 Pulse of Hope. Built for DBMS Project at NMAMIT Nitte.</span>
      <span>Made with ❤️ by Anvitha · Ashwini · Ashitha</span>
    </div>`;
  document.body.appendChild(footer);
}

function authGuard() {
  if (!sessionStorage.getItem('bl_role')) {
    window.location.href = 'index.html';
  }
}
