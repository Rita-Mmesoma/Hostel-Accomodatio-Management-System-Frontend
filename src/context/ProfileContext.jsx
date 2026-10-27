import { createContext, useContext, useEffect, useState } from 'react'
import { getAuthProfile, getStudentProfile } from '../api/profile'
import { getBankAccount } from '../api/payments'

const ProfileContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => useContext(ProfileContext)

// "LEVEL_600" -> "600 Level"
const formatLevel = (level) => (level ? `${level.replace('LEVEL_', '')} Level` : '')

const roleLabels = {
  ADMIN: 'Administrator',
  SUPERADMIN: 'Super Admin',
}

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetches the profile and stores it. Call it again after anything
  // that changes the profile.
  const refreshProfile = async () => {
    try {
      if (localStorage.getItem('role') === 'student') {
        const { data } = await getStudentProfile()
        console.log('=== STUDENT PROFILE DATA ===', data)

        // Check if there is an active reservation saved in this browser
        const regNo = data.registrationNo || localStorage.getItem('studentRegNo')
        const savedKey = regNo ? `allocation:${regNo}` : 'activeAllocation'
        const savedAllocRaw = localStorage.getItem(savedKey) || localStorage.getItem('activeAllocation')
        let savedAlloc = null
        if (savedAllocRaw) {
          try {
            savedAlloc = JSON.parse(savedAllocRaw)
          } catch {}
        }

        const activeAllocFromList =
          data.allocations?.find(
            (a) => a.status === 'RESERVED' || a.status === 'ALLOCATED' || a.status === 'ACTIVE'
          ) || data.allocations?.[0]

        const activeAppAlloc = data.application?.allocation || data.applications?.[0]?.allocation

        let fallbackFromApplication = null
        const app = data.application || data.applications?.[0]
        if (app && (app.status === 'ALLOCATED' || app.hostelId || app.hostel || localStorage.getItem('hasReservedBed'))) {
          fallbackFromApplication = {
            hostel: app.hostel || (app.hostelId ? { id: app.hostelId } : null),
            hostelId: app.hostelId || app.hostel?.id,
            room: app.room || null,
            bed: app.bed || null,
            status: app.status === 'ALLOCATED' ? 'ALLOCATED' : 'RESERVED',
            expiresAt: app.paymentDeadline || localStorage.getItem('reservationExpiresAt') || null,
          }
        }

        let resolvedAllocation =
          data.allocation ||
          activeAllocFromList ||
          data.activeAllocation ||
          data.reservation ||
          activeAppAlloc ||
          savedAlloc ||
          fallbackFromApplication ||
          null

        // If resolvedAllocation is missing room or bed details but savedAlloc has them, merge!
        if (resolvedAllocation && savedAlloc && (!resolvedAllocation.room || !resolvedAllocation.bed)) {
          resolvedAllocation = {
            ...savedAlloc,
            ...resolvedAllocation,
            room: resolvedAllocation.room || savedAlloc.room,
            bed: resolvedAllocation.bed || savedAlloc.bed,
            hostel: resolvedAllocation.hostel || savedAlloc.hostel,
          }
        }

        if (resolvedAllocation) {
          if (regNo) {
            localStorage.setItem(`allocation:${regNo}`, JSON.stringify(resolvedAllocation))
            localStorage.setItem(`hasReservedBed:${regNo}`, 'true')
          }
          localStorage.setItem('activeAllocation', JSON.stringify(resolvedAllocation))
          localStorage.setItem('hasReservedBed', 'true')
          if (resolvedAllocation.expiresAt) {
            localStorage.setItem('reservationExpiresAt', resolvedAllocation.expiresAt)
          }
        }

        let bankAccount = null
        try {
          const bankRes = await getBankAccount()
          bankAccount = bankRes?.data || null
        } catch {
          // not created yet or network glitch
        }

        setProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          gender: data.gender,
          roleLabel: 'Student',
          registrationNo: data.registrationNo,
          level: formatLevel(data.academicLevel),
          allocation: resolvedAllocation,
          application: data.application || data.applications?.[0] || null,
          schoolFee: data.schoolFee,
          bankAccount,
        })
      } else {
        const { data } = await getAuthProfile()
        const user = data.user

        setProfile({
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roleLabel: roleLabels[user.role] || 'Administrator',
        })
      }
    } catch (err) {
      console.log('Could not load profile:', err.message)
    }
  }

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false))
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}