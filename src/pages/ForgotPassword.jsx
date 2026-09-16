import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Brand from '../components/Brand'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleReset() {
    setError('')
    if (!email) {
      setError('Please enter your email.')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/login',
    })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur">
        <Brand />
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-forest">Reset password</h1>
            <p className="text-ink/60 text-sm mt-1">We'll email you a reset link</p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_10px_30px_rgba(15,90,46,0.10)]">
            {sent ? (
              <p className="text-sm text-forest">
                If an account exists for that email, a reset link is on its way. (Email delivery
                needs an email service set up on Supabase — we'll do that later.)
              </p>
            ) : (
              <>
                {error && (
                  <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}
                <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                  className="w-full mb-5 rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright" />
                <button onClick={handleReset} disabled={busy}
                  className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-colors hover:bg-leaf disabled:opacity-60">
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </>
            )}
            <p className="text-center text-xs text-ink/50 mt-4">
              <Link to="/login" className="text-forest font-semibold">Back to login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
