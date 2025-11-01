(function(){
  const tbody = () => document.getElementById('almacenesTbody');

  function renderRows(items){
    tbody().innerHTML = items.map(a => `<tr>
      <td>${a.almacenId}</td>
      <td>${a.codigo ?? ''}</td>
      <td>${a.nombre ?? ''}</td>
      <td>${a.tipo ?? ''}</td>
      <td>${a.ciudad ?? ''}</td>
      <td>${a.pais ?? ''}</td>
      <td>${a.activo ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-edit="${a.almacenId}"><i class="bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-del="${a.almacenId}"><i class="bi-trash"></i></button>
      </td>
    </tr>`).join('');
  }

  async function load(){
    try {
      const items = await API.Almacenes.list();
      renderRows(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="8" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  function openModal(a){
    document.getElementById('modalAlmacenTitle').textContent = a ? 'Editar almacén' : 'Nuevo almacén';
    document.getElementById('almacenId').value = a?.id || '';
    document.getElementById('almacenCodigo').value = a?.codigo || '';
    document.getElementById('almacenNombre').value = a?.nombre || '';
    document.getElementById('almacenTipo').value = a?.tipo || '';
    document.getElementById('almacenDireccion').value = a?.direccion || '';
    document.getElementById('almacenCiudad').value = a?.ciudad || '';
    document.getElementById('almacenPais').value = a?.pais || '';
    document.getElementById('almacenActivo').checked = a?.activo ?? true;
    new bootstrap.Modal(document.getElementById('modalAlmacen')).show();
  }

  async function save(){
    const id = document.getElementById('almacenId').value;
    const data = {
      codigo: document.getElementById('almacenCodigo').value,
      nombre: document.getElementById('almacenNombre').value,
      tipo: document.getElementById('almacenTipo').value || undefined,
      direccion: document.getElementById('almacenDireccion').value || undefined,
      ciudad: document.getElementById('almacenCiudad').value || undefined,
      pais: document.getElementById('almacenPais').value || undefined,
      activo: document.getElementById('almacenActivo').checked
    };
    if (id) await API.Almacenes.update(id, data);
    else await API.Almacenes.create(data);
  }

  async function onTableClick(e){
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.edit || btn.dataset.del;
    if (!id) return;
    if (btn.dataset.edit){
      const a = await API.Almacenes.getById(id);
      openModal(a);
    } else if (btn.dataset.del){
      if (confirm('¿Eliminar almacén?')){
        await API.Almacenes.remove(id);
        await load();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    tbody().addEventListener('click', onTableClick);
    document.getElementById('btnSaveAlmacen').addEventListener('click', async () => {
      try { await save(); bootstrap.Modal.getInstance(document.getElementById('modalAlmacen')).hide(); await load(); }
      catch(e){ alert(e.message); }
    });
  });
})();
