(function() {
  const tbody = () => document.getElementById('categoriasTbody');

  function renderRows(items) {
    tbody().innerHTML = items.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.descripcion ?? ''}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-edit="${c.id}">
            <i class="bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-del="${c.id}">
            <i class="bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  async function load() {
    try {
      const items = await API.Categorias.list();
      renderRows(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="4" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  function openModal(cat) {
    const modal = document.getElementById('modalCategoria');
    const modalTitle = document.getElementById('modalCategoriaTitle');
    const inputId = document.getElementById('categoriaId');
    const inputNombre = document.getElementById('categoriaNombre');
    const inputDescripcion = document.getElementById('categoriaDescripcion');
    inputId.value = '';
    inputNombre.value = '';
    inputDescripcion.value = '';

    if (cat) {
      modalTitle.textContent = 'Editar categoría';
      inputId.value = cat.id;
      inputNombre.value = cat.nombre;
      inputDescripcion.value = cat.descripcion ?? '';
    } else {
      modalTitle.textContent = 'Nueva categoría';
    }

    

    let categoriaModal = bootstrap.Modal.getInstance(modal);
if (!categoriaModal) {
  categoriaModal = new bootstrap.Modal(modal);
}
categoriaModal.show();
  }


  async function save() {
    const id = document.getElementById('categoriaId').value;
    const data = {
      nombre: document.getElementById('categoriaNombre').value.trim(),
      descripcion: document.getElementById('categoriaDescripcion').value.trim() || undefined
    };

    if (id) {
      await API.Categorias.update(id, data);
    } else {
      await API.Categorias.create(data);
    }
  }

  async function onTableClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.edit || btn.dataset.del;
    if (!id) return;

    if (btn.dataset.edit) {
      const cat = await API.Categorias.getById(id);
      openModal(cat);
    } else if (btn.dataset.del) {
      if (confirm('¿Eliminar categoría?')) {
        await API.Categorias.remove(id);
        await load();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();

    tbody().addEventListener('click', onTableClick);

    document.getElementById('btnSaveCategoria').addEventListener('click', async () => {
      try {
        await save();
        bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide();
        await load();
      } catch (e) {
        alert(e.message);
      }
    });

    document.getElementById('btnNuevaCategoria').addEventListener('click', () => {
      openModal(null);
    });

    document.getElementById('modalCategoria').addEventListener('hidden.bs.modal', () => {
      document.getElementById('categoriaId').value = '';
      document.getElementById('categoriaNombre').value = '';
      document.getElementById('categoriaDescripcion').value = '';
    });
  });
})();
