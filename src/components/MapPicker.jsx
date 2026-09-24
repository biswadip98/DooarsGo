import { useEffect, useRef, useState } from 'react'
import { OlaMaps } from 'olamaps-web-sdk'

const API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY
const STYLE = 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json'
const CENTRE = [26.470342, 89.724015] // [lat, lng] — Kamakhyaguri Bus Stand

const COLOR = { pickup: '#15803d', drop: '#dc2626', driver: '#f59e0b' }

// Silence Ola's harmless default-style warning (a 3D layer the free vector source lacks).
if (typeof window !== 'undefined' && !window.__dgErrPatched) {
  window.__dgErrPatched = true
  const orig = console.error
  console.error = (...args) => {
    const f = args[0]
    const msg = typeof f === 'string' ? f : f?.message || ''
    if (msg.includes('3d_model') || msg.includes('does not exist on source') || msg.includes('Expected value to be of type number')) return
    orig.apply(console, args)
  }
}

function resolveGl(...cands) {
  for (const c of cands) {
    if (!c) continue
    if (typeof c.on === 'function') return c
    if (c.mapLibreMap && typeof c.mapLibreMap.on === 'function') return c.mapLibreMap
    if (c.map && typeof c.map.on === 'function') return c.map
    if (c._map && typeof c._map.on === 'function') return c._map
    if (typeof c.getMap === 'function') {
      const g = c.getMap()
      if (g && typeof g.on === 'function') return g
    }
  }
  return null
}

// props: center [lat,lng], pickup/drop/driver {lat,lng}, onMapTap({lat,lng}), focus {lat,lng,ts}, route [[lng,lat],...]
export default function MapPicker({ center = CENTRE, pickup, drop, driver, onMapTap, focus, route }) {
  const containerRef = useRef(null)
  const olaRef = useRef(null)
  const mapRef = useRef(null)
  const readyRef = useRef(false)
  const pickupMarker = useRef(null)
  const dropMarker = useRef(null)
  const driverMarker = useRef(null)
  const tapRef = useRef(onMapTap)
  const [failed, setFailed] = useState(API_KEY ? '' : 'nokey')

  useEffect(() => { tapRef.current = onMapTap }, [onMapTap])

  function syncMarker(ref, point, color, anchor) {
    const ola = olaRef.current
    const map = mapRef.current
    if (!ola || !map || !point) return
    try {
      if (!ref.current) {
        ref.current = ola.addMarker({ color, anchor: anchor || 'bottom' })
          .setLngLat([point.lng, point.lat]).addTo(map)
      } else {
        ref.current.setLngLat([point.lng, point.lat])
      }
    } catch (e) {
      console.warn('[map] marker skipped:', e?.message || e)
    }
  }

  function drawRoute(coords) {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    const data = coords && coords.length > 1
      ? { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
      : { type: 'FeatureCollection', features: [] }
    try {
      const src = map.getSource('dg-route')
      if (src) {
        src.setData(data)
      } else {
        map.addSource('dg-route', { type: 'geojson', data })
        map.addLayer({
          id: 'dg-route-line', type: 'line', source: 'dg-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#15803d', 'line-width': 5, 'line-opacity': 0.85 },
        })
      }
      if (coords && coords.length > 1) {
        let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity
        for (const [lng, lat] of coords) { a = Math.min(a, lng); c = Math.max(c, lng); b = Math.min(b, lat); d = Math.max(d, lat) }
        if ([a, b, c, d].every(Number.isFinite)) map.fitBounds([[a, b], [c, d]], { padding: 60, maxZoom: 16, duration: 600 })
      }
    } catch (e) {
      console.warn('[map] route draw:', e?.message || e)
    }
  }

  useEffect(() => {
    if (!API_KEY) return
    if (mapRef.current || olaRef.current || !containerRef.current) return

    let cancelled = false
    let poll = null

    const placeAll = () => {
      readyRef.current = true
      try { mapRef.current.resize() } catch (_) {}
      syncMarker(pickupMarker, pickup, COLOR.pickup, 'bottom')
      syncMarker(dropMarker, drop, COLOR.drop, 'bottom')
      syncMarker(driverMarker, driver, COLOR.driver, 'bottom')
      drawRoute(route)
    }
    const onErr = (e) => {
      const msg = e?.error?.message || e?.message || ''
      if (msg.includes('does not exist on source')) return
      if (msg) console.warn('[map] ola:', msg)
    }
    const onClick = (e) => {
      if (tapRef.current && e?.lngLat) tapRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    }
    const attach = (glMap) => {
      if (cancelled || !glMap || mapRef.current) return
      mapRef.current = glMap
      console.log('[map] interactive ready')
      glMap.on('load', () => { if (!cancelled) placeAll() })
      glMap.on('error', onErr)
      glMap.on('click', onClick)
      glMap.on('styleimagemissing', (e) => {
        try { if (e?.id && !glMap.hasImage(e.id)) glMap.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) }) } catch (_) {}
      })
      try { if (glMap.loaded && glMap.loaded()) placeAll() } catch (_) {}
      setTimeout(() => { try { glMap.resize() } catch (_) {} }, 300)
    }

    ;(async () => {
      let olaMaps
      try {
        olaMaps = new OlaMaps({ apiKey: API_KEY })
        olaRef.current = olaMaps
      } catch (err) {
        console.error('[map] SDK init failed:', err)
        setFailed('init')
        return
      }

      let inst
      try {
        // init() returns a Promise in this SDK — await it to get the real map.
        inst = await olaMaps.init({
          style: STYLE,
          container: containerRef.current,
          center: [center[1], center[0]],
          zoom: 14,
        })
      } catch (err) {
        console.error('[map] init failed:', err)
        setFailed('init')
        return
      }
      if (cancelled) return

      const first = resolveGl(inst, olaMaps) || inst?.mapLibreMap || null
      if (first) { attach(first); return }

      // Fall back to polling for mapLibreMap in case it wires up a tick later.
      let tries = 0
      poll = setInterval(() => {
        if (cancelled) { clearInterval(poll); return }
        const g = resolveGl(inst, olaMaps) || inst?.mapLibreMap || null
        if (g) { clearInterval(poll); attach(g) }
        else if (++tries >= 60) { clearInterval(poll); console.warn('[map] rendered but not interactive') }
      }, 50)
    })()

    return () => {
      cancelled = true
      if (poll) clearInterval(poll)
      readyRef.current = false
      try { mapRef.current && mapRef.current.remove && mapRef.current.remove() } catch (_) {}
      mapRef.current = null
      olaRef.current = null
      pickupMarker.current = null
      dropMarker.current = null
      driverMarker.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (readyRef.current) syncMarker(pickupMarker, pickup, COLOR.pickup, 'bottom') // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup])
  useEffect(() => { if (readyRef.current) syncMarker(dropMarker, drop, COLOR.drop, 'bottom') // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drop])
  useEffect(() => { if (readyRef.current) syncMarker(driverMarker, driver, COLOR.driver, 'bottom') // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver])
  useEffect(() => { drawRoute(route) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])

  useEffect(() => {
    const map = mapRef.current
    if (map && focus && typeof map.flyTo === 'function') map.flyTo({ center: [focus.lng, focus.lat], zoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.ts])

  if (failed) {
    return (
      <div style={{ width: '100%', height: '100%' }} className="flex items-center justify-center bg-[#ecfdf5] p-4 text-center">
        <div className="max-w-xs text-sm text-[#14532d]">
          <p className="font-bold">Map couldn't load</p>
          <p className="mt-1 text-[#15803d]">
            {failed === 'nokey'
              ? 'VITE_OLA_MAPS_API_KEY is missing. Add it to your .env file and fully restart npm run dev.'
              : 'The map SDK failed to start. Check the key and reload.'}
          </p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
