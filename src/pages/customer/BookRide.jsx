import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { reverseGeocode, searchPlace } from '../../lib/geo'
import MapPicker from '../../components/MapPicker'
import Brand from '../../components/Brand'

const VEHICLES = [
  { key: 'toto', label: 'Toto', icon: '🛺' },
  { key: 'bike', label: 'Bike', icon: '🏍️' },
  { key: 'car', label: 'Car', icon: '🚗' },
]

export default function BookRide() {
  const navigate = useNavigate()
  const [pickup, setPickup] = useState(null)
  const [drop, setDrop] = useState(null)
  const [mode, setMode] = useState('drop') // which pin a map tap moves
  const [vehicle, setVehicle] = useState('toto')
  const [passengers, setPassengers] = useState(1)
  const [focus, setFocus] = useState(null)
  const [quote, setQuote] = useState(null)
  const [busy, setBusy] = useState('') // '', 'quoting', 'requesting'
  const [outOfZone, setOutOfZone] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  // Try current location for pickup (non-blocking; if denied, just stay on Kamakhyaguri)
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPickup({ ...p, address: 'Your location' })
        setFocus({ ...p, ts: Date.now() })
        reverseGeocode(p).then((address) => setPickup((cur) => (cur ? { ...cur, address } : cur)))
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  function resetQuote() {
    setQuote(null)
    setOutOfZone(false)
    setError('')
  }

  // Pin drops instantly; address is filled in afterwards.
  function handleMapTap({ lat, lng }) {
    const point = { lat, lng, address: 'Locating…' }
    if (mode === 'pickup') setPickup(point)
    else setDrop(point)
    resetQuote()
    reverseGeocode({ lat, lng }).then((address) => {
      if (mode === 'pickup') setPickup((cur) => (cur ? { ...cur, address } : cur))
      else setDrop((cur) => (cur ? { ...cur, address } : cur))
    })
  }

  function locateMe() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setPickup({ ...p, address: 'Your location' })
      setFocus({ ...p, ts: Date.now() })
      resetQuote()
      reverseGeocode(p).then((address) => setPickup((cur) => (cur ? { ...cur, address } : cur)))
    })
  }

  async function doSearch() {
    if (!search.trim()) return
    setSearching(true)
    setSearched(true)
    const res = await searchPlace(search)
    setResults(res)
    setSearching(false)
  }

  function pickResult(r) {
    if (mode === 'pickup') setPickup({ lat: r.lat, lng: r.lng, address: r.label })
    else setDrop({ lat: r.lat, lng: r.lng, address: r.label })
    setFocus({ lat: r.lat, lng: r.lng, ts: Date.now() })
    setResults([])
    setSearched(false)
    setSearch('')
    resetQuote()
  }

  async function checkFare() {
    setError('')
    setOutOfZone(false)
    if (!pickup || !drop) {
      setError('Please set both a pickup and a drop point first.')
      return
    }
    setBusy('quoting')
    const { data, error } = await supabase.rpc('quote_ride', {
      p_vehicle_type: vehicle,
      p_pickup_lng: pickup.lng,
      p_pickup_lat: pickup.lat,
      p_drop_lng: drop.lng,
      p_drop_lat: drop.lat,
      p_passenger_count: vehicle === 'toto' ? passengers : 1,
    })
    setBusy('')
    if (error) return setError(error.message)
    if (!data?.in_zone) {
      setOutOfZone(true)
      setQuote(null)
      return
    }
    setQuote(data)
  }

  async function requestRide() {
    setError('')
    setBusy('requesting')
    const { data, error } = await supabase.rpc('request_ride', {
      p_vehicle_type: vehicle,
      p_pickup_lng: pickup.lng,
      p_pickup_lat: pickup.lat,
      p_pickup_address: pickup.address,
      p_drop_lng: drop.lng,
      p_drop_lat: drop.lat,
      p_drop_address: drop.address,
      p_passenger_count: vehicle === 'toto' ? passengers : 1,
    })
    setBusy('')
    if (error) return setError(error.message)
    if (!data?.ok) {
      return setError(
        data?.error === 'out_of_zone'
          ? 'That trip is outside our 15 km service area.'
          : 'Could not request the ride. Please try again.'
      )
    }
    navigate('/ride/' + data.ride_id)
  }

  const seg = (m, label) => (
    <button
      onClick={() => setMode(m)}
      className={`flex-1 py-2 text-xs font-semibold rounded-lg ${
        mode === m ? 'bg-forest text-white' : 'text-ink/60'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur flex items-center justify-between">
        <Brand size={34} />
        <Link to="/home" className="text-sm font-semibold text-forest">
          ← Home
        </Link>
      </header>

      <div style={{ height: '42vh', minHeight: 260 }} className="relative">
        <MapPicker center={[26.2836, 89.6583]} pickup={pickup} drop={drop} onMapTap={handleMapTap} focus={focus} />
        <button
          onClick={locateMe}
          className="absolute z-[1000] bottom-3 right-3 bg-white rounded-full shadow-md px-3 py-2 text-xs font-semibold text-forest border border-black/5"
        >
          📍 My location
        </button>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto p-4 space-y-3">
        <div className="flex gap-1 bg-mist rounded-xl p-1 border border-black/5">
          {seg('pickup', 'Tap map = Pickup')}
          {seg('drop', 'Tap map = Drop')}
        </div>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            placeholder={`Search a ${mode} place…`}
            className="flex-1 rounded-xl border border-mist bg-white px-3 py-2.5 text-sm outline-none focus:border-leafbright"
          />
          <button onClick={doSearch} className="rounded-xl bg-forest text-white text-sm font-semibold px-4">
            {searching ? '…' : 'Find'}
          </button>
        </div>
        {searched && !searching && results.length === 0 && (
          <div className="text-xs text-ink/50 px-1">No places found — try a nearby landmark, or tap the map.</div>
        )}
        {results.length > 0 && (
          <div className="bg-white border border-mist rounded-xl overflow-hidden">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => pickResult(r)}
                className="block w-full text-left px-3 py-2 text-xs border-b border-mist last:border-0 hover:bg-mist/60"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-mist p-3 text-xs space-y-2">
          <div className="flex gap-2">
            <span>🟢</span>
            <span className="text-ink/70">{pickup?.address || 'Set your pickup (tap "My location" or the map)'}</span>
          </div>
          <div className="flex gap-2">
            <span>🔴</span>
            <span className="text-ink/70">{drop?.address || 'Set your drop (search or tap the map)'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {VEHICLES.map((v) => (
            <button
              key={v.key}
              onClick={() => {
                setVehicle(v.key)
                resetQuote()
              }}
              className={`flex-1 rounded-xl border p-2.5 text-xs font-semibold ${
                vehicle === v.key ? 'border-leafbright bg-leafbright/10 text-forest' : 'border-mist text-ink/60'
              }`}
            >
              <span className="block text-xl">{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>

        {vehicle === 'toto' && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-mist p-3">
            <span className="text-sm text-ink/70">Passengers</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPassengers(Math.max(1, passengers - 1))
                  resetQuote()
                }}
                className="w-8 h-8 rounded-lg bg-mist font-bold"
              >
                –
              </button>
              <b className="w-4 text-center">{passengers}</b>
              <button
                onClick={() => {
                  setPassengers(Math.min(4, passengers + 1))
                  resetQuote()
                }}
                className="w-8 h-8 rounded-lg bg-leafbright text-white font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {outOfZone && (
          <div className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            We are not currently serving in that area (outside the 15 km zone).
          </div>
        )}

        {!quote ? (
          <button
            onClick={checkFare}
            disabled={busy === 'quoting'}
            className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60"
          >
            {busy === 'quoting' ? 'Checking…' : 'Check fare'}
          </button>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-leafbright/40 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink/70">Estimated fare</span>
                <span className="text-xl font-extrabold text-forest">₹{quote.fare_estimate}</span>
              </div>
              <div className="text-xs text-ink/50 mt-1">
                {quote.distance_km} km · about {quote.duration_min} min
              </div>
            </div>
            <button
              onClick={requestRide}
              disabled={busy === 'requesting'}
              className="w-full rounded-xl bg-leafbright text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60"
            >
              {busy === 'requesting' ? 'Requesting…' : 'Request ride'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
