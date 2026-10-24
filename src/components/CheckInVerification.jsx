import { useState } from 'react'
import { Spinner } from './ui/Loader'
import StatusBadge from './ui/StatusBadge'
import { completeCheckIn } from '../api/admin'

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 max-w-lg mx-auto'

const CheckInVerification = () => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // codes look like R-678-458, so tidy up spaces and lowercase letters
      const res = await completeCheckIn(code.trim().toUpperCase())
      setResult(res.data)
      setCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Success: show who was checked in
  if (result) {
    const bed = result.allocation?.bed
    const rows = [
      { label: 'Code', value: result.code },
      { label: 'Hostel', value: bed?.room?.hostel?.name },
      { label: 'Room', value: bed?.room?.roomNumber },
      { label: 'Bed', value: bed?.bedNumber },
      {
        label: 'Checked in at',
        value: result.usedAt
          ? new Date(result.usedAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
          : '',
      },
    ]

    return (
      <div className={`${boxClass} text-center`}>
        <StatusBadge status='Confirmed' />
        <h2 className='text-xl font-semibold mt-4 mb-1'>Student checked in</h2>
        <p className='text-gray-500 mb-6'>The bed is now marked as occupied.</p>

        <div className='mb-6 text-left'>
          {rows.map((row) => (
            <div
              key={row.label}
              className='flex justify-between py-3.5 border-b border-dashed border-stone-200 last:border-b-0'
            >
              <span>{row.label}</span>
              <span className='font-medium'>{row.value || '–'}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setResult(null)}
          className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer'
        >
          Verify another code
        </button>
      </div>
    )
  }

  return (
    <div className={boxClass}>
      <h2 className='text-xl font-semibold mb-1'>Verify a check-in code</h2>
      <p className='text-gray-500 mb-6'>
        Ask the student for the code shown on their My Check-in Code page. A code works once only.
      </p>

      <form onSubmit={handleSubmit}>
        <label className='block font-medium mb-1.5'>Check-in code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder='R-678-458'
          autoComplete='off'
          className='w-full border border-stone-200 rounded-lg px-4 py-3 font-mono text-lg tracking-wider uppercase outline-none focus:border-green-700 mb-4'
        />

        {error && (
          <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{error}</p>
        )}

        <button
          type='submit'
          disabled={loading || !code.trim()}
          className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {loading && <Spinner size={16} />}
          {loading ? 'Verifying...' : 'Complete check-in'}
        </button>
      </form>
    </div>
  )
}

export default CheckInVerification