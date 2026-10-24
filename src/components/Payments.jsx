import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useCountdown from '../hooks/useCountdown'
import Loader, { Spinner } from './ui/Loader'
import ErrorMessage from './ui/ErrorMessage'
import StatusBadge from './ui/StatusBadge'
// import TransactionHistory from './TransactionHistory'
import { useProfile } from '../context/ProfileContext'
import { getHostel } from '../api/hostels'
import { makePayment } from '../api/payments'

const formatFee = (fee) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(fee))

const pad = (n) => String(n).padStart(2, '0')

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto'
const linkClass =
  'inline-block px-6 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors'
const inputClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-green-700'

// The 48-hour reservation timer. It is its own component so the timer
// only runs when we actually have a deadline.
const Countdown = ({ deadline }) => {
  const { hours, minutes, seconds, remaining } = useCountdown(deadline)
  const expired = remaining === 0
  const urgent = remaining < 60 * 60 * 1000 // under 1 hour left

  const timeBoxes = [
    { value: hours, unit: 'hours' },
    { value: minutes, unit: 'minutes' },
    { value: seconds, unit: 'seconds' },
  ]

  return (
    <div
      className={`rounded-2xl p-6 border ${
        urgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      }`}
    >
      <p className='font-semibold mb-1'>
        {expired ? 'Reservation expired' : urgent ? 'Reservation expiring soon' : 'Reservation held'}
      </p>
      <p className='text-gray-600 mb-4'>
        {expired
          ? 'This bed has been released. Go to Reserve a Room to apply again.'
          : 'Complete payment before the timer runs out, or your bed will be released.'}
      </p>

      {!expired && (
        <div className='flex gap-3'>
          {timeBoxes.map((box) => (
            <div
              key={box.unit}
              className='bg-white border border-stone-200 rounded-xl px-5 py-3 text-center min-w-20'
            >
              <p className={`text-3xl font-bold ${urgent ? 'text-red-600' : ''}`}>{pad(box.value)}</p>
              <p className='text-xs text-gray-400'>{box.unit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// The invoice / payment part of the page
const PaymentPanel = ({ onPaid }) => {
  const { profile, loading: profileLoading, refreshProfile } = useProfile()

  const [fee, setFee] = useState(null)
  const [feeError, setFeeError] = useState('')
  const [rrr, setRrr] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [justPaid, setJustPaid] = useState(false)

  const allocation = profile?.allocation
  const hostelId = allocation?.hostel?.id
  const alreadyPaid = allocation?.bed?.status === 'OCCUPIED'

  // pre-fill the RRR from the student's school fee record
  useEffect(() => {
    if (profile?.schoolFee?.rrr) setRrr(profile.schoolFee.rrr)
  }, [profile])

  useEffect(() => {
    if (!hostelId || alreadyPaid) return

    getHostel(hostelId)
      .then((res) => setFee(res.data.accommodationFee))
      .catch((err) => setFeeError(err.message))
  }, [hostelId, alreadyPaid])

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setPaying(true)

    try {
      const res = await makePayment(rrr.trim(), Number(fee))

      // the check-in code only comes back in this response, so keep it
      localStorage.setItem(`checkIn:${profile.registrationNo}`, JSON.stringify(res.data.checkIn))
      localStorage.removeItem('reservationExpiresAt')
      await refreshProfile()
      setJustPaid(true)
      onPaid?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setPaying(false)
    }
  }

  if (profileLoading) {
    return <Loader text='Loading your payment details...' />
  }

  // no bed reserved yet
  if (!allocation?.hostel) {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>No bed reserved yet</h2>
        <p className='text-gray-500 mb-6'>Reserve a room first, then come back here to pay.</p>
        <Link to='/reserve' className={linkClass}>
          Reserve a room
        </Link>
      </div>
    )
  }

  // already paid
  if (alreadyPaid || justPaid) {
    return (
      <div className={boxClass}>
        <StatusBadge status='Confirmed' />
        <h2 className='text-xl font-semibold mt-4 mb-1'>Payment confirmed</h2>
        <p className='text-gray-500 mb-6'>
          {allocation.hostel.name} · Room {allocation.room?.roomNumber} · Bed {allocation.bed?.bedNumber} is yours.
        </p>
        <Link to='/check-in-code' className={linkClass}>
          Get my check-in code
        </Link>
      </div>
    )
  }

  // reserved but not paid yet: show the invoice
  const rows = [
    { label: 'Hostel', value: allocation.hostel.name },
    { label: 'Room', value: allocation.room?.roomNumber },
    { label: 'Bed', value: allocation.bed?.bedNumber },
  ]

  const expiresAt = allocation.expiresAt || localStorage.getItem('reservationExpiresAt')
  const deadline = expiresAt ? new Date(expiresAt).getTime() : null

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-start'>

      <div className='bg-white border border-stone-200 rounded-2xl p-6'>
        {feeError && <ErrorMessage message={feeError} />}
        {!feeError && fee === null && <Loader text='Loading invoice...' />}

        {fee !== null && (
          <>
            <p className='text-sm text-gray-400'>Hostel accommodation fee</p>
            <p className='text-4xl font-bold mt-1 mb-5'>{formatFee(fee)}</p>

            <div className='mb-6'>
              {rows.map((row) => (
                <div
                  key={row.label}
                  className='flex justify-between py-3.5 border-b border-dashed border-stone-200 last:border-b-0'
                >
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handlePay}>
              <label className='block font-medium mb-1.5'>RRR</label>
              <input
                value={rrr}
                onChange={(e) => setRrr(e.target.value)}
                placeholder='Your RRR'
                className={inputClass}
              />
              <p className='text-xs text-gray-400 mt-1.5 mb-4'>
                The fee is taken from your account balance.
              </p>

              {error && (
                <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{error}</p>
              )}

              <button
                type='submit'
                disabled={paying || !rrr.trim()}
                className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {paying && <Spinner size={16} />}
                {paying ? 'Processing...' : `Pay ${formatFee(fee)}`}
              </button>
            </form>
          </>
        )}
      </div>

      {deadline && <Countdown deadline={deadline} />}
    </div>
  )
}

// The page: the payment panel on top, the payment history below
const Payments = () => {
  // changing this number makes the history reload (see the key below)
  const [historyVersion, setHistoryVersion] = useState(0)

  return (
    <div className='flex flex-col gap-8'>
      <PaymentPanel onPaid={() => setHistoryVersion((v) => v + 1)} />
      {/* <TransactionHistory key={historyVersion} /> */}
    </div>
  )
}

export default Payments