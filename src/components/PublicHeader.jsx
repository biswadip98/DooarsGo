import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import logoFull from '../assets/dooarsgo-logo-full.png'

const CHEVRON = 'M6 9l6 6 6-6'

function useDismiss(open, onClose) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  return ref
}

function Dropdown({ label, primary = false, items, onNavigate }) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const base = 'inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold transition-colors'
  const look = primary
    ? 'bg-[#15803d] text-white hover:bg-[#14532d]'
    : 'border-2 border-[#15803d] text-[#15803d] hover:bg-[#ecfdf5]'
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className={`${base} ${look}`}>
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true"><path d={CHEVRON} /></svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {items.map((it) => (
            <button key={it.label} role="menuitem" type="button" onClick={() => { setOpen(false); onNavigate(it.to) }}
              className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-[#ecfdf5] hover:text-[#14532d]">
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PublicHeader() {
  const navigate = useNavigate()
  const auth = useAuth() || {}
  const user = auth.user ?? auth.session?.user ?? null
  const profile = auth.profile ?? null
  const loading = auth.loading ?? false
  const signOut = auth.signOut ?? auth.logout ?? null

  const displayName =
    profile?.full_name || profile?.fullName ||
    user?.user_metadata?.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '') || 'Account'

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const acctRef = useDismiss(acctOpen, () => setAcctOpen(false))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (to) => { setMobileOpen(false); navigate(to) }
  const bookTo = user ? '/book' : '/login'

  async function handleLogout() {
    setAcctOpen(false); setMobileOpen(false)
    try { if (signOut) await signOut() } finally { navigate('/') }
  }

  const loginItems = [
    { label: 'Login as User', to: '/login' },
    { label: 'Login as Driver', to: '/login/driver' },
  ]
  const signupItems = [
    { label: 'Sign up as User', to: '/signup' },
    { label: 'Sign up as Driver', to: '/signup/driver' },
  ]

  return (
    <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur transition-shadow ${scrolled ? 'shadow-md' : 'border-b border-slate-100'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="DooarsGo home">
          <img src={logoFull} alt="DooarsGo" className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 md:flex">
          {loading ? (
            <span className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <>
              <Link to={bookTo} className="rounded-lg bg-[#facc15] px-4 py-2 text-sm font-bold text-[#14532d] transition-colors hover:bg-[#eab308]">Book Now</Link>
              <div className="relative" ref={acctRef}>
                <button type="button" onClick={() => setAcctOpen((o) => !o)} aria-haspopup="menu" aria-expanded={acctOpen}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-[#15803d] px-3 py-2 text-sm font-bold text-[#15803d] transition-colors hover:bg-[#ecfdf5]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#15803d] text-[11px] font-extrabold text-white">{displayName.charAt(0).toUpperCase()}</span>
                  <span className="max-w-[9rem] truncate">{displayName}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${acctOpen ? 'rotate-180' : ''}`} aria-hidden="true"><path d={CHEVRON} /></svg>
                </button>
                {acctOpen && (
                  <div role="menu" className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    {profile?.is_admin && (
                      <button role="menuitem" type="button" onClick={() => go('/admin')} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-[#ecfdf5] hover:text-[#14532d]">Admin panel</button>
                    )}
                    <button role="menuitem" type="button" onClick={() => go('/home')} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-[#ecfdf5] hover:text-[#14532d]">Home</button>
                    <button role="menuitem" type="button" onClick={() => go('/profile')} className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-[#ecfdf5] hover:text-[#14532d]">Profile</button>
                    <button role="menuitem" type="button" onClick={handleLogout} className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg bg-[#facc15] px-4 py-2 text-sm font-bold text-[#14532d] transition-colors hover:bg-[#eab308]">Book Now</Link>
              <Dropdown label="Login" items={loginItems} onNavigate={go} />
              <Dropdown label="Signup" primary items={signupItems} onNavigate={go} />
              <Link to="/login/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-[#14532d] hover:bg-[#ecfdf5]">Admin</Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" aria-expanded={mobileOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#14532d] md:hidden">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && !loading && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#15803d] text-sm font-extrabold text-white">{displayName.charAt(0).toUpperCase()}</span>
                <span className="font-bold text-[#14532d]">{displayName}</span>
              </div>
              <button onClick={() => go(bookTo)} className="rounded-lg bg-[#facc15] px-4 py-2.5 text-center text-sm font-bold text-[#14532d]">Book Now</button>
              {profile?.is_admin && (
                <button onClick={() => go('/admin')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700">Admin panel</button>
              )}
              <button onClick={() => go('/home')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700">Home</button>
              <button onClick={() => go('/profile')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700">Profile</button>
              <button onClick={handleLogout} className="rounded-lg border border-red-200 px-4 py-2.5 text-left text-sm font-semibold text-red-600">Log out</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button onClick={() => go('/login')} className="rounded-lg bg-[#facc15] px-4 py-2.5 text-center text-sm font-bold text-[#14532d]">Book Now</button>
              <p className="px-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Login</p>
              <button onClick={() => go('/login')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700">Login as User</button>
              <button onClick={() => go('/login/driver')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700">Login as Driver</button>
              <p className="px-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sign up</p>
              <button onClick={() => go('/signup')} className="rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700">Sign up as User</button>
              <button onClick={() => go('/signup/driver')} className="rounded-lg bg-[#15803d] px-4 py-2.5 text-left text-sm font-bold text-white">Sign up as Driver</button>
              <button onClick={() => go('/login/admin')} className="mt-1 rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-[#14532d]">Login as Admin</button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
