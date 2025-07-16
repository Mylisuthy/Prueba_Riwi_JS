import { get, post, put, deletes } from './services.js';

// Helper: Show notification
function showNotification(message, isSuccess = true) {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.className = 'notification'; // Use CSS class for styling
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.className = isSuccess ? 'notification success' : 'notification error'; // Apply success/error styles
  notif.style.display = 'block';
  notif.style.opacity = '1';
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => { notif.style.display = 'none'; }, 350);
  }, 1800);
}

// Función para generar IDs únicos como cadenas de texto
function generateId(prefix = 'evt') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

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
  const contenedor = document.getElementById('catalogo-lista');
  if (!contenedor) return;
  contenedor.innerHTML = '<div class="text-center">Cargando eventos...</div>';
  try {
    const eventos = await get('eventos');
    if (!eventos || eventos.length === 0) {
      contenedor.innerHTML = '<div class="text-center">No hay eventos disponibles.</div>';
      return;
    }
    const user = getUser();
    let html = '';
    // Botón agregar eventos
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

    // Listeners CRUD para bibliotecario
    if (user && user.admin) {
      const agregarBtn = document.getElementById('agregar-evento-btn');
      if (agregarBtn) {
        agregarBtn.onclick = () => openModal('agregar');
      }
      document.querySelectorAll('.editar-evento-btn').forEach(btn => {
        btn.onclick = async () => {
          const idEvento = btn.getAttribute('data-id');
          const eventos = await get('eventos');
          const evento = eventos.find(e => e.id === idEvento);
          if (evento) openModal('editar', evento);
        };
      });
      document.querySelectorAll('.eliminar-evento-btn').forEach(btn => {
        btn.onclick = async () => {
          const idEvento = btn.getAttribute('data-id');
          const eventos = await get('eventos');
          const evento = eventos.find(e => e.id === idEvento);
          if (!evento) {
            showNotification('Evento no encontrado.', false);
            return;
          }
          if (confirm(`¿Seguro que deseas eliminar el evento "${evento.nombre}"?`)) {
            try {
              await deletes('eventos', evento.id);
              showNotification('Evento eliminado correctamente.', true);
              renderCatalogo();
            } catch (err) {
              showNotification('Error al eliminar el evento.', false);
            }
          }
        };
      });
    }
  } catch (err) {
    contenedor.innerHTML = '<div class="text-center text-danger">Error al cargar los eventos.</div>';
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
