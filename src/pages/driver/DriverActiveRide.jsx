import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'
import Chat from '../../components/Chat'

const STEPS = ['Accepted', 'Arrived', 'On the way', 'Completed']
function stepIndex(status) {
  if (status === 'ACCEPTED') return 0
  if (status === 'ARRIVED') return 1
  if (status === 'IN_PROGRESS') return 2
  if (status === 'COMPLETED') return 3
  return -1
}

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

  useEffect(() => {
    const active = ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(ride?.status)
    if (!active || !ride?.vehicle_type) return
    function push() {
      navigator.geolocation?.getCurrentPosition((pos) => {
        supabase.rpc('upsert_driver_location', {
          p_lng: pos.coords.longitude, p_lat: pos.coords.latitude, p_vehicle_type: ride.vehicle_type, p_is_available: false,
        })
      })
    }
    push()
    timerRef.current = setInterval(push, 7000)
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [ride?.status, ride?.vehicle_type])

  async function markArrived() {
    setErr(''); setBusy(true)
    const { error } = await supabase.rpc('transition_ride_state', { p_ride_id: id, p_new_status: 'ARRIVED', p_actor_id: user.id, p_actor_role: 'driver' })
    setBusy(false)
    if (error) setErr(error.message)
  }

  async function startRide() {
    setErr(''); setBusy(true)
    const { data, error } = await supabase.rpc('verify_pickup_otp', { p_ride_id: id, p_otp: otp.trim(), p_driver_id: user.id })
    if (error || (data && (data.ok === false || data.error))) {
      setBusy(false); setErr('Wrong code. Ask the rider for their 4-digit pickup code.'); return
    }
    const { data: r } = await supabase.from('rides').select('status').eq('id', id).maybeSingle()
    if (r && r.status !== 'IN_PROGRESS') {
      await supabase.rpc('transition_ride_state', { p_ride_id: id, p_new_status: 'IN_PROGRESS', p_actor_id: user.id, p_actor_role: 'driver' })
    }
    setBusy(false)
  }

  async function finish() {
    setErr(''); setBusy(true)
    if (!navigator.geolocation) { setBusy(false); setErr('Location is needed to finish.'); return }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { data, error } = await supabase.rpc('finish_ride', { p_ride_id: id, p_driver_lng: pos.coords.longitude, p_driver_lat: pos.coords.latitude, p_payment_method: method })
      setBusy(false)
      if (error) { setErr(error.message); return }
      if (!data?.ok) setErr(data?.error === 'too_far' ? 'You must be within 200 m of the drop to finish.' : 'Could not finish the ride.')
    }, () => { setBusy(false); setErr('Could not read your location.') })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Loading…</div>
  if (!ride) return <div className="min-h-screen flex items-center justify-center text-ink/50 text-sm">Ride not found.</div>

  const done = ['COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_DRIVER'].includes(ride.status)
  const si = stepIndex(ride.status)
  const emoji = ride.vehicle_type === 'car' ? '🚗' : ride.vehicle_type === 'bike' ? '🏍️' : '🛺'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ecfdf5] to-white flex flex-col">
      <style>{`
        @keyframes dg-up { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes dg-car { 0%,100% { transform: translateX(-4px) } 50% { transform: translateX(4px) } }
        .dg-up { animation: dg-up .45s ease-out both }
      `}</style>

      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate('/driver')} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          {done ? 'Dashboard' : 'Minimize'}
        </button>
        <Brand size={32} />
        <span className="w-16" />
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-5 space-y-4">
        {/* Stepper */}
        {si >= 0 && (
          <div className="dg-up flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div className={`flex-1 h-1 rounded ${i === 0 ? 'opacity-0' : i <= si ? 'bg-leafbright' : 'bg-mist'}`} />
                  <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                    i < si ? 'bg-leafbright border-leafbright text-white' : i === si ? 'bg-white border-leafbright text-forest' : 'bg-white border-mist text-ink/30'}`}>
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
        <div className="dg-up text-center pt-1">
          {['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(ride.status) && (
            <div className="text-4xl" style={{ animation: 'dg-car 1.4s ease-in-out infinite' }}>{emoji}</div>
          )}
          <div className="mt-1 inline-block text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-full px-3 py-1">
            {ride.status.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Trip card */}
        <div className="dg-up bg-white rounded-2xl border border-black/5 p-4 shadow-[0_8px_24px_rgba(15,90,46,0.06)] space-y-3">
          <div className="text-xs space-y-2">
            <div className="flex gap-2"><span>🟢</span><span className="text-ink/70">{ride.pickup_address}</span></div>
            <div className="flex gap-2"><span>🔴</span><span className="text-ink/70">{ride.drop_address}</span></div>
          </div>
          <div className="border-t border-mist pt-3 flex justify-between text-sm">
            <span className="text-ink/60 capitalize">{emoji} {ride.vehicle_type} · {ride.passenger_count} pax</span>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-ink/40">You earn</div>
              <b className="text-forest text-lg">₹{ride.fare_estimate}</b>
            </div>
          </div>
        </div>

        {err && <div className="dg-up text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>}

        {ride.status === 'ACCEPTED' && (
          <button onClick={markArrived} disabled={busy}
            className="dg-up w-full rounded-xl bg-forest text-white font-semibold py-3.5 text-sm hover:bg-leaf disabled:opacity-60 transition-transform active:scale-[.98]">
            {busy ? '…' : "I've arrived at pickup"}
          </button>
        )}

        {ride.status === 'ARRIVED' && (
          <div className="dg-up bg-white rounded-2xl border border-black/5 p-4 space-y-3 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
            <div className="text-sm text-ink/70">Ask the rider for their 4-digit pickup code:</div>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" maxLength={4} placeholder="1234"
              className="w-full text-center tracking-[0.5em] text-2xl font-bold rounded-xl border border-mist bg-mist/40 px-3 py-3 outline-none focus:border-leafbright" />
            <button onClick={startRide} disabled={busy}
              className="w-full rounded-xl bg-leafbright text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60">
              {busy ? '…' : 'Verify & start ride'}
            </button>
          </div>
        )}

        {ride.status === 'IN_PROGRESS' && (
          <div className="dg-up bg-white rounded-2xl border border-black/5 p-4 space-y-3 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
            <div className="text-sm text-ink/70">Collect payment and finish near the drop:</div>
            <div className="flex gap-2">
              {['cash', 'upi'].map((m) => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-bold uppercase transition-colors ${method === m ? 'border-leafbright bg-leafbright/10 text-forest' : 'border-mist text-ink/50'}`}>
                  {m === 'cash' ? '💵 Cash' : '📲 UPI'}
                </button>
              ))}
            </div>
            <button onClick={finish} disabled={busy}
              className="w-full rounded-xl bg-leafbright text-white font-semibold py-3.5 text-sm hover:bg-leaf disabled:opacity-60 transition-transform active:scale-[.98]">
              {busy ? '…' : `Finish ride · ₹${ride.fare_estimate}`}
            </button>
            <div className="text-xs text-ink/50 text-center">You can finish only within 200 m of the drop.</div>
          </div>
        )}

        {ride.status === 'COMPLETED' && (
          <div className="dg-up bg-white rounded-2xl border border-black/5 p-6 text-center shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
            <div className="text-5xl mb-2">✅</div>
            <b className="text-forest text-lg">Ride completed</b>
            <p className="text-sm text-ink/60 mt-1">Your earning has been added to your wallet 💚</p>
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
