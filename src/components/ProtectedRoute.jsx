import { Navigate, Outlet } from 'react-router-dom'
import { ProfileProvider } from '../context/ProfileContext'

const ProtectedRoute = ({role}) => {
  const token = localStorage.getItem('token')
  const savedRole = localStorage.getItem('role')


  if (!token || savedRole !== role) {
    return <Navigate to={role === 'admin' ? '/adminLogin' : '/'} replace />
  }

  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  )
}

export default ProtectedRoute