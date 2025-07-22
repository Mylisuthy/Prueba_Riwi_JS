import { get, deletes, showNotification } from '../services.js';
import { setupModalEventos } from './modal-eventos.js';

export async function renderCatalogo(user) {
    const contenedor = document.getElementById('catalogo-lista');
    const catalogoSection = document.getElementById('catalogo-section');
    if (!contenedor || !catalogoSection) return;

    contenedor.innerHTML = '<div class="text-center">Cargando eventos...</div>';

    try {
        const eventos = await get('eventos'); // Obtener eventos desde la base de datos
        console.log('Eventos obtenidos:', eventos); // Log para depuración
        const { openModal } = setupModalEventos(user);

        // Asegurarnos de que el botón "Agregar evento" siempre esté visible
        if (user && user.admin) {
            let agregarBtn = document.getElementById('agregar-evento-btn');
            if (!agregarBtn) {
                agregarBtn = document.createElement('button');
                agregarBtn.id = 'agregar-evento-btn';
                agregarBtn.className = 'catalog-card-btn mt-2';
                agregarBtn.textContent = 'Agregar evento';
                catalogoSection.insertBefore(agregarBtn, contenedor);
                agregarBtn.addEventListener('click', () => openModal());
            }
        }

        if (!Array.isArray(eventos) || eventos.length === 0) {
            contenedor.innerHTML = '<div class="text-center">No hay eventos disponibles.</div>';
            return;
        }

        let html = '<div class="catalogo-grid">';
        for (const evento of eventos) {
            html += `
                <div class="catalog-card">
                    <img class="catalog-card-img" src="${evento.imagen}" alt="${evento.nombre}" onerror="this.src='default-image.jpg';" />
                    <div class="catalog-card-body">
                        <div class="catalog-card-title">${evento.nombre}</div>
                        <div class="catalog-card-fecha"><b>Fecha:</b> ${evento.fecha || 'Desconocido'}</div>
                        <div class="catalog-card-desc">${evento.descripcion}</div>
                        <div class="catalog-card-price">$${evento.precio}</div>
                        <button class="catalog-card-btn">Ver más</button>
                        ${user && user.admin ? `
                            <button class="catalog-card-btn editar-evento-btn mt-2" data-id="${evento.id}">Editar</button>
                            <button class="catalog-card-btn eliminar-evento-btn mt-2" data-id="${evento.id}">Eliminar</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        html += '</div>';
        contenedor.innerHTML = html;

        if (user && user.admin) {
            document.querySelectorAll('.editar-evento-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const evento = eventos.find(ev => ev.id === id);
                    openModal(evento);
                });
            });
            document.querySelectorAll('.eliminar-evento-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const confirmar = confirm('¿Estás seguro de que deseas eliminar este evento?');
                    if (confirmar) {
                        try {
                            await deletes(`eventos/${id}`);
                            showNotification('Evento eliminado correctamente.', true);
                            renderCatalogo(user);
                        } catch (err) {
                            showNotification('Error al eliminar el evento.', false);
                        }
                    }
                });
            });
        }
    } catch (err) {
        console.error('Error al cargar los eventos:', err);
        contenedor.innerHTML = '<div class="text-center text-danger">Error al cargar los eventos.</div>';
    }
}
