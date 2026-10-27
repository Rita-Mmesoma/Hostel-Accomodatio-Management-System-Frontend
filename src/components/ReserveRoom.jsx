import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HostelCard from './ui/HostelCard'
import Loader, { Spinner } from './ui/Loader'
import ErrorMessage from './ui/ErrorMessage'
import StatusBadge from './ui/StatusBadge'
import { getHostels, applyForHostel, reserveBed } from '../api/hostels'
import { useProfile } from '../context/ProfileContext'
import { isAccommodationPaid } from '../utils/checkIn'

const formatFee = (fee) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(fee))

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm'
const buttonClass =
  'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'

const ReserveRoom = () => {
  const { profile, loading: profileLoading, refreshProfile } = useProfile()

  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [step, setStep] = useState('choose') // 'choose' | 'applied' | 'reserved'
  const [applyingId, setApplyingId] = useState(null)
  const [reserving, setReserving] = useState(false)
  const [actionError, setActionError] = useState('')
  const [queueWaiting, setQueueWaiting] = useState(false)
  const [appliedHostel, setAppliedHostel] = useState('')
  const [reservation, setReservation] = useState(null)

  const loadHostels = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await getHostels()
      setHostels(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHostels()
  }, [])

  // Automatically restore active application state from profile
  useEffect(() => {
    if (
      profile?.application &&
      profile.application.status !== 'ALLOCATED' &&
      profile.application.status !== 'CANCELLED'
    ) {
      const hostelName = profile.application.hostel?.name || appliedHostel
      if (hostelName) setAppliedHostel(hostelName)
      setStep('applied')
    }
  }, [profile])

  const handleApply = async (hostelId) => {
    setActionError('')
    setApplyingId(hostelId)

    try {
      const res = await applyForHostel(hostelId)
      setAppliedHostel(res.data?.hostel?.name || '')
      setStep('applied')
    } catch (err) {
      // already applied earlier or already has active application/reservation?
      const msg = err.message?.toLowerCase() || ''
      if (
        err.code === 'ACTIVE_APPLICATION_EXISTS' ||
        msg.includes('already') ||
        msg.includes('active') ||
        msg.includes('reserved')
      ) {
        setAppliedHostel('')
        await refreshProfile()
        setStep('applied')
      } else {
        setActionError(err.message)
      }
    } finally {
      setApplyingId(null)
    }
  }

  const handleReserve = async () => {
    setActionError('')
    setQueueWaiting(false)
    setReserving(true)

    try {
      const res = await reserveBed()
      const alloc = res.data?.allocation || res.data
      const regNo = profile?.registrationNo || localStorage.getItem('studentRegNo')
      if (alloc) {
        if (regNo) {
          localStorage.setItem(`allocation:${regNo}`, JSON.stringify(alloc))
          localStorage.setItem(`hasReservedBed:${regNo}`, 'true')
        }
        localStorage.setItem('activeAllocation', JSON.stringify(alloc))
        localStorage.setItem('hasReservedBed', 'true')
        if (alloc.expiresAt) {
          localStorage.setItem('reservationExpiresAt', alloc.expiresAt)
        }
      }
      setReservation(alloc)
      setStep('reserved')
      await refreshProfile() // so the Payments page and dashboard see the new reservation
    } catch (err) {
      const msg = err.message?.toLowerCase() || ''
      if (err.code === 'FCFS_QUEUE_NOT_REACHED') {
        // not an error: other students applied before this one
        setQueueWaiting(true)
      } else if (
        err.code === 'ALLOCATION_ALREADY_EXISTS' ||
        msg.includes('already has an allocation') ||
        msg.includes('already allocated') ||
        msg.includes('already reserved')
      ) {
        const regNo = profile?.registrationNo || localStorage.getItem('studentRegNo')
        if (regNo) localStorage.setItem(`hasReservedBed:${regNo}`, 'true')
        localStorage.setItem('hasReservedBed', 'true')
        await refreshProfile()
        setStep('reserved')
      } else {
        setActionError(err.message)
        await refreshProfile() // maybe the bed was already allocated
      }
    } finally {
      setReserving(false)
    }
  }

  if (loading || profileLoading) {
    return <Loader text='Loading hostels...' />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadHostels} />
  }

  // Resolve whether the user currently has an active reservation or allocation
  const getSavedAlloc = () => {
    try {
      const regNo = profile?.registrationNo || localStorage.getItem('studentRegNo')
      const raw =
        (regNo && localStorage.getItem(`allocation:${regNo}`)) ||
        localStorage.getItem('activeAllocation')
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const regNo = profile?.registrationNo || localStorage.getItem('studentRegNo')
  const savedAlloc = getSavedAlloc()
  const activeAlloc = reservation || profile?.allocation || savedAlloc
  const application = profile?.application

  const hostelId =
    activeAlloc?.hostel?.id ||
    activeAlloc?.bed?.room?.hostel?.id ||
    activeAlloc?.hostelId ||
    application?.hostelId ||
    application?.hostel?.id

  const matchedHostel = hostels.find((h) => h.id === hostelId)

  const allocHostel =
    activeAlloc?.hostel ||
    activeAlloc?.bed?.room?.hostel ||
    matchedHostel ||
    application?.hostel ||
    null

  const allocRoom = activeAlloc?.room || activeAlloc?.bed?.room || null
  const allocBed = activeAlloc?.bed || null

  const isReserved =
    activeAlloc?.status === 'RESERVED' ||
    allocBed?.status === 'RESERVED' ||
    Boolean(localStorage.getItem('reservationExpiresAt')) ||
    Boolean(localStorage.getItem(`hasReservedBed:${regNo}`)) ||
    Boolean(localStorage.getItem('hasReservedBed')) ||
    application?.status === 'ALLOCATED'

  const alreadyPaid = isAccommodationPaid(regNo, activeAlloc)

  const hasReservedOrAllocatedBed = Boolean(
    reservation ||
    activeAlloc?.id ||
    allocBed ||
    (activeAlloc?.room && allocHostel) ||
    activeAlloc?.status === 'RESERVED' ||
    activeAlloc?.status === 'ALLOCATED' ||
    application?.status === 'ALLOCATED' ||
    localStorage.getItem(`hasReservedBed:${regNo}`) ||
    localStorage.getItem('hasReservedBed')
  )

  // Has a room reserved or allocated: show the room details and payment button instead of all hostels
  if (hasReservedOrAllocatedBed) {
    const hostelName =
      allocHostel?.name || appliedHostel || (profile?.gender?.toUpperCase() === 'FEMALE' ? 'Okeke' : 'Hall Aa')
    const roomNumber = allocRoom?.roomNumber
      ? `Room ${allocRoom.roomNumber}`
      : activeAlloc?.roomNumber
      ? `Room ${activeAlloc.roomNumber}`
      : 'Room A02'
    const bedNumber = allocBed?.bedNumber
      ? `Bed ${allocBed.bedNumber}`
      : activeAlloc?.bedNumber
      ? `Bed ${activeAlloc.bedNumber}`
      : 'Bed B1'
    const expiresAt = activeAlloc?.expiresAt || localStorage.getItem('reservationExpiresAt')
    const expires = expiresAt
      ? new Date(expiresAt).toLocaleString('en-NG', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null

    const fee = allocHostel?.accommodationFee || matchedHostel?.accommodationFee || 35000

    return (
      <div className={boxClass}>
        <div className='flex justify-center mb-3'>
          <StatusBadge status={alreadyPaid ? 'Allocated' : 'Pending Payment'} />
        </div>
        <h2 className='text-2xl font-bold mb-2'>
          {alreadyPaid ? 'Bed space allocated' : 'Bed space reserved'}
        </h2>
        <p className='text-gray-600 mb-6'>
          {alreadyPaid
            ? 'Your bed space is confirmed. You can view your move-in check-in code anytime.'
            : 'Your room and bed space have been reserved. Proceed to payment to complete your reservation.'}
        </p>

        <div className='bg-stone-50 border border-stone-200 rounded-xl p-5 text-left mb-6 divide-y divide-stone-200/70'>
          <div className='flex justify-between py-2 text-sm'>
            <span className='text-gray-500'>Hostel</span>
            <span className='font-semibold text-gray-900'>{hostelName}</span>
          </div>
          <div className='flex justify-between py-2 text-sm'>
            <span className='text-gray-500'>Room</span>
            <span className='font-semibold text-gray-900'>{roomNumber}</span>
          </div>
          <div className='flex justify-between py-2 text-sm'>
            <span className='text-gray-500'>Bed space</span>
            <span className='font-semibold text-gray-900'>{bedNumber}</span>
          </div>
          {fee && (
            <div className='flex justify-between py-2 text-sm'>
              <span className='text-gray-500'>Accommodation fee</span>
              <span className='font-semibold text-gray-900'>{formatFee(fee)}</span>
            </div>
          )}
          {expires && !alreadyPaid && (
            <div className='flex justify-between py-2 text-sm'>
              <span className='text-gray-500'>Payment deadline</span>
              <span className='font-semibold text-amber-700'>{expires}</span>
            </div>
          )}
        </div>

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Link
            to={alreadyPaid ? '/check-in-code' : '/payments'}
            className={buttonClass}
          >
            {alreadyPaid ? 'View check-in code' : 'Go to payment'}
          </Link>
          {alreadyPaid && (
            <Link
              to='/payments'
              className='inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-stone-200 text-gray-700 font-semibold hover:bg-stone-50 transition-colors'
            >
              View receipt
            </Link>
          )}
        </div>

        {!alreadyPaid && (
          <p className='text-xs text-gray-400 mt-4'>
            Complete payment before the deadline, or this bed will be released.
          </p>
        )}
      </div>
    )
  }

  // Step 2: applied, now ask the system for a bed
  if (step === 'applied') {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>Application received</h2>
        <p className='text-gray-600 mb-5'>
          {appliedHostel
            ? `Your application for ${appliedHostel} is in. `
            : 'You already have an active hostel application. '}
          Beds are given out in the order applications came in. Click below to reserve your
          bed.
        </p>

        {queueWaiting && (
          <p className='bg-amber-50 text-amber-700 rounded-lg px-4 py-3 mb-4 text-sm'>
            Other students applied before you, so it isn't your turn yet. Wait a moment and try
            again.
          </p>
        )}

        {actionError && (
          <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{actionError}</p>
        )}

        <button onClick={handleReserve} disabled={reserving} className={buttonClass}>
          {reserving && <Spinner size={16} />}
          {reserving ? 'Reserving...' : queueWaiting ? 'Try again' : 'Reserve my bed'}
        </button>

        <button
          type='button'
          onClick={() => {
            setStep('choose')
            setActionError('')
            setQueueWaiting(false)
          }}
          className='text-sm text-green-800 font-medium hover:underline mt-4 block mx-auto cursor-pointer'
        >
          ← Choose another hostel
        </button>
      </div>
    )
  }

  // Step 1: choose a hostel (only active ones that match the student's gender)
  const visibleHostels = hostels.filter(
    (h) =>
      (!profile?.gender || h.gender?.toUpperCase() === profile.gender?.toUpperCase()) &&
      (!h.status || h.status === 'ACTIVE')
  )

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>Hostels available to you</h2>
        <p className='text-sm text-gray-500 mt-1'>
          Apply for a hostel. The system will then assign you a room and bed.
        </p>
      </div>

      {actionError && (
        <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm'>{actionError}</p>
      )}

      {visibleHostels.length === 0 ? (
        <p className='text-gray-500'>No hostels are available right now.</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {visibleHostels.map((h) => (
            <HostelCard
              key={h.id}
              {...h}
              onApply={handleApply}
              applying={applyingId === h.id}
              disabled={applyingId !== null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ReserveRoom