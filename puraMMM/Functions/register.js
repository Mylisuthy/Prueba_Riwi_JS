import { validateForm, post, showNotification } from '../services.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const fields = [
                document.getElementById('reg-nombre'),
                document.getElementById('reg-email'),
                document.getElementById('reg-password')
            ];
            const error = validateForm(fields);
            const errorDiv = document.getElementById('register-error');
            if (error) {
                errorDiv.textContent = error;
                return;
            }
            try {
                const nuevoUsuario = {
                    nombre: fields[0].value.trim(),
                    email: fields[1].value.trim(),
                    password: fields[2].value.trim(),
                    admin: false
                };
                await post('usuarios', nuevoUsuario);
                showNotification('Registro exitoso. Ahora puedes iniciar sesión.');
                window.location.hash = '/';
            } catch (err) {
                errorDiv.textContent = 'Error al registrar usuario.';
            }
        });
    }
});
