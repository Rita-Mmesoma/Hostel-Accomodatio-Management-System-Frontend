import { request } from './client'

export const getHostels = () => request('/user/get-all-hostel')

export const getHostel = (id) => request(`/user/${id}`)

export const applyForHostel = (hostelId) =>
  request('/user/hostel-application', {
    method: 'POST',
    body: JSON.stringify({ hostelId }),
  })

// the backend picks the room and bed
export const reserveBed = () =>
  request('/user/allocation', {
    method: 'POST',
    body: JSON.stringify({}),
  })