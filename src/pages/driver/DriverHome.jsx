import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'

export default function DriverHome() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [verif, setVerif] = useState(null)
  const [online, setOnline] = useState(false)
  const [rides, setRides] = useState([])
  const [msg, setMsg] = useState('')
  const posRef = useRef(null)
  const timerRef = useRef(null)

  const status = profile?.driver_status || 'none'

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('driver_verifications')
        .select('vehicle_type,status,review_note')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setVerif(data)
    }
    load()
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [user.id])

  async function refreshRides() {
    const p = posRef.current
    if (!p || !verif?.vehicle_type) return
    const { data } = await supabase.rpc('open_rides_for_driver', {
      p_driver_lng: p.lng, p_driver_lat: p.lat, p_vehicle_type: verif.vehicle_type, p_max_radius_m: null,
    })
    setRides(data || [])
  }

  function tick() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      posRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      await supabase.rpc('upsert_driver_location', {
        p_lng: posRef.current.lng, p_lat: posRef.current.lat, p_vehicle_type: verif.vehicle_type, p_is_available: true,
      })
      refreshRides()
    })
  }

  async function goOnline() {
    if (!navigator.geolocation) { setMsg('Location is needed to go online.'); return }
    setOnline(true)
    tick()
    timerRef.current = setInterval(tick, 7000)
  }

  async function goOffline() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    await supabase.rpc('set_driver_offline')
    setOnline(false)
    setRides([])
  }

  async function accept(rideId) {
    const p = posRef.current
    const { data, error } = await supabase.rpc('accept_ride', {
      p_ride_id: rideId, p_driver_id: user.id, p_driver_lng: p?.lng ?? null, p_driver_lat: p?.lat ?? null,
    })
    if (error || !data || data.success === false || data.reason) {
      setMsg('That ride was just taken by someone else.')
      refreshRides()
      return
    }
    navigate('/driver/ride/' + rideId)
  }

  async function handleLogout() {
    if (online) await goOffline()
    await signOut()
    navigate('/login')
  }

  const emoji = verif?.vehicle_type === 'car' ? '🚗' : verif?.vehicle_type === 'bike' ? '🏍️' : '🛺'

  if (status !== 'approved') {
    return (
      <Shell onLogout={handleLogout}>
        <h1 className="font-display text-2xl font-bold text-forest">Driver area</h1>
        {status === 'pending' && (
          <Card>
            <div className="text-5xl mb-2">⏳</div>
            <b className="text-forest">Under review</b>
            <p className="text-sm text-ink/60 mt-1">Our team is checking your documents. You'll be able to go online once approved.</p>
          </Card>
        )}
        {status === 'rejected' && (
          <Card>
            <div className="text-5xl mb-2">⚠️</div>
            <b className="text-red-600">Application not approved</b>
            <p className="text-sm text-ink/60 mt-1">{verif?.review_note || 'Please re-submit your details.'}</p>
            <Link to="/driver/register" className="inline-block mt-3 text-sm font-semibold text-forest">Re-submit →</Link>
          </Card>
        )}
        {status === 'none' && (
          <Card>
            <div className="text-5xl mb-2">🚗</div>
            <p className="text-sm text-ink/60">You haven't registered as a driver yet.</p>
            <Link to="/driver/register" className="inline-block mt-3 rounded-xl bg-forest text-white text-sm font-semibold px-4 py-2.5">Register as a driver</Link>
          </Card>
        )}
      </Shell>
    )
  }

  return (
    <Shell onLogout={handleLogout}>
      <style>{`
        @keyframes dg-up { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes dg-ping { 0% { transform: scale(.8); opacity:.6 } 100% { transform: scale(2.2); opacity:0 } }
        .dg-up { animation: dg-up .45s ease-out both }
      `}</style>

      {/* Status hero */}
      <div className={`dg-up rounded-2xl p-4 text-white shadow-[0_10px_30px_rgba(15,90,46,0.2)] ${online ? 'bg-gradient-to-br from-[#15803d] to-[#14532d]' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">Hi {profile?.full_name}</div>
            <div className="font-display text-2xl font-extrabold mt-0.5 flex items-center gap-2">
              {online && <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full rounded-full bg-white" style={{ animation: 'dg-ping 1.5s ease-out infinite' }} /><span className="relative inline-flex rounded-full h-3 w-3 bg-white" /></span>}
              {online ? "You're Online" : "You're Offline"}
            </div>
            <div className="text-xs opacity-80 mt-0.5 capitalize">{emoji} {verif?.vehicle_type} driver</div>
          </div>
          <button onClick={online ? goOffline : goOnline}
            className={`w-16 h-9 rounded-full relative transition-colors ${online ? 'bg-white/30' : 'bg-white/20'}`} aria-label="Toggle online">
            <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${online ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
        <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs">💚 You keep <b>100%</b> of every fare — no commission.</div>
      </div>

      {msg && <div className="dg-up mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{msg}</div>}

      {!online ? (
        <Card>
          <div className="text-4xl mb-2">🟢</div>
          <p className="text-sm text-ink/60">Flip the switch above to go online and start receiving nearby ride requests.</p>
        </Card>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <b className="text-sm text-ink/70">Nearby requests {rides.length > 0 && <span className="ml-1 rounded-full bg-leafbright text-white text-[10px] font-bold px-2 py-0.5">{rides.length}</span>}</b>
            <button onClick={refreshRides} className="text-xs font-semibold text-forest hover:underline">Refresh</button>
          </div>
          {rides.length === 0 ? (
            <div className="bg-white rounded-2xl border border-mist p-6 text-center">
              <div className="relative mx-auto mb-3 h-14 w-14">
                <span className="absolute inset-0 rounded-full bg-leafbright/30" style={{ animation: 'dg-ping 1.8s ease-out infinite' }} />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">📡</div>
              </div>
              <p className="text-sm text-ink/50">Waiting for ride requests near you…</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((r) => (
                <div key={r.ride_id} className="dg-up bg-white rounded-2xl border border-leafbright/40 p-3 shadow-[0_6px_18px_rgba(15,90,46,0.08)]">
                  <div className="flex justify-between items-start">
                    <div className="text-xs">
                      <div className="text-forest font-bold">📍 {Math.round(r.distance_to_pickup_m)} m to pickup · {r.trip_km} km trip</div>
                      <div className="mt-0.5 text-ink/60">👥 {r.passenger_count} passenger{Number(r.passenger_count) > 1 ? 's' : ''}</div>
                      <div className="mt-1 text-ink/70">🟢 {r.pickup_address}</div>
                      <div className="text-ink/70">🔴 {r.drop_address}</div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-[10px] uppercase tracking-wide text-ink/40">You earn</div>
                      <b className="text-forest text-xl">₹{r.fare_estimate}</b>
                    </div>
                  </div>
                  <button onClick={() => accept(r.ride_id)}
                    className="w-full mt-2 rounded-lg bg-leafbright text-white font-semibold py-2.5 text-sm hover:bg-leaf transition-transform active:scale-[.98]">
                    Accept ride
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  )
}

function Shell({ children, onLogout }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ecfdf5] to-white">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate('/home')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Home
        </button>
        <Brand size={32} />
        <button onClick={onLogout} className="text-sm font-semibold text-forest">Log out</button>
      </header>
      <main className="max-w-md mx-auto p-5">{children}</main>
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="dg-up mt-6 bg-white rounded-2xl border border-black/5 p-6 shadow-[0_8px_24px_rgba(15,90,46,0.06)] text-center">
      {children}
    </div>
  )
}
