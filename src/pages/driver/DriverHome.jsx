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
      p_driver_lng: p.lng,
      p_driver_lat: p.lat,
      p_vehicle_type: verif.vehicle_type,
      p_max_radius_m: null,
    })
    setRides(data || [])
  }

  function tick() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      posRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      await supabase.rpc('upsert_driver_location', {
        p_lng: posRef.current.lng,
        p_lat: posRef.current.lat,
        p_vehicle_type: verif.vehicle_type,
        p_is_available: true,
      })
      refreshRides()
    })
  }

  async function goOnline() {
    if (!navigator.geolocation) {
      setMsg('Location is needed to go online.')
      return
    }
    setOnline(true)
    tick() // immediately
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
    const { data, error } = await supabase.rpc('accept_ride', {
      p_ride_id: rideId,
      p_driver_id: user.id,
    })
    if (error || (data && (data.ok === false || data.error))) {
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

  // --- Pending / rejected / not-registered states ---
  if (status !== 'approved') {
    return (
      <Shell onLogout={handleLogout}>
        <h1 className="font-display text-2xl font-bold text-forest">Driver area</h1>
        {status === 'pending' && (
          <Card>
            <div className="text-4xl mb-2">⏳</div>
            <b className="text-forest">Under review</b>
            <p className="text-sm text-ink/60 mt-1">
              Our team is checking your documents. You'll be able to go online once approved.
            </p>
          </Card>
        )}
        {status === 'rejected' && (
          <Card>
            <div className="text-4xl mb-2">⚠️</div>
            <b className="text-red-600">Application not approved</b>
            <p className="text-sm text-ink/60 mt-1">{verif?.review_note || 'Please re-submit your details.'}</p>
            <Link to="/driver/register" className="inline-block mt-3 text-sm font-semibold text-forest">
              Re-submit →
            </Link>
          </Card>
        )}
        {status === 'none' && (
          <Card>
            <p className="text-sm text-ink/60">You haven't registered as a driver yet.</p>
            <Link to="/driver/register" className="inline-block mt-3 rounded-xl bg-forest text-white text-sm font-semibold px-4 py-2.5">
              Register as a driver
            </Link>
          </Card>
        )}
      </Shell>
    )
  }

  // --- Approved dashboard ---
  return (
    <Shell onLogout={handleLogout}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-ink/60">Hi {profile?.full_name}</div>
          <div className="font-display text-xl font-bold text-forest">
            {online ? "You're Online" : "You're Offline"}
          </div>
          <div className="text-xs text-ink/50 capitalize">{verif?.vehicle_type} driver</div>
        </div>
        <button
          onClick={online ? goOffline : goOnline}
          className={`w-14 h-8 rounded-full relative transition-colors ${online ? 'bg-leafbright' : 'bg-gray-300'}`}
          aria-label="Toggle online"
        >
          <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${online ? 'right-1' : 'left-1'}`} />
        </button>
      </div>

      {msg && (
        <div className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}

      {!online ? (
        <Card>
          <p className="text-sm text-ink/60">Flip the switch to go online and start receiving nearby ride requests.</p>
        </Card>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <b className="text-sm text-ink/70">Nearby requests</b>
            <button onClick={refreshRides} className="text-xs font-semibold text-forest">Refresh</button>
          </div>
          {rides.length === 0 ? (
            <div className="bg-white rounded-xl border border-mist p-4 text-sm text-ink/50 text-center">
              Waiting for ride requests near you…
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((r) => (
                <div key={r.ride_id} className="bg-white rounded-xl border border-leafbright/40 p-3">
                  <div className="flex justify-between items-start">
                    <div className="text-xs">
                      <div className="text-forest font-semibold">
                        🛒 {Math.round(r.distance_to_pickup_m)} m to pickup · {r.trip_km} km trip
                      </div>
                      <div className="mt-1 text-ink/70">🟢 {r.pickup_address}</div>
                      <div className="text-ink/70">🔴 {r.drop_address}</div>
                    </div>
                    <div className="text-right">
                      <b className="text-forest">₹{r.fare_estimate}</b>
                    </div>
                  </div>
                  <button
                    onClick={() => accept(r.ride_id)}
                    className="w-full mt-2 rounded-lg bg-leafbright text-white font-semibold py-2 text-sm hover:bg-leaf"
                  >
                    Accept
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
  return (
    <div className="min-h-screen">
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <Brand />
        <button onClick={onLogout} className="text-sm font-semibold text-forest">Log out</button>
      </header>
      <main className="max-w-md mx-auto p-5">{children}</main>
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="mt-6 bg-white rounded-2xl border border-black/5 p-5 shadow-[0_8px_24px_rgba(15,90,46,0.06)] text-center">
      {children}
    </div>
  )
}
