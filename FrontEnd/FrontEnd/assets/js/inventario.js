(function(){
  const tbody = () => document.getElementById('invTbody');
  let currentList = [];

  function render(items){
    tbody().innerHTML = items.map(p => {
      const id = p.id ?? p.productoId ?? '';
      const nombre = p.nombre ?? p.name ?? '';
      stock: typeof p.stockMaximo === 'number'
        ? p.stockMaximo
        : (typeof p.stock === 'number' ? p.stock : (typeof p.cantidad === 'number' ? p.cantidad : 0));
      const stock = p.stockMaximo ?? p.stock ?? p.cantidad ?? 0; 
      const activo = p.activo ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>';
      return `<tr data-id="${id}">
        <td>${id}</td>
        <td>${nombre}</td>
        <td>${stock}</td>
        <td>${activo}</td>
      </tr>`;
    }).join('');
  }

  async function loadAll(){
    try {
      currentList = await API.Productos.list();
      render(Array.isArray(currentList) ? currentList : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="4" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  function selectedId(){
    const tr = tbody().querySelector('tr.table-active');
    return tr?.dataset?.id;
  }

  function enableSelect(){
    tbody().addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      tbody().querySelectorAll('tr').forEach(r => r.classList.remove('table-active'));
      tr.classList.add('table-active');
    });
  }

  async function applyDelta(sign){
    const id = selectedId();
    if (!id){ alert('Selecciona un producto.'); return; }
    const qty = Number(document.getElementById('invQty').value || 1);
    if (sign > 0) await API.Productos.increaseStock(id, qty);
    else await API.Productos.decreaseStock(id, qty);
    await loadAll();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadAll();
    enableSelect();
    document.getElementById('invInc').addEventListener('click', () => applyDelta(1));
    document.getElementById('invDec').addEventListener('click', () => applyDelta(-1));
    document.getElementById('invBtnSearch').addEventListener('click', async () => {
      const name = document.getElementById('invSearch').value.trim();
      if (!name) { render(currentList); return; }
      const res = await API.Productos.searchByName(name);
      render(Array.isArray(res) ? res : (res ? [res] : []));
    });
  });
})();
