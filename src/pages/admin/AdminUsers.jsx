import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminUsers() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [ridesById, setRidesById] = useState({})

  async function load() {
    setLoading(true); setError('')
    const { data, error } = await supabase.rpc('admin_all_users')
    if (error) setError(error.message === 'not_authorized' ? 'You are not an admin on this account.' : error.message)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function toggle(id) {
    if (openId === id) { setOpenId(null); return }
    setOpenId(id)
    if (!ridesById[id]) {
      setRidesById((m) => ({ ...m, [id]: { loading: true, rides: [] } }))
      const { data, error } = await supabase.rpc('admin_user_rides', { p_user_id: id })
      setRidesById((m) => ({ ...m, [id]: { loading: false, rides: error ? [] : (data || []) } }))
    }
  }

  const counts = useMemo(() => ({
    all: rows.length,
    customers: rows.filter((r) => !r.is_driver && !r.is_admin).length,
    drivers: rows.filter((r) => r.is_driver).length,
    admins: rows.filter((r) => r.is_admin).length,
  }), [rows])

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter === 'customers' && (r.is_driver || r.is_admin)) return false
      if (filter === 'drivers' && !r.is_driver) return false
      if (filter === 'admins' && !r.is_admin) return false
      if (!term) return true
      return [r.full_name, r.email, r.phone, r.vehicle_type].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))
    })
  }, [rows, q, filter])

  const Tab = ({ id, label }) => (
    <button
      onClick={() => setFilter(id)}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${filter === id ? 'bg-forest text-white' : 'bg-white text-ink/60 border border-mist hover:bg-mist/40'}`}
    >
      {label} <span className="opacity-70">{counts[id]}</span>
    </button>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl font-bold text-forest">Users</h2>
        <button onClick={load} className="text-xs font-semibold text-forest hover:underline">Refresh</button>
      </div>
      <p className="text-sm text-ink/60 mb-4">Everyone on DooarsGo. Click a row to see that person's booking history.</p>

      {error && <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Tab id="all" label="All" />
        <Tab id="customers" label="Customers" />
        <Tab id="drivers" label="Drivers" />
        <Tab id="admins" label="Admins" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…"
          className="ml-auto w-full sm:w-64 rounded-lg border border-mist bg-white px-3 py-2 text-sm outline-none focus:border-leafbright" />
      </div>

      {loading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-sm text-ink/50 bg-white border border-mist rounded-xl p-6 text-center">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-mist bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist/40 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Driver</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <FragmentRow key={r.id} r={r} open={openId === r.id} onToggle={() => toggle(r.id)} detail={ridesById[r.id]} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FragmentRow({ r, open, onToggle, detail }) {
  return (
    <>
      <tr onClick={onToggle} className={`border-t border-mist/70 align-top cursor-pointer ${open ? 'bg-leafbright/5' : 'hover:bg-mist/30'}`}>
        <td className="px-3 py-2">
          <div className="font-semibold text-slate-900">{open ? '▾ ' : '▸ '}{r.full_name || '—'}</div>
          {r.gender && <div className="text-[11px] text-ink/40 capitalize">{r.gender}</div>}
        </td>
        <td className="px-3 py-2">
          <div className="text-slate-700">{r.email || '—'}</div>
          <div className="text-[11px] text-ink/50">{r.phone || 'no phone'}</div>
        </td>
        <td className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
            <Badge>Customer</Badge>
            {r.is_driver && <Badge tone="driver">Driver</Badge>}
            {r.is_admin && <Badge tone="admin">Admin</Badge>}
          </div>
        </td>
        <td className="px-3 py-2">
          {r.is_driver ? (
            <div>
              <div className="capitalize text-slate-700">{r.vehicle_type || '—'}</div>
              <div className="text-[11px] text-ink/50 capitalize">{r.driver_status || 'status?'}</div>
            </div>
          ) : <span className="text-ink/30">—</span>}
        </td>
        <td className="px-3 py-2">
          {r.rating_count > 0 ? (
            <span className="text-slate-700">{Number(r.rating_avg).toFixed(1)} ★ <span className="text-[11px] text-ink/50">({r.rating_count})</span></span>
          ) : <span className="text-ink/30">—</span>}
        </td>
        <td className="px-3 py-2 text-ink/60 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
      </tr>
      {open && (
        <tr className="bg-leafbright/5 border-t border-mist/40">
          <td colSpan={6} className="px-3 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-ink/40 mb-2">Booking history</div>
            {!detail || detail.loading ? (
              <div className="text-xs text-ink/50">Loading rides…</div>
            ) : detail.rides.length === 0 ? (
              <div className="text-xs text-ink/50">No rides yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-mist bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="text-ink/50">
                    <tr>
                      <th className="px-2 py-1.5">When</th>
                      <th className="px-2 py-1.5">As</th>
                      <th className="px-2 py-1.5">Vehicle</th>
                      <th className="px-2 py-1.5">Trip</th>
                      <th className="px-2 py-1.5">Fare</th>
                      <th className="px-2 py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.rides.map((ride) => (
                      <tr key={ride.id} className="border-t border-mist/60">
                        <td className="px-2 py-1.5 whitespace-nowrap">{new Date(ride.when_at).toLocaleString()}</td>
                        <td className="px-2 py-1.5">{ride.role}</td>
                        <td className="px-2 py-1.5 capitalize">{ride.vehicle_type}</td>
                        <td className="px-2 py-1.5">{(ride.pickup_address || '').slice(0, 18)}{' → '}{(ride.drop_address || '').slice(0, 18)}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap">₹{ride.fare ?? '—'}</td>
                        <td className="px-2 py-1.5 font-semibold text-forest">{(ride.status || '').replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

function Badge({ children, tone }) {
  const cls = tone === 'admin'
    ? 'bg-[#14532d] text-white'
    : tone === 'driver'
      ? 'bg-forest text-white'
      : 'bg-leafbright/15 text-forest border border-leafbright/30'
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>
}
