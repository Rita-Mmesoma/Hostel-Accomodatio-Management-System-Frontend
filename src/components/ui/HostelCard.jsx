import { Link } from 'react-router-dom'

const HostelCard = ({ id, name, gender, level, availableBeds, totalBeds }) => {
  const full = availableBeds === 0

  return (
    <div className='bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col'>

      <div className='h-24 bg-linear-to-br from-green-700 to-green-900 flex items-end p-4'>
        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white'>
          <span className='w-1.5 h-1.5 rounded-full bg-current' />
          {gender}
        </span>
      </div>

      <div className='p-5 flex flex-col gap-3 flex-1'>
        <h3 className='text-lg font-semibold'>{name}</h3>

        <div className='flex justify-between text-sm text-gray-500'>
          <span>{level}</span>
          <span>{totalBeds} bed spaces</span>
        </div>

        <div className='flex justify-between items-center text-sm text-gray-500'>
          <span>{full ? 'No space available' : `${availableBeds} beds available`}</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${
              full ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}
          >
            <span className='w-1.5 h-1.5 rounded-full bg-current' />
            {full ? 'Full' : 'Open'}
          </span>
        </div>

        {full ? (
          <button disabled className='w-full py-3 rounded-lg border border-stone-200 text-gray-400 cursor-not-allowed'>
            Fully booked
          </button>
        ) : (
          <Link
            to={`/reserve/${id}`}
            className='w-full py-3 rounded-lg bg-green-700 text-white font-semibold text-center hover:bg-green-800 transition-colors'
          >
            View rooms
          </Link>
        )}
      </div>
    </div>
  )
}

export default HostelCard