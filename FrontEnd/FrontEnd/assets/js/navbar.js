(function () {
  const links = [
    { file: 'index.html', key: 'home', text: 'Inicio', icon: 'bi-house-fill' },
    { file: 'productos.html', key: 'productos', text: 'Productos', icon: 'bi-box-seam' },
    { file: 'categorias.html', key: 'categorias', text: 'Categorías', icon: 'bi-tags-fill' },
    { file: 'almacenes.html', key: 'almacenes', text: 'Almacenes', icon: 'bi-building' },
    { file: 'inventario.html', key: 'inventario', text: 'Inventario', icon: 'bi-graph-up' },
    { file: 'entregas.html', key: 'entregas', text: 'Despachos', icon: 'bi-truck' },
    { file: 'restablecimientos.html', key: 'restablecimientos', text: 'Recibir', icon: 'bi-arrow-repeat' },
    { file: 'gestiones.html', key: 'gestiones', text: 'Gestiones', icon: 'bi-check2-circle' }
  ];

  function isInPagesDir() {
    return /\/pages\//.test(location.pathname);
  }

  function resolveHref(file) {
    if (file === 'index.html') return isInPagesDir() ? '../index.html' : 'index.html';
    return isInPagesDir() ? file : `pages/${file}`;
  }

  function currentKey() {
    const path = location.pathname.split('/').pop() || 'index.html';
    if (path === 'index.html') return 'home';
    const match = links.find(l => l.file === path);
    return match ? match.key : 'home';
  }

  async function fetchLowStock() {
    try {
      const res = await API.Productos.request('/productos/bajo-stock');
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Error al obtener productos con bajo stock:', e);
      return [];
    }
  }

  // ✅ NUEVO: obtener usuario autenticado desde auth.js
  async function getUser() {
    try {
      const res = await fetch("https://accounts.beckysflorist.site/api/auth/validation/cookie", {
        method: "GET",
        credentials: "include"
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
      return null;
    }
  }

  async function renderNavbar() {
    const container = document.getElementById('app-navbar');
    if (!container) return;
    const activeKey = currentKey();

    const navItems = links.map(l => `
      <li class="nav-item">
        <a class="nav-link ${activeKey === l.key ? 'active' : ''}" href="${resolveHref(l.file)}">
          <i class="${l.icon} me-1"></i>${l.text}
        </a>
      </li>
    `).join('');

    // Obtenemos el usuario
    const user = await getUser();

    container.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-gradient navbar-dark shadow-sm">
        <div class="container">
          <a class="navbar-brand fw-bold" href="${resolveHref('index.html')}">
            <i class="bi-bag-check-fill me-2"></i>InventarioApp
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              ${navItems}
              <li class="nav-item dropdown ms-3">
                <a class="nav-link position-relative" href="#" id="notifDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi-bell-fill fs-5"></i>
                  <span id="notifBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">0</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notifDropdown" style="min-width: 300px; max-height: 300px; overflow-y: auto;">
                  <li><h6 class="dropdown-header">Notificaciones</h6></li>
                  <li><div id="notifList" class="px-3 text-muted small">Cargando...</div></li>
                </ul>
              </li>
            </ul>
            <!-- NUEVO: sección de usuario y logout -->
            ${user ? `
              <div class="user-info ms-3">
                <span>👋 Hola, <strong>${user.firstName}</strong></span>
                <button id="logoutBtn" class="btn-logout">Cerrar sesión</button>
              </div>
            ` : ""}
          </div>
        </div>
      </nav>
    `;

    // Si hay usuario, activar logout
    if (user) {
      document.getElementById("logoutBtn").addEventListener("click", logout);
    }
  }

  // ✅ NUEVO: función para cerrar sesión
  async function logout() {
    try {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      alert("Sesión cerrada correctamente 👋");
      window.location.href = isInPagesDir() ? "../index.html" : "index.html";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  }

  async function loadNotifications() {
    const notifList = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    if (!notifList || !badge) return;

    const lowStock = await fetchLowStock();

    if (lowStock.length === 0) {
      notifList.innerHTML = '<div class="px-2 py-1 text-muted text-center">No hay productos con bajo stock</div>';
      badge.classList.add('d-none');
      return;
    }

    badge.textContent = lowStock.length;
    badge.classList.remove('d-none');

    notifList.innerHTML = lowStock.map(p => `
      <div class="border-bottom py-1">
        <strong>${p.nombre}</strong><br>
        <small class="text-danger">Stock actual: ${p.stockMaximo ?? 0}</small>
      </div>
    `).join('');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await renderNavbar();
    // Esperamos a que el navbar se inserte antes de buscar los elementos
    setTimeout(loadNotifications, 500);
  });
})();
