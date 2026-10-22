import HostelCard from './ui/HostelCard'
import { hostels } from '../data/hostels'

const ReserveRoom = () => {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>Hostels available to you</h2>
        <p className='text-sm text-gray-500 mt-1'>Showing hostels for 300 Level students only.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {hostels.map((h) => (
          <HostelCard key={h.id} {...h} />
        ))}
      </div>
    </div>
  )
}

export default ReserveRoom