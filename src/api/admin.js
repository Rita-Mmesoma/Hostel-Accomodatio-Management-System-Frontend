import { request } from './client'

export const getAllHostels = () => request('/admin/get-all-hostel')
export const getAllRooms = () => request('/admin/room/get-all-room')
export const getAllBeds = () => request('/admin/bed/get-all-bed')
export const getAllIssues = () => request('/admin/all/issues')
export const getSchoolFeeRecords = () => request('/admin/all/school-fee-records')
export const completeCheckIn = (code) =>
  request('/admin/check-in', {
    method: 'POST',
    body: JSON.stringify({ code }),
})

export const createHostel = (formData) =>
  request('/admin/create-hostel', { method: 'POST', body: formData })

export const updateHostel = (id, formData) =>
  request(`/admin/update-hostel/${id}`, { method: 'PATCH', body: formData })

export const deactivateHostel = (id) =>
  request(`/admin/delete-hostel/${id}`, { method: 'DELETE' })

export const activateHostel = (id) =>
  request(`/admin/${id}/activate`, { method: 'PATCH' })

export const createRoom = (hostelId, roomNumber, capacity) =>
  request('/admin/create-room', {
    method: 'POST',
    body: JSON.stringify({ hostelId, roomNumber, capacity }),
})

export const updateRoom = (roomId, fields) =>
  request(`/admin/room/update-room/${roomId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })

export const deactivateRoom = (roomId) =>
  request(`/admin/room/deactivate-room/${roomId}`, { method: 'PATCH' })

export const activateRoom = (roomId) =>
  request(`/admin/room/${roomId}/activate`, { method: 'PATCH' })

export const createBed = (roomId, bedNumber) =>
  request('/admin/create-bed', {
    method: 'POST',
    body: JSON.stringify({ roomId, bedNumber }),
  })

export const updateBed = (bedId, bedNumber) =>
  request(`/admin/bed/update-bed/${bedId}`, {
    method: 'PATCH',
    body: JSON.stringify({ bedNumber }),
})

export const updateIssueStatus = (issueId, status) =>
  request(`/admin/issues/${issueId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
})

export const deleteIssue = (issueId) =>
  request(`/admin/issues/${issueId}`, { method: 'DELETE' })

export const fundBankAccount = (accountNumber, amount) =>
  request('/admin/fund/bank-account', {
    method: 'POST',
    body: JSON.stringify({ accountNumber, amount }),
})

export const getAllTransactions = () => request('/admin/all/transactions')