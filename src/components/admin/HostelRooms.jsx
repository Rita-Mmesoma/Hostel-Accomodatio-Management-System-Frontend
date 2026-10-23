import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { adminHostels, getStats, getRoomStatus } from '../../data/adminHostels'
import StatusBadge from '../ui/StatusBadge'
import OccupancyBar from '../ui/OccupancyBar'
import Modal from '../ui/Modal'

const statusTone = { Available: 'green', Full: 'amber', Inactive: 'gray' }
const bedTone = { allocated: 'green', pending: 'amber', available: 'outline' }
const bedLabel = { allocated: 'Allocated', pending: 'Pending', available: 'Available' }
const filters = ['All', 'Available', 'Full', 'Inactive']

const HostelRooms = () => {
  const { hostelId } = useParams()
  const hostel = adminHostels.find((h) => h.id === hostelId)

  const [rooms, setRooms] = useState(hostel ? hostel.rooms : [])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [roomNumber, setRoomNumber] = useState('')
  const [bedCount, setBedCount] = useState(4)

  // Hostel id in the URL did not match anything
  if (!hostel) {
    return (
      <div>
        <Link to='/admin/hostels' className='text-green-800 text-sm font-semibold'>← Back to hostels</Link>
        <p className='mt-6 text-stone-500'>Hostel not found.</p>
      </div>
    )
  }

  const { totalBeds, takenBeds } = getStats(rooms)

  const visibleRooms = rooms.filter((room) => {
    const matchesFilter = filter === 'All' || getRoomStatus(room) === filter
    const matchesSearch = room.number.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  const handleAddRoom = (e) => {
    e.preventDefault()
    const id = `r${Date.now()}`
    const beds = []
    for (let i = 1; i <= Number(bedCount); i++) {
      beds.push({ id: `${id}-b${i}`, label: `Corner ${i}`, status: 'available', studentName: '', regNo: '', expiresIn: '' })
    }
    setRooms([...rooms, { id, number: roomNumber.trim(), active: true, beds }])
    setRoomNumber('')
    setBedCount(4)
    setShowAddRoom(false)
  }

  const toggleRoomActive = (id) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  return (
    <div>
      <Link to='/admin/hostels' className='text-green-800 text-sm font-semibold flex items-center gap-1 mb-3'>
        <ArrowLeft size={16} /> Back to hostels
      </Link>

      {/* Title row */}
      <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6'>
        <div>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-bold text-stone-900'>{hostel.name}</h2>
            <Badge tone={hostel.active ? 'green' : 'gray'}>{hostel.active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <p className='text-sm text-stone-500 mt-1'>
            {rooms.length} rooms · {takenBeds} / {totalBeds} beds taken
          </p>
        </div>

        <button
          onClick={() => setShowAddRoom(true)}
          className='bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-green-900'
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

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
              {f}
            </button>
          ))}
        </div>

        <div className='relative md:w-65'>
          <Search size={16} className='absolute left-3 top-3 text-stone-400' />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search room number...'
            className='w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-green-700'
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className='hidden md:block bg-white border border-stone-200 rounded-2xl overflow-hidden mb-8'>
        <div className='grid grid-cols-[1fr_1fr_3fr_1.5fr_1fr] bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-semibold text-stone-500 uppercase'>
          <span>Room</span>
          <span>Beds</span>
          <span>Occupancy</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {visibleRooms.map((room) => {
          const stats = getStats([room])
          const status = getRoomStatus(room)

          return (
            <div
              key={room.id}
              className={`grid grid-cols-[1fr_1fr_3fr_1.5fr_1fr] items-center px-6 py-4 border-b border-stone-100 last:border-b-0 text-sm ${
                selectedRoomId === room.id ? 'bg-green-50' : ''
              } ${room.active ? 'text-stone-900' : 'text-stone-400'}`}
            >
              <span className='font-semibold'>{room.number}</span>
              <span>{stats.totalBeds}</span>
              <div className='flex items-center gap-3 pr-6'>
                {room.active ? (
                  <>
                    <div className='flex-1'><OccupancyBar percent={stats.percent} /></div>
                    <span className='text-stone-600 text-xs w-10'>{stats.takenBeds} / {stats.totalBeds}</span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
              <span><Badge tone={statusTone[status]}>{status}</Badge></span>
              <button
                onClick={() => setSelectedRoomId(room.id)}
                className='text-green-800 font-semibold text-left cursor-pointer hover:underline'
              >
                View beds
              </button>
            </div>
          )
        })}

        {visibleRooms.length === 0 && (
          <p className='text-center text-stone-500 py-10 text-sm'>No rooms match.</p>
        )}
      </div>

      {/* Mobile room cards */}
      <div className='md:hidden space-y-3 mb-8'>
        {visibleRooms.map((room) => {
          const stats = getStats([room])
          const status = getRoomStatus(room)

          return (
            <div key={room.id} className='bg-white border border-stone-200 rounded-2xl p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='font-bold text-stone-900'>{room.number}</span>
                <StatusBadge status={hostel.active ? 'Active' : 'Inactive'} />
              </div>
              {room.active && <OccupancyBar percent={stats.percent} />}
              <div className='flex items-center justify-between mt-3 text-sm'>
                <span className='text-stone-500'>{stats.takenBeds} / {stats.totalBeds} beds taken</span>
                <button
                  onClick={() => setSelectedRoomId(room.id)}
                  className='text-green-800 font-semibold cursor-pointer'
                >
                  View beds
                </button>
              </div>
            </div>
          )
        })}

        {visibleRooms.length === 0 && (
          <p className='text-center text-stone-500 py-6 text-sm'>No rooms match.</p>
        )}
      </div>

      {/* Beds of the selected room */}
      {selectedRoom && (
        <div>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4'>
            <div>
              <h3 className='text-base font-bold text-stone-900'>Room {selectedRoom.number}: beds (corners)</h3>
              <p className='text-xs text-stone-500 mt-1'>
                {selectedRoom.beds.filter((b) => b.status === 'allocated').length} allocated ·{' '}
                {selectedRoom.beds.filter((b) => b.status === 'pending').length} pending ·{' '}
                {selectedRoom.beds.filter((b) => b.status === 'available').length} available
              </p>
            </div>

            <button
              onClick={() => toggleRoomActive(selectedRoom.id)}
              className='border border-stone-200 bg-white rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-stone-50'
            >
              {selectedRoom.active ? 'Deactivate room' : 'Activate room'}
            </button>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {selectedRoom.beds.map((bed) => (
              <div
                key={bed.id}
                className={`rounded-2xl p-4 bg-white ${
                  bed.status === 'available' ? 'border border-dashed border-stone-300' : 'border border-stone-200'
                }`}
              >
                <p className='font-bold text-stone-900 text-sm mb-2'>{bed.label}</p>
                <Badge tone={bedTone[bed.status]}>{bedLabel[bed.status]}</Badge>

                {bed.status === 'available' ? (
                  <p className='text-sm text-stone-400 mt-3'>No student yet</p>
                ) : (
                  <div className='mt-3'>
                    <p className='text-sm text-stone-700'>{bed.studentName}</p>
                    <p className='text-xs text-stone-500'>{bed.regNo}</p>
                    {bed.status === 'pending' && (
                      <p className='text-xs text-amber-700 mt-1'>Expires in {bed.expiresIn}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add room modal */}
      {showAddRoom && (
        <Modal title='Add Room' onClose={() => setShowAddRoom(false)}>
          <form onSubmit={handleAddRoom}>
            <label className='block text-sm font-medium mb-1'>Room number</label>
            <input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder='e.g. A105'
              required
              className='w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-700 mb-4'
            />

            <label className='block text-sm font-medium mb-1'>Number of beds</label>
            <input
              type='number'
              min='1'
              max='12'
              value={bedCount}
              onChange={(e) => setBedCount(e.target.value)}
              required
              className='w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-700 mb-6'
            />

            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setShowAddRoom(false)}
                className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-900'
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default HostelRooms