import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [s, setS] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.rpc('admin_stats').then(({ data, error }) => {
      if (error) setError(error.message)
      else setS(data)
    })
  }, [])

  const Stat = ({ n, l }) => (
    <div className="bg-white rounded-xl border border-mist p-4">
      <div className="text-2xl font-extrabold text-forest">{n ?? '—'}</div>
      <div className="text-xs text-ink/60 mt-1">{l}</div>
    </div>
  )

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-forest mb-1">Overview</h2>
      <p className="text-sm text-ink/60 mb-4">Kamakhyaguri zone</p>
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Stat n={s?.customers} l="Customers" />
        <Stat n={s?.drivers} l="Drivers" />
        <Stat n={s?.pending} l="Pending approval" />
        <Stat n={s?.live} l="Rides live now" />
        <Stat n={s?.today} l="Rides today" />
        <Stat n={s?.completed_today} l="Completed today" />
      </div>
    </div>
  )
}
