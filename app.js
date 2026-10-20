const API = `${window.API_URL}/api/productos`;
const $ = (id) => document.getElementById(id);
const form = $('form'), tbody = $('tbody'), msg = $('msg');

const mostrar = (texto, error = false) => {
  msg.textContent = texto;
  msg.className = error ? 'err' : 'ok';
};

async function api(url, opts = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function fila(p) {
  const tr = document.createElement('tr');
  const celdas = [p.id, p.nombre, `$${Number(p.precio).toFixed(2)}`, p.stock];
  celdas.forEach((v, i) => {
    const td = document.createElement('td');
    td.textContent = v;
    if (i === 3 && p.stock < 5) td.className = 'low';
    tr.appendChild(td);
  });
  const td = document.createElement('td');
  td.className = 'row-actions';
  const editar = document.createElement('button');
  editar.textContent = 'Editar'; editar.className = 'small';
  editar.onclick = () => editarProducto(p);
  const borrar = document.createElement('button');
  borrar.textContent = 'Eliminar'; borrar.className = 'small danger';
  borrar.onclick = () => eliminar(p);
  td.append(editar, borrar);
  tr.appendChild(td);
  return tr;
}

async function cargar() {
  try {
    const productos = await api(API);
    tbody.replaceChildren(...productos.map(fila));
    $('total').textContent = `(${productos.length})`;
  } catch (e) {
    mostrar('No se pudo cargar: ' + e.message + ' (si el backend estaba dormido, espera ~30s y recarga)', true);
  }
}

function editarProducto(p) {
  $('id').value = p.id; $('nombre').value = p.nombre;
  $('precio').value = p.precio; $('stock').value = p.stock;
  $('form-title').textContent = `Editar producto #${p.id}`;
  $('cancelar').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reset() {
  form.reset(); $('id').value = '';
  $('form-title').textContent = 'Nuevo producto';
  $('cancelar').hidden = true;
}

async function eliminar(p) {
  if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
  try { await api(`${API}/${p.id}`, { method: 'DELETE' }); mostrar('Producto eliminado'); cargar(); }
  catch (e) { mostrar(e.message, true); }
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const id = $('id').value;
  const body = JSON.stringify({
    nombre: $('nombre').value,
    precio: parseFloat($('precio').value),
    stock: parseInt($('stock').value, 10),
  });
  try {
    await api(id ? `${API}/${id}` : API, { method: id ? 'PUT' : 'POST', body });
    mostrar(id ? 'Producto actualizado' : 'Producto creado');
    reset(); cargar();
  } catch (e) { mostrar(e.message, true); }
});
$('cancelar').onclick = reset;
cargar();
