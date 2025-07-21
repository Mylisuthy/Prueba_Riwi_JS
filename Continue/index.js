import { renderCatalogo } from './Functions/catalogo.js';
import { get, showNotification } from './services.js'; // Asegurarse de importar 'get' y 'showNotification'
import './Functions/Login.js';
import './Functions/register.js';

const app = document.getElementById('spa-content');
const routes = {
  '/': './pages/login.html',
  '/catalogo': './pages/catalogo.html',
  '/register': './pages/register.html',
  '/registrar-evento': './pages/modal-eventos.html',
};

function router() {
    const hash = window.location.hash || '#/';
    const route = hash.slice(1);
    const user = JSON.parse(localStorage.getItem('user'));

    // Proteger rutas sensibles
    if (!user && route !== '/' && route !== '/register') {
        window.location.hash = '/';
        return;
    }

    // Cargar la vista correspondiente
    fetch(routes[route])
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar la vista.');
            return res.text();
        })
        .then(data => {
            app.innerHTML = data; // Actualizar dinámicamente el contenido del <main>
            updateHeader(user); // Actualizar el header dinámicamente
            setListeners(route, user); // Configurar eventos según la ruta
        })
        .catch(err => {
            console.error(err);
            app.innerHTML = '<div class="text-center text-danger">Error al cargar la página.</div>';
        });
}

function setListeners(route, user) {
    if (route === '/catalogo') {
        renderCatalogo(user); // Renderizar el catálogo dinámicamente
    }
    if (route === '/register') {
        const goLogin = document.getElementById('go-login');
        if (goLogin) {
            goLogin.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '/';
            });
        }
    }
    if (route === '/') {
        const goRegister = document.getElementById('go-register');
        if (goRegister) {
            goRegister.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = '/register';
            });
        }
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value.trim();
                const loginError = document.getElementById('loginError');
                loginError.classList.add('hide');
                try {
                    const users = await get('usuarios'); // Obtener usuarios desde el servidor
                    if (!Array.isArray(users)) {
                        throw new Error('La respuesta del servidor no es válida.');
                    }
                    const user = users.find(u => u.email === email && u.password === password);
                    if (!user) {
                        loginError.textContent = 'Correo o contraseña incorrectos';
                        loginError.classList.remove('hide');
                        return;
                    }
                    localStorage.setItem('user', JSON.stringify(user));
                    showNotification(`Bienvenido, ${user.admin ? 'administrador' : 'usuario'}.`);
                    window.location.hash = '/catalogo'; // Redirigir al catálogo
                } catch (error) {
                    console.error('Error al buscar usuarios:', error);
                    loginError.textContent = 'Error al iniciar sesión. Intenta nuevamente.';
                    loginError.classList.remove('hide');
                }
            });
        }
    }
}

function updateHeader(user) {
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.querySelector('a[href="#/"]');
    const catalogoBtn = document.querySelector('a[href="#/catalogo"]');

    if (logoutBtn) {
        logoutBtn.style.display = user ? 'inline-block' : 'none';
        logoutBtn.onclick = () => {
            localStorage.removeItem('user');
            window.location.hash = '/';
        };
    }
    if (loginBtn) {
        loginBtn.style.display = user ? 'none' : 'inline-block';
    }
    if (catalogoBtn) {
        catalogoBtn.style.display = user ? 'inline-block' : 'none';
    }
}

window.addEventListener('load', router);
window.addEventListener('hashchange', router);
