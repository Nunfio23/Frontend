(function(){
  async function loadLowStock(threshold){
    const tbody = document.getElementById('lowStockTbody');
    try {
      const productos = await window.API.Productos.list();
      const rows = (Array.isArray(productos) ? productos : []).filter(p => {
        const stock = typeof p.stock === 'number' ? p.stock : (typeof p.cantidad === 'number' ? p.cantidad : null);
        return stock !== null && stock <= threshold;
      }).slice(0, 8).map(p => {
        const id = p.id ?? p.productoId ?? '';
        const nombre = p.nombre ?? p.name ?? '(sin nombre)';
        const stock = (typeof p.stock === 'number' ? p.stock : (typeof p.cantidad === 'number' ? p.cantidad : '-'));
        const activo = (p.activo === true || p.activo === false) ? (p.activo ? 'Sí' : 'No') : '-';
        return `<tr>
          <td>${id}</td>
          <td>${nombre}</td>
          <td><span class="badge ${stock <= 0 ? 'bg-danger' : 'bg-warning'}">${stock}</span></td>
          <td>${activo}</td>
        </tr>`;
      }).join('');
      tbody.innerHTML = rows || '<tr><td colspan="4" class="text-center text-muted">Sin productos con stock bajo</td></tr>';
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const thresholdInput = document.getElementById('lowStockThreshold');
    const btn = document.getElementById('btnApplyThreshold');
    const threshold = Number(thresholdInput?.value || 5);
    loadLowStock(threshold);
    btn?.addEventListener('click', () => {
      const t = Number(thresholdInput.value || 5);
      loadLowStock(t);
    });
  });
})();
