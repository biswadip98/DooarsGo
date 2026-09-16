import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import Brand from '../components/Brand'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogin() {
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) {
      setError(error.message || 'Could not log in. Check your email and password.')
      return
    }
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur">
        <Brand />
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-forest">Welcome back</h1>
            <p className="text-ink/60 text-sm mt-1">Login to book your ride</p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_10px_30px_rgba(15,90,46,0.10)]">
            {error && (
              <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full mb-4 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright"
            />

            <label className="block text-xs font-semibold text-ink/60 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              type="password"
              placeholder="••••••••"
              className="w-full mb-2 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright"
            />

            <div className="text-right mb-4">
              <Link to="/forgot" className="text-xs text-forest font-semibold">Forgot password?</Link>
            </div>

            <button
              onClick={handleLogin}
              disabled={busy}
              className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-colors hover:bg-leaf disabled:opacity-60"
            >
              {busy ? 'Logging in…' : 'Login'}
            </button>

            <p className="text-center text-xs text-ink/50 mt-4">
              New here?{' '}
              <Link to="/signup" className="text-forest font-semibold">Create an account</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-ink/40 py-4">
        DooarsGo · Kamakhyaguri · web app
      </footer>
    </div>
  )
}
