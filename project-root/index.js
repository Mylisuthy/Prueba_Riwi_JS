import { get } from './services.js';

// router structure
const app = document.getElementById('spa-content');

// definir las vistas
const routes = {
  '/': './pages/login.html',
  '/catalogo': './pages/catalogo.html',
  '/register': './pages/register.html',
  '/iniciar-sesion': './pages/iniciar-sesion.html',
  '/registrar-evento': './pages/registrar-evento.html',
  '/eventos': './pages/eventos.html'
};

// funcion para conectar vistas
function router() {
    const hash = window.location.hash || '#/';
    const route = hash.slice(1);

    fetch(routes[route])
    .then(res => res.text())
    .then(data => {
      app.innerHTML = data; 
      setlisteners(route);
    })
};

function setlisteners(route) {
  // LOGIN
  if (route === '/') {
    const formLogin = document.getElementById('loginForm');
    if (formLogin) {
      formLogin.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');
        loginError.style.display = 'none';
        const users = await get('usuarios');
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          loginError.textContent = 'Correo o contraseña incorrectos';
          loginError.style.display = 'block';
          return;
        }
        // Guardar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        window.location.hash = '/catalogo';
      });
      // Ir a registro
      const goRegister = document.querySelector('a[href="register.html"]');
      if (goRegister) {
        goRegister.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.hash = '/register';
        });
      }
    }
  }
  // REGISTRO
  if (route === '/register') {
    const formRegister = document.getElementById('register-form');
    if (formRegister) {
      formRegister.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre = document.getElementById('reg-nombre').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const errorDiv = document.getElementById('register-error');
        errorDiv.textContent = '';
        if (!nombre || nombre.length < 3) {
          errorDiv.textContent = 'El nombre es obligatorio y debe tener al menos 3 caracteres.';
          return;
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
          errorDiv.textContent = 'Correo electrónico inválido.';
          return;
        }
        if (!password || password.length < 6) {
          errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
          return;
        }
        // Validar email único
        const users = await get('usuarios');
        if (users.some(u => u.email === email)) {
          errorDiv.textContent = 'El correo ya está registrado.';
          return;
        }
        // Por defecto, todos son usuarios normales
        const nuevoUsuario = {
          nombre: nombre,
          apellido: '',
          email: email,
          password: password,
          admin: false
        };
        try {
          await import('./services.js').then(({ post }) => post('usuarios', nuevoUsuario));
          alert('Registro exitoso. Ahora puedes iniciar sesión.');
          window.location.hash = '/';
        } catch (err) {
          errorDiv.textContent = 'Error al registrar usuario.';
        }
      });
      // Ir a login
      const goLogin = document.getElementById('go-login');
      if (goLogin) {
        goLogin.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.hash = '/';
        });
      }
    }
  }
  // CATÁLOGO
  if (route === '/catalogo') {
    renderCatalogo();
  }
}

// Helper: obtener usuario logueado
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}


// Renderizar eventos en cartas con grid y estilos
async function renderCatalogo() {
  // Mensaje flotante (notificación)
  let notif = document.getElementById('catalogo-notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'catalogo-notif';
    notif.style.position = 'fixed';
    notif.style.top = '32px';
    notif.style.left = '50%';
    notif.style.transform = 'translateX(-50%)';
    notif.style.zIndex = '2000';
    notif.style.background = '#1976d2';
    notif.style.color = '#fff';
    notif.style.padding = '0.9rem 2.1rem';
    notif.style.borderRadius = '7px';
    notif.style.boxShadow = '0 2px 16px rgba(25,118,210,0.12)';
    notif.style.fontWeight = '500';
    notif.style.fontSize = '1.06rem';
    notif.style.display = 'none';
    notif.style.transition = 'opacity 0.18s';
    document.body.appendChild(notif);
  }
  function showNotif(msg, ok=true) {
    notif.textContent = msg;
    notif.style.background = ok ? '#1976d2' : '#d32f2f';
    notif.style.display = 'block';
    notif.style.opacity = '1';
    setTimeout(()=>{
      notif.style.opacity = '0';
      setTimeout(()=>{notif.style.display='none';}, 350);
    }, 1800);
  }

  const contenedor = document.getElementById('catalogo-lista');
  if (!contenedor) return;
  contenedor.innerHTML = '<div style="text-align:center;">Cargando eventos...</div>';
  try {
    const eventos = await get('eventos');
    if (!eventos || eventos.length === 0) {
      contenedor.innerHTML = '<div style="text-align:center;">No hay eventos disponibles.</div>';
      return;
    }
    const user = getUser();
    // Inyectar modal si es admin
    if (user && user.admin && !document.getElementById('modal-eventos')) {
      fetch('./pages/modal-eventos.html').then(r => r.text()).then(modalHtml => {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      });
    }
    let html = '';
    // Botón agregar eventos
    if (user && user.admin) {
      html += '<button id="agregar-evento-btn" class="catalog-card-btn" style="margin-bottom:1.5rem;">Agregar evento</button>';
    }
    html += '<div class="catalogo-grid">';
    for (const evento of eventos) {
      html += `
        <div class="catalog-card">
          <img class="catalog-card-img" src="${evento.imagen}" alt="${evento.nombre}" />
          <div class="catalog-card-body">
            <div class="catalog-card-title">${evento.nombre}</div>
            <div class="catalog-card-fecha"><b>fecha:</b> ${evento.fecha ? evento.fecha : 'Desconocido'}</div>
            <div class="catalog-card-desc">${evento.descripcion}</div>
            <div class="catalog-card-price">$${evento.precio}</div>
            <button class="catalog-card-btn">Ver más</button>
            ${user && user.admin ? `
              <button class="catalog-card-btn editar-evento-btn" data-id="${evento.id}" style="background:#1976d2;margin-top:0.5rem;">Editar</button>
              <button class="catalog-card-btn eliminar-evento-btn" data-id="${evento.id}" style="background:#d32f2f;margin-top:0.5rem;">Eliminar</button>
            ` : ''}
          </div>
        </div>
      `;
    }
    html += '</div>';
    contenedor.innerHTML = html;
    // Listeners CRUD para bibliotecario
    if (user && user.admin) {
      // Mostrar modal agregar
      const openModal = async (modo, eventoData = null) => {
        // Espera a que el modal esté en el DOM
        let modal = document.getElementById('modal-evento');
        if (!modal) {
          const modalHtml = await fetch('./pages/modal-evento.html').then(r => r.text());
          document.body.insertAdjacentHTML('beforeend', modalHtml);
          modal = document.getElementById('modal-evento');
        }
        modal.style.display = 'flex';
        const form = document.getElementById('form-evento');
        const title = document.getElementById('modal-evento-title');
        const errorDiv = document.getElementById('evento-error');
        errorDiv.textContent = '';
        // Reset form
        form.reset();
        if (modo === 'editar' && eventoData) {
          title.textContent = 'Editar evento';
          document.getElementById('evento-nombre').value = eventoData.nombre;
          document.getElementById('evento-fecha').value = eventoData.fecha;
          document.getElementById('evento-descripcion').value = eventoData.descripcion;
          document.getElementById('evento-precio').value = eventoData.precio;
          document.getElementById('evento-imagen').value = eventoData.imagen;
        } else {
          title.textContent = 'Agregar evento';
        }
        // Cancelar
        document.getElementById('evento-cancel').onclick = () => { modal.style.display = 'none'; };
        // Submit
        form.onsubmit = async (e) => {
          e.preventDefault();
          const nombre = document.getElementById('evento-nombre').value.trim();
          const fecha = document.getElementById('evento-fecha').value.trim();
          const descripcion = document.getElementById('evento-descripcion').value.trim();
          const precio = Number(document.getElementById('evento-precio').value);
          const imagen = document.getElementById('evento-imagen').value.trim();
          // Validaciones estrictas
          if (!nombre || !fecha || !descripcion || !precio || !imagen) {
            errorDiv.textContent = 'Todos los campos son obligatorios.';
            return;
          }
          if (nombre.length < 2) {
            errorDiv.textContent = 'El nombre debe tener al menos 2 caracteres.';
            return;
          }
          if (fecha.length < 2) {
            errorDiv.textContent = 'la fecha debe tener al menos 2 caracteres.';
            return;
          }
          if (descripcion.length < 10) {
            errorDiv.textContent = 'La descripción debe tener al menos 10 caracteres.';
            return;
          }
          if (isNaN(precio) || precio <= 0) {
            errorDiv.textContent = 'El precio debe ser mayor que 0.';
            return;
          }
          if (!/^https?:\/\//.test(imagen)) {
            errorDiv.textContent = 'La URL de la imagen debe ser válida.';
            return;
          }
          try {
            const { post, put, get } = await import('./services.js');
            const eventos = await get('eventos');
            // Validación de título duplicado (ignorando el propio evento en edición)
            const nombreNormalizado = nombre.trim().toLowerCase().replace(/\s+/g, ' ');
            const existeDuplicado = eventos.some(e => {
              if (modo === 'editar' && eventoData && Number(e.id) === Number(eventoData.id)) return false;
              return e.nombre.trim().toLowerCase().replace(/\s+/g, ' ') === nombreNormalizado;
            });
            if (existeDuplicado) {
              errorDiv.textContent = 'Ya existe un evento con ese nombre.';
              return;
            }
            if (modo === 'editar' && eventoData) {
              // Buscar evento original por id
              const eventos = await get('eventos');
              const eventoOriginal = eventos.find(e => e.id === eventoData.id);
              if (!eventoOriginal) throw new Error('Evento no encontrado');
              await put('/eventos', eventoOriginal.id, { id: eventoOriginal.id, nombre, fecha, descripcion, precio, imagen });
            } else {
              // Generar id incremental automáticamente
              const eventos = await get('eventos');
              let maxId = 0;
              eventos.forEach(e => { if (typeof e.id === 'number' && e.id > maxId) maxId = e.id; });
              const nuevoEvento = { id: Number(maxId + 1), nombre, fecha, descripcion, precio, imagen };
              await post('eventos', nuevoEvento);
            }
            modal.style.display = 'none';
            renderCatalogo();
          } catch (err) {
            errorDiv.textContent = 'Error al guardar evento.';
          }
        };

      };
      // Botón agregar
      const agregarBtn = document.getElementById('agregar-evento-btn');
      if (agregarBtn) {
        agregarBtn.onclick = () => openModal('agregar');
      }
      // Botones editar
      document.querySelectorAll('.editar-evento-btn').forEach(btn => {
        btn.onclick = async () => {
          const idEvento = Number(btn.getAttribute('data-id'));
          const eventos = await get('eventos');
          const evento = eventos.find(e => Number(e.id) === idEvento);
          if (evento) openModal('editar', evento);
        };
      });
      // Botones eliminar
      document.querySelectorAll('.eliminar-evento-btn').forEach(btn => {
        btn.onclick = async () => {
          const idEvento = Number(btn.getAttribute('data-id'));
          const { deletes, get } = await import('./services.js');
          const eventos = await get('eventos');
          // Fuerza comparación numérica para ids
          const evento = eventos.find(e => Number(e.id) === idEvento);
          if (!evento) {
            showNotif('Evento no encontrado.', false);
            return;
          }
          if (!evento.id) {
            showNotif('Este evento no tiene un ID único. No se puede eliminar de forma segura.', false);
            return;
          }
          if (confirm('¿Seguro que deseas eliminar el evento "'+evento.nombre+'"?')) {
            try {
              await deletes('eventos', evento.id);
              showNotif('evento eliminado correctamente.', true);
              renderCatalogo();
            } catch (err) {
                if (err && err.message) {
                    showNotif('Error al eliminar el evento: ' + err.message, false);
                } else {
                    showNotif('Error al eliminar el evento.', false);
                }
            }
          }
        };
      });
    }
  } catch (err) {
    contenedor.innerHTML = '<div style="text-align:center;color:red;">Error al cargar los eventos.</div>';
  }
}


// procesos de muestra 
window.addEventListener('load', () => {
  mostrarLogoutBtn();
  router();
});
window.addEventListener('hashchange', () => {
  mostrarLogoutBtn();
  router();
});

function mostrarLogoutBtn() {
  const logoutBtn = document.getElementById('logout-btn');
  const addBookBtn = document.getElementById('add-book-btn');
  const inicioBtn = document.querySelector('a.header-btn[href="#/"]');
  let user = localStorage.getItem('user');
  let esAdmin = false;
  if (user) {
    try {
      user = JSON.parse(user);
      esAdmin = !!user.admin;
    } catch (e) { user = null; }
  }
  if (logoutBtn) {
    if (user) {
      logoutBtn.style.display = 'inline-block';
      logoutBtn.onclick = function() {
        localStorage.removeItem('user');
        window.location.hash = '/';
        mostrarLogoutBtn();
      };
    } else {
      logoutBtn.style.display = 'none';
      logoutBtn.onclick = null;
    }
  }
  if (addBookBtn) {
    if (user && esAdmin) {
      addBookBtn.style.display = 'inline-block';
    } else {
      addBookBtn.style.display = 'none';
    }
  }
  if (inicioBtn) {
    if (user) {
      inicioBtn.style.display = 'none';
    } else {
      inicioBtn.style.display = 'inline-block';
    }
  }
}
