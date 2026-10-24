import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, Plus, Search } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import OccupancyBar from '../ui/OccupancyBar'
import Modal from '../ui/Modal'
import Loader, { Spinner } from '../ui/Loader'
import ErrorMessage from '../ui/ErrorMessage'
import {
  getAllHostels,
  getAllRooms,
  getAllBeds,
  createHostel,
  updateHostel,
  deactivateHostel,
  activateHostel,
} from '../../api/admin'

const emptyForm = { name: '', description: '', gender: 'MALE', fee: '', image: null }

const formatFee = (fee) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(fee))

// Rooms and beds of one hostel. A bed is "taken" when it is not AVAILABLE.
const getHostelStats = (hostel, rooms, beds) => {
  const roomCount = rooms.filter((r) => r.hostelId === hostel.id).length
  const hostelBeds = beds.filter((b) => b.room?.hostelId === hostel.id)
  const total = hostelBeds.length
  const taken = hostelBeds.filter((b) => b.status !== 'AVAILABLE').length
  const percent = total === 0 ? 0 : Math.round((taken / total) * 100)
  return { roomCount, total, taken, percent }
}

const inputClass =
  'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-700'

const ManageHostels = () => {
  const [hostels, setHostels] = useState([])
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [menuId, setMenuId] = useState(null) // which card's ⋮ menu is open
  const [modal, setModal] = useState(null) // { type: 'add' | 'edit' | 'deactivate', hostel }
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState(null) // hostel being activated or deactivated
  const [actionError, setActionError] = useState('')

  const load = async () => {
    try {
      const [h, r, b] = await Promise.all([getAllHostels(), getAllRooms(), getAllBeds()])
      setHostels(h.data)
      setRooms(r.data)
      setBeds(b.data)
      setLoadError('')
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const isActive = (hostel) => hostel.status === 'ACTIVE'

  const visibleHostels = hostels.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive(h)) ||
      (statusFilter === 'inactive' && !isActive(h))
    return matchesSearch && matchesStatus
  })

  const openAdd = () => {
    setForm(emptyForm)
    setFormError('')
    setModal({ type: 'add' })
  }

  const openEdit = (hostel) => {
    setForm({
      name: hostel.name,
      description: hostel.description || '',
      gender: hostel.gender,
      fee: String(hostel.accommodationFee),
      image: null,
    })
    setFormError('')
    setModal({ type: 'edit', hostel })
    setMenuId(null)
  }

  const openDeactivate = (hostel) => {
    setModal({ type: 'deactivate', hostel })
    setMenuId(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')

    const data = new FormData()

    if (modal.type === 'add') {
      if (!form.image) {
        setFormError('Please choose an image for the hostel.')
        return
      }
      data.append('name', form.name.trim())
      if (form.description.trim()) data.append('description', form.description.trim())
      data.append('gender', form.gender)
      data.append('accommodationFee', form.fee)
      data.append('image', form.image)
    } else {
      // only send what actually changed
      const h = modal.hostel
      if (form.name.trim() !== h.name) data.append('name', form.name.trim())
      if (form.description.trim() !== (h.description || '')) {
        data.append('description', form.description.trim())
      }
      if (form.gender !== h.gender) data.append('gender', form.gender)
      if (Number(form.fee) !== Number(h.accommodationFee)) data.append('accommodationFee', form.fee)
      if (form.image) data.append('image', form.image)

      if ([...data.keys()].length === 0) {
        setModal(null)
        return
      }
    }

    setSaving(true)
    try {
      if (modal.type === 'add') {
        await createHostel(data)
      } else {
        await updateHostel(modal.hostel.id, data)
      }
      setModal(null)
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // runs activate or deactivate, then reloads the lists
  const runAction = async (id, action) => {
    setActionError('')
    setBusyId(id)
    try {
      await action(id)
      await load()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const confirmDeactivate = async () => {
    const id = modal.hostel.id
    setModal(null)
    await runAction(id, deactivateHostel)
  }

  if (loading) {
    return <Loader text='Loading hostels...' />
  }

  if (loadError) {
    return (
      <div className='max-w-lg'>
        <ErrorMessage message={loadError} />
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
        {hostels.length} hostels · {rooms.length} rooms · {beds.length} beds
      </p>

      {actionError && (
        <div className='mb-4'>
          <ErrorMessage message={actionError} />
        </div>
      )}

      {/* Hostel cards */}
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {visibleHostels.map((hostel) => {
          const { roomCount, total, taken, percent } = getHostelStats(hostel, rooms, beds)
          const active = isActive(hostel)
          const busy = busyId === hostel.id

          return (
            <div
              key={hostel.id}
              className={`rounded-2xl p-5 ${
                active
                  ? 'bg-white border border-stone-200'
                  : 'bg-stone-50 border border-dashed border-stone-300'
              }`}
            >
              {hostel.imageUrl && (
                <img
                  src={hostel.imageUrl}
                  alt={hostel.name}
                  className={`w-full h-36 object-cover rounded-xl mb-4 ${
                    active ? '' : 'opacity-50 grayscale'
                  }`}
                />
              )}

              <div className='flex items-center justify-between mb-1'>
                <h3 className={`text-lg font-bold ${active ? 'text-stone-900' : 'text-stone-400'}`}>
                  {hostel.name}
                </h3>
                <StatusBadge status={active ? 'Active' : 'Inactive'} />
              </div>

              <p className={`text-sm mb-1 ${active ? 'text-stone-500' : 'text-stone-400'}`}>
                {hostel.gender === 'MALE' ? 'Male' : 'Female'} · {roomCount} rooms ·{' '}
                {formatFee(hostel.accommodationFee)}
              </p>
              {hostel.description && (
                <p className={`text-sm mb-4 ${active ? 'text-stone-500' : 'text-stone-400'}`}>
                  {hostel.description}
                </p>
              )}
              {!hostel.description && <div className='mb-4' />}

              {active ? (
                <>
                  <OccupancyBar percent={percent} />
                  <div className='flex justify-between text-sm mt-2 mb-4'>
                    <span className='text-stone-600'>
                      {taken} / {total} beds taken
                    </span>
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
                        disabled={busy}
                        className='border border-stone-200 rounded-lg p-2.5 cursor-pointer hover:bg-stone-50 disabled:opacity-60'
                      >
                        {busy ? <Spinner size={18} /> : <MoreVertical size={18} />}
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
                      onClick={() => runAction(hostel.id, activateHostel)}
                      disabled={busy}
                      className='w-full border border-green-800 text-green-800 text-sm font-semibold rounded-lg py-2.5 cursor-pointer hover:bg-green-50 flex items-center justify-center gap-2 disabled:opacity-60'
                    >
                      {busy && <Spinner size={16} />}
                      {busy ? 'Activating...' : 'Activate hostel'}
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
        <Modal
          title={modal.type === 'add' ? 'Add Hostel' : 'Edit Hostel'}
          onClose={() => !saving && setModal(null)}
        >
          <form onSubmit={handleSave}>
            <label className='block text-sm font-medium mb-1'>Hostel name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder='e.g. Hall 4'
              required
              className={`${inputClass} mb-4`}
            />

            <label className='block text-sm font-medium mb-1'>Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder='e.g. Recently renovated male hostel'
              className={`${inputClass} mb-4`}
            />

            <div className='grid grid-cols-2 gap-3 mb-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className={inputClass}
                >
                  <option value='MALE'>Male</option>
                  <option value='FEMALE'>Female</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Fee (₦)</label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  placeholder='10000'
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <label className='block text-sm font-medium mb-1'>
              Image {modal.type === 'edit' && '(leave empty to keep the current one)'}
            </label>
            <input
              type='file'
              accept='image/jpeg,image/png,image/webp'
              onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })}
              className='w-full text-sm mb-1'
            />
            <p className='text-xs text-stone-400 mb-5'>JPG, PNG or WEBP.</p>

            {formError && (
              <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{formError}</p>
            )}

            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setModal(null)}
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