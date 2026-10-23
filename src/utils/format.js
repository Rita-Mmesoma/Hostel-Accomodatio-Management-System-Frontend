// "IN_PROGRESS" -> "In Progress"
export const formatStatus = (status) =>
  status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

// "2026-09-23T02:50:38.392Z" -> "23 Sep 2026"
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })