import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'

export default function AdminHome() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <Brand />
        <button onClick={handleLogout} className="text-sm font-semibold text-forest">Log out</button>
      </header>

      <main className="max-w-2xl mx-auto p-5">
        <h1 className="font-display text-2xl font-bold text-forest">Admin panel</h1>
        <p className="text-ink/60 text-sm mt-1">Signed in as {profile?.full_name}</p>
        <div className="mt-6 bg-white rounded-2xl border border-black/5 p-5 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
          <p className="text-sm text-ink/70">
            Driver approvals, bookings, and the settings control room are built in Phase 6.
            You reached this page because your profile has <b>is_admin = true</b>.
          </p>
          <Link to="/home" className="inline-block mt-4 text-sm font-semibold text-forest">← Back to home</Link>
        </div>
      </main>
    </div>
  )
}
