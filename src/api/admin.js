import { request } from './client'

export const getAllHostels = () => request('/admin/get-all-hostel')
export const getAllRooms = () => request('/admin/room/get-all-room')
export const getAllBeds = () => request('/admin/bed/get-all-bed')
export const getAllIssues = () => request('/admin/all/issues')
export const getSchoolFeeRecords = () => request('/admin/all/school-fee-records')