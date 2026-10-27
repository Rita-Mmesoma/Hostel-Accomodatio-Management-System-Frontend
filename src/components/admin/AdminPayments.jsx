import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Modal from '../ui/Modal'
import StatusBadge from '../ui/StatusBadge'
import Loader, { Spinner } from '../ui/Loader'
import ErrorMessage from '../ui/ErrorMessage'
import { fundBankAccount, getAllTransactions } from '../../api/admin'

const PAGE_SIZE = 20
const filters = ['All', 'Credit', 'Debit']

const formatNaira = (n) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(n))

const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const titleCase = (text) => text.charAt(0) + text.slice(1).toLowerCase()

const ownerName = (tx) => {
  const user = tx.bankAccount?.user
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown'
}

const inputClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-green-700'

const AdminPayments = () => {
  // funding form
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [funding, setFunding] = useState(false)
  const [fundError, setFundError] = useState('')
  const [result, setResult] = useState(null) // the last successful funding

  // transaction history
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const load = async () => {
    try {
      const res = await getAllTransactions()
      setTransactions(res.data)
      setLoadError('')
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setFundError('')
    setResult(null)
    setConfirming(true) // ask the admin to confirm before any money moves
  }

  const handleFund = async () => {
    setFunding(true)
    setFundError('')

    try {
      const res = await fundBankAccount(accountNumber.trim(), Number(amount))
      setResult({
        accountNumber: res.data.bankAccount.accountNumber,
        amount: res.data.transaction.amount,
        balance: res.data.bankAccount.balance,
        reference: res.data.transaction.reference,
      })
      setAccountNumber('')
      setAmount('')
      await load() // the new funding shows up in the history
    } catch (err) {
      setFundError(err.message)
    } finally {
      setFunding(false)
      setConfirming(false)
    }
  }

  const sumOf = (type) =>
    transactions.filter((t) => t.type === type).reduce((sum, t) => sum + Number(t.amount), 0)

  const countOf = (label) =>
    label === 'All'
      ? transactions.length
      : transactions.filter((t) => titleCase(t.type) === label).length

  const matching = transactions.filter((t) => {
    const matchesFilter = filter === 'All' || titleCase(t.type) === filter
    const text = [
      ownerName(t),
      t.bankAccount?.accountNumber,
      t.bankAccount?.user?.student?.registrationNo,
      t.reference,
    ]
      .join(' ')
      .toLowerCase()
    return matchesFilter && text.includes(search.toLowerCase())
  })

  const visible = matching.slice(0, limit)

  const changeFilter = (f) => {
    setFilter(f)
    setLimit(PAGE_SIZE)
  }

  const changeSearch = (value) => {
    setSearch(value)
    setLimit(PAGE_SIZE)
  }

  return (
    <div className='max-w-5xl mx-auto'>
      {/* Fund an account */}
      <div className='bg-white border border-stone-200 rounded-2xl p-6 mb-6 max-w-lg'>
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

          {fundError && (
            <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{fundError}</p>
          )}

          <button
            type='submit'
            disabled={funding || !accountNumber || !amount}
            className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            Fund account
          </button>
        </form>
      </div>

      {result && (
        <div className='bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 max-w-lg'>
          <p className='font-semibold text-green-800 mb-1'>
            {formatNaira(result.amount)} added to {result.accountNumber}
          </p>
          <p className='text-sm text-stone-600'>
            New balance: <span className='font-semibold'>{formatNaira(result.balance)}</span>
          </p>
          <p className='text-xs text-stone-500 mt-1'>Reference: {result.reference}</p>
        </div>
      )}

      {/* Transaction history */}
      <h2 className='text-xl font-semibold mb-4'>All transactions</h2>

      {loading && <Loader text='Loading transactions...' />}

      {loadError && (
        <div className='max-w-lg'>
          <ErrorMessage message={loadError} />
          <button
            onClick={() => {
              setLoading(true)
              load()
            }}
            className='mt-4 bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 cursor-pointer hover:bg-green-900'
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5'>
            <div className='bg-white border border-stone-200 rounded-2xl p-5'>
              <p className='text-sm text-gray-400'>Transactions</p>
              <p className='text-2xl font-bold mt-1'>{transactions.length}</p>
            </div>
            <div className='bg-white border border-stone-200 rounded-2xl p-5'>
              <p className='text-sm text-gray-400'>Money added (credits)</p>
              <p className='text-2xl font-bold mt-1 text-green-700'>{formatNaira(sumOf('CREDIT'))}</p>
            </div>
            <div className='bg-white border border-stone-200 rounded-2xl p-5'>
              <p className='text-sm text-gray-400'>Money paid out (debits)</p>
              <p className='text-2xl font-bold mt-1 text-amber-700'>{formatNaira(sumOf('DEBIT'))}</p>
            </div>
          </div>

          {/* Filters + search */}
          <div className='flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4'>
            <div className='flex gap-2 flex-wrap'>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => changeFilter(f)}
                  className={`text-sm rounded-full px-4 py-1.5 border cursor-pointer ${
                    filter === f
                      ? 'bg-green-800 text-white border-green-800 font-semibold'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f} ({countOf(f)})
                </button>
              ))}
            </div>

            <div className='relative md:w-80'>
              <Search size={16} className='absolute left-3 top-3 text-stone-400' />
              <input
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder='Search name, reg. number, account...'
                className='w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-green-700'
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className='hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden'>
            <div className='grid grid-cols-[2.2fr_1.6fr_1fr_1.3fr_2.4fr] bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-semibold text-stone-500 uppercase'>
              <span>Student</span>
              <span>Account</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Date</span>
            </div>

            {visible.map((tx) => (
              <div
                key={tx.id}
                className='grid grid-cols-[2.2fr_1.6fr_1fr_1.3fr_2.4fr] items-center px-6 py-4 border-b border-stone-100 last:border-b-0 text-sm'
              >
                <div>
                  <p className='font-semibold text-stone-900'>{ownerName(tx)}</p>
                  <p className='text-xs text-stone-500'>
                    {tx.bankAccount?.user?.student?.registrationNo || tx.bankAccount?.type}
                  </p>
                </div>
                <span className='font-mono text-xs'>{tx.bankAccount?.accountNumber}</span>
                <span>
                  <StatusBadge status={titleCase(tx.type)} />
                </span>
                <span
                  className={`font-semibold ${
                    tx.type === 'CREDIT' ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {tx.type === 'CREDIT' ? '+' : '−'}
                  {formatNaira(tx.amount)}
                </span>
                <div>
                  <p className='text-stone-700'>{formatDateTime(tx.createdAt)}</p>
                  <p className='text-xs text-stone-400 truncate'>{tx.description}</p>
                </div>
              </div>
            ))}

            {visible.length === 0 && (
              <p className='text-center text-stone-500 py-10 text-sm'>
                {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match.'}
              </p>
            )}
          </div>

          {/* Mobile cards */}
          <div className='md:hidden space-y-3'>
            {visible.map((tx) => (
              <div key={tx.id} className='bg-white border border-stone-200 rounded-2xl p-4'>
                <div className='flex items-start justify-between gap-3 mb-2'>
                  <div>
                    <p className='font-semibold text-stone-900'>{ownerName(tx)}</p>
                    <p className='text-xs text-stone-500'>
                      {tx.bankAccount?.user?.student?.registrationNo || tx.bankAccount?.type}
                    </p>
                  </div>
                  <StatusBadge status={titleCase(tx.type)} />
                </div>
                <p
                  className={`text-lg font-bold ${
                    tx.type === 'CREDIT' ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {tx.type === 'CREDIT' ? '+' : '−'}
                  {formatNaira(tx.amount)}
                </p>
                <p className='text-xs text-stone-500 mt-1'>
                  {formatDateTime(tx.createdAt)} · {tx.bankAccount?.accountNumber}
                </p>
                <p className='text-xs text-stone-400'>{tx.description}</p>
              </div>
            ))}

            {visible.length === 0 && (
              <p className='text-center text-stone-500 py-6 text-sm'>
                {transactions.length === 0 ? 'No transactions yet.' : 'No transactions match.'}
              </p>
            )}
          </div>

          {matching.length > limit && (
            <div className='text-center mt-4'>
              <button
                onClick={() => setLimit(limit + PAGE_SIZE)}
                className='border border-stone-200 bg-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-stone-50'
              >
                Show more ({matching.length - limit} left)
              </button>
            </div>
          )}
        </>
      )}

      {confirming && (
        <Modal title='Confirm funding' onClose={() => !funding && setConfirming(false)}>
          <p className='text-sm text-stone-500 mb-2'>
            Add <span className='font-semibold text-stone-900'>{formatNaira(amount)}</span> to
            account
          </p>
          <p className='font-mono text-lg mb-6'>{accountNumber}</p>

          <div className='flex justify-end gap-3'>
            <button
              onClick={() => setConfirming(false)}
              disabled={funding}
              className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
            >
              Cancel
            </button>
            <button
              onClick={handleFund}
              disabled={funding}
              className='bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-900 flex items-center gap-2 disabled:opacity-60'
            >
              {funding && <Spinner size={16} />}
              {funding ? 'Funding...' : 'Yes, fund account'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminPayments