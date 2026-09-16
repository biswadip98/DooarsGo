// Geocoding via Photon (free, good for interactive search). Results are biased
// toward Kamakhyaguri so local places rank first. Falls back to plain coordinates.

const KAMA = { lat: 26.2836, lng: 89.6583 }

export function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function labelFrom(p) {
  return [p.name, p.street, p.locality || p.district, p.city || p.county, p.state]
    .filter(Boolean)
    .join(', ')
}

export async function reverseGeocode({ lat, lng }) {
  try {
    const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`)
    const j = await r.json()
    const p = j.features?.[0]?.properties
    const label = p ? labelFrom(p) : ''
    return label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

export async function searchPlace(query) {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query
    )}&limit=6&lat=${KAMA.lat}&lon=${KAMA.lng}`
    const r = await fetch(url)
    const j = await r.json()
    return (j.features || []).map((ft) => {
      const [lng, lat] = ft.geometry.coordinates
      const label = labelFrom(ft.properties)
      return { label: label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng }
    })
  } catch {
    return []
  }
}
