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

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />} >
        <Route path='/' element={<Login />} />
        <Route path='/adminlogin' element={<AdminLogin />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/reserve' element={<ReserveRoom />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/check-in-code' element={<CheckInCode />} />
          <Route path='/report-issue' element={<ReportIssue />} />
          <Route path='/signout' element={<SignOut />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App 