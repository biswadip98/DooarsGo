import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'
import heroCar from '../../assets/hero-car.jpg'
import heroToto from '../../assets/hero-toto.jpg'
import heroBike from '../../assets/hero-bike.jpg'

const SUPPORT_PHONE = '9434141673'
const WHATSAPP = '919239514925'

const RIDES = [
  { img: heroToto, label: 'Toto', note: 'From ₹20' },
  { img: heroBike, label: 'Bike', note: 'From ₹40' },
  { img: heroCar, label: 'Car / Cab', note: 'From ₹90' },
]

const STEPS = [
  { icon: '📍', title: 'Set pickup & drop', body: 'Tap the map or search your spot.' },
  { icon: '💰', title: 'See the fare upfront', body: 'Know the price before you book.' },
  { icon: '🛺', title: 'Ride & pay', body: 'Cash or UPI — driver keeps the full fare.' },
]

export default function Home() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  const Badge = ({ children }) => (
    <span className="text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-full px-3 py-1">
      {children}
    </span>
  )

  return (
    <div className="min-h-screen">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <Brand />
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-sm font-semibold text-forest">Profile</Link>
          <button onClick={handleLogout} className="text-sm font-semibold text-forest">Log out</button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 pb-10">
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

        <div className="mt-3 grid gap-2">
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

        <div className="mt-8">
          <div className="text-sm font-bold text-forest mb-2">Choose your ride</div>
          <div className="grid grid-cols-3 gap-3">
            {RIDES.map((r) => (
              <Link key={r.label} to="/book" className="group rounded-2xl border border-mist bg-white overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-24 bg-[#ecfdf5] flex items-center justify-center overflow-hidden">
                  <img src={r.img} alt={r.label} className="max-h-full max-w-full object-contain p-1 group-hover:scale-105 transition-transform" />
                </div>
                <div className="px-2 py-2 text-center">
                  <div className="text-xs font-bold text-slate-900">{r.label}</div>
                  <div className="text-[10px] text-forest font-semibold">{r.note}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="text-sm font-bold text-forest mb-2">How it works</div>
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-mist bg-white p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leafbright/15 text-lg">{s.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                  <div className="text-xs text-ink/60">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#facc15] to-[#eab308] px-4 py-4 text-center">
          <div className="text-lg font-extrabold text-[#14532d]">50% off your first ride 🎉</div>
          <div className="text-xs font-semibold text-[#14532d]/80 mt-0.5">Serving Kamakhyaguri, Chepani, Barobisha & nearby</div>
        </div>

        <div className="mt-6 rounded-2xl border border-mist bg-white p-4 text-center">
          <div className="text-sm font-bold text-forest">Need help?</div>
          <p className="text-xs text-ink/60 mt-1">We're here for you anytime.</p>
          <div className="mt-3 flex gap-2">
            <a href={`tel:${SUPPORT_PHONE}`} className="flex-1 rounded-xl bg-forest text-white text-sm font-semibold py-2.5 hover:bg-leaf">Call us</a>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-leafbright/40 text-forest text-sm font-semibold py-2.5 hover:bg-leafbright/10">WhatsApp</a>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink/40">DooarsGo · Your Local Ride, Anytime.</p>
      </main>
    </div>
  )
}
