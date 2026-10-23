import { request } from './client'

export const getAuthProfile = () => request('/auth/profile')

export const getStudentProfile = () => request('/user/student/profile')