import { request } from './client'

export const loginStudent = (registrationNo, rrr) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ registrationNo, rrr }),
  })