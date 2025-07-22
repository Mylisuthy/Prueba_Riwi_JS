import { get } from './services.js';

export async function renderCatalogo() {
    const catalogoContainer = document.getElementById('catalogo-container');
    if (!catalogoContainer) {
        console.error("No se encontró el contenedor del catálogo.");
        return;
    }

    catalogoContainer.innerHTML = '<p>Cargando eventos...</p>';

    const eventos = await get('http://localhost:3000/eventos');
    if (!eventos || !Array.isArray(eventos)) {
        catalogoContainer.innerHTML = '<p>No se pudieron cargar los eventos. Intenta más tarde.</p>';
        console.error("La respuesta de eventos no es válida:", eventos);
        return;
    }

    if (eventos.length === 0) {
        catalogoContainer.innerHTML = '<p>No hay eventos disponibles.</p>';
        return;
    }

    catalogoContainer.innerHTML = '';
    eventos.forEach(evento => {
        // Asegúrate de que los campos existen
        const { id, nombre, descripcion, fecha, imagen } = evento;
        if (!id || !nombre) {
            console.warn("Evento inválido:", evento);
            return;
        }
        const card = document.createElement('div');
        card.className = 'evento-card';
        card.innerHTML = `
            <img src="${imagen || 'default.jpg'}" alt="${nombre}" class="evento-imagen"/>
            <h3>${nombre}</h3>
            <p>${descripcion || ''}</p>
            <p><strong>Fecha:</strong> ${fecha || 'Sin fecha'}</p>
            <button class="ver-detalle" data-id="${id}">Ver Detalle</button>
        `;
        catalogoContainer.appendChild(card);
    });

    // Delegación de eventos para los botones "Ver Detalle"
    catalogoContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('ver-detalle')) {
            const eventoId = e.target.getAttribute('data-id');
            console.log("Ver detalle de evento:", eventoId);
            // Aquí puedes llamar a la función para mostrar el detalle del evento
        }
    });
}