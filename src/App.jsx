import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageBackground from './components/PageBackground'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Team from './pages/Team'
import CustomerHome from './pages/customer/Home'
import BookRide from './pages/customer/BookRide'
import RideStatus from './pages/customer/RideStatus'
import DriverRegister from './pages/driver/DriverRegister'
import DriverHome from './pages/driver/DriverHome'
import DriverActiveRide from './pages/driver/DriverActiveRide'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminApprovals from './pages/admin/AdminApprovals'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBookings from './pages/admin/AdminBookings'
import AdminSettings from './pages/admin/AdminSettings'
import AdminPayouts from './pages/admin/AdminPayouts'
import Profile from './pages/Profile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageBackground>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/team" element={<Team />} />

            {/* Auth - plain path = rider; /driver = driver; /admin = admin */}
            <Route path="/login" element={<Login />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup/:role" element={<Signup />} />
            <Route path="/forgot" element={<ForgotPassword />} />

            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

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
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="payouts" element={<AdminPayouts />} />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </PageBackground>
      </BrowserRouter>
    </AuthProvider>
  )
}
