/* ─── AUTH ─── */
const USERS = [
  { id: 'admin', password: 'admin123', role: 'admin', name: 'Admin' },
  { id: 'cashier', password: 'cash123', role: 'cashier', name: 'Cashier' }
];

function authLogin(id, pass) {
  const user = USERS.find(u => u.id === id && u.password === pass);
  if (user) {
    sessionStorage.setItem('pos_user', JSON.stringify({ id: user.id, role: user.role, name: user.name }));
    return user;
  }
  return null;
}

function authLogout() {
  sessionStorage.removeItem('pos_user');
  window.location.href = 'index.html';
}

function authGetUser() {
  const raw = sessionStorage.getItem('pos_user');
  return raw ? JSON.parse(raw) : null;
}

function authGuard(allowedRoles) {
  const user = authGetUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = user.role === 'cashier' ? 'sell.html' : 'dashboard.html';
    return null;
  }
  return user;
}

/* ─── THEME ─── */
(function applyThemeEarly() {
  const saved = localStorage.getItem('pos_theme') || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light-early');
})();

function initTheme() {
  const saved = localStorage.getItem('pos_theme') || 'dark';
  if (saved === 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  document.documentElement.classList.remove('light-early');
  updateThemeToggle(saved === 'light');
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('pos_theme', isLight ? 'light' : 'dark');
  updateThemeToggle(isLight);
}

function updateThemeToggle(isLight) {
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon)  icon.textContent  = isLight ? '☀️' : '🌙';
  if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
}

/* ─── SIDEBAR ─── */
function buildSidebar(user) {
  const adminLinks = user.role === 'admin' ? `
    <a class="nav-link" href="dashboard.html" id="nav-dashboard"><span class="icon">🏠</span> Dashboard</a>
    <a class="nav-link" href="list.html"      id="nav-list"><span class="icon">📦</span> Inventory</a>
    <a class="nav-link" href="sales.html"     id="nav-sales"><span class="icon">📊</span> Sales Report</a>
  ` : '';
  const cashierLinks = `<a class="nav-link" href="sell.html" id="nav-sell"><span class="icon">🧾</span> Point of Sale</a>`;

  document.getElementById('sidebarNav').innerHTML = `
    <div class="nav-label">Navigation</div>${adminLinks}${cashierLinks}`;

  /* Mark active link */
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'dashboard';
  const activeEl = document.getElementById(`nav-${page}`) ||
                   document.getElementById('nav-dashboard');
  if (activeEl) activeEl.classList.add('active');

  /* User info */
  const sidebarUser = document.getElementById('sidebarUser');
  if (sidebarUser) {
    sidebarUser.innerHTML = `
      <div class="user-badge">
        <div class="user-avatar ${user.role}">${user.name[0]}</div>
        <div class="user-info"><strong>${user.name}</strong><span>${user.role}</span></div>
        <button class="logout-btn" onclick="authLogout()" title="Logout">⏻</button>
      </div>`;
  }

  initTheme();
  initTopbarDate();
  _initSidebar();
}

function _initSidebar() {
  const sidebar  = document.querySelector('.sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay  = document.getElementById('sidebarOverlay');
  if (!sidebar || !hamburger || !overlay) return;

  /* Remove any old listeners by cloning the hamburger */
  const newHamburger = hamburger.cloneNode(true);
  hamburger.parentNode.replaceChild(newHamburger, hamburger);

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    newHamburger.classList.add('open');
    overlay.style.cssText = 'display:block;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;';
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    newHamburger.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  newHamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    sidebar.classList.contains('mobile-open') ? closeSidebar() : openSidebar();
  });

  /* Expose globally so other page scripts can close the sidebar */
  window._closeSidebar = closeSidebar;

  overlay.addEventListener('click', closeSidebar);

  /* Close sidebar when nav link clicked */
  document.querySelectorAll('#sidebarNav .nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const current = window.location.pathname.split('/').pop();
      if (!href || href === current) e.preventDefault();
      closeSidebar();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSidebar();
  });
}

/* ─── DATE ─── */
function formatTopbarDate() {
  const now = new Date();
  const w = window.innerWidth;
  if (w <= 400) return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (w <= 600) return now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function initTopbarDate() {
  const el = document.getElementById('topbarDate');
  if (!el) return;
  el.textContent = formatTopbarDate();
  window.addEventListener('resize', () => { el.textContent = formatTopbarDate(); });
}


let _toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(_toastTimer);
  el.className = type;
  el.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span>${msg}</span>`;
  el.offsetHeight; // force reflow
  el.classList.add('show');
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ─── DATA ─── */
function getProducts() { return JSON.parse(localStorage.getItem('pos_products')) || []; }
function saveProducts(p) { localStorage.setItem('pos_products', JSON.stringify(p)); }
function getSales()    { return JSON.parse(localStorage.getItem('pos_sales'))    || []; }
function saveSales(s)  { localStorage.setItem('pos_sales',    JSON.stringify(s)); }
