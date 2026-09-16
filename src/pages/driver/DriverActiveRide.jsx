import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'
import Chat from '../../components/Chat'

export default function DriverActiveRide() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState('')
  const [method, setMethod] = useState('cash')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    let channel
    async function init() {
      const { data } = await supabase.from('rides').select('*').eq('id', id).maybeSingle()
      setRide(data)
      setLoading(false)
      channel = supabase
        .channel('driveride-' + id)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${id}` },
          (p) => setRide(p.new))
        .subscribe()
    }
    init()
    return () => channel && supabase.removeChannel(channel)
  }, [id])

  // Keep pushing the driver's location while the ride is active (feeds rider's live map)
  useEffect(() => {
    const active = ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(ride?.status)
    if (!active || !ride?.vehicle_type) return
    function push() {
      navigator.geolocation?.getCurrentPosition((pos) => {
        supabase.rpc('upsert_driver_location', {
          p_lng: pos.coords.longitude,
          p_lat: pos.coords.latitude,
          p_vehicle_type: ride.vehicle_type,
          p_is_available: false,
        })
      })
    }
    push()
    timerRef.current = setInterval(push, 7000)
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [ride?.status, ride?.vehicle_type])

  async function markArrived() {
    setErr(''); setBusy(true)
    const { error } = await supabase.rpc('transition_ride_state', {
      p_ride_id: id, p_new_status: 'ARRIVED', p_actor_id: user.id, p_actor_role: 'driver',
    })
    setBusy(false)
    if (error) setErr(error.message)
  }

  async function startRide() {
    setErr(''); setBusy(true)
    const { data, error } = await supabase.rpc('verify_pickup_otp', {
      p_ride_id: id, p_otp: otp.trim(), p_driver_id: user.id,
    })
    if (error || (data && (data.ok === false || data.error))) {
      setBusy(false)
      setErr('Wrong code. Ask the rider for their 4-digit pickup code.')
      return
    }
    // Ensure the ride is now in progress (works whether or not verify moves it)
    const { data: r } = await supabase.from('rides').select('status').eq('id', id).maybeSingle()
    if (r && r.status !== 'IN_PROGRESS') {
      await supabase.rpc('transition_ride_state', {
        p_ride_id: id, p_new_status: 'IN_PROGRESS', p_actor_id: user.id, p_actor_role: 'driver',
      })
    }
    setBusy(false)
  }

  async function finish() {
    setErr(''); setBusy(true)
    if (!navigator.geolocation) { setBusy(false); setErr('Location is needed to finish.'); return }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { data, error } = await supabase.rpc('finish_ride', {
        p_ride_id: id, p_driver_lng: pos.coords.longitude, p_driver_lat: pos.coords.latitude, p_payment_method: method,
      })
      setBusy(false)
      if (error) { setErr(error.message); return }
      if (!data?.ok) {
        setErr(data?.error === 'too_far' ? 'You must be within 200 m of the drop to finish.' : 'Could not finish the ride.')
      }
    }, () => { setBusy(false); setErr('Could not read your location.') })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Loading…</div>
  if (!ride) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Ride not found.</div>

  const done = ['COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_DRIVER'].includes(ride.status)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur">
        <Brand size={34} />
      </header>
      <main className="flex-1 max-w-md w-full mx-auto p-5 space-y-4">
        <span className="text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-full px-3 py-1">
          {ride.status.replace(/_/g, ' ')}
        </span>

        <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-[0_8px_24px_rgba(15,90,46,0.06)] space-y-3">
          <div className="text-xs space-y-2">
            <div className="flex gap-2"><span>🟢</span><span className="text-ink/70">{ride.pickup_address}</span></div>
            <div className="flex gap-2"><span>🔴</span><span className="text-ink/70">{ride.drop_address}</span></div>
          </div>
          <div className="border-t border-mist pt-3 flex justify-between text-sm">
            <span className="text-ink/60 capitalize">{ride.vehicle_type} · {ride.passenger_count} pax</span>
            <b className="text-forest">₹{ride.fare_estimate}</b>
          </div>
        </div>

        {err && <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>}

        {ride.status === 'ACCEPTED' && (
          <button onClick={markArrived} disabled={busy}
            className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60">
            {busy ? '…' : "I've arrived at pickup"}
          </button>
        )}

        {ride.status === 'ARRIVED' && (
          <div className="bg-white rounded-2xl border border-black/5 p-4 space-y-3">
            <div className="text-sm text-ink/70">Ask the rider for their 4-digit pickup code:</div>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={4} placeholder="1234"
              className="w-full text-center tracking-[0.5em] text-xl font-bold rounded-xl border border-mist bg-mist/40 px-3 py-3 outline-none focus:border-leafbright" />
            <button onClick={startRide} disabled={busy}
              className="w-full rounded-xl bg-leafbright text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60">
              {busy ? '…' : 'Verify & start ride'}
            </button>
          </div>
        )}

        {ride.status === 'IN_PROGRESS' && (
          <div className="bg-white rounded-2xl border border-black/5 p-4 space-y-3">
            <div className="text-sm text-ink/70">Collect payment and finish near the drop:</div>
            <div className="flex gap-2">
              {['cash', 'upi'].map((m) => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold uppercase ${
                    method === m ? 'border-leafbright bg-leafbright/10 text-forest' : 'border-mist text-ink/60'}`}>
                  {m}
                </button>
              ))}
            </div>
            <button onClick={finish} disabled={busy}
              className="w-full rounded-xl bg-leafbright text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60">
              {busy ? '…' : `Finish ride · ₹${ride.fare_estimate}`}
            </button>
            <div className="text-xs text-ink/50 text-center">You can finish only within 200 m of the drop.</div>
          </div>
        )}

        {ride.status === 'COMPLETED' && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 text-center">
            <div className="text-4xl mb-2">✅</div>
            <b className="text-forest">Ride completed</b>
            <p className="text-sm text-ink/60 mt-1">Your earning has been added to your wallet.</p>
          </div>
        )}

        {!done && <Chat rideId={id} role="driver" />}

        <button onClick={() => navigate('/driver')}
          className="w-full rounded-xl bg-white border border-black/5 text-forest font-semibold py-3 text-sm hover:bg-mist">
          {done ? 'Back to dashboard' : 'Minimize (ride stays active)'}
        </button>
      </main>
    </div>
  )
}
