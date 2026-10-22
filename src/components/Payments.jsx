import { useState } from 'react'
import { Link } from 'react-router-dom'
import useCountdown from '../hooks/useCountdown'
import StatusBadge from './ui/StatusBadge'

// Demo deadline: about 5h 47m from when the app loads.
// In the real app this comes from the backend (reservation time + 48 hours).
const DEADLINE = Date.now() + (5 * 60 + 47) * 60 * 1000

const invoice = {
  number: 'INV-20260920-014',
  amount: '₦45,000.00',
  rows: [
    { label: 'Hostel', value: 'Mary Slessor Hall' },
    { label: 'Room', value: 'Room A2' },
    { label: 'Corner', value: 'A2-1' },
    { label: 'Session', value: '2026/2027 — First Semester' },
  ],
}

const history = [
  { id: 1, label: 'First semester accommodation fee', amount: '₦45,000', status: 'Confirmed', date: '20 Sep 2026' },
]

const pad = (n) => String(n).padStart(2, '0')

const Payments = () => {
  const { hours, minutes, seconds, remaining } = useCountdown(DEADLINE)
  const [paid, setPaid] = useState(false)
  const urgent = remaining < 60 * 60 * 1000 // under 1 hour left

  const timeBoxes = [
    { value: hours, unit: 'hours' },
    { value: minutes, unit: 'minutes' },
    { value: seconds, unit: 'seconds' },
  ]

  return (
    <div>
      {paid ? (
        <div className='bg-white border border-stone-200 rounded-2xl p-10 text-center mb-8'>
          <StatusBadge status='Confirmed' />
          <h2 className='text-xl font-semibold mt-4 mb-1'>Payment confirmed</h2>
          <p className='text-gray-500 mb-5'>Corner A2-1 at Mary Slessor Hall is now allocated to you.</p>
          <Link
            to='/check-in-code'
            className='inline-block px-6 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors'
          >
            Get my check-in code
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-start mb-8'>

          <div className='bg-white border border-stone-200 rounded-2xl p-6'>
            <p className='text-sm text-gray-400'>Invoice #{invoice.number}</p>
            <p className='text-4xl font-bold mt-1 mb-5'>{invoice.amount}</p>

            <div className='mb-6'>
              {invoice.rows.map((row) => (
                <div
                  key={row.label}
                  className='flex justify-between py-3.5 border-b border-dashed border-stone-200 last:border-b-0'
                >
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPaid(true)}
              className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer'
            >
              Pay with Remita
            </button>
          </div>

          <div
            className={`rounded-2xl p-6 border ${
              urgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <p className='font-semibold mb-1'>
              {urgent ? 'Reservation expiring soon' : 'Reservation held'}
            </p>
            <p className='text-gray-600 mb-4'>
              Complete payment before the timer runs out, or corner A2-1 will be released back to the pool.
            </p>

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
          </div>

        </div>
      )}

      <h2 className='text-lg font-semibold mb-3'>Payment history</h2>
      <div className='bg-white border border-stone-200 rounded-2xl px-6'>
        {history.map((h) => (
          <div
            key={h.id}
            className='flex flex-wrap items-center justify-between gap-3 py-5 border-b border-stone-200 last:border-b-0'
          >
            <div>
              <p className='font-medium'>{h.label}</p>
              <p className='text-sm text-gray-400'>{h.date}</p>
            </div>
            <div className='flex items-center gap-3'>
              <span>{h.amount}</span>
              <StatusBadge status={h.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Payments