import { get, deletes, showNotification } from '../services.js';

export async function renderCatalogo(user) {
    const contenedor = document.getElementById('catalogo-lista');
    if (!contenedor) return;
    contenedor.innerHTML = '<div class="text-center">Cargando eventos...</div>';
    try {
        const eventos = await get('eventos');
        if (!eventos || eventos.length === 0) {
            contenedor.innerHTML = '<div class="text-center">No hay eventos disponibles.</div>';
            return;
        }
        let html = '';
        if (user && user.admin) {
            html += '<button id="agregar-evento-btn" class="catalog-card-btn mt-2">Agregar evento</button>';
        }
        html += '<div class="catalogo-grid">';
        for (const evento of eventos) {
            html += `
                <div class="catalog-card">
                    <img class="catalog-card-img" src="${evento.imagen}" alt="${evento.nombre}" />
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
            const agregarBtn = document.getElementById('agregar-evento-btn');
            if (agregarBtn) {
                agregarBtn.addEventListener('click', () => {
                    window.location.hash = '/registrar-evento';
                });
            }

            const editarBtns = document.querySelectorAll('.editar-evento-btn');
            editarBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    window.location.hash = `/editar-evento?id=${id}`;
                });
            });

            const eliminarBtns = document.querySelectorAll('.eliminar-evento-btn');
            eliminarBtns.forEach(btn => {
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
        contenedor.innerHTML = '<div class="text-center text-danger">Error al cargar los eventos.</div>';
    }
}
