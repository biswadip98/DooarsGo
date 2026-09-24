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

export default function Signup() {
  const { role } = useParams()
  const isDriver = role === 'driver'
  const navigate = useNavigate()

  const auth = useAuth() || {}
  const { signUp } = auth
  const user = auth.user ?? auth.session?.user ?? null
  const profile = auth.profile ?? null
  const loading = auth.loading ?? false
  const signOut = auth.signOut ?? auth.logout ?? null

  const displayName =
    profile?.full_name || profile?.fullName ||
    user?.user_metadata?.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '') || 'there'

  const [form, setForm] = useState({ fullName: '', phone: '', gender: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const afterSignup = isDriver ? '/driver/register' : '/home'
  const emoji = isDriver ? '🧑‍✈️' : '🛺'

  async function handleSignup() {
    setError(''); setInfo('')
    if (!form.fullName || !form.phone || !form.email || !form.password) { setError('Please fill in every required field.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    const { data, error } = await signUp({
      email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), phone: form.phone.trim(), gender: form.gender || null,
    })
    setBusy(false)
    if (error) { setError(error.message || 'Could not create your account.'); return }
    if (data?.session) navigate(afterSignup)
    else setInfo(isDriver ? 'Account created. Please confirm your email, then log in to finish driver registration.' : 'Account created. Please confirm your email, then log in.')
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
              <h1 className="font-display text-xl font-bold text-forest">You're already logged in as {displayName}</h1>
              <p className="text-ink/60 text-sm mt-1">No need to create another account.</p>
              <button onClick={() => navigate(isDriver ? '/driver/register' : '/home')} className="mt-5 w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-colors hover:bg-leaf">
                {isDriver ? 'Continue driver registration' : 'Go to your dashboard'}
              </button>
              <button onClick={handleLogout} className="mt-2 w-full rounded-xl border border-mist py-3 text-sm font-semibold text-ink/70 hover:bg-mist/40">Log out</button>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-leafbright/15 text-3xl">{emoji}</div>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${isDriver ? 'bg-forest text-white' : 'bg-leafbright/15 text-forest'}`}>{isDriver ? 'Driver' : 'Rider'}</span>
                <h1 className="font-display text-2xl font-bold text-forest mt-2">{isDriver ? 'Become a driver' : 'Create your account'}</h1>
                <p className="text-ink/60 text-sm mt-1">{isDriver ? 'Create your account, then complete a quick KYC' : 'Join DooarsGo in a few seconds'}</p>
              </div>

              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_10px_30px_rgba(15,90,46,0.12)]">
                {error && <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
                {info && <div className="mb-4 text-xs font-medium text-forest bg-leafbright/15 border border-leafbright/30 rounded-lg px-3 py-2">{info}</div>}

                <label className="block text-xs font-semibold text-ink/60 mb-1">Full name</label>
                <input value={form.fullName} onChange={set('fullName')} type="text" placeholder="Rina Sarkar"
                  className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

                <label className="block text-xs font-semibold text-ink/60 mb-1">Phone</label>
                <input value={form.phone} onChange={set('phone')} type="tel" placeholder="98xxxxxxxx"
                  className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

                <label className="block text-xs font-semibold text-ink/60 mb-1">Gender <span className="font-normal text-ink/40">(optional)</span></label>
                <select value={form.gender} onChange={set('gender')}
                  className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright">
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
                <input value={form.email} onChange={set('email')} type="email" placeholder="you@example.com"
                  className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

                <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
                <input value={form.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && handleSignup()} type="password" placeholder="At least 8 characters"
                  className="w-full mb-5 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

                <button onClick={handleSignup} disabled={busy}
                  className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-transform hover:bg-leaf active:scale-[.98] disabled:opacity-60">
                  {busy ? 'Creating...' : isDriver ? 'Create driver account' : 'Create account'}
                </button>

                <p className="text-center text-xs text-ink/50 mt-4">
                  Already have an account? <Link to={isDriver ? '/login/driver' : '/login'} className="text-forest font-semibold">Login</Link>
                </p>
                <p className="text-center text-xs text-ink/40 mt-2">
                  {isDriver
                    ? <Link to="/signup" className="font-semibold hover:underline">Sign up as a rider instead</Link>
                    : <Link to="/signup/driver" className="font-semibold hover:underline">Sign up as a driver instead</Link>}
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </PageBackground>
  )
}
