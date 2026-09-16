import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Brand from '../components/Brand'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleSignup() {
    setError('')
    setInfo('')
    if (!form.fullName || !form.phone || !form.email || !form.password) {
      setError('Please fill in every field.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    const { data, error } = await signUp({
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
    })
    setBusy(false)
    if (error) {
      setError(error.message || 'Could not create your account.')
      return
    }
    if (data?.session) {
      navigate('/home')
    } else {
      // Happens only if email confirmation is still ON in Supabase.
      setInfo('Account created. Please confirm your email, then log in.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur">
        <Brand />
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-forest">Create your account</h1>
            <p className="text-ink/60 text-sm mt-1">Join DooarsGo in a few seconds</p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_10px_30px_rgba(15,90,46,0.10)]">
            {error && (
              <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 text-xs font-medium text-forest bg-leafbright/15 border border-leafbright/30 rounded-lg px-3 py-2">
                {info}
              </div>
            )}

            <label className="block text-xs font-semibold text-ink/60 mb-1">Full name</label>
            <input value={form.fullName} onChange={set('fullName')} type="text" placeholder="Rina Sarkar"
              className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

            <label className="block text-xs font-semibold text-ink/60 mb-1">Phone</label>
            <input value={form.phone} onChange={set('phone')} type="tel" placeholder="98xxxxxxxx"
              className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

            <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
            <input value={form.email} onChange={set('email')} type="email" placeholder="you@example.com"
              className="w-full mb-3 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

            <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
            <input value={form.password} onChange={set('password')} type="password" placeholder="At least 8 characters"
              className="w-full mb-5 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />

            <button onClick={handleSignup} disabled={busy}
              className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-colors hover:bg-leaf disabled:opacity-60">
              {busy ? 'Creating…' : 'Create account'}
            </button>

            <p className="text-center text-xs text-ink/50 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-forest font-semibold">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
