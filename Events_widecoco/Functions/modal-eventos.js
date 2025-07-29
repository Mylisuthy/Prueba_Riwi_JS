// Modal de eventos: agregar/editar. Modular y seguro para SPA. Expone funciones globales.
// Se asume que el modal está en el DOM cuando este script se carga.

const modal = document.getElementById('eventoModal');
const closeBtn = document.getElementById('closeModal');
const form = document.getElementById('eventoForm');
const errorDiv = document.getElementById('evento-error');
const title = document.getElementById('modalTitle');
const cancelBtn = document.getElementById('evento-cancel');
const guardarBtn = document.getElementById('guardarBtn');

let modo = 'agregar'; // o 'editar'
let eventoActual = null;

// Limpia el formulario y errores
function limpiarFormulario() {
  form.reset();
  document.getElementById('eventoId').value = '';
  errorDiv.textContent = '';
}

// Abre el modal para agregar evento
function abrirModalAgregar() {
  modo = 'agregar';
  eventoActual = null;
  title.textContent = 'Agregar Evento';
  guardarBtn.textContent = 'Guardar';
  limpiarFormulario();
  mostrarModal();
}

// Abre el modal para editar evento
async function abrirModalEditar(id) {
  modo = 'editar';
  errorDiv.textContent = '';
  try {
    const res = await fetch(`http://localhost:3000/eventos/${id}`);
    if (!res.ok) throw new Error('No se pudo obtener el evento');
    const evento = await res.json();
    eventoActual = evento;
    document.getElementById('eventoId').value = evento.id;
    document.getElementById('nombre').value = evento.nombre;
    document.getElementById('fecha').value = evento.fecha;
    document.getElementById('descripcion').value = evento.descripcion;
    document.getElementById('precio').value = evento.precio;
    document.getElementById('imagen').value = evento.imagen;
    title.textContent = 'Editar Evento';
    guardarBtn.textContent = 'Actualizar';
    mostrarModal();
  } catch (err) {
    errorDiv.textContent = 'Error al cargar datos del evento.';
  }
}

// Muestra el modal
function mostrarModal() {
  modal.classList.remove('hide');
  modal.style.display = 'flex';
}

// Oculta el modal
function cerrarModal() {
  modal.classList.add('hide');
  modal.style.display = 'none';
  limpiarFormulario();
}

// Validación simple
function validarFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const fecha = document.getElementById('fecha').value;
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = document.getElementById('precio').value;
  const imagen = document.getElementById('imagen').value.trim();
  if (!nombre || nombre.length < 2) {
    errorDiv.textContent = 'El nombre debe tener al menos 2 caracteres.';
    return false;
  }
  if (!fecha) {
    errorDiv.textContent = 'La fecha es obligatoria.';
    return false;
  }
  if (!descripcion || descripcion.length < 5) {
    errorDiv.textContent = 'La descripción debe tener al menos 5 caracteres.';
    return false;
  }
  if (!precio || isNaN(precio) || Number(precio) < 1) {
    errorDiv.textContent = 'El precio debe ser un número mayor a 0.';
    return false;
  }
  if (!imagen || !/^https?:\/\/.+\..+/.test(imagen)) {
    errorDiv.textContent = 'La URL de portada debe ser válida.';
    return false;
  }
  return true;
}

// Maneja el submit del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.textContent = '';
  if (!validarFormulario()) return;

  const evento = {
    nombre: document.getElementById('nombre').value.trim(),
    fecha: document.getElementById('fecha').value,
    descripcion: document.getElementById('descripcion').value.trim(),
    precio: Number(document.getElementById('precio').value),
    imagen: document.getElementById('imagen').value.trim()
  };

  if (modo === 'agregar') {
    try {
      const res = await fetch('http://localhost:3000/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento)
      });
      if (!res.ok) throw new Error('Error al agregar evento');
      cerrarModal();
      window.actualizarCatalogoEventos && window.actualizarCatalogoEventos();
    } catch (err) {
      errorDiv.textContent = 'No se pudo agregar el evento. Verifica la conexión.';
    }
  } else if (modo === 'editar') {
    try {
      const id = document.getElementById('eventoId').value;
      const res = await fetch(`http://localhost:3000/eventos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento)
      });
      if (!res.ok) throw new Error('Error al editar evento');
      cerrarModal();
      window.actualizarCatalogoEventos && window.actualizarCatalogoEventos();
    } catch (err) {
      errorDiv.textContent = 'No se pudo editar el evento. Verifica la conexión.';
    }
  }
});

// Cierra el modal al hacer click en la X o en Cancelar
closeBtn.addEventListener('click', cerrarModal);
cancelBtn.addEventListener('click', cerrarModal);

// Expone funciones globales para otros módulos
window.abrirModalAgregarEvento = abrirModalAgregar;
window.abrirModalEditarEvento = abrirModalEditar;
window.cerrarModalEvento = cerrarModal;