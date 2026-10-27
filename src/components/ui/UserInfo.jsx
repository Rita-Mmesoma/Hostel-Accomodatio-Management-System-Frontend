import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const titleCase = (text) => (text ? text.charAt(0) + text.slice(1).toLowerCase() : '')

const Row = ({ label, value }) => (
  <div className='flex justify-between gap-4 py-2.5 border-b border-dashed border-stone-200 last:border-b-0 text-sm'>
    <span className='text-stone-500'>{label}</span>
    <span className='font-medium text-stone-900 text-right break-all'>{value || '–'}</span>
  </div>
)

const UserInfo = ({ profile }) => {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  // close when you click outside the card or press Escape
  useEffect(() => {
    if (!open) return

    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const name = profile?.fullName || 'User'
  const role = profile?.roleLabel || ''
  const isStudent = role === 'Student'
  const allocation = profile?.allocation
  const hostel = allocation?.hostel || allocation?.bed?.room?.hostel
  const room = allocation?.room || allocation?.bed?.room
  const bed = allocation?.bed

  // "Chidinma Okafor" -> "CO"
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')

  return (
    <div className='relative' ref={boxRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className='flex items-center gap-3 rounded-lg px-2 py-1 cursor-pointer hover:bg-stone-50 transition-colors'
      >
        <div className='w-9 h-9 rounded-full bg-green-50 text-green-900 text-sm font-semibold flex items-center justify-center'>
          {initials}
        </div>
        <div className='hidden sm:block leading-tight text-left'>
          <p className='text-sm font-semibold'>{name}</p>
          <p className='text-xs text-gray-400'>{role}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='absolute right-0 top-full mt-2 w-72 bg-white border border-stone-200 rounded-2xl p-5 shadow-lg z-50'>
          <div className='flex items-center gap-3 mb-3'>
            <div className='w-12 h-12 rounded-full bg-green-50 text-green-900 font-semibold flex items-center justify-center'>
              {initials}
            </div>
            <div className='min-w-0'>
              <p className='font-semibold truncate'>{name}</p>
              <p className='text-xs text-gray-400'>{role}</p>
            </div>
          </div>

          {isStudent ? (
            <>
              <Row label='Reg. number' value={profile.registrationNo} />
              <Row label='Level' value={profile.level} />
              <Row label='Gender' value={titleCase(profile.gender)} />
              <Row label='Email' value={profile.email} />
              <Row label='School fee' value={titleCase(profile.schoolFee?.status?.replace('_', ' '))} />
              {profile.bankAccount && (
                <>
                  <Row label='Wallet Account' value={profile.bankAccount.accountNumber} />
                  <Row
                    label='Wallet Balance'
                    value={new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                    }).format(Number(profile.bankAccount.balance || 0))}
                  />
                </>
              )}

              {hostel ? (
                <>
                  <Row label='Hostel' value={hostel.name} />
                  <Row label='Room' value={room?.roomNumber} />
                  <Row label='Bed' value={bed?.bedNumber} />
                </>
              ) : (
                <Row label='Hostel' value='No bed reserved yet' />
              )}
            </>
          ) : (
            <>
              <Row label='Email' value={profile?.email} />
              <Row label='Role' value={role} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default UserInfo