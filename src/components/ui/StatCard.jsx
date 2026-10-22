const StatCard = ({ label, value, foot, big = false }) => {
  return (
    <div className='bg-white border border-stone-200 rounded-2xl p-5'>
      <p className='text-sm text-gray-500'>{label}</p>
      <p className={`font-bold text-gray-900 mt-1.5 ${big ? 'text-3xl' : 'text-xl'}`}>
        {value}
      </p>
      {foot && <p className='text-sm text-gray-400 mt-2'>{foot}</p>}
    </div>
  )
}

export default StatCard