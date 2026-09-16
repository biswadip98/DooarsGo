import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'
import Chat from '../../components/Chat'
import MapPicker from '../../components/MapPicker'

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
  const [cancelling, setCancelling] = useState(false)
  const posTimer = useRef(null)

  useEffect(() => {
    let channel
    async function init() {
      const { data } = await supabase.from('rides').select('*').eq('id', id).maybeSingle()
      setRide(data)
      setLoading(false)
      channel = supabase
        .channel('ride-' + id)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${id}` },
          (p) => setRide(p.new))
        .subscribe()
    }
    init()
    navigator.geolocation?.getCurrentPosition((pos) =>
      setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    )
    return () => channel && supabase.removeChannel(channel)
  }, [id])

  const status = ride?.status
  const active = ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(status)
  const searching = ['REQUESTED', 'SEARCHING'].includes(status)
  const canCancel = ['REQUESTED', 'SEARCHING', 'ACCEPTED'].includes(status)

  // fetch/refresh the pickup OTP once a driver is assigned
  useEffect(() => {
    if (['ACCEPTED', 'ARRIVED'].includes(status)) {
      supabase.rpc('ensure_pickup_otp', { p_ride_id: id }).then(({ data }) => data && setOtp(data))
    }
  }, [status, id])

  // poll the driver's live position while active
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

  async function cancel() {
    setCancelling(true)
    await supabase.rpc('cancel_ride', { p_ride_id: id, p_cancelled_by: 'rider', p_reason: 'changed_plans', p_actor_id: user.id })
    setCancelling(false)
    navigate('/home')
  }

  async function rate(stars) {
    await supabase.from('ratings').insert({
      ride_id: id, rater_id: user.id, ratee_id: ride.driver_id, role: 'rider', stars,
    })
    setRated(true)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Loading…</div>
  if (!ride) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Ride not found.</div>

  const s = STATUS_TEXT[status] || { title: status, note: '' }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur">
        <Brand size={34} />
      </header>

      {active && (
        <div style={{ height: '34vh', minHeight: 220 }} className="relative">
          <MapPicker pickup={me} driver={driverPos} focus={driverPos ? { ...driverPos, ts: Date.now() } : null} />
        </div>
      )}

      <main className="flex-1 max-w-md w-full mx-auto p-5 space-y-4">
        <div className="text-center">
          {searching && (
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-leafbright/30 border-t-leafbright animate-spin" />
          )}
          <h1 className="font-display text-2xl font-bold text-forest">{s.title}</h1>
          <p className="text-ink/60 text-sm mt-1">{s.note}</p>
        </div>

        {['ACCEPTED', 'ARRIVED'].includes(status) && otp && (
          <div className="bg-forest text-white rounded-2xl p-4 text-center">
            <div className="text-xs opacity-80">Your pickup code</div>
            <div className="text-3xl font-extrabold tracking-[0.35em] mt-1">{otp}</div>
            <div className="text-xs opacity-80 mt-1">Tell this to your driver to start the ride</div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-[0_8px_24px_rgba(15,90,46,0.06)] space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-ink/60 capitalize">{ride.vehicle_type}</span>
            <b>₹{ride.fare_estimate}</b>
          </div>
          <div className="border-t border-mist pt-3 text-xs space-y-2">
            <div className="flex gap-2"><span>🟢</span><span className="text-ink/70">{ride.pickup_address}</span></div>
            <div className="flex gap-2"><span>🔴</span><span className="text-ink/70">{ride.drop_address}</span></div>
          </div>
        </div>

        {active && <Chat rideId={id} role="rider" />}

        {status === 'COMPLETED' && !rated && ride.driver_id && (
          <div className="bg-white rounded-2xl border border-black/5 p-4 text-center">
            <div className="text-sm text-ink/70 mb-2">Rate your driver</div>
            <div className="text-3xl text-sun">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => rate(n)} className="px-1 hover:scale-110 transition-transform">★</button>
              ))}
            </div>
          </div>
        )}
        {rated && <div className="text-center text-sm text-forest font-semibold">Thanks for your rating! 🙏</div>}

        {canCancel && (
          <button onClick={cancel} disabled={cancelling}
            className="w-full rounded-xl bg-white text-red-600 border border-red-200 font-semibold py-3 text-sm hover:bg-red-50 disabled:opacity-60">
            {cancelling ? 'Cancelling…' : 'Cancel ride'}
          </button>
        )}
        {!active && !canCancel && (
          <button onClick={() => navigate('/home')}
            className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm hover:bg-leaf">
            Back to home
          </button>
        )}
      </main>
    </div>
  )
}
