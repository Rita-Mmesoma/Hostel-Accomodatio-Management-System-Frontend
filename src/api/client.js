const BASE_URL = import.meta.env.VITE_API_URL

export async function request(path, options ={}) {
    const token = localStorage.getItem('token')

    let response
    try{
        response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        })
    } catch {
        throw new Error('Cannot reach the server. Check your connection and try again.')
    }

    const result = await response.json().catch(() => null)

    if (response.status === 401 && token) {
        localStorage.removeItem('token')
        window.location.href = '/'
        throw new Error('Your session has expired. Please log in again.')
    }

    if(!response.ok || result?.success === false){
        throw new Error(result?.message || 'Something went wrong. Please try again.')
    }

    return result
}