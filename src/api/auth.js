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

export const saveLogin = (res, role, extra = {}) => {
  const data = res.data
  const token = typeof data === 'string' ? data : data?.token
  localStorage.setItem('token', token)
  localStorage.setItem('role', role)
  if (extra.registrationNo) {
    localStorage.setItem('studentRegNo', extra.registrationNo)
  }
  if (extra.rrr) {
    localStorage.setItem('studentRrr', extra.rrr)
  }
}

export const clearLogin = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  // We intentionally preserve studentRegNo and active reservation/allocation data
  // so students logging back in on this browser do not lose their reserved bed space.
}
