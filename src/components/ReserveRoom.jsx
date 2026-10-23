import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HostelCard from './ui/HostelCard'
import Loader, { Spinner } from './ui/Loader'
import ErrorMessage from './ui/ErrorMessage'
import { getHostels, applyForHostel, reserveBed } from '../api/hostels'
import { useProfile } from '../context/ProfileContext'

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto'
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

  const handleApply = async (hostelId) => {
    setActionError('')
    setApplyingId(hostelId)

    try {
      await applyForHostel(hostelId)
      setStep('applied')
    } catch (err) {
      // already applied earlier? then just move on to the next step
      if (err.code === 'ACTIVE_APPLICATION_EXISTS') {
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
    setReserving(true)

    try {
      const res = await reserveBed()
      localStorage.setItem('reservationExpiresAt', res.data.expiresAt)
      setReservation(res.data)
      setStep('reserved')
      refreshProfile() // so the Payments page and dashboard see the new reservation
    } catch (err) {
      setActionError(err.message)
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

  // Step 3: the bed was reserved just now
  if (step === 'reserved' && reservation) {
    const { bed } = reservation
    const expires = new Date(reservation.expiresAt).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>Bed reserved</h2>
        <p className='text-gray-600 mb-1'>
          {bed.room.hostel.name} · Room {bed.room.roomNumber} · Bed {bed.bedNumber}
        </p>
        <p className='text-sm text-gray-500 mb-6'>
          Complete payment before {expires}, or this bed will be released.
        </p>
        <Link to='/payments' className={buttonClass}>
          Go to my payments
        </Link>
      </div>
    )
  }

  // Step 2: applied, now ask the system for a bed
  if (step === 'applied') {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>Application received</h2>
        <p className='text-gray-600 mb-5'>
          Beds are assigned in the order applications came in. Click below to
          reserve your bed. If other students are ahead of you, wait a moment
          and try again.
        </p>

        {actionError && (
          <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{actionError}</p>
        )}

        <button onClick={handleReserve} disabled={reserving} className={buttonClass}>
          {reserving && <Spinner size={16} />}
          {reserving ? 'Reserving...' : 'Reserve my bed'}
        </button>
      </div>
    )
  }

  // Already has a bed (from the profile)
  const allocation = profile?.allocation
  if (allocation?.hostel) {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>You already have a bed space</h2>
        <p className='text-gray-600 mb-6'>
          {allocation.hostel.name} · Room {allocation.room?.roomNumber} · Bed {allocation.bed?.bedNumber}
        </p>
        <Link to='/payments' className={buttonClass}>
          Go to my payments
        </Link>
      </div>
    )
  }

  // Step 1: choose a hostel (only ones matching the student's gender)
  const visibleHostels = hostels.filter(
    (h) => !profile?.gender || h.gender === profile.gender
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