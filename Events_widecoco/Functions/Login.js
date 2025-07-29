import { showNotification } from '../services.js';

document.addEventListener('DOMContentLoaded', () => {
    const goRegister = document.getElementById('go-register');
    if (goRegister) {
        goRegister.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '/register'; // Redirigir al registro
        });
    }
});
