import { Link } from 'react-router-dom'
import Loader from './ui/Loader'
import { useProfile } from '../context/ProfileContext'

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto'
const linkClass =
  'inline-block px-6 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors'

const steps = [
  'Go to your hostel with your student ID and this code.',
  'The porter on duty will enter this code to complete your check-in.',
  "Once verified, the code becomes invalid and can't be reused or shared.",
]

// The code saved in this browser right after payment
const getSavedCheckIn = () => {
  try {
    return JSON.parse(localStorage.getItem('checkIn'))
  } catch {
    return null
  }
}

// "2026-09-26T22:43:31.511Z" -> "26 Sep 2026"
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const CheckInCode = () => {
  const { profile, loading } = useProfile()

  if (loading) {
    return <Loader text='Loading your check-in code...' />
  }

  const allocation = profile?.allocation

  // no bed yet
  if (!allocation?.hostel) {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>No bed reserved yet</h2>
        <p className='text-gray-500 mb-6'>Reserve a room and pay first. Your check-in code appears after payment.</p>
        <Link to='/reserve' className={linkClass}>
          Reserve a room
        </Link>
      </div>
    )
  }

  // bed reserved, not paid yet
  if (allocation.bed?.status === 'RESERVED') {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>Complete your payment first</h2>
        <p className='text-gray-500 mb-6'>Your check-in code is created as soon as your payment goes through.</p>
        <Link to='/payments' className={linkClass}>
          Go to my payments
        </Link>
      </div>
    )
  }

  // paid: use the code from the profile if the backend sends it, otherwise the one saved after payment
  const checkIn = allocation.checkIn || getSavedCheckIn()

  if (!checkIn?.code) {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>We can't show your code here</h2>
        <p className='text-gray-500'>
          Your check-in code is only shown right after payment on the device you paid from.
          Please contact the hostel management office to get it again.
        </p>
      </div>
    )
  }

  const used = Boolean(checkIn.usedAt)
  const expired = checkIn.expiresAt && new Date(checkIn.expiresAt) < new Date()

  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>My check-in code</h2>

      <div className='max-w-md mx-auto bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden'>

        <div className='bg-green-950 text-center px-6 py-6'>
          <p className='text-sm text-white/70 mb-1'>
            {allocation.hostel.name} · Room {allocation.room?.roomNumber} · Bed {allocation.bed?.bedNumber}
          </p>
          <p className='text-white font-semibold text-lg'>{profile.fullName}</p>
        </div>

        <div className='relative'>
          <div className='mx-6 border-t-2 border-dashed border-stone-200' />
          <div className='absolute -top-3 -left-3 w-6 h-6 rounded-full bg-gray-50' />
          <div className='absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gray-50' />
        </div>

        <div className='px-6 pt-6 pb-7'>
          <p className='text-center text-sm font-semibold text-gray-500 tracking-wide'>
            SHOW THIS CODE TO THE PORTER
          </p>

          <p className='mt-5 mb-3 rounded-xl border border-stone-200 bg-green-50 py-4 px-4 text-center font-mono text-3xl sm:text-4xl font-bold tracking-widest text-green-900 break-all'>
            {checkIn.code}
          </p>

          {used && <p className='text-center text-sm text-red-600'>This code has already been used.</p>}
          {!used && expired && (
            <p className='text-center text-sm text-red-600'>
              This code has expired. Please contact the hostel management office.
            </p>
          )}
          {!used && !expired && (
            <p className='text-center text-sm text-gray-400'>
              Valid for one check-in only
              {checkIn.expiresAt && ` · Expires ${formatDate(checkIn.expiresAt)}`}
            </p>
          )}

          <ol className='mt-5 flex flex-col gap-3'>
            {steps.map((step, i) => (
              <li key={i} className='flex gap-3 text-gray-600'>
                <span className='w-6 h-6 shrink-0 rounded-full bg-green-50 text-green-900 text-xs font-bold flex items-center justify-center mt-0.5'>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  )
}

export default CheckInCode