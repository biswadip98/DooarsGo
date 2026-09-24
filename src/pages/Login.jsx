import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import PageBackground from '../components/PageBackground'
import logoFull from '../assets/dooarsgo-logo-full.png'

function BackButton({ to = '/' }) {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(to)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      Back
    </button>
  )
}

export default function Login() {
  const { role } = useParams()
  const isDriver = role === 'driver'
  const isAdmin = role === 'admin'
  const navigate = useNavigate()

  const auth = useAuth() || {}
  const { signIn } = auth
  const user = auth.user ?? auth.session?.user ?? null
  const profile = auth.profile ?? null
  const loading = auth.loading ?? false
  const signOut = auth.signOut ?? auth.logout ?? null

  const displayName =
    profile?.full_name || profile?.fullName ||
    user?.user_metadata?.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '') || 'there'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const homeFor = isAdmin ? '/admin' : isDriver ? '/driver' : '/home'
  const badge = isAdmin ? 'Admin' : isDriver ? 'Driver' : 'Rider'
  const emoji = isAdmin ? '🛡️' : isDriver ? '🧑‍✈️' : '🛺'
  const heading = isAdmin ? 'Admin login' : isDriver ? 'Driver login' : 'Welcome back'
  const subtext = isAdmin ? 'Restricted access — authorized staff only.'
    : isDriver ? 'Log in to go online and accept rides' : 'Login to book your ride'

  async function handleLogin() {
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) { setError(error.message || 'Could not log in. Check your email and password.'); return }
    navigate(homeFor)
  }

  async function handleLogout() { try { if (signOut) await signOut() } finally {} }

  return (
    <PageBackground>
      <style>{`@keyframes dg-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.dg-up{animation:dg-up .5s ease-out both}`}</style>
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <BackButton to="/" />
        <Link to="/" className="flex items-center" aria-label="DooarsGo home">
          <img src={logoFull} alt="DooarsGo" className="h-8 w-auto" />
        </Link>
        <span className="w-12" aria-hidden="true" />
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm dg-up">
          {!loading && user ? (
            <div className="bg-white rounded-2xl border border-black/5 p-6 text-center shadow-[0_10px_30px_rgba(15,90,46,0.12)]">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-xl font-extrabold text-white">{displayName.charAt(0).toUpperCase()}</div>
              <h1 className="font-display text-xl font-bold text-forest">You're logged in as {displayName}</h1>
              <p className="text-ink/60 text-sm mt-1">You don't need to log in again.</p>
              <button onClick={() => navigate(homeFor)} className="mt-5 w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-colors hover:bg-leaf">
                {isAdmin ? 'Go to admin panel' : isDriver ? 'Go to driver dashboard' : 'Continue to booking'}
              </button>
              <button onClick={handleLogout} className="mt-2 w-full rounded-xl border border-mist py-3 text-sm font-semibold text-ink/70 hover:bg-mist/40">Log out</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-leafbright/15 text-3xl">{emoji}</div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${isAdmin ? 'bg-[#14532d] text-white' : isDriver ? 'bg-forest text-white' : 'bg-leafbright/15 text-forest'}`}>{badge}</span>
                <h1 className="font-display text-2xl font-bold text-forest mt-2">{heading}</h1>
                <p className="text-ink/60 text-sm mt-1">{subtext}</p>
              </div>

              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_10px_30px_rgba(15,90,46,0.12)]">
                {error && <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

                <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                  className="w-full mb-4 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

                <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} type="password" placeholder="********"
                  className="w-full mb-2 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

                <div className="text-right mb-4"><Link to="/forgot" className="text-xs text-forest font-semibold">Forgot password?</Link></div>

                <button onClick={handleLogin} disabled={busy}
                  className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-transform hover:bg-leaf active:scale-[.98] disabled:opacity-60">
                  {busy ? 'Logging in...' : isAdmin ? 'Login as admin' : isDriver ? 'Login as driver' : 'Login'}
                </button>

                {!isAdmin && (
                  <>
                    <p className="text-center text-xs text-ink/50 mt-4">
                      New here?{' '}
                      <Link to={isDriver ? '/signup/driver' : '/signup'} className="text-forest font-semibold">{isDriver ? 'Create a driver account' : 'Create an account'}</Link>
                    </p>
                    <p className="text-center text-xs text-ink/40 mt-2">
                      {isDriver
                        ? <Link to="/login" className="font-semibold hover:underline">Login as a rider instead</Link>
                        : <Link to="/login/driver" className="font-semibold hover:underline">Login as a driver instead</Link>}
                    </p>
                  </>
                )}
                {isAdmin && <p className="text-center text-xs text-ink/40 mt-4">Only authorized admin accounts can access the panel.</p>}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-ink/40 py-4">DooarsGo &middot; Kamakhyaguri &middot; web app</footer>
    </PageBackground>
  )
}
