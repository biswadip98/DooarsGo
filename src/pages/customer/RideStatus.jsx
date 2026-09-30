import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'
import Chat from '../../components/Chat'
import MapPicker from '../../components/MapPicker'
import { Sounds, buzz } from '../../lib/sound'

const STATUS_TEXT = {
  REQUESTED: { title: 'Finding you a driver…', note: 'Nearby drivers are being notified.' },
  SEARCHING: { title: 'Finding you a driver…', note: 'Nearby drivers are being notified.' },
  ACCEPTED: { title: 'Driver on the way', note: 'Share your pickup code when they arrive.' },
  ARRIVED: { title: 'Your driver has arrived', note: 'Give them your pickup code to start.' },
  IN_PROGRESS: { title: 'On the way to your drop', note: 'Enjoy the ride!' },
  COMPLETED: { title: 'Ride completed', note: 'Thanks for riding with DooarsGo.' },
  NO_DRIVER_FOUND: { title: 'No driver available', note: 'Sorry, no driver was free. Please try again.' },
  CANCELLED_BY_CUSTOMER: { title: 'Ride cancelled', note: 'You cancelled this ride.' },
  CANCELLED_BY_DRIVER: { title: 'Ride cancelled', note: 'The driver could not take this ride.' },
  EXPIRED: { title: 'Request expired', note: 'No driver responded in time.' },
}

const STEPS = ['Requested', 'Driver assigned', 'Arrived', 'On the way', 'Completed']
const END_REASONS = [
  'Passenger getting off early',
  'Reached a closer point',
  'Emergency / urgent',
  'Road blocked ahead',
]
const CANCEL_REASONS = [
  { code: 'driver_delay', label: 'Driver is taking too long' },
  { code: 'booked_by_mistake', label: 'Booked by mistake' },
  { code: 'found_another_ride', label: 'Found another ride' },
  { code: 'changed_plans', label: 'Change of plans' },
  { code: 'other', label: 'Other reason' },
]
function stepIndex(status) {
  if (['REQUESTED', 'SEARCHING'].includes(status)) return 0
  if (status === 'ACCEPTED') return 1
  if (status === 'ARRIVED') return 2
  if (status === 'IN_PROGRESS') return 3
  if (status === 'COMPLETED') return 4
  return -1
}

export default function RideStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState('')
  const [me, setMe] = useState(null)
  const [driverPos, setDriverPos] = useState(null)
  const [rated, setRated] = useState(false)
  const [hover, setHover] = useState(0)
  const [driverInfo, setDriverInfo] = useState(null)
  const [people, setPeople] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [otherReason, setOtherReason] = useState('')
  const [ending, setEnding] = useState(false)
  const prevStatus = useRef(null)
  const posTimer = useRef(null)

  useEffect(() => {
    let mounted = true
    supabase.from('rides').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (mounted) { setRide(data); setLoading(false) }
    })
    // Create the channel synchronously so cleanup always removes it (no duplicate subscriptions).
    const channel = supabase.channel(`ride-${id}`)
    channel
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${id}` },
        (p) => setRide(p.new))
      .subscribe()
    navigator.geolocation?.getCurrentPosition((pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }))
    return () => { mounted = false; supabase.removeChannel(channel) }
  }, [id])

  const status = ride?.status

  useEffect(() => {
    const prev = prevStatus.current
    prevStatus.current = status
    if (!status || prev === status) return
    if (status === 'ACCEPTED' && (prev === 'REQUESTED' || prev === 'SEARCHING' || prev === null)) { Sounds.matched(); buzz([90]) }
    if (status === 'COMPLETED') { Sounds.complete(); buzz([80, 60, 80]); setShowComplete(true) }
  }, [status])

  const active = ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(status)
  const searching = ['REQUESTED', 'SEARCHING'].includes(status)
  const canCancel = ['REQUESTED', 'SEARCHING', 'ACCEPTED', 'ARRIVED'].includes(status)
  const si = stepIndex(status)

  useEffect(() => {
    if (['ACCEPTED', 'ARRIVED'].includes(status)) {
      supabase.rpc('ensure_pickup_otp', { p_ride_id: id }).then(({ data }) => data && setOtp(data))
    }
  }, [status, id])

  useEffect(() => {
    if (!active) return
    async function poll() {
      const { data } = await supabase.rpc('driver_live_location', { p_ride_id: id })
      if (data && data[0]) setDriverPos({ lat: data[0].lat, lng: data[0].lng })
    }
    poll()
    posTimer.current = setInterval(poll, 5000)
    return () => posTimer.current && clearInterval(posTimer.current)
  }, [active, id])

  // No driver within ~10 min? Stop waiting and show "No driver found".
  useEffect(() => {
    if (!searching) return
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('expire_my_ride', { p_ride_id: id })
      if (data?.status) setRide((r) => (r ? { ...r, status: data.status } : r))
    }, 600000)
    return () => clearTimeout(t)
  }, [searching, id])

  // Once a driver is assigned, load their card (name, photo, rating, vehicle).
  useEffect(() => {
    if (!ride?.driver_id || !active) return
    supabase.rpc('ride_driver_info', { p_ride_id: id }).then(({ data }) => {
      if (data && data[0]) setDriverInfo(data[0])
    })
    supabase.rpc('ride_people', { p_ride_id: id }).then(({ data }) => { if (data?.ok) setPeople(data) })
  }, [ride?.driver_id, active, id])

  async function cancelWithReason(reason) {
    setCancelling(true)
    await supabase.rpc('cancel_ride', { p_ride_id: id, p_cancelled_by: 'rider', p_reason: reason, p_actor_id: user.id })
    setCancelling(false)
    navigate('/home')
  }

  function endRideWith(reason) {
    setEnding(true)
    if (!navigator.geolocation) { setEnding(false); return }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.rpc('end_ride_early', {
        p_ride_id: id, p_lng: pos.coords.longitude, p_lat: pos.coords.latitude, p_ended_by: 'rider', p_reason: reason,
      })
      setEnding(false)
      // Realtime flips the ride to COMPLETED -> the completion popup shows automatically.
    }, () => setEnding(false))
  }

  async function rate(stars) {
    await supabase.from('ratings').insert({ ride_id: id, rater_id: user.id, ratee_id: ride.driver_id, role: 'rider', stars })
    setRated(true)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Loading…</div>
  if (!ride) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Ride not found.</div>

  const s = STATUS_TEXT[status] || { title: status, note: '' }
  const done = status === 'COMPLETED'
  const cancelled = ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_DRIVER', 'EXPIRED', 'NO_DRIVER_FOUND'].includes(status)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ecfdf5] to-white flex flex-col">
      <style>{`
        @keyframes dg-radar { 0% { transform: scale(.6); opacity:.7 } 100% { transform: scale(2.4); opacity:0 } }
        @keyframes dg-up { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes dg-car { 0%,100% { transform: translateX(-4px) } 50% { transform: translateX(4px) } }
        .dg-up { animation: dg-up .5s ease-out both }
      `}</style>

      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate('/home')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Home
        </button>
        <Brand size={32} />
        <span className="w-12" />
      </header>

      {active && (
        <div style={{ height: '32vh', minHeight: 200 }} className="relative">
          <MapPicker pickup={me} driver={driverPos} focus={driverPos ? { lat: driverPos.lat, lng: driverPos.lng, ts: `${driverPos.lat},${driverPos.lng}` } : null} />
        </div>
      )}

      {showComplete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-5" onClick={() => setShowComplete(false)}>
          <div className="dg-up w-full max-w-xs rounded-2xl bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-2">✅</div>
            <h2 className="font-display text-xl font-extrabold text-forest">Ride completed!</h2>
            <p className="mt-1 text-sm text-ink/60">₹{ride.fare_estimate} paid directly to your driver. Thanks for riding with DooarsGo 💚</p>
            <button onClick={() => setShowComplete(false)} className="mt-4 w-full rounded-xl bg-forest py-3 text-sm font-semibold text-white hover:bg-leaf">
              Rate your driver
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-md w-full mx-auto p-5 space-y-4">
        {/* Progress stepper */}
        {si >= 0 && (
          <div className="dg-up flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div className={`flex-1 h-1 rounded ${i === 0 ? 'opacity-0' : i <= si ? 'bg-leafbright' : 'bg-mist'}`} />
                  <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                    i < si ? 'bg-leafbright border-leafbright text-white'
                    : i === si ? 'bg-white border-leafbright text-forest'
                    : 'bg-white border-mist text-ink/30'}`}>
                    {i < si ? '✓' : i + 1}
                  </div>
                  <div className={`flex-1 h-1 rounded ${i === STEPS.length - 1 ? 'opacity-0' : i < si ? 'bg-leafbright' : 'bg-mist'}`} />
                </div>
                <div className={`mt-1 text-[9px] text-center leading-tight ${i === si ? 'text-forest font-bold' : 'text-ink/40'}`}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Status hero */}
        <div className="dg-up text-center pt-2">
          {searching && (
            <div className="relative mx-auto mb-4 h-20 w-20">
              <span className="absolute inset-0 rounded-full bg-leafbright/30" style={{ animation: 'dg-radar 1.8s ease-out infinite' }} />
              <span className="absolute inset-0 rounded-full bg-leafbright/30" style={{ animation: 'dg-radar 1.8s ease-out .9s infinite' }} />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">📍</div>
            </div>
          )}
          {active && !searching && (
            <div className="mx-auto mb-3 text-4xl" style={{ animation: 'dg-car 1.4s ease-in-out infinite' }}>
              {ride.vehicle_type === 'car' ? '🚗' : ride.vehicle_type === 'bike' ? '🏍️' : '🛺'}
            </div>
          )}
          {done && <div className="mx-auto mb-2 text-5xl">✅</div>}
          {cancelled && <div className="mx-auto mb-2 text-5xl">🚫</div>}
          <h1 className="font-display text-2xl font-bold text-forest">{s.title}</h1>
          <p className="text-ink/60 text-sm mt-1">{s.note}</p>
        </div>

        {/* OTP */}
        {['ACCEPTED', 'ARRIVED'].includes(status) && otp && (
          <div className="dg-up bg-forest text-white rounded-2xl p-4 text-center shadow-[0_10px_30px_rgba(15,90,46,0.25)]">
            <div className="text-xs opacity-80">Your pickup code</div>
            <div className="text-4xl font-extrabold tracking-[0.35em] mt-1">{otp}</div>
            <div className="text-xs opacity-80 mt-1">Tell this to your driver to start the ride</div>
          </div>
        )}

        {/* Driver card (shown once a driver accepts) */}
        {active && driverInfo && (
          <div className="dg-up flex items-center gap-3 bg-white rounded-2xl border border-black/5 p-4 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
            {driverInfo.avatar_url ? (
              <img src={driverInfo.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-leafbright/40" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-forest text-white flex items-center justify-center text-xl font-extrabold">
                {(driverInfo.full_name || 'D').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wide text-ink/40">Your driver</div>
              <div className="font-bold text-slate-900 truncate">{driverInfo.full_name || 'Driver'}</div>
              <div className="text-xs text-ink/60 flex items-center gap-2">
                <span className="font-semibold text-[#eab308]">★ {driverInfo.rating_count > 0 ? Number(driverInfo.rating_avg).toFixed(1) : 'New'}</span>
                {driverInfo.rating_count > 0 && <span className="text-ink/40">({driverInfo.rating_count} rides)</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl leading-none">{driverInfo.vehicle_type === 'car' ? '🚗' : driverInfo.vehicle_type === 'bike' ? '🏍️' : '🛺'}</div>
              <div className="mt-1 text-xs font-bold text-forest tracking-wide">{driverInfo.vehicle_number}</div>
            </div>
          </div>
        )}

        {active && people?.driver_phone && (
          <a href={`tel:${people.driver_phone}`} className="dg-up flex w-full items-center justify-center gap-2 rounded-2xl bg-forest py-3 text-sm font-semibold text-white hover:bg-leaf">
            📞 Call driver
          </a>
        )}

        {/* Trip card */}
        <div className="dg-up bg-white rounded-2xl border border-black/5 p-4 shadow-[0_8px_24px_rgba(15,90,46,0.06)] space-y-3">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-2 text-sm text-ink/70 capitalize">
              <span className="text-lg">{ride.vehicle_type === 'car' ? '🚗' : ride.vehicle_type === 'bike' ? '🏍️' : '🛺'}</span>
              {ride.vehicle_type} · {ride.passenger_count} pax
            </span>
            <b className="text-lg text-forest">₹{ride.fare_estimate}</b>
          </div>
          <div className="border-t border-mist pt-3 text-xs space-y-2">
            <div className="flex gap-2"><span>🟢</span><span className="text-ink/70">{ride.pickup_address}</span></div>
            <div className="flex gap-2"><span>🔴</span><span className="text-ink/70">{ride.drop_address}</span></div>
          </div>
        </div>

        {active && <Chat rideId={id} role="rider" />}

        {/* Rating */}
        {done && !rated && ride.driver_id && (
          <div className="dg-up bg-white rounded-2xl border border-black/5 p-5 text-center shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
            <div className="text-sm font-semibold text-ink/70 mb-2">How was your ride?</div>
            <div className="text-4xl">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => rate(n)}
                  className="px-1 transition-transform hover:scale-125">
                  <span className={n <= hover ? 'text-[#facc15]' : 'text-mist'}>★</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {rated && <div className="dg-up text-center text-sm text-forest font-semibold bg-leafbright/10 border border-leafbright/30 rounded-xl py-3">Thanks for your rating! 🙏</div>}

        {/* Actions */}
        {status === 'IN_PROGRESS' && !showEnd && (
          <button onClick={() => setShowEnd(true)}
            className="w-full rounded-xl bg-white text-red-600 border border-red-200 font-semibold py-3 text-sm hover:bg-red-50">
            End ride here
          </button>
        )}
        {status === 'IN_PROGRESS' && showEnd && (
          <div className="dg-up bg-white rounded-2xl border border-red-200 p-4 space-y-2">
            <div className="text-sm font-semibold text-slate-900">End the ride at your current spot?</div>
            <div className="text-xs text-ink/60">You'll pay only for the distance already covered.</div>
            {END_REASONS.map((r) => (
              <button key={r} disabled={ending} onClick={() => endRideWith(r)}
                className="w-full text-left rounded-lg border border-mist px-3 py-2.5 text-sm hover:bg-red-50 hover:border-red-200 disabled:opacity-60">{r}</button>
            ))}
            <input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder="Other reason (optional)"
              className="w-full rounded-lg border border-mist bg-mist/30 px-3 py-2 text-sm outline-none focus:border-leafbright" />
            <button disabled={ending} onClick={() => endRideWith(otherReason.trim() || 'Other')}
              className="w-full rounded-lg bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
              {ending ? 'Ending…' : 'End ride here'}
            </button>
            <button onClick={() => setShowEnd(false)} disabled={ending}
              className="w-full rounded-lg bg-mist py-2.5 text-sm font-semibold text-ink/70 hover:bg-mist/70">Keep going</button>
          </div>
        )}

        {canCancel && !showCancel && (
          <button onClick={() => setShowCancel(true)}
            className="w-full rounded-xl bg-white text-red-600 border border-red-200 font-semibold py-3 text-sm hover:bg-red-50">
            Cancel ride
          </button>
        )}
        {canCancel && showCancel && (
          <div className="dg-up bg-white rounded-2xl border border-red-200 p-4 space-y-2">
            <div className="text-sm font-semibold text-slate-900">Why are you cancelling?</div>
            {CANCEL_REASONS.map((r) => (
              <button key={r.code} disabled={cancelling} onClick={() => cancelWithReason(r.code)}
                className="w-full text-left rounded-lg border border-mist px-3 py-2.5 text-sm hover:bg-red-50 hover:border-red-200 disabled:opacity-60">
                {r.label}
              </button>
            ))}
            <button onClick={() => setShowCancel(false)} disabled={cancelling}
              className="w-full rounded-lg bg-mist py-2.5 text-sm font-semibold text-ink/70 hover:bg-mist/70">
              Keep my ride
            </button>
          </div>
        )}
        {!active && !canCancel && (
          <div className="space-y-2">
            {(cancelled || done) && (
              <button onClick={() => navigate('/book')} className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm hover:bg-leaf">
                {done ? 'Book another ride' : 'Book again'}
              </button>
            )}
            <button onClick={() => navigate('/home')} className="w-full rounded-xl bg-white border border-black/5 text-forest font-semibold py-3 text-sm hover:bg-mist">
              Back to home
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
