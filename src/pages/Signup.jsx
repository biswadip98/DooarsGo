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

// --- Validation helpers (India, production-grade) ---------------------------
// Keep only digits, drop a leading 91 (country code) or 0 (trunk), keep last 10.
function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '')     // digits only
  if (d.length > 10 && d.startsWith('91')) d = d.slice(2)   // strip +91 / 91
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1)  // strip leading 0
  if (d.length > 10) d = d.slice(-10)              // keep last 10 as a fallback
  return d
}
// Valid Indian mobile: exactly 10 digits, starts 6-9.
const isValidIndianMobile = (d) => /^[6-9][0-9]{9}$/.test(d)
// Reject obvious junk: all-same-digit, or a simple 1234567890 sequence.
const isJunkPhone = (d) => /^(\d)\1{9}$/.test(d) || d === '1234567890' || d === '0123456789'
// Basic but real email format check.
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim())
// Name: at least 2 letters, allow spaces/dots/hyphens.
const isValidName = (n) => {
  const t = String(n || '').trim()
  return t.length >= 2 && /[A-Za-z\u0980-\u09FF]{2,}/.test(t)  // Latin or Bengali letters
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
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Phone field: allow only digits as the user types, cap at 10.
  const onPhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, phone: digits }))
  }

  const afterSignup = isDriver ? '/driver/register' : '/home'
  const emoji = isDriver ? '🧑‍✈️' : '🛺'

  async function handleSignup() {
    setError(''); setInfo('')

    const name = form.fullName.trim()
    const email = form.email.trim()
    const phone = normalizePhone(form.phone)

    // --- Validation gate (every rider & driver) ---
    if (!name || !form.phone || !email || !form.password) {
      setError('Please fill in every required field.'); return
    }
    if (!isValidName(name)) {
      setError('Please enter your real full name.'); return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address (example: name@gmail.com).'); return
    }
    if (!isValidIndianMobile(phone) || isJunkPhone(phone)) {
      setError('Enter a valid 10-digit Indian mobile number (starting 6, 7, 8 or 9). We need a real number so your driver/rider can reach you.'); return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return
    }
    if (!agreedTerms) {
      setError('Please accept the Terms & Privacy Policy to continue.'); return
    }

    setBusy(true)
    const { data, error } = await signUp({
      email, password: form.password, fullName: name, phone, gender: form.gender || null,
    })
    setBusy(false)
    if (error) {
      const m = (error.message || '').toLowerCase()
      if (m.includes('phone') && (m.includes('unique') || m.includes('duplicate'))) {
        setError('This mobile number is already registered. Please log in, or use a different number.')
      } else if (m.includes('already') || m.includes('registered')) {
        setError('An account with this email already exists. Please log in instead.')
      } else {
        setError(error.message || 'Could not create your account.')
      }
      return
    }
    if (data?.session) navigate(afterSignup)
    else setInfo(isDriver
  ? 'Almost done! We sent a confirmation link to your email. Open it to activate your account, then log in to finish driver registration. (If you typed the wrong email, nothing happens — just sign up again with the correct one.)'
  : 'Almost done! We sent a confirmation link to your email. Open it to activate your account, then log in. (If you typed the wrong email, nothing happens — just sign up again with the correct one.)')
  }

  async function handleLogout() { try { if (signOut) await signOut() } finally {} }

  const inputCls = 'w-full rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright'

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
                <input value={form.fullName} onChange={set('fullName')} type="text" maxLength={60} placeholder="Rina Sarkar"
                  className={`${inputCls} mb-3`} />

                <label className="block text-xs font-semibold text-ink/60 mb-1">Mobile number</label>
                <div className="mb-1 flex items-stretch gap-2">
                  <span className="flex items-center rounded-xl border border-mist bg-mist/60 px-3 text-sm font-semibold text-ink/70">+91</span>
                  <input value={form.phone} onChange={onPhoneChange} type="tel" inputMode="numeric" maxLength={10}
                    autoComplete="tel-national" placeholder="9876543210" className={`${inputCls} flex-1`} />
                </div>
                <p className="mb-3 text-[11px] text-ink/40">10-digit number your driver/rider will call. No +91, no spaces.</p>

                <label className="block text-xs font-semibold text-ink/60 mb-1">Gender <span className="font-normal text-ink/40">(optional)</span></label>
                <select value={form.gender} onChange={set('gender')} className={`${inputCls} mb-3`}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
                <input value={form.email} onChange={set('email')} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com"
                  className={`${inputCls} mb-3`} />

                <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
                <div className="relative mb-5">
                  <input value={form.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                    type={showPass ? 'text' : 'password'} placeholder="At least 8 characters" className={`${inputCls} pr-16`} />
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-forest hover:bg-mist/60">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>

                <label className="mb-4 flex items-start gap-2 text-xs text-ink/60 cursor-pointer">
                  <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#15803d]" />
                  <span>I agree to DooarsGo's <Link to="/terms" className="font-semibold text-forest underline">Terms</Link> and <Link to="/privacy" className="font-semibold text-forest underline">Privacy Policy</Link>.</span>
                </label>

                <button onClick={handleSignup} disabled={busy || !agreedTerms}
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
