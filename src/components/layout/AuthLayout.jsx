import { Outlet, useLocation } from 'react-router-dom'
import Logo from '../Logo'

const AuthLayout = () => {
    const location = useLocation()
    const isAdminLogin = location.pathname === '/adminlogin'
  return (
    <div className='w-full h-screen flex flex-col md:flex-row'>

      <div className='flex-1 bg-white flex justify-center items-center'>
        <Outlet />
      </div>

      <div className='flex-1 flex-col bg-green-600 flex justify-center items-center
                       rounded-t-[50px] md:rounded-t-none md:rounded-l-[200px]'>
        <Logo text={isAdminLogin ? 'Admin Portal' : 'Student Portal'} />
      </div>

    </div>
  )
}

export default AuthLayout