const baseUrl = 'http://localhost:3000';

export async function get(path){
 try {
    const response = await fetch(`${baseUrl}/${path}`);
    const data = await response.json();
    return data;
 } catch (error) {
    console.error(error);
 }   
}

export  async function post(path, obj){
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
        const numericId = Number(id);
        const response = await fetch(`${baseUrl}/${path}/${numericId}`, {
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

// eliminar evento por la id
export async function deletes(path, id) {
    try {
        // Fuerza id a número y usa slash correcto
        const numericId = Number(id);
        const response = await fetch(`${baseUrl}/${path}/${numericId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error_text = await response.text();
            throw new Error(`Error ${response.status}: ${error_text}`);
        }
        // JSON Server retorna {} en delete
        return true;
    } catch (error) {
        console.error("Error en DELETE:", error.message || error);
        throw error;
    }
}