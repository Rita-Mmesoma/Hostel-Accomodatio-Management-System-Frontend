import { createContext, useContext, useEffect, useState } from 'react'
import { getAuthProfile, getStudentProfile } from '../api/profile'

const ProfileContext = createContext(null)

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

        setProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          gender: data.gender,
          roleLabel: 'Student',
          registrationNo: data.registrationNo,
          level: formatLevel(data.academicLevel),
          allocation: data.allocation,
          schoolFee: data.schoolFee,
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