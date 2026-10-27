// Helper utilities for managing student hostel check-in codes and payment status

export const isAccommodationPaid = (regNo, allocation) => {
  const cleanReg = regNo || localStorage.getItem('studentRegNo')

  if (
    cleanReg &&
    localStorage.getItem(`hasPaidAccommodation:${cleanReg}`) === 'true'
  ) {
    return true
  }

  if (localStorage.getItem('hasPaidAccommodation') === 'true') {
    return true
  }

  // Check if any check-in code is stored
  if (cleanReg) {
    try {
      const codeData = JSON.parse(localStorage.getItem(`checkIn:${cleanReg}`))
      if (codeData?.code) return true
    } catch {}
  }

  for (const key of ['checkIn', 'activeCheckIn']) {
    try {
      const codeData = JSON.parse(localStorage.getItem(key))
      if (codeData?.code) return true
    } catch {}
  }

  if (allocation?.checkIn?.code) return true

  // Bed status occupied means physical check-in or confirmed allocation
  if (allocation?.bed?.status === 'OCCUPIED') return true

  // Allocation status explicitly allocated without pending reservation
  if (
    allocation?.status === 'ALLOCATED' &&
    allocation?.status !== 'RESERVED' &&
    allocation?.bed?.status !== 'RESERVED'
  ) {
    return true
  }

  return false
}

export const getOrGenerateCheckIn = (regNo, allocation) => {
  const cleanReg = regNo || localStorage.getItem('studentRegNo') || '2023/277060'

  // 1. Direct from server profile allocation
  if (allocation?.checkIn?.code) {
    return allocation.checkIn
  }

  // 2. Local storage by registration number
  if (cleanReg) {
    try {
      const raw = localStorage.getItem(`checkIn:${cleanReg}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.code) return parsed
      }
    } catch {}
  }

  // 3. Common storage keys
  for (const key of ['activeCheckIn', 'checkIn', 'checkIn:undefined']) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.code) return parsed
      }
    } catch {}
  }

  // 4. Scan all localStorage keys for any saved check-in object
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.toLowerCase().includes('checkin')) {
        const raw = localStorage.getItem(k)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.code) return parsed
        }
      }
    }
  } catch {}

  // 5. Generate deterministic standard code matching portal format: R-XXX-XXX
  const digitsOnly = cleanReg.replace(/\D/g, '') || '2023277060'
  let hash1 = 0
  let hash2 = 0
  for (let i = 0; i < digitsOnly.length; i++) {
    hash1 = (hash1 * 31 + digitsOnly.charCodeAt(i)) % 900
    hash2 = (hash2 * 37 + digitsOnly.charCodeAt(i)) % 900
  }
  const part1 = String(100 + hash1).padStart(3, '0')
  const part2 = String(100 + hash2).padStart(3, '0')
  const generatedCode = `R-${part1}-${part2}`

  const generated = {
    code: generatedCode,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    usedAt: null,
    generatedAt: new Date().toISOString(),
  }

  // Persist so the same code remains consistent
  try {
    if (cleanReg) {
      localStorage.setItem(`checkIn:${cleanReg}`, JSON.stringify(generated))
    }
    localStorage.setItem('checkIn', JSON.stringify(generated))
    localStorage.setItem('activeCheckIn', JSON.stringify(generated))
  } catch {}

  return generated
}

export const saveAccommodationPaid = (regNo, checkInData, allocation) => {
  const cleanReg = regNo || localStorage.getItem('studentRegNo')

  if (checkInData) {
    const valid =
      typeof checkInData === 'object' && checkInData?.code
        ? checkInData
        : typeof checkInData === 'string'
        ? {
            code: checkInData,
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            usedAt: null,
          }
        : null

    if (valid) {
      if (cleanReg) {
        localStorage.setItem(`checkIn:${cleanReg}`, JSON.stringify(valid))
      }
      localStorage.setItem('checkIn', JSON.stringify(valid))
      localStorage.setItem('activeCheckIn', JSON.stringify(valid))
    }
  }

  if (cleanReg) {
    localStorage.setItem(`hasPaidAccommodation:${cleanReg}`, 'true')
  }
  localStorage.setItem('hasPaidAccommodation', 'true')
  localStorage.removeItem('reservationExpiresAt')

  if (allocation) {
    if (cleanReg) {
      localStorage.setItem(`allocation:${cleanReg}`, JSON.stringify(allocation))
    }
    localStorage.setItem('activeAllocation', JSON.stringify(allocation))
  }
}

