import { post, put, showNotification } from '../services.js';

export function setupModalEventos(user) {
    const modal = document.getElementById('modal-evento');
    const form = document.getElementById('form-evento');
    const cancelBtn = document.getElementById('evento-cancel');
    const submitBtn = document.getElementById('evento-submit');
    const errorDiv = document.getElementById('evento-error');

    let editingEvent = null;

    function openModal(event = null) {
        editingEvent = event;
        modal.classList.remove('hide');
        if (event) {
            document.getElementById('modal-evento-title').textContent = 'Editar Evento';
            form['nombre'].value = event.nombre;
            form['fecha'].value = event.fecha;
            form['descripcion'].value = event.descripcion;
            form['precio'].value = event.precio;
            form['imagen'].value = event.imagen;
        } else {
            document.getElementById('modal-evento-title').textContent = 'Agregar Evento';
            form.reset();
        }
    }

    function closeModal() {
        modal.classList.add('hide');
        form.reset();
        errorDiv.textContent = '';
        editingEvent = null;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoEvento = {
            nombre: form['nombre'].value.trim(),
            fecha: form['fecha'].value.trim(),
            descripcion: form['descripcion'].value.trim(),
            precio: parseFloat(form['precio'].value),
            imagen: form['imagen'].value.trim(),
        };

        try {
            if (editingEvent) {
                await put('eventos', editingEvent.id, nuevoEvento);
                showNotification('Evento editado correctamente.', true);
            } else {
                await post('eventos', nuevoEvento);
                showNotification('Evento agregado correctamente.', true);
            }
            closeModal();
            if (user) user.renderCatalogo(user); // Actualizar catálogo
        } catch (err) {
            errorDiv.textContent = 'Error al guardar el evento.';
        }
    });

    cancelBtn.addEventListener('click', closeModal);

    return { openModal, closeModal };
}
