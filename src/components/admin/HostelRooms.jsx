import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import OccupancyBar from '../ui/OccupancyBar'
import Modal from '../ui/Modal'
import Loader, { Spinner } from '../ui/Loader'
import ErrorMessage from '../ui/ErrorMessage'
import {
  getAllHostels,
  getAllRooms,
  getAllBeds,
  createRoom,
  updateRoom,
  deactivateRoom,
  activateRoom,
  createBed,
} from '../../api/admin'

// backend bed status -> label used by StatusBadge
const bedLabel = { AVAILABLE: 'Available', RESERVED: 'Pending', OCCUPIED: 'Allocated' }
const bedNote = {
  AVAILABLE: 'No student yet',
  RESERVED: 'Reserved by a student',
  OCCUPIED: 'Checked in',
}
const filters = ['All', 'Available', 'Full', 'Inactive']

const inputClass =
  'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-700'

// A bed is "taken" when it is not AVAILABLE
const getStats = (beds) => {
  const total = beds.length
  const taken = beds.filter((b) => b.status !== 'AVAILABLE').length
  const percent = total === 0 ? 0 : Math.round((taken / total) * 100)
  return { total, taken, percent }
}

// Deactivating a room sets its status to MAINTENANCE
const isRoomInactive = (room) => room.status === 'MAINTENANCE' || room.status === 'INACTIVE'

const getRoomStatus = (room, beds) => {
  if (isRoomInactive(room)) return 'Inactive'
  const { total, taken } = getStats(beds)
  if (room.status === 'FULL' || (total > 0 && taken === total)) return 'Full'
  return 'Available'
}

// ("A", 1, 10) -> ["A01", "A02", ... "A10"]
const buildRoomNumbers = (prefix, from, to) => {
  const width = Math.max(2, String(to).length)
  const numbers = []
  for (let i = from; i <= to; i++) {
    numbers.push(`${prefix}${String(i).padStart(width, '0')}`)
  }
  return numbers
}

// Picks the next free bed numbers: B1, B2, ... skipping ones the room already has
const nextBedNumbers = (existingBeds, count) => {
  const used = new Set(existingBeds.map((b) => b.bedNumber.toUpperCase()))
  const numbers = []
  let n = 1
  while (numbers.length < count) {
    const label = `B${n}`
    if (!used.has(label)) numbers.push(label)
    n++
  }
  return numbers
}

const HostelRooms = () => {
  const { hostelId } = useParams()

    const bedsRef = useRef(null)

  const viewBeds = (roomId) => {
    setSelectedRoomId(roomId)
    // wait for the beds section to appear, then scroll down to it
    setTimeout(() => {
      bedsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const [hostel, setHostel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  // add room
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [multiple, setMultiple] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(10)
  const [roomNumber, setRoomNumber] = useState('')
  const [capacity, setCapacity] = useState(4)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // edit room, activate / deactivate room
  const [editRoom, setEditRoom] = useState(null)
  const [editNumber, setEditNumber] = useState('')
  const [editCapacity, setEditCapacity] = useState(4)
  const [editError, setEditError] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [addingBeds, setAddingBeds] = useState(false)

  const load = async () => {
    try {
      const [h, r, b] = await Promise.all([getAllHostels(), getAllRooms(), getAllBeds()])
      setHostel(h.data.find((item) => item.id === hostelId) || null)
      setRooms(r.data.filter((room) => room.hostelId === hostelId))
      setBeds(b.data.filter((bed) => bed.room?.hostelId === hostelId))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [hostelId])

  // const handleAddRoom = async (e) => {
  //   e.preventDefault()
  //   setFormError('')
  //   setSaving(true)

  //   try {
  //     await createRoom(hostelId, roomNumber.trim(), Number(capacity))
  //     setShowAddRoom(false)
  //     setRoomNumber('')
  //     setCapacity(4)
  //     await load()
  //   } catch (err) {
  //     setFormError(err.message)
  //   } finally {
  //     setSaving(false)
  //   }
  // }

    const handleAddRoom = async (e) => {
    e.preventDefault()
    setFormError('')

    const numbers = multiple
      ? buildRoomNumbers(prefix.trim(), Number(from), Number(to))
      : [roomNumber.trim()]

    if (multiple && (Number(from) > Number(to) || numbers.length > 50)) {
      setFormError('Use a range that goes up, with at most 50 rooms at a time.')
      return
    }

    setSaving(true)

    // the backend creates one room per request, so we send them one after another
    const failed = []
    for (const number of numbers) {
      try {
        await createRoom(hostelId, number, Number(capacity))
      } catch (err) {
        failed.push(`${number} (${err.message})`)
      }
    }

    await load()
    setSaving(false)

    if (failed.length === 0) {
      setShowAddRoom(false)
      setRoomNumber('')
      setCapacity(4)
      setMultiple(false)
      setPrefix('')
      return
    }

    // some rooms were created, some were not: say which ones failed
    setFormError(
      `Created ${numbers.length - failed.length} of ${numbers.length} rooms. ` +
        `Could not create: ${failed.join('; ')}. Close this form to see the rooms that were created.`
    )
  }

  const openEditRoom = (room) => {
    setEditRoom(room)
    setEditNumber(room.roomNumber)
    setEditCapacity(room.capacity)
    setEditError('')
  }

  const handleEditRoom = async (e) => {
    e.preventDefault()
    setEditError('')

    // only send what changed, so an unchanged room number doesn't clash with itself
    const fields = {}
    if (editNumber.trim() !== editRoom.roomNumber) fields.roomNumber = editNumber.trim()
    if (Number(editCapacity) !== editRoom.capacity) fields.capacity = Number(editCapacity)

    if (Object.keys(fields).length === 0) {
      setEditRoom(null)
      return
    }

    setBusy(true)
    try {
      await updateRoom(editRoom.id, fields)
      setEditRoom(null)
      await load()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleRoom = async (room) => {
    setActionError('')
    setBusy(true)
    try {
      await (isRoomInactive(room) ? activateRoom(room.id) : deactivateRoom(room.id))
      await load()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // creates the missing beds of one room; returns an error text, or null if all went well
  const fillRoom = async (room) => {
    const existing = beds.filter((b) => b.roomId === room.id)
    const missing = room.capacity - existing.length
    if (missing <= 0) return null

    for (const number of nextBedNumbers(existing, missing)) {
      try {
        await createBed(room.id, number)
      } catch (err) {
        return `Room ${room.roomNumber}: ${err.message}`
      }
    }
    return null
  }

  const handleAddBeds = async (targetRooms) => {
    setActionError('')
    setAddingBeds(true)

    // the backend creates one bed per request, so we send them one after another
    const problems = []
    for (const room of targetRooms) {
      const problem = await fillRoom(room)
      if (problem) problems.push(problem)
    }

    await load()
    setAddingBeds(false)
    if (problems.length > 0) setActionError(problems.join(' · '))
  }

  if (loading) {
    return <Loader text='Loading rooms...' />
  }

  if (error) {
    return (
      <div className='max-w-lg'>
        <Link to='/admin/hostels' className='text-green-800 text-sm font-semibold'>
          ← Back to hostels
        </Link>
        <div className='mt-4'>
          <ErrorMessage message={error} />
        </div>
      </div>
    )
  }

  if (!hostel) {
    return (
      <div>
        <Link to='/admin/hostels' className='text-green-800 text-sm font-semibold'>
          ← Back to hostels
        </Link>
        <p className='mt-6 text-stone-500'>Hostel not found.</p>
      </div>
    )
  }

  const bedsOf = (room) => beds.filter((b) => b.roomId === room.id)
  const hostelStats = getStats(beds)
  const missingFor = (room) => Math.max(0, room.capacity - bedsOf(room).length)
  const roomsNeedingBeds = rooms.filter((room) => missingFor(room) > 0)
  const active = hostel.status === 'ACTIVE'

  const visibleRooms = rooms.filter((room) => {
    const matchesFilter = filter === 'All' || getRoomStatus(room, bedsOf(room)) === filter
    const matchesSearch = room.roomNumber.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)
  const selectedBeds = selectedRoom ? bedsOf(selectedRoom) : []
  
  return (
    <div>
      <Link
        to='/admin/hostels'
        className='text-green-800 text-sm font-semibold flex items-center gap-1 mb-3'
      >
        <ArrowLeft size={16} /> Back to hostels
      </Link>

      {/* Title row */}
      <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6'>
        <div>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-bold text-stone-900'>{hostel.name}</h2>
            <StatusBadge status={active ? 'Active' : 'Inactive'} />
          </div>
          <p className='text-sm text-stone-500 mt-1'>
            {rooms.length} rooms · {hostelStats.taken} / {hostelStats.total} beds taken
          </p>
        </div>

               <div className='flex gap-2 flex-wrap'>
          {roomsNeedingBeds.length > 0 && (
            <button
              onClick={() => handleAddBeds(roomsNeedingBeds)}
              disabled={addingBeds}
              className='border border-green-800 text-green-800 text-sm font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-green-50 disabled:opacity-60'
            >
              {addingBeds && <Spinner size={16} />}
              {addingBeds
                ? 'Adding beds...'
                : `Add missing beds (${roomsNeedingBeds.reduce((sum, r) => sum + missingFor(r), 0)})`}
            </button>
          )}

          <button
            onClick={() => {
              setFormError('')
              setShowAddRoom(true)
            }}
            className='bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-green-900'
          >
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>
      
      {actionError && (
        <div className='mb-4'>
          <ErrorMessage message={actionError} />
        </div>
      )}

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
          const roomBeds = bedsOf(room)
          const stats = getStats(roomBeds)
          const status = getRoomStatus(room, roomBeds)

          return (
            <div
              key={room.id}
              className={`grid grid-cols-[1fr_1fr_3fr_1.5fr_1fr] items-center px-6 py-4 border-b border-stone-100 last:border-b-0 text-sm ${
                selectedRoomId === room.id ? 'bg-green-50' : ''
              } ${status === 'Inactive' ? 'text-stone-400' : 'text-stone-900'}`}
            >
              <span className='font-semibold'>{room.roomNumber}</span>
              <span>
                {stats.total} / {room.capacity}
              </span>
              <div className='flex items-center gap-3 pr-6'>
                {status !== 'Inactive' ? (
                  <>
                    <div className='flex-1'>
                      <OccupancyBar percent={stats.percent} />
                    </div>
                    <span className='text-stone-600 text-xs w-10'>
                      {stats.taken} / {stats.total}
                    </span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
              <span>
                <StatusBadge status={status} />
              </span>
              <button
                onClick={() => viewBeds(room.id)}
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
          const roomBeds = bedsOf(room)
          const stats = getStats(roomBeds)
          const status = getRoomStatus(room, roomBeds)

          return (
            <div key={room.id} className='bg-white border border-stone-200 rounded-2xl p-4'>
              <div className='flex items-center justify-between mb-3'>
                <span className='font-bold text-stone-900'>{room.roomNumber}</span>
                <StatusBadge status={status} />
              </div>
              {status !== 'Inactive' && <OccupancyBar percent={stats.percent} />}
              <div className='flex items-center justify-between mt-3 text-sm'>
                <span className='text-stone-500'>
                  {stats.taken} / {stats.total} beds taken
                </span>
                <button
                  onClick={() => viewBeds(room.id)}
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
        <div ref={bedsRef} className='scroll-mt-4'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4'>
            <div>
              <h3 className='text-base font-bold text-stone-900'>
                Room {selectedRoom.roomNumber}: beds
              </h3>
              <p className='text-xs text-stone-500 mt-1'>
                {selectedBeds.filter((b) => b.status === 'OCCUPIED').length} allocated ·{' '}
                {selectedBeds.filter((b) => b.status === 'RESERVED').length} pending ·{' '}
                {selectedBeds.filter((b) => b.status === 'AVAILABLE').length} available
              </p>
            </div>

            <div className='flex gap-2'>
              {missingFor(selectedRoom) > 0 && (
                <button
                  onClick={() => handleAddBeds([selectedRoom])}
                  disabled={addingBeds}
                  className='border border-green-800 text-green-800 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-green-50 flex items-center gap-2 disabled:opacity-60'
                >
                  {addingBeds && <Spinner size={14} />}
                  Add {missingFor(selectedRoom)} bed{missingFor(selectedRoom) === 1 ? '' : 's'}
                </button>
              )}

              <button
                onClick={() => openEditRoom(selectedRoom)}
                className='border border-stone-200 bg-white rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-stone-50'
              >
                Edit room
              </button>
            </div>
          </div>

          {/* {actionError && (
            <div className='mb-4'>
              <ErrorMessage message={actionError} />
            </div>
          )} */}

          {selectedBeds.length === 0 && (
            <p className='text-sm text-stone-500'>No beds have been created in this room yet.</p>
          )}

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {selectedBeds.map((bed) => (
              <div
                key={bed.id}
                className={`rounded-2xl p-4 bg-white ${
                  bed.status === 'AVAILABLE'
                    ? 'border border-dashed border-stone-300'
                    : 'border border-stone-200'
                }`}
              >
                <p className='font-bold text-stone-900 text-sm mb-2'>Bed {bed.bedNumber}</p>
                <StatusBadge status={bedLabel[bed.status] || bed.status} />
                <p className='text-sm text-stone-400 mt-3'>{bedNote[bed.status] || ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add room modal */}
      {showAddRoom && (
        <Modal title='Add Room' onClose={() => !saving && setShowAddRoom(false)}>
          <form onSubmit={handleAddRoom}>

            {!multiple ? (
              <>
                <label className='block text-sm font-medium mb-1'>Room number</label>
                <input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder='e.g. A01'
                  required
                  className={`${inputClass} mb-2`}
                />
              </>
            ) : (
              <>
                <div className='grid grid-cols-3 gap-3 mb-2'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Prefix</label>
                    <input
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder='A'
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>From</label>
                    <input
                      type='number'
                      min='1'
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>To</label>
                    <input
                      type='number'
                      min='1'
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
                {Number(from) <= Number(to) && Number(to) - Number(from) < 50 && (
                  <p className='text-xs text-stone-500 mb-2'>
                    {(() => {
                      const list = buildRoomNumbers(prefix.trim(), Number(from), Number(to))
                      return `Will create ${list.length} room${list.length === 1 ? '' : 's'}: ${list[0]} to ${list[list.length - 1]}`
                    })()}
                  </p>
                )}
              </>
            )}

            <button
              type='button'
              onClick={() => setMultiple(!multiple)}
              className='text-green-800 text-sm font-semibold cursor-pointer mb-4'
            >
              {multiple ? 'Add a single room instead' : 'Add several rooms at once'}
            </button>

            <label className='block text-sm font-medium mb-1'>Capacity (number of beds)</label>
            <input
              type='number'
              min='1'
              max='12'
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              className={`${inputClass} mb-6`}
            />

            {formError && (
              <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{formError}</p>
            )}

            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setShowAddRoom(false)}
                disabled={saving}
                className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={saving}
                className='bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-900 flex items-center gap-2 disabled:opacity-60'
              >
                {saving && <Spinner size={16} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit room modal */}
      {editRoom && (
        <Modal title='Edit Room' onClose={() => !busy && setEditRoom(null)}>
          <form onSubmit={handleEditRoom}>
            <label className='block text-sm font-medium mb-1'>Room number</label>
            <input
              value={editNumber}
              onChange={(e) => setEditNumber(e.target.value)}
              required
              className={`${inputClass} mb-4`}
            />

            <label className='block text-sm font-medium mb-1'>Capacity (number of beds)</label>
            <input
              type='number'
              min='1'
              max='12'
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
              required
              className={`${inputClass} mb-6`}
            />

            {editError && (
              <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{editError}</p>
            )}

            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setEditRoom(null)}
                disabled={busy}
                className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={busy}
                className='bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-900 flex items-center gap-2 disabled:opacity-60'
              >
                {busy && <Spinner size={16} />}
                {busy ? 'Saving...' : 'Save'}
              </button>

                            <button
                onClick={() => toggleRoom(selectedRoom)}
                disabled={busy}
                className='border border-stone-200 bg-white rounded-lg px-4 py-2 text-sm cursor-pointer hover:bg-stone-50 flex items-center gap-2 disabled:opacity-60'
              >
                {busy && <Spinner size={14} />}
                {isRoomInactive(selectedRoom) ? 'Activate room' : 'Deactivate room'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default HostelRooms