/* ─── AUTH MODULE ─── */
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
  window.location.href = 'login.html';
}

function authGetUser() {
  const raw = sessionStorage.getItem('pos_user');
  return raw ? JSON.parse(raw) : null;
}

function authGuard(allowedRoles) {
  const user = authGetUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = user.role === 'cashier' ? 'sell.html' : 'dashboard.html';
    return null;
  }
  return user;
}

/* ─── THEME — apply IMMEDIATELY before any paint ─── */
(function applyThemeEarly() {
  const saved = localStorage.getItem('pos_theme') || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light-early');
})();

function initTheme() {
  const saved = localStorage.getItem('pos_theme') || 'dark';
  if (saved === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
  document.documentElement.classList.remove('light-early');
  updateThemeToggle(saved === 'light');
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('pos_theme', isLight ? 'light' : 'dark');
  updateThemeToggle(isLight);
}

function updateThemeToggle(isLight) {
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon) icon.textContent = isLight ? '☀️' : '🌙';
  if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
}

/* ─── MOBILE SIDEBAR ─── */
function initMobileSidebar() {
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.getElementById('hamburger');

  if (!overlay || !sidebar || !hamburger) return;

  hamburger.addEventListener('click', () => {
    const open = sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active', open);
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.getElementById('hamburger');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
  if (hamburger) hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

function renderSidebarUser(user) {
  const el = document.getElementById('sidebarUser');
  if (!el) return;
  el.innerHTML = `
    <div class="user-badge">
      <div class="user-avatar ${user.role}">${user.name[0]}</div>
      <div class="user-info">
        <strong>${user.name}</strong>
        <span>${user.role}</span>
      </div>
      <button class="logout-btn" onclick="authLogout()" title="Logout">⏻</button>
    </div>
  `;
}

function buildSidebar(user) {
  const adminLinks = user.role === 'admin' ? `
    <a class="nav-link" href="dashboard.html" id="nav-dashboard" onclick="closeMobileSidebar()">
      <span class="icon">🏠</span> Dashboard
    </a>
    <a class="nav-link" href="list.html" id="nav-list" onclick="closeMobileSidebar()">
      <span class="icon">📦</span> Inventory
    </a>
    <a class="nav-link" href="sales.html" id="nav-sales" onclick="closeMobileSidebar()">
      <span class="icon">📊</span> Sales Report
    </a>
  ` : '';

  const cashierLinks = `
    <a class="nav-link" href="sell.html" id="nav-sell" onclick="closeMobileSidebar()">
      <span class="icon">🧾</span> Point of Sale
    </a>
  `;

  document.getElementById('sidebarNav').innerHTML = `
    <div class="nav-label">Navigation</div>
    ${adminLinks}
    ${cashierLinks}
  `;

  // Mark active link
  const page = window.location.pathname.split('/').pop().replace('.html','');
  let activeEl = document.getElementById(`nav-${page}`);
  if (!activeEl && page === 'sell') activeEl = document.getElementById('nav-sell');
  if (activeEl) activeEl.classList.add('active');

  renderSidebarUser(user);

  // Theme must be initialised BEFORE sidebar is rendered
  // but also call here to sync toggle UI state
  initTheme();
  initMobileSidebar();
}

/* ─── TOAST ─── */
let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.className = type;
  const icon = type === 'success' ? '✓' : '✕';
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  el.offsetHeight; // force reflow
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ─── DATA HELPERS ─── */
function getProducts() { return JSON.parse(localStorage.getItem('pos_products')) || []; }
function saveProducts(p) { localStorage.setItem('pos_products', JSON.stringify(p)); }
function getSales() { return JSON.parse(localStorage.getItem('pos_sales')) || []; }
function saveSales(s) { localStorage.setItem('pos_sales', JSON.stringify(s)); }
