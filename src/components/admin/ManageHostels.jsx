import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, Plus, Search } from 'lucide-react'
import { adminHostels, getStats } from '../../data/adminHostels'
import StatusBadge from '../ui/StatusBadge'
import OccupancyBar from '../ui/OccupancyBar'
import Modal from '../ui/Modal'

const ManageHostels = () => {
  const [hostels, setHostels] = useState(adminHostels)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [menuId, setMenuId] = useState(null) // which card's ⋮ menu is open
  const [modal, setModal] = useState(null) // { type: 'add' | 'edit' | 'deactivate', hostel }
  const [nameInput, setNameInput] = useState('')

  // Filter by search text and status
  const visibleHostels = hostels.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && h.active) ||
      (statusFilter === 'inactive' && !h.active)
    return matchesSearch && matchesStatus
  })

  // Summary line numbers
  const totalRooms = hostels.reduce((sum, h) => sum + h.rooms.length, 0)
  const totalBeds = hostels.reduce((sum, h) => sum + getStats(h.rooms).totalBeds, 0)

  const openAdd = () => {
    setNameInput('')
    setModal({ type: 'add' })
  }

  const openEdit = (hostel) => {
    setNameInput(hostel.name)
    setModal({ type: 'edit', hostel })
    setMenuId(null)
  }

  const openDeactivate = (hostel) => {
    setModal({ type: 'deactivate', hostel })
    setMenuId(null)
  }

  const activateHostel = (id) => {
    setHostels(hostels.map((h) => (h.id === id ? { ...h, active: true } : h)))
  }

  const handleSave = (e) => {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return

    if (modal.type === 'add') {
      const newHostel = { id: `h${Date.now()}`, name, active: true, rooms: [] }
      setHostels([...hostels, newHostel])
    } else {
      setHostels(hostels.map((h) => (h.id === modal.hostel.id ? { ...h, name } : h)))
    }
    setModal(null)
  }

  const confirmDeactivate = () => {
    setHostels(hostels.map((h) => (h.id === modal.hostel.id ? { ...h, active: false } : h)))
    setModal(null)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className='flex flex-col md:flex-row gap-3 md:items-center mb-4'>
        <div className='relative md:w-75'>
          <Search size={16} className='absolute left-3 top-3.5 text-stone-400' />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search hostels...'
            className='w-full bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-green-700'
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-700'
        >
          <option value='all'>All status</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>

        <button
          onClick={openAdd}
          className='md:ml-auto bg-green-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-green-900'
        >
          <Plus size={16} /> Add Hostel
        </button>
      </div>

      <p className='text-sm text-stone-500 mb-4'>
        {hostels.length} hostels · {totalRooms} rooms · {totalBeds} beds
      </p>

      {/* Hostel cards */}
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {visibleHostels.map((hostel) => {
          const { totalBeds, takenBeds, percent } = getStats(hostel.rooms)

          return (
            <div
              key={hostel.id}
              className={`rounded-2xl p-5 ${
                hostel.active
                  ? 'bg-white border border-stone-200'
                  : 'bg-stone-50 border border-dashed border-stone-300'
              }`}
            >
              <div className='flex items-center justify-between mb-1'>
                <h3 className={`text-lg font-bold ${hostel.active ? 'text-stone-900' : 'text-stone-400'}`}>
                  {hostel.name}
                </h3>
                <StatusBadge status={hostel.active ? 'Active' : 'Inactive'} />
              </div>

              <p className={`text-sm mb-4 ${hostel.active ? 'text-stone-500' : 'text-stone-400'}`}>
                {hostel.rooms.length} rooms
              </p>

              {hostel.active ? (
                <>
                  <OccupancyBar percent={percent} />
                  <div className='flex justify-between text-sm mt-2 mb-4'>
                    <span className='text-stone-600'>{takenBeds} / {totalBeds} beds taken</span>
                    <span className='font-bold text-stone-800'>{percent}%</span>
                  </div>

                  <div className='border-t border-stone-100 pt-4 flex gap-2'>
                    <Link
                      to={`/admin/hostels/${hostel.id}`}
                      className='flex-1 bg-green-800 text-white text-sm font-semibold rounded-lg py-2.5 text-center hover:bg-green-900'
                    >
                      Manage rooms
                    </Link>

                    {/* ⋮ menu */}
                    <div className='relative'>
                      <button
                        onClick={() => setMenuId(menuId === hostel.id ? null : hostel.id)}
                        className='border border-stone-200 rounded-lg p-2.5 cursor-pointer hover:bg-stone-50'
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuId === hostel.id && (
                        <div className='absolute right-0 bottom-12 w-40 bg-white border border-stone-200 rounded-lg z-10 overflow-hidden'>
                          <button
                            onClick={() => openEdit(hostel)}
                            className='w-full text-left text-sm px-4 py-2.5 hover:bg-stone-50 cursor-pointer'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeactivate(hostel)}
                            className='w-full text-left text-sm px-4 py-2.5 text-red-600 hover:bg-stone-50 cursor-pointer'
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <OccupancyBar percent={0} />
                  <p className='text-sm text-stone-400 mt-2 mb-4'>Students cannot reserve here</p>
                  <div className='border-t border-stone-100 pt-4'>
                    <button
                      onClick={() => activateHostel(hostel.id)}
                      className='w-full border border-green-800 text-green-800 text-sm font-semibold rounded-lg py-2.5 cursor-pointer hover:bg-green-50'
                    >
                      Activate hostel
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {visibleHostels.length === 0 && (
        <p className='text-center text-stone-500 py-12'>No hostels match your search.</p>
      )}

      {/* Add / Edit modal */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'add' ? 'Add Hostel' : 'Edit Hostel'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave}>
            <label className='block text-sm font-medium mb-1'>Hostel name</label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder='e.g. Hall 4'
              required
              className='w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-700 mb-6'
            />
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setModal(null)}
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

      {/* Deactivate confirmation */}
      {modal?.type === 'deactivate' && (
        <Modal title={`Deactivate ${modal.hostel.name}?`} onClose={() => setModal(null)}>
          <p className='text-sm text-stone-500 mb-6'>
            Students will no longer be able to reserve beds here. You can activate it again later.
          </p>
          <div className='flex justify-end gap-3'>
            <button
              onClick={() => setModal(null)}
              className='border border-stone-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-stone-50'
            >
              Cancel
            </button>
            <button
              onClick={confirmDeactivate}
              className='bg-green-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-900'
            >
              Yes, deactivate
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ManageHostels