import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import logoMark from '../../assets/dooarsgo-logo-mark.png'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/approvals', label: 'Approvals', icon: '🪪' },
  { to: '/admin/bookings', label: 'Bookings', icon: '🧾' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { to: '/admin/payouts', label: 'Payouts', icon: '💰' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen md:flex bg-[#f4f8f4]">
      <aside className="bg-gradient-to-b from-[#15803d] to-[#14532d] text-white md:w-60 md:min-h-screen">
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <img src={logoMark} alt="" className="h-8 w-8 object-contain rounded" />
          <span className="font-display font-extrabold">DooarsGo Admin</span>
        </div>
        <nav className="flex md:block overflow-x-auto p-2 gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
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
            onClick={async () => { await signOut(); navigate('/login') }}
            className="text-sm font-semibold text-forest hover:underline"
          >
            Log out
          </button>
        </header>
        <div className="p-5 max-w-5xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
