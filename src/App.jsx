import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import CustomerHome from './pages/customer/Home'
import BookRide from './pages/customer/BookRide'
import RideStatus from './pages/customer/RideStatus'
import DriverRegister from './pages/driver/DriverRegister'
import DriverHome from './pages/driver/DriverHome'
import DriverActiveRide from './pages/driver/DriverActiveRide'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminBookings from './pages/admin/AdminBookings'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPayouts from './pages/admin/AdminPayouts'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* Customer */}
          <Route path="/home" element={<ProtectedRoute><CustomerHome /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
          <Route path="/ride/:id" element={<ProtectedRoute><RideStatus /></ProtectedRoute>} />

          {/* Driver */}
          <Route path="/driver/register" element={<ProtectedRoute><DriverRegister /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute requireDriver><DriverHome /></ProtectedRoute>} />
          <Route path="/driver/ride/:id" element={<ProtectedRoute requireDriver><DriverActiveRide /></ProtectedRoute>} />

          {/* Admin (nested) */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="payouts" element={<AdminPayouts />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
