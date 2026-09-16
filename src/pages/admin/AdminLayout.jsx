import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/approvals', label: 'Approvals', icon: '🪪' },
  { to: '/admin/bookings', label: 'Bookings', icon: '🧾' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { to: '/admin/payouts', label: 'Payouts', icon: '💰' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-forest text-white md:w-56 md:min-h-screen">
        <div className="p-4 border-b border-white/10 font-display font-extrabold">DooarsGo Admin</div>
        <nav className="flex md:block overflow-x-auto">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-white/15 md:border-l-4 border-leafbright text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`
              }
            >
              <span>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="px-5 py-3 border-b border-black/5 bg-white flex items-center justify-between">
          <div className="text-sm text-ink/60">
            Signed in as <b className="text-forest">{profile?.full_name}</b>
          </div>
          <button
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            className="text-sm font-semibold text-forest"
          >
            Log out
          </button>
        </header>
        <div className="p-5 max-w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
