import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function ProtectedRoute({ children, requireAdmin = false, requireDriver = false }) {
  const { loading, session, profile } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">
        Loading…
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  if (requireAdmin && !profile?.is_admin) return <Navigate to="/home" replace />
  if (requireDriver && !profile?.is_driver) return <Navigate to="/home" replace />

  return children
}
