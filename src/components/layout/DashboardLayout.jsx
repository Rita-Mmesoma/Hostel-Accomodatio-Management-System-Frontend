import { useState } from 'react'
import { NavLink, Outlet, Link  } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import UserInfo from '../ui/UserInfo'
import { LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reserve', label: 'Reserve a Room' },
  { to: '/payments', label: 'My Payments' },
  { to: '/check-in-code', label: 'My Check-in Code' },
  { to: '/report-issue', label: 'Report an Issue' },
]

const titles = {
  '/dashboard': 'Dashboard',
  '/reserve': 'Reserve a Room',
  '/payments': 'My Payments',
  '/check-in-code': 'My Check-in Code',
  '/report-issue': 'Report an Issue',
}

const DashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const {pathname} = useLocation()

  return (
    <div className='w-full min-h-screen flex bg-gray-50'>

      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 md:w-70 lg:w-90 bg-green-700 text-white
                    flex flex-col p-4 z-50 transition-transform duration-200
                    ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className='text-xl font-bold mb-8 px-2'>Hostel Portal</div>
        <nav className='flex flex-col gap-1'>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-3.5 rounded-lg text-lg font-medium ${
                  isActive ? 'bg-white text-green-700 shadow-md' : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to='/signout'
          onClick={() => setMenuOpen(false)}
          className='mt-auto flex items-center gap-3 px-3 py-3.5 rounded-lg text-lg font-medium text-white/80 hover:bg-white/10'
        >
          <LogOut size={20} />
          Sign out
        </Link>
      </aside>

      {menuOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-40 md:hidden'
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className='flex-1 flex flex-col'>
        <header className='h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6'>
          <div className='flex items-center gap-4'>
            <button onClick={() => setMenuOpen(true)} className='md:hidden text-2xl'>
              ☰
            </button>
            <h1 className='text-lg font-semibold'>{titles[pathname] || 'Dashboard'}</h1>
          </div>

          <UserInfo name='Chidinma Okafor' role='Student' />
        </header>
        {/* <header className='h-16 bg-white border-b flex items-center px-6 gap-4'>
          <button
            onClick={() => setMenuOpen(true)}
            className='md:hidden text-2xl'
          >
            ☰
          </button>
          <h1 className='text-lg font-semibold'>{titles[pathname] || 'Dashboard'}</h1>
        </header> */}

        <main className='flex-1 p-6'>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout