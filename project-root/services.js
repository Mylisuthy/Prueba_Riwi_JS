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

export async function deletes(path, id) {
    try {
        const response = await fetch(`${baseUrl}/${path}/${id}`, { // ID como string
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
