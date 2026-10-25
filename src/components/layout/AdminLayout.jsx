import DashboardLayout from './DashboardLayout'

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/hostels', label: 'Hostels & Rooms' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/school-fees', label: 'School Fees' },
  { to: '/admin/check-in', label: 'Check-in Verification' },
  { to: '/admin/issues', label: 'Issues' },
]

const adminTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/hostels': 'Manage Hostels',
  '/admin/payments': 'Payments',
  '/admin/school-fees': 'School Fee Records',
  '/admin/check-in': 'Check-in Verification',
  '/admin/issues': 'Issues',
  '/admin/signout': 'Sign out',
}

const AdminLayout = () => (
  <DashboardLayout navItems={adminNavItems} titles={adminTitles} signOutPath='/admin/signout' />
)

export default AdminLayout