import { Route, Routes } from 'react-router-dom'
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import Login from './components/Login'
import AdminLogin from './components/AdminLogin'
import Dashboard from './components/Dashboard'
import ReserveRoom from './components/ReserveRoom'
import Payments from './components/Payments'
import CheckInCode from './components/CheckInCode'
import ReportIssue from './components/ReportIssue'
import SignOut from './components/SignOut'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './components/AdminDashboard'
import AdminLayout from './components/layout/AdminLayout'
import ComingSoon from './components/ComingSoon'
import ManageHostels from './components/admin/ManageHostels'
import HostelRooms from './components/admin/HostelRooms'
import CheckInVerification from './components/CheckInVerification'

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />} >
        <Route path='/' element={<Login />} />
        <Route path='/adminlogin' element={<AdminLogin />} />
      </Route>

      <Route element={<ProtectedRoute role='student' />}>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/reserve' element={<ReserveRoom />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/check-in-code' element={<CheckInCode />} />
          <Route path='/report-issue' element={<ReportIssue />} />
          <Route path='/signout' element={<SignOut />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role='admin' />}>
        <Route element={<AdminLayout />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          {/* <Route path='/admin/hostels' element={<ComingSoon title='Hostels & Rooms' />} /> */}
          <Route path='/admin/payments' element={<ComingSoon title='Payments' />} />
          <Route path='/admin/check-in' element={<CheckInVerification />} />
          <Route path='/admin/issues' element={<ComingSoon title='Issues' />} />
          <Route path='/admin/hostels' element={<ManageHostels />} />
          <Route path='/admin/hostels/:hostelId' element={<HostelRooms />} />
          <Route path='/admin/signout' element={<SignOut />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App 