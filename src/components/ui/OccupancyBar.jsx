// Green under 80%, amber 80 to 95%, red above 95%
const OccupancyBar = ({ percent }) => {
  let color = 'bg-green-600'
  if (percent > 95) color = 'bg-red-600'
  else if (percent >= 80) color = 'bg-amber-500'

  return (
    <div className='w-full h-2.5 bg-stone-200 rounded-full overflow-hidden'>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

export default OccupancyBar