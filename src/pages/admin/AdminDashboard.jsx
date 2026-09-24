import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [s, setS] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    const { data, error } = await supabase.rpc('admin_stats')
    if (error) setError(error.message === 'not_authorized' ? 'You are not an admin on this account.' : error.message)
    else setS(data)
  }
  useEffect(() => { load() }, [])

  const Stat = ({ n, l, tone }) => (
    <div className="bg-white rounded-xl border border-mist p-4">
      <div className={`text-2xl font-extrabold ${tone === 'live' ? 'text-leafbright' : 'text-forest'}`}>{n ?? '—'}</div>
      <div className="text-xs text-ink/60 mt-1">{l}</div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl font-bold text-forest">Overview</h2>
        <button onClick={load} className="text-xs font-semibold text-forest hover:underline">Refresh</button>
      </div>
      <p className="text-sm text-ink/60 mb-4">Kamakhyaguri zone</p>
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/40">People</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat n={s?.total_users} l="Total users" />
        <Stat n={s?.customers} l="Customers" />
        <Stat n={s?.drivers} l="Drivers" />
        <Stat n={s?.pending} l="Pending approval" />
      </div>

      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/40">Live now</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat n={s?.active_drivers} l="Drivers online" tone="live" />
        <Stat n={s?.available_drivers} l="Drivers available" tone="live" />
        <Stat n={s?.live} l="Rides in progress" tone="live" />
      </div>

      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/40">Rides</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat n={s?.today} l="Rides today" />
        <Stat n={s?.completed_today} l="Completed today" />
        <Stat n={s?.total_rides} l="Total rides" />
        <Stat n={s?.completed_total} l="Completed all-time" />
      </div>
    </div>
  )
}
