import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from './ui/StatCard'
import StatusBadge from './ui/StatusBadge'
import Loader from './ui/Loader'
import { useProfile } from '../context/ProfileContext'
import { formatDate, formatStatus } from '../utils/format'
import {
  getAllHostels,
  getAllRooms,
  getAllBeds,
  getAllIssues,
  getSchoolFeeRecords,
} from '../api/admin'

const DASH = '–'

// Turns one request result into a list, or null if that request failed
const toList = (result) =>
  result.status === 'fulfilled' && Array.isArray(result.value.data) ? result.value.data : null

const AdminDashboard = () => {
  const { profile } = useProfile()
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      // allSettled waits for every request and never throws, so one
      // failing request doesn't blank the whole dashboard
      const results = await Promise.allSettled([
        getAllHostels(),
        getAllRooms(),
        getAllBeds(),
        getAllIssues(),
        getSchoolFeeRecords(),
      ])

      const [hostels, rooms, beds, issues, feeRecords] = results.map(toList)

      // TEMPORARY: lets us check the real field names and counts
      const names = ['hostels', 'rooms', 'beds', 'issues', 'school fee records']
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.log(`Could not load ${names[i]}:`, r.reason.message)
      })
      console.log(
        'admin data samples:',
        JSON.stringify(
          {
            counts: {
              hostels: hostels?.length,
              rooms: rooms?.length,
              beds: beds?.length,
              issues: issues?.length,
              feeRecords: feeRecords?.length,
            },
            hostel: hostels?.[0],
            room: rooms?.[0],
            bed: beds?.[0],
            issue: issues?.[0],
            feeRecord: feeRecords?.[0],
          },
          null,
          2
        )
      )

      setData({ hostels, rooms, beds, issues, feeRecords })
    }

    load()
  }, [])

  if (!data) {
    return <Loader text='Loading dashboard...' />
  }

    const { hostels, rooms, beds, issues, feeRecords } = data

  const activeHostels = hostels ? hostels.filter((h) => h.status === 'ACTIVE').length : DASH
  const openIssues = issues ? issues.filter((i) => i.status === 'OPEN').length : DASH
  const paidStudents = feeRecords ? feeRecords.filter((f) => f.status === 'PAID').length : 0

  const totalBeds = beds ? beds.length : 0
  const occupied = beds ? beds.filter((b) => b.status === 'OCCUPIED').length : 0
  const reserved = beds ? beds.filter((b) => b.status === 'RESERVED').length : 0
  const available = totalBeds - occupied - reserved
  const percent = (n) => (totalBeds ? (n / totalBeds) * 100 : 0)

  const legend = [
    { label: 'Occupied', count: occupied, dot: 'bg-green-700' },
    { label: 'Reserved, not paid', count: reserved, dot: 'bg-amber-400' },
    { label: 'Available', count: available, dot: 'bg-stone-200' },
  ]

  // five newest issues
  const recentIssues = issues
    ? [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    : []

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>
          {profile?.firstName ? `Welcome back, ${profile.firstName}` : 'Welcome back'}
        </h2>
        <p className='text-sm text-gray-500 mt-1'>Here is what is happening across the hostels.</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8'>
        <StatCard
          label='Students on record'
          value={feeRecords ? feeRecords.length : DASH}
          foot={feeRecords ? `${paidStudents} paid school fees` : ''}
          className='sm:col-span-2 xl:col-span-1'
        />
        <StatCard
          label='Active hostels'
          value={activeHostels}
          foot={hostels ? `of ${hostels.length} total` : ''}
        />
        <StatCard label='Rooms' value={rooms ? rooms.length : DASH} />
        <StatCard
          label='Bed spaces occupied'
          value={beds ? `${occupied} / ${totalBeds}` : DASH}
          foot={beds ? `${available} available` : ''}
        />
        <StatCard
          label='Open issues'
          value={openIssues}
          foot={issues ? `of ${issues.length} reported` : ''}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>

        <div className='bg-white border border-stone-200 rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-1'>Bed occupancy</h3>

          {!beds && <p className='text-gray-500'>Could not load bed data.</p>}
          {beds && totalBeds === 0 && (
            <p className='text-gray-500'>No bed spaces have been created yet.</p>
          )}

          {beds && totalBeds > 0 && (
            <>
              <p className='text-sm text-gray-500 mb-4'>
                {Math.round(percent(occupied))}% of bed spaces are occupied.
              </p>

              <div className='flex h-3 rounded-full overflow-hidden bg-stone-100 mb-5'>
                <div className='bg-green-700' style={{ width: `${percent(occupied)}%` }} />
                <div className='bg-amber-400' style={{ width: `${percent(reserved)}%` }} />
              </div>

              <div className='flex flex-col gap-2 text-sm'>
                {legend.map((item) => (
                  <div key={item.label} className='flex items-center justify-between'>
                    <span className='flex items-center gap-2'>
                      <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                      {item.label}
                    </span>
                    <span className='font-semibold'>{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className='bg-white border border-stone-200 rounded-2xl p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold'>Recent issues</h3>
            <Link to='/admin/issues' className='text-sm font-semibold text-green-800'>
              View all
            </Link>
          </div>

          {!issues && <p className='text-gray-500'>Could not load issues.</p>}
          {issues && recentIssues.length === 0 && (
            <p className='text-gray-500'>No issues have been reported.</p>
          )}

          {recentIssues.map((issue) => (
            <div
              key={issue.id}
              className='flex items-start justify-between gap-3 py-3 border-b border-stone-200 last:border-b-0'
            >
              <div>
                <p className='font-medium'>{issue.title}</p>
                <p className='text-sm text-gray-400'>Reported {formatDate(issue.createdAt)}</p>
              </div>
              <StatusBadge status={formatStatus(issue.status)} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard