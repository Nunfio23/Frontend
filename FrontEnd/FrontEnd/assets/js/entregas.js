(function () {
  const tbody = () => document.getElementById('entregasTbody');

  
  function render(items) {
    tbody().innerHTML = items
      .map(
        e => `
      <tr>
        <td>${e.entregaId}</td>
        <td>${e.productoNombre ?? '-'}</td>
        <td>${e.almacenNombre ?? '-'}</td>
        <td>${e.cantidad ?? 0}</td>
        <td>${new Date(e.fechaEntrega).toLocaleDateString() ?? '-'}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-edit="${e.entregaId}">
            <i class="bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-del="${e.entregaId}">
            <i class="bi-trash"></i>
          </button>
        </td>
      </tr>`
      )
      .join('');
  }

  
  async function load() {
    try {
      const items = await API.Entregas.list();
      render(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="5" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  
  async function loadOptions() {
    const [prods, almacenes] = await Promise.all([
      API.Productos.list(),
      API.Almacenes.list(),
    ]);
    const prodSelect = document.getElementById('entregaProducto');
    const almSelect = document.getElementById('entregaAlmacen');

    prodSelect.innerHTML = (prods || [])
      .map(p => `<option value="${p.productoId}">${p.nombre}</option>`)
      .join('');

    almSelect.innerHTML = (almacenes || [])
      .map(a => `<option value="${a.almacenId}">${a.nombre}</option>`)
      .join('');
  }

  
  function openModal(eObj) {
    document.getElementById('modalEntregaTitle').textContent = eObj
      ? 'Editar entrega'
      : 'Nueva entrega';

    document.getElementById('entregaId').value = eObj?.entregaId || '';
    document.getElementById('entregaProducto').value = eObj?.productoId || '';
    document.getElementById('entregaAlmacen').value = eObj?.almacenId || '';
    document.getElementById('entregaCantidad').value = eObj?.cantidad || 1;

    new bootstrap.Modal(document.getElementById('modalEntrega')).show();
  }

  async function save() {
    const id = document.getElementById('entregaId').value;
    const data = {
      productoId: Number(document.getElementById('entregaProducto').value),
      almacenId: Number(document.getElementById('entregaAlmacen').value),
      cantidad: Number(document.getElementById('entregaCantidad').value || 1),
    };

    if (id) await API.Entregas.update(id, data);
    else await API.Entregas.create(data);
  }

  async function onTableClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.edit || btn.dataset.del;
    if (!id) return;

    if (btn.dataset.edit) {
      const item = await API.Entregas.getById(id);
      openModal(item);
    } else if (btn.dataset.del) {
      if (confirm('¿Eliminar entrega?')) {
        await API.Entregas.remove(id);
        await load();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([load(), loadOptions()]);
    tbody().addEventListener('click', onTableClick);
    document
      .getElementById('btnSaveEntrega')
      .addEventListener('click', async () => {
        try {
          await save();
          bootstrap.Modal.getInstance(
            document.getElementById('modalEntrega')
          ).hide();
          await load();
        } catch (e) {
          alert(e.message);
        }
      });
  });
})();
