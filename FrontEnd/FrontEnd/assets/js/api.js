(function () {
  const API_BASE = 'https://endpoints-production-4a52.up.railway.app/api';

  async function request(path, { method = 'GET', body, headers = {} } = {}) {
    const url = `${API_BASE}${path}`;
    const options = { method, headers: { ...headers } };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  // Productos
  const Productos = {
    list: () => request('/productos'),
    getById: (id) => request(`/productos/${encodeURIComponent(id)}`),
    create: (data) => request('/productos', { method: 'POST', body: data }),
    update: (id, data) => request(`/productos/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/productos/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    increaseStock: (id, quantity) => request(`/productos/increase-stock/${encodeURIComponent(id)}?quantity=${encodeURIComponent(quantity)}`, { method: 'PUT' }),
    decreaseStock: (id, quantity) => request(`/productos/decrease-stock/${encodeURIComponent(id)}?quantity=${encodeURIComponent(quantity)}`, { method: 'PUT' }),
    searchByName: (name) => request(`/productos/by-name?name=${encodeURIComponent(name)}`),
    byCategoria: (categoriaId) => request(`/productos/categoria/${encodeURIComponent(categoriaId)}`),
    activar: (id) => request(`/productos/${encodeURIComponent(id)}/activar`, { method: 'PATCH' }),
    desactivar: (id) => request(`/productos/${encodeURIComponent(id)}/desactivar`, { method: 'PATCH' }),
    bajoStock: async (threshold = 3) => {
      const res = await fetch(`${BASE_URL}/productos/bajo-stock?threshold=${threshold}`);
      if (!res.ok) throw new Error('Error al obtener productos con bajo stock');
      return await res.json();
      },
  };

  // Categorías
  const Categorias = {
    list: () => request('/categorias'),
    getById: (id) => request(`/categorias/${encodeURIComponent(id)}`),
    create: (data) => request('/categorias', { method: 'POST', body: data }),
    update: (id, data) => request(`/categorias/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/categorias/${encodeURIComponent(id)}`, { method: 'DELETE' })
  };

  // Almacenes
  const Almacenes = {
    list: () => request('/almacenes'),
    getById: (id) => request(`/almacenes/${encodeURIComponent(id)}`),
    create: (data) => request('/almacenes', { method: 'POST', body: data }),
    update: (id, data) => request(`/almacenes/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/almacenes/${encodeURIComponent(id)}`, { method: 'DELETE' })
  };

  // Entregas (Despachos)
  const Entregas = {
    list: () => request('/entregas'),
    getById: (id) => request(`/entregas/${encodeURIComponent(id)}`),
    create: (data) => request('/entregas', { method: 'POST', body: data }),
    update: (id, data) => request(`/entregas/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/entregas/${encodeURIComponent(id)}`, { method: 'DELETE' })
  };

  // Restablecimientos (Recibir mercadería)
  const Restablecimientos = {
    list: () => request('/restablecimientos'),
    getById: (id) => request(`/restablecimientos/${encodeURIComponent(id)}`),
    create: (data) => request('/restablecimientos', { method: 'POST', body: data }),
    update: (id, data) => request(`/restablecimientos/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/restablecimientos/${encodeURIComponent(id)}`, { method: 'DELETE' })
  };

  // Gestiones
 const Gestiones = {
  list: () => request('/gestiones'),
  getById: (id) => request(`/gestiones/${id}`),
  create: (data) => request('/gestiones', { method: 'POST', body: data }),
  update: (id, data) => request(`/gestiones/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/gestiones/${id}`, { method: 'DELETE' }),
  aprobar: (id) => request(`/gestiones/${id}/aprobar`, { method: 'PUT' }),
  rechazar: (id) => request(`/gestiones/${id}/rechazar`, { method: 'PUT' })
};


  const API = { request, Productos, Categorias, Almacenes, Entregas, Restablecimientos, Gestiones };
  window.API = API;
})();