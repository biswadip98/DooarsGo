// Ola Maps Places + Directions, called DIRECTLY from the browser.
// Ola's API key is domain-restricted (safe client-side, like a Google Maps browser key);
// the browser sends the Origin header Ola checks. Errors log and fall back gracefully.

const API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY
const BASE = 'https://api.olamaps.io'

// Service centre — Kamakhyaguri Bus Stand — biases search toward local places.
const CENTRE = { lat: 26.470342, lng: 89.724015 }

export function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function coordsOf(p) {
  const loc = p?.geometry?.location ?? p?.location ?? {}
  const lat = loc.lat ?? loc.latitude
  const lng = loc.lng ?? loc.lon ?? loc.longitude
  return { lat, lng }
}
const valid = (x) => typeof x.lat === 'number' && typeof x.lng === 'number'

export async function reverseGeocode({ lat, lng }) {
  try {
    const r = await fetch(`${BASE}/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${API_KEY}`)
    const j = await r.json()
    return (
      j.results?.[0]?.formatted_address ||
      j.results?.[0]?.name ||
      `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    )
  } catch (e) {
    console.error('[ola] reverse geocode:', e)
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

export async function searchPlace(query) {
  const q = (query || '').trim()
  if (q.length < 2) return []
  try {
    const acUrl =
      `${BASE}/places/v1/autocomplete?input=${encodeURIComponent(q)}` +
      `&location=${CENTRE.lat},${CENTRE.lng}&radius=50000&api_key=${API_KEY}`
    const r = await fetch(acUrl)
    const j = await r.json()
    let results = (j.predictions || j.results || [])
      .map((p) => ({ label: p.description ?? p.structured_formatting?.main_text ?? p.name ?? '', ...coordsOf(p) }))
      .filter(valid)

    if (results.length === 0) {
      const g = await fetch(`${BASE}/places/v1/geocode?address=${encodeURIComponent(q)}&api_key=${API_KEY}`)
      const gj = await g.json()
      results = (gj.geocodingResults || gj.results || [])
        .map((x) => ({ label: x.formatted_address ?? x.name ?? q, ...coordsOf(x) }))
        .filter(valid)
    }
    return results
  } catch (e) {
    console.error('[ola] search:', e)
    return []
  }
}

// Decode a Google/Ola encoded polyline at a given precision -> [ [lng,lat], ... ] (MapLibre order).
function decodeAt(str, precision) {
  if (!str) return []
  let index = 0, lat = 0, lng = 0
  const coordinates = []
  const factor = Math.pow(10, precision)
  while (index < str.length) {
    let result = 1, shift = 0, b
    do { b = str.charCodeAt(index++) - 63 - 1; result += b << shift; shift += 5 } while (b >= 0x1f)
    lat += (result & 1) ? ~(result >> 1) : (result >> 1)
    result = 1; shift = 0
    do { b = str.charCodeAt(index++) - 63 - 1; result += b << shift; shift += 5 } while (b >= 0x1f)
    lng += (result & 1) ? ~(result >> 1) : (result >> 1)
    coordinates.push([lng / factor, lat / factor])
  }
  return coordinates
}

const inRange = (pts) =>
  pts.length > 1 && pts.every(([lng, lat]) =>
    Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90)

// Ola may encode at precision 5 or 6 — pick whichever yields valid coordinates near `near`.
function decodePolyline(str, near) {
  const p5 = decodeAt(str, 5)
  const p6 = decodeAt(str, 6)
  const near5 = inRange(p5) && (!near || (Math.abs(p5[0][1] - near.lat) < 1 && Math.abs(p5[0][0] - near.lng) < 1))
  const near6 = inRange(p6) && (!near || (Math.abs(p6[0][1] - near.lat) < 1 && Math.abs(p6[0][0] - near.lng) < 1))
  if (near5) return p5
  if (near6) return p6
  if (inRange(p5)) return p5
  if (inRange(p6)) return p6
  return []
}

// Ola Directions: real road distance + duration + route geometry for drawing the line.
// Returns { distance_km, duration_min, coordinates:[[lng,lat],...] } or null (logs why).
export async function getRoute(pickup, drop) {
  try {
    const url =
      `${BASE}/routing/v1/directions` +
      `?origin=${pickup.lat},${pickup.lng}&destination=${drop.lat},${drop.lng}` +
      `&api_key=${API_KEY}`
    // Ola Directions can be POST or GET depending on the product/tier — try POST, then GET.
    let r = await fetch(url, { method: 'POST' })
    if (!r.ok) {
      const t1 = await r.text().catch(() => '')
      console.warn('[ola] directions POST', r.status, t1.slice(0, 120), '- retrying GET')
      r = await fetch(url)
    }
    if (!r.ok) {
      const t = await r.text().catch(() => '')
      console.error('[ola] directions HTTP', r.status, t.slice(0, 200))
      return null
    }
    const j = await r.json()
    const route = j.routes?.[0]
    if (!route) {
      console.warn('[ola] directions: no route in response', j?.status || '')
      return null
    }
    const legs = route.legs || []
    const leg = legs[0] || {}
    const meters =
      leg.distance?.value ??
      (typeof leg.distance === 'number' ? leg.distance : null) ??
      legs.reduce((s, l) => s + (l.distance?.value ?? l.distance ?? 0), 0)
    const seconds =
      leg.duration?.value ??
      (typeof leg.duration === 'number' ? leg.duration : null) ??
      legs.reduce((s, l) => s + (l.duration?.value ?? l.duration ?? 0), 0)
    const encoded = route.overview_polyline?.points ?? route.overview_polyline ?? ''
    const decoded = decodePolyline(encoded, pickup)
    // Connect the exact pickup/drop pins to the road route (the short access/walk bits),
    // so the line always reaches the markers instead of stopping at the nearest road.
    const coordinates = []
    if (pickup && Number.isFinite(pickup.lng) && Number.isFinite(pickup.lat)) coordinates.push([pickup.lng, pickup.lat])
    for (const c of decoded) coordinates.push(c)
    if (drop && Number.isFinite(drop.lng) && Number.isFinite(drop.lat)) coordinates.push([drop.lng, drop.lat])
    console.log('[ola] directions ok:', (meters / 1000).toFixed(2), 'km,', coordinates.length, 'points')
    return {
      distance_km: Number((meters / 1000).toFixed(2)),
      duration_min: Math.max(1, Math.round(seconds / 60)),
      coordinates,
    }
  } catch (e) {
    console.error('[ola] directions:', e)
    return null
  }
}

export { CENTRE }
