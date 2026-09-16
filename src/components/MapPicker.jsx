import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function pin(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;background:${color};border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  })
}

const vehicleIcon = L.divIcon({
  className: '',
  html: `<div style="font-size:24px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))">🛺</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

// props: center, pickup, drop, driver, onMapTap, focus
export default function MapPicker({ center = [26.2836, 89.6583], pickup, drop, driver, onMapTap, focus }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const pickupMarker = useRef(null)
  const dropMarker = useRef(null)
  const driverMarker = useRef(null)
  const tapRef = useRef(onMapTap)

  useEffect(() => {
    tapRef.current = onMapTap
  }, [onMapTap])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current).setView(center, 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    map.on('click', (e) => tapRef.current && tapRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }))
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 200)
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !pickup) return
    if (!pickupMarker.current)
      pickupMarker.current = L.marker([pickup.lat, pickup.lng], { icon: pin('#3aa233') }).addTo(map)
    else pickupMarker.current.setLatLng([pickup.lat, pickup.lng])
  }, [pickup])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !drop) return
    if (!dropMarker.current)
      dropMarker.current = L.marker([drop.lat, drop.lng], { icon: pin('#c8412f') }).addTo(map)
    else dropMarker.current.setLatLng([drop.lat, drop.lng])
  }, [drop])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !driver) return
    if (!driverMarker.current)
      driverMarker.current = L.marker([driver.lat, driver.lng], { icon: vehicleIcon }).addTo(map)
    else driverMarker.current.setLatLng([driver.lat, driver.lng])
  }, [driver])

  useEffect(() => {
    if (mapRef.current && focus) mapRef.current.setView([focus.lat, focus.lng], 15)
  }, [focus?.ts])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
