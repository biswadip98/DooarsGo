import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'

export default function Home() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const Badge = ({ children }) => (
    <span className="text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-full px-3 py-1">
      {children}
    </span>
  )

  return (
    <div className="min-h-screen">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <Brand />
        <button onClick={handleLogout} className="text-sm font-semibold text-forest">Log out</button>
      </header>

      <main className="max-w-md mx-auto p-5">
        <h1 className="font-display text-2xl font-bold text-forest">Hi {profile?.full_name || 'there'} 👋</h1>
        <p className="text-ink/60 text-sm mt-1">{user?.email}</p>

        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge>Customer</Badge>
          {profile?.is_driver && <Badge>Driver</Badge>}
          {profile?.is_admin && <Badge>Admin</Badge>}
        </div>

        <Link
          to="/book"
          className="mt-6 block rounded-2xl bg-forest text-white text-center font-semibold py-4 text-base hover:bg-leaf transition-colors shadow-[0_10px_24px_rgba(15,90,46,0.20)]"
        >
          ＋ Book a ride
        </Link>

        <div className="mt-4 grid gap-2">
          {profile?.is_driver ? (
            <Link to="/driver" className="rounded-xl border border-leafbright/40 text-forest font-semibold text-sm text-center py-3 hover:bg-leafbright/10">
              Go to Driver area →
            </Link>
          ) : (
            <Link to="/driver/register" className="rounded-xl border border-leafbright/40 text-forest font-semibold text-sm text-center py-3 hover:bg-leafbright/10">
              Become a driver →
            </Link>
          )}
          {profile?.is_admin && (
            <Link to="/admin" className="rounded-xl bg-white border border-black/5 text-forest font-semibold text-sm text-center py-3 hover:bg-mist">
              Go to Admin panel →
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
