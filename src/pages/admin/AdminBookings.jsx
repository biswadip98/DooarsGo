import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminBookings() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.rpc('admin_recent_rides', { p_limit: 100 }).then(({ data, error }) => {
      if (error) setError(error.message)
      setRides(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-sm text-ink/50">Loading…</div>

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-forest mb-1">Bookings</h2>
      <p className="text-sm text-ink/60 mb-4">Most recent 100 rides.</p>
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}
      <div className="bg-white rounded-2xl border border-mist overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-ink/50 border-b border-mist">
                <th className="text-left p-3 whitespace-nowrap">When</th>
                <th className="text-left p-3">Trip</th>
                <th className="text-left p-3">Rider / Driver</th>
                <th className="text-left p-3">Fare</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r.id} className="border-b border-mist last:border-0">
                  <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    {(r.pickup_address || '').slice(0, 22)} → {(r.drop_address || '').slice(0, 22)}
                  </td>
                  <td className="p-3">
                    {r.rider_name || '—'} / {r.driver_name || '—'}
                  </td>
                  <td className="p-3 whitespace-nowrap">₹{r.final_fare ?? r.fare_estimate ?? '—'}</td>
                  <td className="p-3">
                    <span className="font-semibold text-forest whitespace-nowrap">
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {rides.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-ink/50">
                    No rides yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
