/*const baseUrl = 'http://localhost:3000';

export async function get(path){
 try {
    const response = await fetch(`${baseUrl}/${path}`);
    const data = await response.json();
    return data;
 } catch (error) {
    console.error(error);
 }   
}

export async function post(path, obj) {
    try {
        const response = await fetch(`${baseUrl}/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });
        if (!response.ok) {
            const error_text = await response.text();
            throw new Error(`Error ${response.status}: ${error_text}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en post:", error.message || error);
        throw error;
    }
}

// Edita un evento por su id. Debe enviar el objeto completo (incluyendo id)
export async function put(path, id, obj) {
    try {
        const response = await fetch(`${baseUrl}/${path}/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        });
        if (!response.ok) {
            const error_text = await response.text();
            throw new Error(`Error ${response.status}: ${error_text}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en PUT:", error.message || error);
        throw error;
    }
}

// Elimina un recurso por su path completo (ej: 'eventos/3')
export async function deletes(path) {
    try {
        const response = await fetch(`${baseUrl}/${path}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error_text = await response.text();
            throw new Error(`Error ${response.status}: ${error_text}`);
        }
        return true;
    } catch (error) {
        console.error("Error en DELETE:", error.message || error);
        throw error;
    }
}

export function validateForm(fields) {
  for (const field of fields) {
    if (!field.value.trim()) {
      return `${field.name} es obligatorio.`;
    }
    if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value)) {
      return 'Correo electrónico inválido.';
    }
    if (field.type === 'password' && field.value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
  }
  return null;
}

export function showNotification(message, isSuccess = true) {
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
*/