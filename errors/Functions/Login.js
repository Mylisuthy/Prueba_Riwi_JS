import { get, showNotification } from '../services.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const loginError = document.getElementById('loginError');
            loginError.classList.add('hide');
            const users = await get('usuarios');
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                loginError.textContent = 'Correo o contraseña incorrectos';
                loginError.classList.remove('hide');
                return;
            }
            localStorage.setItem('user', JSON.stringify(user));
            showNotification(`Bienvenido, ${user.admin ? 'administrador' : 'usuario'}.`);
            window.location.hash = '/catalogo'; // Redirigir al catálogo
        });
    }

    const goRegister = document.getElementById('go-register');
    if (goRegister) {
        goRegister.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '/register'; // Redirigir al registro
        });
    }
});
