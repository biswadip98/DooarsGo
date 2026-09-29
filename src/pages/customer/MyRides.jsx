import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import PageBackground from '../../components/PageBackground'
import Brand from '../../components/Brand'

const STATUS_STYLE = {
  COMPLETED: 'bg-leafbright/15 text-forest',
  CANCELLED_BY_CUSTOMER: 'bg-red-50 text-red-600',
  CANCELLED_BY_DRIVER: 'bg-red-50 text-red-600',
  NO_DRIVER_FOUND: 'bg-amber-50 text-amber-700',
  EXPIRED: 'bg-amber-50 text-amber-700',
}
const emojiFor = (v) => (v === 'car' ? '🚗' : v === 'bike' ? '🏍️' : '🛺')
const pretty = (s) => (s || '').replace(/_/g, ' ').toLowerCase()

export default function MyRides() {
  const navigate = useNavigate()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('my_rides').then(({ data }) => {
      setRides(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <PageBackground>
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <Brand size={32} />
        <span className="w-12" />
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-5">
        <h1 className="font-display text-2xl font-extrabold text-forest mb-4">My rides</h1>

        {loading ? (
          <p className="text-sm text-ink/50">Loading…</p>
        ) : rides.length === 0 ? (
          <div className="rounded-2xl border border-mist bg-white p-8 text-center">
            <div className="text-5xl mb-2">🛺</div>
            <p className="text-sm text-ink/60">No rides yet. Your trips will show up here.</p>
            <button onClick={() => navigate('/book')} className="mt-4 rounded-xl bg-forest text-white text-sm font-semibold px-5 py-2.5 hover:bg-leaf">Book a ride</button>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((r) => (
              <button key={r.id} onClick={() => navigate('/ride/' + r.id)}
                className="w-full text-left bg-white rounded-2xl border border-mist p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 capitalize">
                    <span className="text-lg">{emojiFor(r.vehicle_type)}</span>{r.vehicle_type}
                    {r.role === 'driver' && <span className="text-[10px] font-bold uppercase text-forest bg-leafbright/15 rounded-full px-2 py-0.5">Drove</span>}
                  </span>
                  <b className="text-forest">₹{r.fare}</b>
                </div>
                <div className="mt-2 text-xs text-ink/60 space-y-1">
                  <div className="flex gap-2"><span>🟢</span><span className="truncate">{r.pickup_address}</span></div>
                  <div className="flex gap-2"><span>🔴</span><span className="truncate">{r.drop_address}</span></div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 capitalize ${STATUS_STYLE[r.status] || 'bg-mist text-ink/60'}`}>{pretty(r.status)}</span>
                  <span className="text-[11px] text-ink/40">{new Date(r.created_at).toLocaleDateString()} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </PageBackground>
  )
}
