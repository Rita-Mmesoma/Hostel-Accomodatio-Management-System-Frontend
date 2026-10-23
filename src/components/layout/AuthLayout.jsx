import { Outlet, useLocation } from 'react-router-dom'
import Logo from '../Logo'

const AuthLayout = () => {
  const location = useLocation()
  const isAdminLogin = location.pathname === '/adminlogin'
  const title = isAdminLogin ? 'Admin Hostel Portal' : 'Student Hostel Portal'

  return (
    <div className='relative w-full h-dvh flex flex-col md:flex-row'>

      {/* White half: logo at the top middle on mobile only  */}
      <div className='flex-1 bg-white flex justify-center pt-8 md:pt-0'>
        <div className='md:hidden'>
          <Logo text={title} textClass='text-green-800' imgClass='w-24' />
        </div>
      </div>

      {/* Green half: logo shown on desktop only */}
      <div className='flex-1 bg-green-600 flex flex-col justify-center items-center
                      rounded-t-[50px] md:rounded-t-none md:rounded-l-[200px]'>
        <div className='hidden md:block'>
          <Logo text={title} />
        </div>
      </div>

      {/* Form: centered on the white/green line on mobile, centered in the white half on desktop */}
      <div className='absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-1/4'>
        <Outlet />
      </div>

    </div>
  )
}

export default AuthLayout