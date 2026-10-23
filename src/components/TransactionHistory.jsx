import { useEffect, useState } from 'react'
import Loader from './ui/Loader'
import ErrorMessage from './ui/ErrorMessage'
import { getTransactions } from '../api/payments'

const formatMoney = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(amount))

// "2026-09-06T19:00:00.000Z" -> "06 Sep 2026"
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const emptyBox = 'bg-white border border-stone-200 rounded-2xl p-6 text-gray-500'

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noAccount, setNoAccount] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    setNoAccount(false)

    try {
      const res = await getTransactions()
      setTransactions(res.data)
    } catch (err) {
      if (err.code === 'BANK_ACCOUNT_NOT_FOUND') {
        setNoAccount(true)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <h2 className='text-lg font-semibold mb-3'>Payment history</h2>

      {loading && <Loader text='Loading payment history...' />}

      {error && <ErrorMessage message={error} onRetry={load} />}

      {noAccount && (
        <div className={emptyBox}>
          You don't have a bank account yet. You need one to pay your accommodation fee.
        </div>
      )}

      {!loading && !error && !noAccount && transactions.length === 0 && (
        <div className={emptyBox}>No transactions yet.</div>
      )}

      {!loading && !error && !noAccount && transactions.length > 0 && (
        <div className='bg-white border border-stone-200 rounded-2xl px-6'>
          {transactions.map((t) => {
            const credit = t.type === 'CREDIT'

            return (
              <div
                key={t.id}
                className='flex flex-wrap items-center justify-between gap-3 py-5 border-b border-stone-200 last:border-b-0'
              >
                <div>
                  <p className='font-medium'>{t.description}</p>
                  <p className='text-sm text-gray-400'>
                    {formatDate(t.createdAt)} · {t.reference}
                  </p>
                </div>
                <p className={`font-semibold ${credit ? 'text-green-700' : 'text-gray-900'}`}>
                  {credit ? '+' : '-'}
                  {formatMoney(t.amount)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TransactionHistory