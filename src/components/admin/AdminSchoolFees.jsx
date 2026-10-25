import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import Loader from '../ui/Loader'
import ErrorMessage from '../ui/ErrorMessage'
import { getSchoolFeeRecords } from '../../api/admin'
import { formatDate, formatStatus } from '../../utils/format'

const PAGE_SIZE = 20
const filters = ['All', 'Paid', 'Not Paid']

const fullName = (record) => {
  const user = record.student?.user
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown student'
}

const titleCase = (text) => (text ? text.charAt(0) + text.slice(1).toLowerCase() : '–')

const AdminSchoolFees = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const load = async () => {
    try {
      const res = await getSchoolFeeRecords()
      setRecords(res.data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <Loader text='Loading school fee records...' />
  }

  if (error) {
    return (
      <div className='max-w-lg'>
        <ErrorMessage message={error} />
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
    )
  }

  const paidCount = records.filter((r) => r.status === 'PAID').length
  const countOf = (label) =>
    label === 'All'
      ? records.length
      : records.filter((r) => formatStatus(r.status) === label).length

  const matching = [...records]
    .sort((a, b) => fullName(a).localeCompare(fullName(b)))
    .filter((r) => {
      const matchesFilter = filter === 'All' || formatStatus(r.status) === filter
      const text = `${fullName(r)} ${r.student?.registrationNo || ''} ${r.rrr || ''}`.toLowerCase()
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
    <div>
      <p className='text-sm text-stone-500 mb-4'>
        {records.length} students on record · {paidCount} paid · {records.length - paidCount} not
        paid
      </p>

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
            placeholder='Search name, reg. number or RRR...'
            className='w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-green-700'
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className='hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden'>
        <div className='grid grid-cols-[2.5fr_1fr_1fr_1.8fr_1.2fr_1.2fr] bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-semibold text-stone-500 uppercase'>
          <span>Student</span>
          <span>Level</span>
          <span>Gender</span>
          <span>RRR</span>
          <span>Status</span>
          <span>Verified</span>
        </div>

        {visible.map((record) => (
          <div
            key={record.id}
            className='grid grid-cols-[2.5fr_1fr_1fr_1.8fr_1.2fr_1.2fr] items-center px-6 py-4 border-b border-stone-100 last:border-b-0 text-sm'
          >
            <div>
              <p className='font-semibold text-stone-900'>{fullName(record)}</p>
              <p className='text-xs text-stone-500'>{record.student?.registrationNo}</p>
            </div>
            <span>{formatStatus(record.student?.academicLevel || '')}</span>
            <span>{titleCase(record.student?.gender)}</span>
            <span className='font-mono text-xs'>{record.rrr || '–'}</span>
            <span>
              <StatusBadge status={formatStatus(record.status)} />
            </span>
            <span className='text-stone-600'>
              {record.verifiedAt ? formatDate(record.verifiedAt) : '–'}
            </span>
          </div>
        ))}

        {visible.length === 0 && (
          <p className='text-center text-stone-500 py-10 text-sm'>No records match.</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className='md:hidden space-y-3'>
        {visible.map((record) => (
          <div key={record.id} className='bg-white border border-stone-200 rounded-2xl p-4'>
            <div className='flex items-start justify-between gap-3 mb-2'>
              <div>
                <p className='font-semibold text-stone-900'>{fullName(record)}</p>
                <p className='text-xs text-stone-500'>{record.student?.registrationNo}</p>
              </div>
              <StatusBadge status={formatStatus(record.status)} />
            </div>
            <p className='text-sm text-stone-500'>
              {formatStatus(record.student?.academicLevel || '')} ·{' '}
              {titleCase(record.student?.gender)}
            </p>
            <p className='text-xs text-stone-500 mt-1'>
              RRR: <span className='font-mono'>{record.rrr || '–'}</span>
              {record.verifiedAt && ` · Verified ${formatDate(record.verifiedAt)}`}
            </p>
          </div>
        ))}

        {visible.length === 0 && (
          <p className='text-center text-stone-500 py-6 text-sm'>No records match.</p>
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
    </div>
  )
}

export default AdminSchoolFees