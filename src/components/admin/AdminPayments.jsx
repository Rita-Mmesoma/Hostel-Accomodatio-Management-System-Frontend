import { useState } from 'react'
import Modal from '../ui/Modal'
import { Spinner } from '../ui/Loader'
import { fundBankAccount } from '../../api/admin'

const formatNaira = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(n))

const inputClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-green-700'

const AdminPayments = () => {
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // the last successful funding
  const [recent, setRecent] = useState([]) // fundings made since the page was opened

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setConfirming(true) // ask the admin to confirm before any money moves
  }

  const handleFund = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fundBankAccount(accountNumber.trim(), Number(amount))
      const entry = {
        accountNumber: res.data.bankAccount.accountNumber,
        amount: res.data.transaction.amount,
        balance: res.data.bankAccount.balance,
        reference: res.data.transaction.reference,
      }
      setResult(entry)
      setRecent((list) => [entry, ...list].slice(0, 5))
      setAccountNumber('')
      setAmount('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div className='max-w-lg mx-auto'>
      <div className='bg-white border border-stone-200 rounded-2xl p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-1'>Fund a student account</h2>
        <p className='text-gray-500 mb-6'>
          Adds money to a bank account so the student can pay the hostel fee. This cannot be
          undone from here.
        </p>

        <form onSubmit={handleSubmit}>
          <label className='block font-medium mb-1.5'>Account number</label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            inputMode='numeric'
            placeholder='e.g. 123456789012'
            required
            className={`${inputClass} mb-4 font-mono`}
          />

          <label className='block font-medium mb-1.5'>Amount (₦)</label>
          <input
            type='number'
            min='1'
            step='1'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='e.g. 50000'
            required
            className={`${inputClass} mb-6`}
          />

          {error && (
            <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{error}</p>
          )}

          <button
            type='submit'
            disabled={loading || !accountNumber || !amount}
            className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            Fund account
          </button>
        </form>
      </div>

      {result && (
        <div className='bg-green-50 border border-green-200 rounded-2xl p-5 mb-6'>
          <p className='font-semibold text-green-800 mb-1'>
            {formatNaira(result.amount)} added to {result.accountNumber}
          </p>
          <p className='text-sm text-stone-600'>
            New balance: <span className='font-semibold'>{formatNaira(result.balance)}</span>
          </p>
          <p className='text-xs text-stone-500 mt-1'>Reference: {result.reference}</p>
        </div>
      )}

      {recent.length > 1 && (
        <div className='bg-white border border-stone-200 rounded-2xl p-5'>
          <h3 className='font-semibold mb-3'>Funded in this session</h3>
          {recent.map((item) => (
            <div
              key={item.reference}
              className='flex justify-between py-2 border-b border-stone-100 last:border-b-0 text-sm'
            >
              <span className='font-mono'>{item.accountNumber}</span>
              <span className='font-semibold'>{formatNaira(item.amount)}</span>
            </div>
          ))}
          <p className='text-xs text-stone-400 mt-3'>This list clears when you refresh the page.</p>
        </div>
      )}

      {confirming && (
        <Modal title='Confirm funding' onClose={() => !loading && setConfirming(false)}>
          <p className='text-sm text-stone-500 mb-2'>
            Add <span className='font-semibold text-stone-900'>{formatNaira(amount)}</span> to
            account
          </p>
          <p className='font-mono text-lg mb-6'>{accountNumber}</p>

          <div className='flex justify-end gap-3'>
            <button
              onClick={() => setConfirming(false)}
              disabled={loading}
              className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
            >
              Cancel
            </button>
            <button
              onClick={handleFund}
              disabled={loading}
              className='bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-900 flex items-center gap-2 disabled:opacity-60'
            >
              {loading && <Spinner size={16} />}
              {loading ? 'Funding...' : 'Yes, fund account'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminPayments