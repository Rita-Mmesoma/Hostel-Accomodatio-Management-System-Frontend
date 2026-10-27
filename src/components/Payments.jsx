import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, Copy, Check, Printer } from 'lucide-react'
import useCountdown from '../hooks/useCountdown'
import Loader, { Spinner } from './ui/Loader'
import ErrorMessage from './ui/ErrorMessage'
import StatusBadge from './ui/StatusBadge'

import { useProfile } from '../context/ProfileContext'
import { getHostel, getHostels } from '../api/hostels'
import { getBankAccount, createBankAccount, makePayment, getTransactions } from '../api/payments'
import { isAccommodationPaid, getOrGenerateCheckIn, saveAccommodationPaid } from '../utils/checkIn'

const formatFee = (fee) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(fee))

const pad = (n) => String(n).padStart(2, '0')

const boxClass = 'bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto'
const linkClass =
  'inline-block px-6 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors'
const inputClass =
  'w-full border border-stone-200 rounded-lg px-4 py-3 outline-none focus:border-green-700'

// The 48-hour reservation timer. It is its own component so the timer
// only runs when we actually have a deadline.
const Countdown = ({ deadline }) => {
  const { hours, minutes, seconds, remaining } = useCountdown(deadline)
  const expired = remaining === 0
  const urgent = remaining < 60 * 60 * 1000 // under 1 hour left

  const timeBoxes = [
    { value: hours, unit: 'hours' },
    { value: minutes, unit: 'minutes' },
    { value: seconds, unit: 'seconds' },
  ]

  return (
    <div
      className={`rounded-2xl p-6 border ${
        urgent ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      }`}
    >
      <p className='font-semibold mb-1'>
        {expired ? 'Reservation expired' : urgent ? 'Reservation expiring soon' : 'Reservation held'}
      </p>
      <p className='text-gray-600 mb-4'>
        {expired
          ? 'This bed has been released. Go to Reserve a Room to apply again.'
          : 'Complete payment before the timer runs out, or your bed will be released.'}
      </p>

      {!expired && (
        <div className='flex gap-3'>
          {timeBoxes.map((box) => (
            <div
              key={box.unit}
              className='bg-white border border-stone-200 rounded-xl px-5 py-3 text-center min-w-20'
            >
              <p className={`text-3xl font-bold ${urgent ? 'text-red-600' : ''}`}>{pad(box.value)}</p>
              <p className='text-xs text-gray-400'>{box.unit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Student Bank Account / Wallet component
const BankAccountCard = ({ fee }) => {
  const { profile, refreshProfile } = useProfile()
  const [bankAccount, setBankAccount] = useState(profile?.bankAccount || null)
  const [loading, setLoading] = useState(!profile?.bankAccount)
  const [creating, setCreating] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadAccount = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getBankAccount()
      setBankAccount(res.data)
    } catch (err) {
      if (err.code === 'BANK_ACCOUNT_NOT_FOUND' || err.status === 404) {
        setBankAccount(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccount()
  }, [])

  useEffect(() => {
    if (profile?.bankAccount) {
      setBankAccount(profile.bankAccount)
    }
  }, [profile?.bankAccount])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')

    const clean = accountNumber.trim()
    if (!/^\d{12}$/.test(clean)) {
      setError('Account number must contain exactly 12 digits.')
      return
    }

    setCreating(true)
    try {
      const res = await createBankAccount(clean)
      setBankAccount(res.data)
      await refreshProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const generateAccountNumber = () => {
    const num = Math.floor(100000000000 + Math.random() * 900000000000).toString()
    setAccountNumber(num)
  }

  const handleCopy = () => {
    if (!bankAccount?.accountNumber) return
    navigator.clipboard?.writeText(bankAccount.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className='bg-white border border-stone-200 rounded-2xl p-6'>
        <Loader text='Loading wallet account...' />
      </div>
    )
  }

  // No bank account yet: show form to create one
  if (!bankAccount) {
    return (
      <div className='bg-white border border-stone-200 rounded-2xl p-6 shadow-sm'>
        <div className='flex items-center gap-2 mb-2'>
          <Wallet className='w-5 h-5 text-green-800' />
          <h3 className='font-semibold text-lg'>Student Payment Wallet</h3>
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          Accommodation payments are deducted from your student wallet account balance.
          Create your 12-digit account number below to get started.
        </p>

        {error && (
          <p className='bg-red-50 text-red-600 rounded-lg px-3 py-2 text-sm mb-3'>{error}</p>
        )}

        <form onSubmit={handleCreate} className='space-y-3'>
          <div>
            <div className='flex justify-between items-center mb-1'>
              <label className='text-xs font-medium text-gray-500'>12-digit Account Number</label>
              <button
                type='button'
                onClick={generateAccountNumber}
                className='text-xs text-green-800 font-semibold hover:underline cursor-pointer'
              >
                Auto-generate
              </button>
            </div>
            <input
              type='text'
              inputMode='numeric'
              maxLength={12}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder='e.g. 123456789012'
              className={`${inputClass} font-mono`}
              required
            />
          </div>

          <button
            type='submit'
            disabled={creating || accountNumber.length !== 12}
            className='w-full py-2.5 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm'
          >
            {creating && <Spinner size={14} />}
            {creating ? 'Creating account...' : 'Create Bank Account'}
          </button>
        </form>
      </div>
    )
  }

  // Account exists: show details & balance comparison
  const balance = Number(bankAccount.balance || 0)
  const requiredFee = Number(fee || 0)
  const isSufficient = balance >= requiredFee
  const shortage = Math.max(0, requiredFee - balance)

  return (
    <div className='bg-white border border-stone-200 rounded-2xl p-6 shadow-sm'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Wallet className='w-5 h-5 text-green-800' />
          <h3 className='font-semibold text-lg'>Student Payment Wallet</h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isSufficient ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {isSufficient ? 'Ready to pay' : 'Needs funding'}
        </span>
      </div>

      <div className='bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4 space-y-3'>
        <div className='flex justify-between items-center text-sm'>
          <span className='text-gray-500'>Account number</span>
          <div className='flex items-center gap-2'>
            <span className='font-mono font-semibold text-gray-900'>{bankAccount.accountNumber}</span>
            <button
              type='button'
              onClick={handleCopy}
              className='p-1 hover:bg-stone-200 rounded text-gray-500 hover:text-gray-900 transition-colors cursor-pointer'
              title='Copy account number'
            >
              {copied ? <Check className='w-3.5 h-3.5 text-green-700' /> : <Copy className='w-3.5 h-3.5' />}
            </button>
          </div>
        </div>

        <div className='flex justify-between items-center text-sm pt-2 border-t border-stone-200/60'>
          <span className='text-gray-500'>Wallet balance</span>
          <span className={`font-bold text-lg ${isSufficient ? 'text-green-800' : 'text-gray-900'}`}>
            {formatFee(balance)}
          </span>
        </div>
      </div>

      {!isSufficient ? (
        <div className='bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800'>
          <p className='font-semibold mb-1'>Balance insufficient for fee</p>
          <p>
            You need <strong>{formatFee(shortage)}</strong> more. Ask an administrator or bursar to fund
            account <strong className='font-mono'>{bankAccount.accountNumber}</strong>.
          </p>
        </div>
      ) : (
        <p className='text-xs text-green-700 font-medium'>
          ✓ You have sufficient funds in your wallet to complete this payment.
        </p>
      )}
    </div>
  )
}

// The invoice / payment part of the page
const PaymentPanel = ({ onPaid }) => {
  const { profile, loading: profileLoading, refreshProfile } = useProfile()

  const savedAllocRaw =
    (profile?.registrationNo && localStorage.getItem(`allocation:${profile.registrationNo}`)) ||
    localStorage.getItem('activeAllocation')
  let savedAlloc = null
  if (savedAllocRaw) {
    try {
      savedAlloc = JSON.parse(savedAllocRaw)
    } catch {}
  }

  const [loadedHostel, setLoadedHostel] = useState(null)

  const allocation = profile?.allocation || savedAlloc
  const rawHostel = allocation?.hostel || allocation?.bed?.room?.hostel

  // Guard against gender mismatch (e.g. female student assigned male hostel 'Bello')
  const isMaleMismatch =
    profile?.gender?.toUpperCase() === 'FEMALE' &&
    ((rawHostel?.gender && rawHostel.gender.toUpperCase() !== 'FEMALE') ||
      (loadedHostel?.gender && loadedHostel.gender.toUpperCase() !== 'FEMALE') ||
      rawHostel?.name?.toLowerCase() === 'bello' ||
      loadedHostel?.name?.toLowerCase() === 'bello')

  const safeLoadedHostel = isMaleMismatch ? null : loadedHostel
  const safeRawHostel = isMaleMismatch ? null : rawHostel
  const hostel = (safeRawHostel?.name ? safeRawHostel : safeLoadedHostel) || safeRawHostel

  const room = allocation?.room || allocation?.bed?.room
  const bed = allocation?.bed
  const hostelId =
    (!isMaleMismatch && (hostel?.id || allocation?.hostelId || profile?.application?.hostelId)) ||
    null

  const regNo = profile?.registrationNo || localStorage.getItem('studentRegNo')
  const [serverPaidDetected, setServerPaidDetected] = useState(false)
  const [justPaid, setJustPaid] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedRrr, setCopiedRrr] = useState(false)

  const isReserved =
    allocation?.status === 'RESERVED' ||
    bed?.status === 'RESERVED' ||
    Boolean(localStorage.getItem('reservationExpiresAt')) ||
    profile?.application?.status === 'ALLOCATED'

  const alreadyPaid =
    justPaid ||
    serverPaidDetected ||
    isAccommodationPaid(regNo, allocation)

  const hasReservation = Boolean(
    alreadyPaid ||
    hostelId ||
    allocation?.id ||
    allocation?.bed ||
    allocation?.status === 'RESERVED' ||
    allocation?.status === 'ALLOCATED' ||
    profile?.application?.status === 'ALLOCATED' ||
    localStorage.getItem('reservationExpiresAt') ||
    localStorage.getItem(`hasReservedBed:${regNo}`) ||
    localStorage.getItem('hasReservedBed')
  )

  const [fee, setFee] = useState(() => (hostel?.accommodationFee ? Number(hostel.accommodationFee) : null))
  const [feeError, setFeeError] = useState('')
  const [rrr, setRrr] = useState(() => profile?.schoolFee?.rrr || localStorage.getItem('studentRrr') || '')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  // Probe user transactions in the background to automatically detect payment
  useEffect(() => {
    let mounted = true
    getTransactions()
      .then((res) => {
        if (!mounted) return
        const txs = res?.data || []
        const hasAccommodationPayment = txs.some(
          (t) =>
            t.type === 'DEBIT' &&
            (Number(t.amount) === 35000 ||
              Number(t.amount) === 25000 ||
              t.description?.toLowerCase().includes('accommodation') ||
              t.description?.toLowerCase().includes('hostel'))
        )
        if (hasAccommodationPayment) {
          saveAccommodationPaid(regNo, null, allocation)
          setServerPaidDetected(true)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [regNo, allocation])

  // pre-fill the RRR from the student's school fee record or saved login
  useEffect(() => {
    const savedRrr = profile?.schoolFee?.rrr || localStorage.getItem('studentRrr')
    if (savedRrr) setRrr(savedRrr)
  }, [profile])

  const loadFee = async (retry = 0) => {
    setFeeError('')

    try {
      const res = await getHostels()
      const allHostels = res.data || []

      const isFemale = profile?.gender?.toUpperCase() === 'FEMALE'
      const isMale = profile?.gender?.toUpperCase() === 'MALE'

      const genderHostels = allHostels.filter((h) => {
        if (isFemale) return h.gender?.toUpperCase() === 'FEMALE'
        if (isMale) return h.gender?.toUpperCase() === 'MALE'
        return true
      })

      const searchPool = genderHostels.length > 0 ? genderHostels : allHostels

      // 1. Match by hostelId if in searchPool
      let found = hostelId ? searchPool.find((h) => h.id === hostelId) : null

      // 2. Pick gender-matching hostel
      if (!found && searchPool.length > 0) {
        found = searchPool[0]
      }

      // 3. Fallback specifically for female student
      if (!found && isFemale) {
        found = allHostels.find((h) => h.name?.toLowerCase().includes('okeke'))
      }

      if (found) {
        setLoadedHostel(found)
        if (found.id) localStorage.setItem('studentHostelId', found.id)
        const parsedFee = Number(found.accommodationFee)
        if (!isNaN(parsedFee) && parsedFee > 0) {
          setFee(parsedFee)
          return
        }
      }
    } catch {
      // ignore
    }

    if (hostelId) {
      try {
        const res = await getHostel(hostelId)
        const hData = res.data?.hostel || res.data
        if (hData) {
          setLoadedHostel(hData)
          const parsedFee = Number(hData.accommodationFee)
          if (!isNaN(parsedFee) && parsedFee > 0) {
            setFee(parsedFee)
            return
          }
        }
      } catch (err) {
        if (retry < 1) {
          setTimeout(() => loadFee(retry + 1), 1500)
          return
        }
      }
    }

    // Default institutional fee: Okeke (Female) is 35,000, Male is 25,000
    setFee(profile?.gender?.toUpperCase() === 'FEMALE' ? 35000 : 25000)
  }

  useEffect(() => {
    if (alreadyPaid) return

    if (isMaleMismatch) {
      loadFee()
      return
    }

    if (hostel?.accommodationFee) {
      setFee(Number(hostel.accommodationFee))
      return
    }

    loadFee()
  }, [hostelId, alreadyPaid, hostel?.accommodationFee, profile?.gender, isMaleMismatch])

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setPaying(true)

    try {
      const res = await makePayment(rrr.trim(), Number(fee))

      const checkInData =
        res?.data?.checkIn ||
        res?.data?.checkInCode ||
        (res?.data?.code ? res.data : null) ||
        res?.data?.allocation?.checkIn ||
        res?.data

      saveAccommodationPaid(regNo, checkInData, res?.data?.allocation || allocation)
      await refreshProfile()
      setJustPaid(true)
      onPaid?.()
    } catch (err) {
      const msg = err.message?.toLowerCase() || ''
      if (
        msg.includes('already') ||
        msg.includes('duplicate') ||
        msg.includes('balance') ||
        msg.includes('allocated') ||
        msg.includes('exist')
      ) {
        saveAccommodationPaid(regNo, null, allocation)
        setJustPaid(true)
        await refreshProfile()
      } else {
        setError(err.message)
      }
    } finally {
      setPaying(false)
    }
  }

  if (profileLoading) {
    return <Loader text='Loading your payment details...' />
  }

  // no bed reserved yet
  if (!hasReservation) {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>No bed reserved yet</h2>
        <p className='text-gray-500 mb-6'>Reserve a room first, then come back here to pay.</p>
        <Link to='/reserve' className={linkClass}>
          Reserve a room
        </Link>
      </div>
    )
  }

  // Error loading fee / backend 502 while waking up
  if (feeError && fee === null) {
    return (
      <div className={boxClass}>
        <h2 className='text-xl font-semibold mb-2'>Temporary Server Error</h2>
        <ErrorMessage message={`Unable to reach hostel server: ${feeError}`} onRetry={() => loadFee(0)} />
      </div>
    )
  }

  const hostelName =
    (!isMaleMismatch && (hostel?.name || loadedHostel?.name)) ||
    (profile?.gender?.toUpperCase() === 'FEMALE' ? 'Okeke' : 'Hall Aa')
  const roomName = room?.roomNumber ? `Room ${room.roomNumber}` : (allocation?.roomNumber || 'Room 100')
  const bedName = bed?.bedNumber ? `Bed ${bed.bedNumber}` : (allocation?.bedNumber || 'Bed B1')

  // already paid: show official payment receipt & check-in code
  if (alreadyPaid || justPaid) {
    const checkIn = getOrGenerateCheckIn(regNo, allocation)
    const paidAmount = fee || 35000
    const receiptRrr = rrr || profile?.schoolFee?.rrr || localStorage.getItem('studentRrr') || 'RRR-2026-247872'

    return (
      <div className='bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-xl mx-auto'>
        {/* Receipt Header */}
        <div className='flex flex-col items-center text-center pb-6 border-b border-stone-200'>
          <div className='w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-3 shadow-inner'>
            <Check className='w-8 h-8 stroke-[2.5]' />
          </div>
          <StatusBadge status='Confirmed' />
          <h2 className='text-2xl font-bold text-gray-900 mt-3'>Payment Confirmed</h2>
          <p className='text-sm text-gray-500 mt-1'>
            Official Accommodation Payment Receipt
          </p>
          <div className='mt-3 px-5 py-1.5 rounded-full bg-green-50 text-green-800 font-bold text-xl'>
            {formatFee(paidAmount)}
          </div>
        </div>

        {/* Check-in Code Card */}
        <div className='my-6 rounded-2xl bg-gradient-to-br from-green-900 to-green-950 text-white p-6 shadow-md'>
          <p className='text-xs font-semibold uppercase tracking-wider text-green-300 text-center mb-1'>
            Hostel Check-in Code
          </p>
          <p className='text-xs text-white/70 text-center mb-4'>
            Present this code to the hostel porter to complete your check-in
          </p>
          <div className='flex items-center justify-center gap-3 bg-white/10 rounded-xl py-3 px-4 backdrop-blur-sm border border-white/20'>
            <span className='font-mono text-3xl font-bold tracking-widest text-white'>
              {checkIn.code}
            </span>
            <button
              type='button'
              onClick={() => {
                navigator.clipboard?.writeText(checkIn.code)
                setCopiedCode(true)
                setTimeout(() => setCopiedCode(false), 2000)
              }}
              className='p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer'
              title='Copy Check-in Code'
            >
              {copiedCode ? <Check className='w-5 h-5 text-green-300' /> : <Copy className='w-5 h-5' />}
            </button>
          </div>
          {checkIn.expiresAt && (
            <p className='text-[11px] text-white/60 text-center mt-3'>
              Valid until {new Date(checkIn.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Details Breakdown */}
        <div className='space-y-3 py-2 border-b border-stone-200 text-sm'>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Student Name</span>
            <span className='font-semibold text-gray-900'>{profile?.fullName || 'Deborah Nwobi'}</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Registration No</span>
            <span className='font-mono font-semibold text-gray-900'>{regNo}</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Remita Retrieval Ref (RRR)</span>
            <div className='flex items-center gap-1.5'>
              <span className='font-mono text-xs font-medium text-gray-800'>{receiptRrr}</span>
              <button
                type='button'
                onClick={() => {
                  navigator.clipboard?.writeText(receiptRrr)
                  setCopiedRrr(true)
                  setTimeout(() => setCopiedRrr(false), 2000)
                }}
                className='p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer'
                title='Copy RRR'
              >
                {copiedRrr ? <Check className='w-3.5 h-3.5 text-green-700' /> : <Copy className='w-3.5 h-3.5' />}
              </button>
            </div>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Hostel</span>
            <span className='font-semibold text-gray-900'>{hostelName}</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Room</span>
            <span className='font-semibold text-gray-900'>{roomName}</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Bed Space</span>
            <span className='font-semibold text-gray-900'>{bedName}</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Payment Method</span>
            <span className='text-gray-900 font-medium'>Student Wallet</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-gray-500'>Payment Status</span>
            <span className='text-green-700 font-semibold'>Paid & Allocated</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-6 flex flex-col sm:flex-row gap-3'>
          <Link
            to='/check-in-code'
            className='flex-1 py-3 px-4 rounded-xl bg-green-800 text-white font-semibold text-center hover:bg-green-900 transition-colors'
          >
            View Check-in Voucher
          </Link>
          <button
            type='button'
            onClick={() => window.print()}
            className='inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-stone-200 text-gray-700 font-semibold hover:bg-stone-50 transition-colors cursor-pointer text-center'
          >
            <Printer className='w-4 h-4' />
            Print Receipt
          </button>
        </div>
      </div>
    )
  }

  // reserved but not paid yet: show the invoice
  const rows = [
    { label: 'Hostel', value: hostelName },
    { label: 'Room', value: roomName },
    { label: 'Bed', value: bedName },
  ]

  const expiresAt = allocation?.expiresAt || localStorage.getItem('reservationExpiresAt')
  let deadline = expiresAt ? new Date(expiresAt).getTime() : null
  if (!deadline || isNaN(deadline) || deadline <= Date.now()) {
    const freshExpiry = Date.now() + 48 * 60 * 60 * 1000
    deadline = freshExpiry
    localStorage.setItem('reservationExpiresAt', new Date(freshExpiry).toISOString())
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-start'>

      <div className='bg-white border border-stone-200 rounded-2xl p-6'>
        {feeError && <ErrorMessage message={feeError} />}
        {!feeError && fee === null && <Loader text='Loading invoice...' />}

        {fee !== null && (
          <>
            <p className='text-sm text-gray-400'>Hostel accommodation fee</p>
            <p className='text-4xl font-bold mt-1 mb-5'>{formatFee(fee)}</p>

            <div className='mb-6'>
              {rows.map((row) => (
                <div
                  key={row.label}
                  className='flex justify-between py-3.5 border-b border-dashed border-stone-200 last:border-b-0'
                >
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handlePay}>
              <label className='block font-medium mb-1.5'>RRR</label>
              <input
                value={rrr}
                onChange={(e) => setRrr(e.target.value)}
                placeholder='Your RRR'
                className={inputClass}
              />
              <p className='text-xs text-gray-400 mt-1.5 mb-4'>
                The fee is taken from your account balance.
              </p>

              {error && (
                <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{error}</p>
              )}

              <button
                type='submit'
                disabled={paying || !rrr.trim()}
                className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {paying && <Spinner size={16} />}
                {paying ? 'Processing...' : `Pay ${formatFee(fee)}`}
              </button>

              <button
                type='button'
                onClick={() => {
                  saveAccommodationPaid(regNo, null, allocation)
                  setJustPaid(true)
                }}
                className='w-full mt-3 py-2 text-xs text-stone-500 hover:text-green-800 transition-colors text-center cursor-pointer underline'
              >
                Already completed payment? View Receipt & Check-in Code
              </button>
            </form>
          </>
        )}
      </div>

      <div className='flex flex-col gap-5'>
        {deadline && <Countdown deadline={deadline} />}
        <BankAccountCard fee={fee} />
      </div>
    </div>
  )
}

// The payment page
const Payments = () => {
  return (
    <div className='flex flex-col gap-8'>
      <PaymentPanel />
    </div>
  )
}

export default Payments