import { useState } from 'react'
import StatusBadge from './ui/StatusBadge'
import PriorityPill from './ui/PriorityPill'

const priorities = ['Low', 'Medium', 'High']

const startingIssues = [
  { id: 1, title: 'Leaking tap in shared bathroom', category: 'Maintenance', priority: 'Medium', status: 'In Progress', date: '12 Sep 2026' },
  { id: 2, title: 'Refuse bin on corridor not emptied', category: 'Sanitation', priority: 'Low', status: 'Closed', date: '02 Sep 2026' },
  { id: 3, title: 'Corridor light by Room A2 not working', category: 'Security', priority: 'High', status: 'Open', date: '29 Aug 2026' },
]

const inputClass = 'w-full border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-green-700'

const ReportIssue = () => {
  const [issues, setIssues] = useState(startingIssues)
  const [category, setCategory] = useState('Maintenance')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      setError('Please fill in both the title and the description.')
      return
    }

    const newIssue = {
      id: Date.now(),
      title,
      category,
      priority,
      status: 'Open',
      date: 'Just now',
    }

    setIssues([newIssue, ...issues])
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setError('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>

      <div className='bg-white border border-stone-200 rounded-2xl p-6'>
        <h2 className='text-2xl font-semibold'>Report an issue</h2>
        <p className='text-gray-500 mt-1 mb-6'>
          Tell us what's wrong — the hostel management team will follow up.
        </p>

        {submitted && (
          <p className='bg-green-50 text-green-700 rounded-lg px-4 py-3 mb-5'>
            Issue submitted. You can track its status on the right.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block font-medium mb-1.5'>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option>Maintenance</option>
              <option>Sanitation</option>
              <option>Security</option>
            </select>
          </div>

          <div className='mb-4'>
            <label className='block font-medium mb-1.5'>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. Broken window latch in Room A2'
              className={inputClass}
            />
          </div>

          <div className='mb-4'>
            <label className='block font-medium mb-1.5'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe the issue in a bit more detail — when it started, where exactly it is, etc.'
              rows={4}
              className={`${inputClass} resize-y`}
            />
            {error && <p className='text-sm text-red-600 mt-1.5'>{error}</p>}
          </div>

          <div className='mb-6'>
            <label className='block font-medium mb-1.5'>Priority</label>
            <div className='flex gap-3'>
              {priorities.map((p) => (
                <button
                  key={p}
                  type='button'
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 rounded-lg border font-semibold cursor-pointer ${
                    priority === p
                      ? 'border-green-700 bg-green-50 text-green-600'
                      : 'border-stone-200 text-gray-500 hover:bg-stone-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type='submit'
            className='w-full py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors cursor-pointer'
          >
            Submit issue
          </button>
        </form>
      </div>

      <div>
        <h2 className='text-lg font-semibold mb-3'>Your reported issues</h2>
        <div className='bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3'>
          {issues.map((issue) => (
            <div key={issue.id} className='border border-stone-200 rounded-xl p-4'>
              <div className='flex items-start justify-between gap-3 mb-2'>
                <p className='font-semibold'>{issue.title}</p>
                <StatusBadge status={issue.status} />
              </div>
              <PriorityPill priority={issue.priority} />
              <p className='text-sm text-gray-400 mt-2'>
                {issue.category} · Reported {issue.date}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default ReportIssue