import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import Modal from '../ui/Modal'
import Loader, { Spinner } from '../ui/Loader'
import ErrorMessage from '../ui/ErrorMessage'
import { getAllIssues, updateIssueStatus, deleteIssue } from '../../api/admin'
import { formatDate, formatStatus } from '../../utils/format'

// The backend only allows one step forward: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
const nextStep = {
  OPEN: { to: 'IN_PROGRESS', label: 'Start work' },
  IN_PROGRESS: { to: 'RESOLVED', label: 'Mark as resolved' },
  RESOLVED: { to: 'CLOSED', label: 'Close issue' },
}

const filters = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']

const studentName = (issue) => {
  const user = issue.student?.user
  return user ? `${user.firstName} ${user.lastName}` : 'Unknown student'
}

const AdminIssues = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null) // issue whose details are showing

  const [busyId, setBusyId] = useState(null) // issue being updated or deleted
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(null) // issue waiting for delete confirmation

  const load = async () => {
    try {
      const res = await getAllIssues()
      setIssues(res.data)
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

  const handleStep = async (issue) => {
    setActionError('')
    setBusyId(issue.id)
    try {
      await updateIssueStatus(issue.id, nextStep[issue.status].to)
      await load()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    const issue = deleting
    setActionError('')
    setBusyId(issue.id)
    try {
      await deleteIssue(issue.id)
      setDeleting(null)
      setOpenId(null)
      await load()
    } catch (err) {
      setDeleting(null)
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <Loader text='Loading issues...' />
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

  const countOf = (label) =>
    label === 'All' ? issues.length : issues.filter((i) => formatStatus(i.status) === label).length

  const visible = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((issue) => {
      const matchesFilter = filter === 'All' || formatStatus(issue.status) === filter
      const text = `${issue.title} ${studentName(issue)}`.toLowerCase()
      return matchesFilter && text.includes(search.toLowerCase())
    })

  return (
    <div>
      {/* Filters + search */}
      <div className='flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4'>
        <div className='flex gap-2 flex-wrap'>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
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

        <div className='relative md:w-75'>
          <Search size={16} className='absolute left-3 top-3 text-stone-400' />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search title or student...'
            className='w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-green-700'
          />
        </div>
      </div>

      {actionError && (
        <div className='mb-4'>
          <ErrorMessage message={actionError} />
        </div>
      )}

      {/* Issue list */}
      <div className='bg-white border border-stone-200 rounded-2xl overflow-hidden'>
        {visible.map((issue) => {
          const isOpen = openId === issue.id
          const step = nextStep[issue.status]
          const busy = busyId === issue.id

          return (
            <div key={issue.id} className='border-b border-stone-100 last:border-b-0'>
              <button
                onClick={() => setOpenId(isOpen ? null : issue.id)}
                className='w-full text-left px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-stone-50'
              >
                <div className='min-w-0'>
                  <p className='font-semibold text-stone-900'>{issue.title}</p>
                  <p className='text-sm text-stone-500 mt-0.5'>
                    {studentName(issue)} · Reported {formatDate(issue.createdAt)}
                  </p>
                </div>
                <StatusBadge status={formatStatus(issue.status)} />
              </button>

              {isOpen && (
                <div className='px-5 pb-5'>
                  <p className='text-sm text-stone-700 whitespace-pre-line mb-3'>
                    {issue.description}
                  </p>
                  {issue.resolvedAt && (
                    <p className='text-xs text-stone-500 mb-3'>
                      Resolved {formatDate(issue.resolvedAt)}
                    </p>
                  )}

                  <div className='flex gap-2 flex-wrap'>
                    {step && (
                      <button
                        onClick={() => handleStep(issue)}
                        disabled={busy}
                        className='bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2 cursor-pointer hover:bg-green-900 flex items-center gap-2 disabled:opacity-60'
                      >
                        {busy && <Spinner size={14} />}
                        {step.label}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleting(issue)}
                      disabled={busy}
                      className='border border-stone-200 text-red-600 text-sm rounded-lg px-4 py-2 cursor-pointer hover:bg-stone-50 disabled:opacity-60'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {visible.length === 0 && (
          <p className='text-center text-stone-500 py-10 text-sm'>
            {issues.length === 0 ? 'No issues have been reported.' : 'No issues match.'}
          </p>
        )}
      </div>

      {/* Delete confirmation */}
      {deleting && (
        <Modal title='Delete this issue?' onClose={() => setDeleting(null)}>
          <p className='text-sm text-stone-500 mb-2'>"{deleting.title}"</p>
          <p className='text-sm text-stone-500 mb-6'>
            This permanently removes the issue, whatever its status. It cannot be undone.
          </p>
          <div className='flex justify-end gap-3'>
            <button
              onClick={() => setDeleting(null)}
              className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className='bg-red-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-red-700'
            >
              Yes, delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminIssues