(function () {
  const tbody = () => document.getElementById('restTbody');

  function render(items) {
    tbody().innerHTML = items
      .map(
        r => `
      <tr>
        <td>${r.restablecimientoId ?? '-'}</td>
        <td>${r.productoNombre ?? '-'}</td>
        <td>${r.almacenNombre ?? '-'}</td>
        <td>${r.cantidad ?? 0}</td>
        <td>
          <span class="badge ${
            r.estado === 'APROBADO'
              ? 'bg-success'
              : r.estado === 'RECHAZADO'
              ? 'bg-danger'
              : 'bg-secondary'
          }">
            ${r.estado ?? 'PENDIENTE'}
          </span>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-edit="${r.restablecimientoId}">
            <i class="bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-del="${r.restablecimientoId}">
            <i class="bi-trash"></i>
          </button>
        </td>
      </tr>`
      )
      .join('');
  }

  async function load() {
    try {
      const items = await API.Restablecimientos.list();
      render(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  async function loadOptions() {
    const [prods, almacenes] = await Promise.all([
      API.Productos.list(),
      API.Almacenes.list(),
    ]);

    const prodSelect = document.getElementById('restProducto');
    const almSelect = document.getElementById('restAlmacen');

    prodSelect.innerHTML = (prods || [])
      .map(p => `<option value="${p.productoId}">${p.nombre}</option>`)
      .join('');

    almSelect.innerHTML = (almacenes || [])
      .map(a => `<option value="${a.almacenId}">${a.nombre}</option>`)
      .join('');
  }

  function openModal(obj) {
    document.getElementById('modalRestTitle').textContent = obj
      ? 'Editar restablecimiento'
      : 'Nuevo restablecimiento';

    document.getElementById('restId').value = obj?.restablecimientoId || '';
    document.getElementById('restProducto').value = obj?.productoId || '';
    document.getElementById('restAlmacen').value = obj?.almacenId || '';
    document.getElementById('restCantidad').value = obj?.cantidad || 1;

    new bootstrap.Modal(document.getElementById('modalRest')).show();
  }

  async function save() {
    const id = document.getElementById('restId').value;
    const data = {
      productoId: Number(document.getElementById('restProducto').value),
      almacenId: Number(document.getElementById('restAlmacen').value),
      cantidad: Number(document.getElementById('restCantidad').value || 1),
    };

    if (id) await API.Restablecimientos.update(id, data);
    else await API.Restablecimientos.create(data);
  }

  async function onTableClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.edit || btn.dataset.del;
    if (!id) return;

    if (btn.dataset.edit) {
      const item = await API.Restablecimientos.getById(id);
      openModal(item);
    } else if (btn.dataset.del) {
      if (confirm('¿Eliminar restablecimiento?')) {
        await API.Restablecimientos.remove(id);
        await load();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([load(), loadOptions()]);
    tbody().addEventListener('click', onTableClick);

    document
      .getElementById('btnSaveRest')
      .addEventListener('click', async () => {
        try {
          await save();
          bootstrap.Modal.getInstance(document.getElementById('modalRest')).hide();
          await load();
        } catch (e) {
          alert(e.message);
        }
      });
  });
})();
