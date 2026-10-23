import { useEffect, useState } from 'react'
import Loader, { Spinner } from './ui/Loader'
import ErrorMessage from './ui/ErrorMessage'
import StatusBadge from './ui/StatusBadge'
import { getMyIssues, createIssue } from '../api/issues'

const inputClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-green-700'

// "IN_PROGRESS" -> "In Progress"
const formatStatus = (status) =>
  status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')

// "2026-09-23T02:50:38.392Z" -> "23 Sep 2026"
const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const ReportIssue = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const loadIssues = async () => {
    setLoading(true)
    setLoadError('')

    try {
      const res = await getMyIssues()
      // newest first
      const newestFirst = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setIssues(newestFirst)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      setFormError('Please fill in both the title and the description.')
      return
    }

    setFormError('')
    setSubmitting(true)

    try {
      const res = await createIssue(title.trim(), description.trim())

      // put the new issue at the top of the list
      setIssues((current) => [res.data, ...current])
      setTitle('')
      setDescription('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>

      <div className='bg-white border border-stone-200 rounded-2xl p-6'>
        <h2 className='text-2xl font-semibold'>Report an issue</h2>
        <p className='text-gray-500 mt-1 mb-6'>
          Tell us what's wrong. The hostel management team will follow up.
        </p>

        {submitted && (
          <p className='bg-green-50 text-green-700 rounded-lg px-4 py-3 mb-5'>
            Issue submitted. You can track its status on the right.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block font-medium mb-1.5'>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. Broken window latch in Room A2'
              className={inputClass}
            />
          </div>

          <div className='mb-6'>
            <label className='block font-medium mb-1.5'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe the issue in a bit more detail: when it started, where exactly it is, etc.'
              rows={5}
              className={`${inputClass} resize-y`}
            />
            {formError && <p className='text-sm text-red-600 mt-1.5'>{formError}</p>}
          </div>

          <button
            type='submit'
            disabled={submitting}
            className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {submitting && <Spinner size={16} />}
            {submitting ? 'Submitting...' : 'Submit issue'}
          </button>
        </form>
      </div>

      <div>
        <h2 className='text-lg font-semibold mb-3'>Your reported issues</h2>

        {loading && <Loader text='Loading your issues...' />}

        {loadError && <ErrorMessage message={loadError} onRetry={loadIssues} />}

        {!loading && !loadError && issues.length === 0 && (
          <div className='bg-white border border-stone-200 rounded-2xl p-6 text-gray-500'>
            You haven't reported any issues yet.
          </div>
        )}

        {!loading && !loadError && issues.length > 0 && (
          <div className='bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3'>
            {issues.map((issue) => (
              <div key={issue.id} className='border border-stone-200 rounded-xl p-4'>
                <div className='flex items-start justify-between gap-3 mb-1'>
                  <p className='font-semibold'>{issue.title}</p>
                  <StatusBadge status={formatStatus(issue.status)} />
                </div>
                <p className='text-sm text-gray-500 line-clamp-2'>{issue.description}</p>
                <p className='text-sm text-gray-400 mt-2'>Reported {formatDate(issue.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ReportIssue