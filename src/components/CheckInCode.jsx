import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Printer } from 'lucide-react'
import Loader from './ui/Loader'
import { useProfile } from '../context/ProfileContext'
import { isAccommodationPaid, getOrGenerateCheckIn } from '../utils/checkIn'

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto'
const linkClass =
  'inline-block px-6 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors'

const steps = [
  'Go to your hostel reception with your student ID card.',
  'Present this check-in code to the porter on duty.',
  'The porter verifies the code in the system to allocate your room keys.',
  "Once verified, the code is marked as used and cannot be reused.",
]

// "2026-09-26T22:43:31.511Z" -> "26 Sep 2026"
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const CheckInCode = () => {
  const { profile, loading } = useProfile()
  const [copied, setCopied] = useState(false)

  if (loading) {
    return <Loader text='Loading your check-in code...' />
  }

  const allocation = profile?.allocation
  const hostel = allocation?.hostel || allocation?.bed?.room?.hostel
  const room = allocation?.room || allocation?.bed?.room
  const bed = allocation?.bed

  const regNo = profile?.registrationNo || localStorage.getItem('studentRegNo')
  const hasPaid = isAccommodationPaid(regNo, allocation)

  // no bed yet
  if (!hostel && !allocation && !hasPaid) {
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
  if (!hasPaid && (allocation?.status === 'RESERVED' || allocation?.bed?.status === 'RESERVED')) {
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

  // Retrieve code from server profile or persistent generator
  const checkIn = allocation?.checkIn || getOrGenerateCheckIn(regNo, allocation)

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

  const hostelName =
    hostel?.name ||
    (profile?.gender?.toUpperCase() === 'FEMALE' ? 'Okeke' : 'Hall Aa')
  const roomNumber = room?.roomNumber ? `Room ${room.roomNumber}` : (allocation?.roomNumber || 'Room 100')
  const bedNumber = bed?.bedNumber ? `Bed ${bed.bedNumber}` : (allocation?.bedNumber || 'Bed B1')

  const handleCopy = () => {
    navigator.clipboard?.writeText(checkIn.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className='flex items-center justify-between max-w-md mx-auto mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>My Check-in Code</h2>
        <button
          type='button'
          onClick={() => window.print()}
          className='inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-gray-700 hover:bg-stone-50 transition-colors cursor-pointer'
        >
          <Printer className='w-3.5 h-3.5' />
          Print
        </button>
      </div>

      <div className='max-w-md mx-auto bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden'>
        <div className='bg-green-950 text-center px-6 py-6'>
          <p className='text-sm text-white/70 mb-1'>
            {hostelName} · {roomNumber} · {bedNumber}
          </p>
          <p className='text-white font-semibold text-lg'>{profile?.fullName || 'Deborah Nwobi'}</p>
          <p className='text-xs text-white/60 font-mono mt-0.5'>{regNo}</p>
        </div>

        <div className='relative'>
          <div className='mx-6 border-t-2 border-dashed border-stone-200' />
          <div className='absolute -top-3 -left-3 w-6 h-6 rounded-full bg-gray-50' />
          <div className='absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gray-50' />
        </div>

        <div className='px-6 pt-6 pb-7'>
          <p className='text-center text-xs font-semibold text-gray-500 tracking-wider uppercase'>
            SHOW THIS CODE TO THE PORTER
          </p>

          <div className='relative mt-4 mb-3'>
            <p className='rounded-2xl border-2 border-green-700/20 bg-green-50/70 py-4 px-4 text-center font-mono text-3xl sm:text-4xl font-bold tracking-widest text-green-900 break-all select-all'>
              {checkIn.code}
            </p>
            <button
              type='button'
              onClick={handleCopy}
              className='absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-green-800 text-white hover:bg-green-900 transition-colors cursor-pointer shadow-sm'
              title='Copy Check-in Code'
            >
              {copied ? <Check className='w-4 h-4 text-green-200' /> : <Copy className='w-4 h-4' />}
            </button>
          </div>

          {copied && (
            <p className='text-center text-xs text-green-700 font-semibold mb-2'>
              ✓ Check-in code copied to clipboard!
            </p>
          )}

          {used && <p className='text-center text-sm text-red-600 font-medium'>This code has already been used.</p>}
          {!used && expired && (
            <p className='text-center text-sm text-red-600 font-medium'>
              This code has expired. Please contact the hostel management office.
            </p>
          )}
          {!used && !expired && (
            <p className='text-center text-xs text-gray-500'>
              Valid for one check-in only
              {checkIn.expiresAt && ` · Expires ${formatDate(checkIn.expiresAt)}`}
            </p>
          )}

          <div className='mt-6 pt-5 border-t border-stone-100'>
            <p className='text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3'>
              Check-in Steps
            </p>
            <ol className='flex flex-col gap-2.5'>
              {steps.map((step, i) => (
                <li key={i} className='flex gap-3 text-xs text-gray-600'>
                  <span className='w-5 h-5 shrink-0 rounded-full bg-green-100 text-green-900 text-[11px] font-bold flex items-center justify-center mt-0.5'>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className='mt-6 pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-gray-500'>
            <span>Need receipt?</span>
            <Link to='/payments' className='text-green-800 font-semibold hover:underline'>
              View Payment Receipt →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInCode
