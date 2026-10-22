import { BedDouble, Wallet, KeyRound, Flag } from 'lucide-react'
import StatCard from './ui/StatCard'
import ActionCard from './ui/ActionCard'

const student = {
  firstName: 'Chidinma',
  department: 'Computer Science',
  level: '300 Level',
  regNo: '2021/245678',
}

const status = 'Pending Payment' // 'Not Reserved' | 'Pending Payment' | 'Allocated' | 'Checked-In'

const statusStyles = {
  'Not Reserved': 'bg-stone-100 text-stone-500',
  'Pending Payment': 'bg-amber-50 text-amber-700',
  'Allocated': 'bg-green-50 text-green-700',
  'Checked-In': 'bg-green-50 text-green-700',
}

const statusCopy = {
  'Not Reserved': "You haven't reserved a room yet. Browse available hostels to get started.",
  'Pending Payment': 'Your corner is reserved — complete payment before the deadline to keep it.',
  'Allocated': 'Your corner has been allocated. Collect your check-in code when you are ready to move in.',
  'Checked-In': "You're checked in. Reach out any time if something in your hostel needs attention.",
}

const shortcuts = [
  { to: '/reserve', label: 'Reserve a Room', desc: 'Browse hostels for your level', icon: BedDouble },
  { to: '/payments', label: 'My Payments', desc: 'View invoice & payment history', icon: Wallet },
  { to: '/check-in-code', label: 'My Check-in Code', desc: 'Get your move-in code', icon: KeyRound },
  { to: '/report-issue', label: 'Report an Issue', desc: 'Maintenance, sanitation, security', icon: Flag },
]

const Dashboard = () => {
  return (
    <div>
      <div className='bg-white border border-stone-200 rounded-2xl p-6 mb-6'>
        <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
          <div>
            <h2 className='text-xl font-semibold'>Welcome back, {student.firstName}</h2>
            <p className='text-sm text-gray-500 mt-1'>
              {student.department} · {student.level} · Reg No. {student.regNo}
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
        <StatCard label='Hostel' value='Mary Slessor Hall' foot='Room A2 · Corner A2-1' />
        <StatCard label='Payment due' value='₦45,000' foot='Deadline in 5h 47m' />
        <StatCard label='Open issues' value='1' foot='of 3 reported' big />
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