(function(){
  const tbody = () => document.getElementById('productosTbody');
  const categoriaSelect = () => document.getElementById('filterCategoria');

  function mapProductoForForm(p){
    return {
      id: p.id ?? p.productoId,
      nombre: p.nombre ?? '',
      descripcion: p.descripcion ?? '',
      precio: typeof p.precio === 'number' ? p.precio : (typeof p.price === 'number' ? p.price : 0),
      stock: typeof p.stockMaximo === 'number'
        ? p.stockMaximo
        : (typeof p.stock === 'number' ? p.stock : (typeof p.cantidad === 'number' ? p.cantidad : 0)),
      categoriaId: p.categoria?.id ?? p.categoriaId ?? null,
      activo: p.activo ?? true
    };
  }

  function fillCategorias(selectEl, categorias){
    selectEl.innerHTML = '<option value="">Todas</option>' + categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  }

  async function loadCategorias(){
    try {
      const categorias = await API.Categorias.list();
      fillCategorias(categoriaSelect(), categorias);
      const modalCat = document.getElementById('productoCategoria');
      if (modalCat) modalCat.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    } catch (e) {
      console.error('Error cargando categorías', e);
    }
  }

  function renderRows(items) {
  tbody().innerHTML = items.map(p => `
    <tr>
      <td>${p.productoId}</td>
      <td>${p.nombre}</td>
      <td>${p.categoriaNombre || p.categoriaId}</td>
      <td>${p.stockMaximo ?? 0}</td>
      <td>$${p.precio?.toFixed ? p.precio.toFixed(2) : (p.precio ?? 0)}</td>
      <td>${p.activo ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-danger">No</span>'}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-edit="${p.productoId}">
          <i class="bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-success me-1" data-activate="${p.productoId}">
          <i class="bi-check2"></i> Activar
        </button>
        <button class="btn btn-sm btn-outline-warning me-1" data-deactivate="${p.productoId}">
          <i class="bi-x"></i> Desactivar
        </button>
        <button class="btn btn-sm btn-outline-danger" data-del="${p.productoId}">
          <i class="bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

  async function loadProductos(){
    try {
      let productos = await API.Productos.list();
      const cat = categoriaSelect().value;
      if (cat) {
        productos = await API.Productos.byCategoria(cat);
      }
      renderRows(Array.isArray(productos) ? productos : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  function openModal(producto){
    const modalTitle = document.getElementById('modalProductoTitle');
    const idEl = document.getElementById('productoId');
    const nombreEl = document.getElementById('productoNombre');
    const descEl = document.getElementById('productoDescripcion');
    const precioEl = document.getElementById('productoPrecio');
    const stockEl = document.getElementById('productoStock');
    const catEl = document.getElementById('productoCategoria');
    const activoEl = document.getElementById('productoActivo');

    if (producto) {
      modalTitle.textContent = 'Editar producto';
      const m = mapProductoForForm(producto);
      const productoId = producto.productoId || m.id || m.productoId || producto.id || '';
      idEl.value = productoId;
      idEl.dataset.productoId = productoId;
      nombreEl.value = m.nombre ?? '';
      descEl.value = m.descripcion ?? '';
      precioEl.value = m.precio ?? 0;
      stockEl.value = m.stock ?? 0;
      catEl.value = m.categoriaId ?? '';
      activoEl.checked = !!m.activo;
    } else {
      modalTitle.textContent = 'Nuevo producto';
      idEl.value = '';
      nombreEl.value = '';
      descEl.value = '';
      precioEl.value = '';
      stockEl.value = '';
      catEl.value = '';
      activoEl.checked = true;
    }

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
  }

  async function saveProducto(){
    const id = document.getElementById('productoId').value || document.getElementById('productoId').dataset.productoId;

    const nombre = document.getElementById('productoNombre').value;
    const descripcion = document.getElementById('productoDescripcion').value || undefined;
    const precio = Number(document.getElementById('productoPrecio').value || 0);
    const stockMaximo = Number(document.getElementById('productoStock').value || 0);
    const categoriaId = document.getElementById('productoCategoria').value
        ? Number(document.getElementById('productoCategoria').value)
        : undefined;
    const activo = document.getElementById('productoActivo').checked;

    const data = {
      nombre,
      descripcion,
      precio,
      stockMaximo,
      categoriaId,
      activo
    };

    console.log("Guardando producto ID:", id, data);

    if (id) {
      await API.Productos.update(id, data);
    } else {
      await API.Productos.create(data);
    }
  }

  async function onTableClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.edit || btn.dataset.del || btn.dataset.activate || btn.dataset.deactivate;
    if (!id) return;

    if (btn.dataset.edit) {
      try {
        const prod = await API.Productos.getById(id);
        if (!prod) {
          alert('No se pudo cargar el producto.');
          return;
        }
        openModal(prod);
      } catch (err) {
        console.error('Error al obtener producto:', err);
        alert('Error al obtener los datos del producto.');
      }
    } else if (btn.dataset.del) {
      if (confirm('¿Eliminar producto?')) {
        await API.Productos.remove(id);
        await loadProductos();
      }
    } else if (btn.dataset.activate) {
      await API.Productos.activar(id);
      await loadProductos();
    } else if (btn.dataset.deactivate) {
      await API.Productos.desactivar(id);
      await loadProductos();
    }
  }

  async function onApplyStock(deltaSign){
    const qty = Number(document.getElementById('stockQty').value || 0);
    const selected = tbody().querySelector('tr.table-active');
    if (!selected){ alert('Selecciona un producto (clic en la fila)'); return; }
    const id = selected.firstElementChild.textContent.trim();
    if (!id) return;
    if (deltaSign > 0) {
      await API.Productos.increaseStock(id, qty);
    } else {
      await API.Productos.decreaseStock(id, qty);
    }
    await loadProductos();
  }

  function enableRowSelection(){
    tbody().addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      tbody().querySelectorAll('tr').forEach(r => r.classList.remove('table-active'));
      tr.classList.add('table-active');
    });
  }

  async function init(){
    await loadCategorias();
    await loadProductos();
    enableRowSelection();

    tbody().addEventListener('click', onTableClick);

    document.getElementById('btnSaveProducto').addEventListener('click', async () => {
      try {
        await saveProducto();
        bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
        await loadProductos();
      } catch (e) { alert(e.message); }
    });

    categoriaSelect().addEventListener('change', loadProductos);

    document.getElementById('btnSearch').addEventListener('click', async () => {
      const name = document.getElementById('searchName').value.trim();
      const res = name ? await API.Productos.searchByName(name) : await API.Productos.list();
      renderRows(Array.isArray(res) ? res : (res ? [res] : []));
    });

    document.getElementById('btnIncStock').addEventListener('click', () => onApplyStock(1));
    document.getElementById('btnDecStock').addEventListener('click', () => onApplyStock(-1));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
