import { request } from './client'

export const loginStudent = (registrationNo, rrr) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ registrationNo, rrr }),
})

export const loginAdmin = (email, password) =>
  request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
})

export const saveLogin = (res, role) => {
  const data = res.data
  const token = typeof data === 'string' ? data : data?.token
  localStorage.setItem('token', token)
  localStorage.setItem('role', role)
}

export const clearLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('reservationExpiresAt')
  localStorage.removeItem('checkIn')
}