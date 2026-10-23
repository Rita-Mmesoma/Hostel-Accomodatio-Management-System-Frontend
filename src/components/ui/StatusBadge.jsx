const styles = {
  Confirmed: 'bg-green-50 text-green-700',
  Allocated: 'bg-green-50 text-green-700',
  Closed: 'bg-green-50 text-green-700',
  Resolved: 'bg-green-50 text-green-700',
  Active: 'bg-green-50 text-green-700',
  Available: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  'Pending Payment': 'bg-amber-50 text-amber-700',
  'In Progress': 'bg-amber-50 text-amber-700',
  Expired: 'bg-red-50 text-red-600',
  Open: 'bg-red-50 text-red-600',
  Full: 'bg-red-50 text-red-600',
}

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
        styles[status] || 'bg-stone-100 text-stone-500'
      }`}
    >
      <span className='w-1.5 h-1.5 rounded-full bg-current' />
      {status}
    </span>
  )
}

export default StatusBadge