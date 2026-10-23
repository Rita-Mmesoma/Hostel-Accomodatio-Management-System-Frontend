import { request } from './client'

export const getMyIssues = () => request('/user/my/issues')

export const createIssue = (title, description) =>
  request('/user/create/issues', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })