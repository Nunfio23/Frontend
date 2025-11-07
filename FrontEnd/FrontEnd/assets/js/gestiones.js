(function () {
  const tbody = () => document.getElementById('gestionesTbody');

  function render(items) {
    tbody().innerHTML = items
      .map(
        g => `
      <tr>
        <td>${g.gestionId ?? '-'}</td>
        <td>${g.restablecimientoId ?? '-'}</td>
        <td>${g.observacion ?? '-'}</td>
        <td>
          <span class="badge ${
            g.aprobado
              ? 'bg-success'
              : g.aprobado === false
              ? 'bg-danger'
              : 'bg-secondary'
          }">
            ${
              g.aprobado
                ? 'APROBADO'
                : g.aprobado === false
                ? 'RECHAZADO'
                : 'PENDIENTE'
            }
          </span>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-edit="${
            g.gestionId
          }">
            <i class="bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-success me-1" data-approve="${
            g.gestionId
          }">
            <i class="bi-check2"></i> Aprobar
          </button>
          <button class="btn btn-sm btn-outline-danger me-1" data-reject="${
            g.gestionId
          }">
            <i class="bi-x"></i> Rechazar
          </button>
          <button class="btn btn-sm btn-outline-secondary" data-del="${
            g.gestionId
          }">
            <i class="bi-trash"></i>
          </button>
        </td>
      </tr>`
      )
      .join('');
  }

  async function load() {
    try {
      const items = await API.Gestiones.list();
      render(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="5" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  async function loadRestablecimientos() {
    try {
      const rests = await API.Restablecimientos.list();
      const select = document.getElementById('gestionRest');
      select.innerHTML = (rests || [])
        .map(
          r => `
          <option value="${r.restablecimientoId}">
            #${r.restablecimientoId} • ${r.productoNombre ?? ''} (${r.cantidad ?? 0})
          </option>`
        )
        .join('');
    } catch (e) {
      console.error('Error al cargar restablecimientos:', e);
    }
  }

  function openModal(obj) {
    document.getElementById('modalGestionTitle').textContent = obj
      ? 'Editar gestión'
      : 'Nueva gestión';

    document.getElementById('gestionId').value = obj?.gestionId || '';
    document.getElementById('gestionRest').value = obj?.restablecimientoId || '';
    document.getElementById('gestionObs').value = obj?.observacion || '';

    new bootstrap.Modal(document.getElementById('modalGestion')).show();
  }

async function save() {
  const id = document.getElementById('gestionId').value;
  const data = {
    restablecimiento: {
      restablecimientoId: Number(document.getElementById('gestionRest').value),
    },
    observacion: document.getElementById('gestionObs').value || undefined,
  };

  if (id) {
    await API.Gestiones.update(id, data);
  } else {
    await API.Gestiones.create(data);
  }
}

  async function onTableClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id =
      btn.dataset.edit ||
      btn.dataset.del ||
      btn.dataset.approve ||
      btn.dataset.reject;

    if (!id) return;

    try {
      if (btn.dataset.edit) {
        const item = await API.Gestiones.getById(id);
        openModal(item);
      } else if (btn.dataset.approve) {
        // ✅ aprobar gestión
        await API.Gestiones.aprobar(id);
        alert('✅ Gestión aprobada correctamente');
        await load();
      } else if (btn.dataset.reject) {
        // ❌ rechazar gestión
        await API.Gestiones.rechazar(id);
        alert('❌ Gestión rechazada correctamente');
        await load();
      } else if (btn.dataset.del) {
        if (confirm('¿Eliminar gestión?')) {
          await API.Gestiones.remove(id);
          await load();
        }
      }

      if (typeof API.Restablecimientos !== 'undefined') {
        const restTable = document.getElementById('restTbody');
        if (restTable) {
          const rests = await API.Restablecimientos.list();
          restTable.innerHTML = (rests || [])
            .map(
              r => `
            <tr>
              <td>${r.restablecimientoId}</td>
              <td>${r.productoNombre ?? ''}</td>
              <td>${r.almacenNombre ?? ''}</td>
              <td>${r.cantidad ?? 0}</td>
              <td><span class="badge ${
                r.estado === 'APROBADO'
                  ? 'bg-success'
                  : r.estado === 'RECHAZADO'
                  ? 'bg-danger'
                  : 'bg-secondary'
              }">${r.estado}</span></td>
            </tr>`
            )
            .join('');
        }
      }
    } catch (error) {
      alert('Error al procesar la acción: ' + error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([load(), loadRestablecimientos()]);
    tbody().addEventListener('click', onTableClick);

    document
      .getElementById('btnSaveGestion')
      .addEventListener('click', async () => {
        try {
          await save();
          bootstrap.Modal.getInstance(
            document.getElementById('modalGestion')
          ).hide();
          await load();
        } catch (e) {
          alert(e.message);
        }
      });
  });
})();
