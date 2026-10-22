import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

const UserInfo = ({ name, role }) => {
  // "Chidinma Okafor" -> "CO"
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')

  return (
    <div className='flex items-center gap-4'>
      {/* <button
        aria-label='Notifications'
        className='relative w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-gray-500 hover:bg-stone-50 cursor-pointer'
      >
        <Bell size={18} />
        <span className='absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white' />
      </button> */}

      <Link
        to='/signout'
        className='flex items-center gap-3 pl-4 border-l border-stone-200 hover:opacity-80 transition-opacity'
      >

        <div className='w-9 h-9 rounded-full bg-green-50 text-green-900 text-sm font-semibold flex items-center justify-center'>
          {initials}
        </div>
        <div className='hidden sm:block leading-tight'>
          <p className='text-sm font-semibold'>{name}</p>
          <p className='text-xs text-gray-400'>{role}</p>
        </div>
      </Link>
    </div>
  )
}

export default UserInfo