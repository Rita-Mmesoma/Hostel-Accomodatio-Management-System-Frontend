const BASE_URL = import.meta.env.VITE_API_URL

export async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
            headers: {
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.')
  }

  const result = await response.json().catch(() => null)

  if (response.status === 401 && token) {
    const goTo = localStorage.getItem('role') === 'admin' ? '/adminlogin' : '/'
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    window.location.href = goTo
    throw new Error('Your session has expired. Please log in again.')
  }

  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || 'Something went wrong. Please try again.')
    error.code = result?.code
    error.status = response.status
    throw error
  }

  return result
}