import { useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import UserInfo from '../ui/UserInfo'
import { LogOut } from 'lucide-react'
import { useProfile } from '../../context/ProfileContext'

const studentNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reserve', label: 'Reserve a Room' },
  { to: '/payments', label: 'My Payments' },
  { to: '/check-in-code', label: 'My Check-in Code' },
  { to: '/report-issue', label: 'Report an Issue' },
]

const studentTitles = {
  '/dashboard': 'Dashboard',
  '/reserve': 'Reserve a Room',
  '/payments': 'My Payments',
  '/check-in-code': 'My Check-in Code',
  '/report-issue': 'Report an Issue',
  '/signout': 'Sign out',
}

// Finds the page title for a path. Exact match first, then the closest
const findTitle = (titles, pathname) => {
  if (titles[pathname]) return titles[pathname]

  const parent = Object.keys(titles)
    .filter((path) => pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0]

  return titles[parent] || 'Dashboard'
}

// The student version is the default. AdminLayout passes its own props.
const DashboardLayout = ({
  navItems = studentNavItems,
  titles = studentTitles,
  signOutPath = '/signout',
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { profile, loading } = useProfile()

  return (
    <div className='w-full h-screen flex bg-gray-50 overflow-hidden'>

      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-full shrink-0 overflow-y-auto w-64 md:w-70 lg:w-90 bg-green-700 text-white
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
          to={signOutPath}
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

        <div className='flex-1 flex flex-col min-w-0 h-full'>
        <header className='h-16 shrink-0 bg-white border-b border-stone-200 flex items-center justify-between px-6'>
          <div className='flex items-center gap-4'>
            <button onClick={() => setMenuOpen(true)} className='md:hidden text-2xl cursor-pointer'>
              ☰
            </button>
            <h1 className='text-lg font-semibold'>{findTitle(titles, pathname)}</h1>
          </div>

          {loading ? (
            <div className='h-9 w-44 rounded-lg bg-stone-100 animate-pulse' />
          ) : (
            <UserInfo profile={profile}
              name={profile?.fullName || 'User'}
              role={profile?.roleLabel || ''}
              // signOutPath={signOutPath}
            />
          )}
        </header>

        <main className='flex-1 overflow-y-auto p-6'>
          <Outlet />
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout