import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import PageBackground from '../components/PageBackground'
import logoFull from '../assets/dooarsgo-logo-full.png'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Arriving from the reset email puts us in recovery mode.
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) setMode('reset')
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function sendLink() {
    setError(''); setMsg('')
    if (!email.trim()) { setError('Enter your email address.'); return }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/forgot',
    })
    setBusy(false)
    if (error) setError(error.message)
    else setMsg("If an account exists for that email, we've sent a reset link. Open it on this device to set a new password.")
  }

  async function setNewPassword() {
    setError(''); setMsg('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(error.message)
    else { setMsg('Password updated! Redirecting you to login…'); setTimeout(() => navigate('/login'), 1500) }
  }

  const inputCls = 'w-full rounded-xl border border-mist bg-mist/40 px-3 py-3 text-sm outline-none focus:border-leafbright'

  return (
    <PageBackground>
      <style>{`@keyframes dg-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.dg-up{animation:dg-up .5s ease-out both}`}</style>
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <Link to="/" className="flex items-center"><img src={logoFull} alt="DooarsGo" className="h-8 w-auto" /></Link>
        <span className="w-12" />
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm dg-up">
          <div className="text-center mb-6">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-leafbright/15 text-3xl">🔑</div>
            <h1 className="font-display text-2xl font-bold text-forest">{mode === 'reset' ? 'Set a new password' : 'Forgot password?'}</h1>
            <p className="text-ink/60 text-sm mt-1">
              {mode === 'reset' ? 'Choose a new password for your account.' : "Enter your email and we'll send a reset link."}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-[0_10px_30px_rgba(15,90,46,0.12)]">
            {error && <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
            {msg && <div className="mb-4 text-xs font-medium text-forest bg-leafbright/15 border border-leafbright/30 rounded-lg px-3 py-2">{msg}</div>}

            {mode === 'request' ? (
              <>
                <label className="block text-xs font-semibold text-ink/60 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendLink()} type="email" placeholder="you@example.com" className={`${inputCls} mb-4`} />
                <button onClick={sendLink} disabled={busy} className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-transform hover:bg-leaf active:scale-[.98] disabled:opacity-60">
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </>
            ) : (
              <>
                <label className="block text-xs font-semibold text-ink/60 mb-1">New password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setNewPassword()} type="password" placeholder="At least 8 characters" className={`${inputCls} mb-4`} />
                <button onClick={setNewPassword} disabled={busy} className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-transform hover:bg-leaf active:scale-[.98] disabled:opacity-60">
                  {busy ? 'Saving…' : 'Update password'}
                </button>
              </>
            )}

            <p className="text-center text-xs text-ink/50 mt-4">
              Remembered it? <Link to="/login" className="text-forest font-semibold">Back to login</Link>
            </p>
          </div>
        </div>
      </main>
    </PageBackground>
  )
}
