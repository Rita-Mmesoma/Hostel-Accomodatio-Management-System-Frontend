import { useEffect, useState } from 'react'
import { BedDouble, Wallet, KeyRound, Flag } from 'lucide-react'
import StatCard from './ui/StatCard'
import ActionCard from './ui/ActionCard'
import Loader from './ui/Loader'
import { useProfile } from '../context/ProfileContext'
import { getMyIssues } from '../api/issues'

const statusStyles = {
  'Not Reserved': 'bg-stone-100 text-stone-500',
  'Pending Payment': 'bg-amber-50 text-amber-700',
  'Allocated': 'bg-green-50 text-green-700',
  'Checked-In': 'bg-green-50 text-green-700',
}

const statusCopy = {
  'Not Reserved': "You haven't reserved a room yet. Browse available hostels to get started.",
  'Pending Payment': 'Your bed is reserved. Complete payment before the deadline to keep it.',
  'Allocated': 'Your bed has been allocated. Collect your check-in code when you are ready to move in.',
  'Checked-In': "You're checked in. Reach out any time if something in your hostel needs attention.",
}

const shortcuts = [
  { to: '/reserve', label: 'Reserve a Room', desc: 'Apply for a hostel', icon: BedDouble },
  { to: '/payments', label: 'My Payments', desc: 'Pay your accommodation fee', icon: Wallet },
  { to: '/check-in-code', label: 'My Check-in Code', desc: 'Get your move-in code', icon: KeyRound },
  { to: '/report-issue', label: 'Report an Issue', desc: 'Maintenance, sanitation, security', icon: Flag },
]

// Works out the status from the student's allocation
const getStatus = (allocation) => {
  if (!allocation?.hostel) return 'Not Reserved'
  if (allocation.bed?.status === 'RESERVED') return 'Pending Payment'
  return 'Allocated'
}

const Dashboard = () => {
  const { profile, loading } = useProfile()
  const [issues, setIssues] = useState(null)

  useEffect(() => {
    getMyIssues()
      .then((res) => setIssues(res.data))
      .catch(() => {}) // if it fails, the card just shows a dash
  }, [])

  if (loading) {
    return <Loader text='Loading your dashboard...' />
  }

  if (!profile) {
    return <p className='text-red-600'>We could not load your profile. Please refresh the page.</p>
  }

  const { allocation, schoolFee } = profile
  const status = getStatus(allocation)
  const feePaid = schoolFee?.status === 'PAID'
  const openIssues = issues ? issues.filter((i) => i.status === 'OPEN').length : '–'

  return (
    <div>
      <div className='bg-white border border-stone-200 rounded-2xl p-6 mb-6'>
        <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
          <div>
            <h2 className='text-xl font-semibold'>Welcome back, {profile.firstName}</h2>
            <p className='text-sm text-gray-500 mt-1'>
              {profile.level} · Reg No. {profile.registrationNo}
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status]}`}>
            <span className='w-1.5 h-1.5 rounded-full bg-current' />
            {status}
          </span>
        </div>
        <p className='text-gray-600'>{statusCopy[status]}</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatCard label='Accommodation status' value={status} />
        <StatCard
          label='Hostel'
          value={allocation?.hostel?.name || 'No hostel yet'}
          foot={
            allocation?.room
              ? `Room ${allocation.room.roomNumber} · Bed ${allocation.bed?.bedNumber}`
              : 'Reserve a room to get started'
          }
        />
        <StatCard
          label='School fee'
          value={feePaid ? 'Paid' : 'Not paid'}
          foot={schoolFee?.rrr ? `RRR ${schoolFee.rrr}` : ''}
        />
        <StatCard
          label='Open issues'
          value={openIssues}
          foot={issues ? `of ${issues.length} reported` : ''}
        />
      </div>

      <h2 className='text-lg font-semibold mb-3'>Quick actions</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {shortcuts.map((s) => (
          <ActionCard key={s.to} {...s} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard