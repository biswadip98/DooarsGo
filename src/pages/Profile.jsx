import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import PageBackground from '../components/PageBackground'
import Brand from '../components/Brand'

const GENDER_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

export default function Profile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [email, setEmail] = useState('')            // from the session, not profiles
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', gender: '' })

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) { navigate('/login'); return }
      setEmail(user.email || '')
      const { data: row, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, gender, avatar_url, is_driver, driver_status, rating_avg, rating_count, created_at')
        .eq('id', user.id)
        .single()
      if (!active) return
      if (fetchError) {
        setError('Could not load your profile. Refresh and try again.')
      } else {
        setProfile(row)
        setForm({ full_name: row.full_name || '', phone: row.phone || '', gender: row.gender || '' })
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [navigate])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone, gender: form.gender || null })
      .eq('id', profile.id)
    setSaving(false)
    if (updateError) setError('Could not save changes. Try again.')
    else {
      setSaved(true)
      setProfile((p) => ({ ...p, ...form }))
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const initial = (form.full_name || 'U').charAt(0).toUpperCase()
  const inputCls = 'mt-1 w-full rounded-xl border border-mist bg-mist/40 px-3 py-2.5 text-sm outline-none focus:border-leafbright'

  return (
    <PageBackground>
      <style>{`@keyframes dg-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.dg-up{animation:dg-up .5s ease-out both}`}</style>
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <Brand size={32} />
        <span className="w-12" />
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-5">
        <h1 className="font-display text-2xl font-extrabold text-forest mb-4">My profile</h1>

        {loading ? (
          <p className="text-sm text-ink/50">Loading your details…</p>
        ) : (
          <>
            {/* Identity card */}
            <div className="dg-up rounded-2xl border border-black/5 bg-white p-5 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-leafbright/30" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-2xl font-extrabold text-white ring-4 ring-leafbright/30">{initial}</div>
                )}
                <div>
                  <p className="text-base font-bold text-slate-900">{form.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-ink/50">{email}</p>
                  <span className="mt-1 inline-block text-xs font-semibold text-forest">
                    {profile?.is_driver ? `Driver · ${profile?.driver_status || 'status unknown'}` : 'Customer'}
                  </span>
                </div>
              </div>
              {profile?.is_driver && profile?.rating_count > 0 && (
                <p className="mt-3 text-xs text-ink/50">Rating: {Number(profile.rating_avg).toFixed(1)} ★ ({profile.rating_count} rides)</p>
              )}
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="dg-up mt-5 space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink/50">Full name</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink/50">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink/50">Gender <span className="font-normal normal-case text-ink/40">(optional)</span></label>
                <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className={inputCls}>
                  {GENDER_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-ink/50">Email</label>
                <input type="email" value={email} disabled className="mt-1 w-full rounded-xl border border-mist bg-slate-50 px-3 py-2.5 text-sm text-ink/50" />
                <p className="mt-1 text-xs text-ink/40">Email is tied to your login and can't be changed here.</p>
              </div>

              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              {saved && <p className="text-sm font-semibold text-forest">✓ Saved.</p>}

              <button type="submit" disabled={saving}
                className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm transition-transform hover:bg-leaf active:scale-[.98] disabled:opacity-60">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </>
        )}
      </main>
    </PageBackground>
  )
}
