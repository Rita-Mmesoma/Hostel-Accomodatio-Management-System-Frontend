const styles = {
  Low: 'bg-stone-100 text-stone-500',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-600',
}

const PriorityPill = ({ priority }) => {
  return (
    <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${styles[priority]}`}>
      {priority} priority
    </span>
  )
}

export default PriorityPill