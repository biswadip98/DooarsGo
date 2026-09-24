import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminApprovals() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [urls, setUrls] = useState({})
  const [notes, setNotes] = useState({})
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState('')

  async function signed(bucket, path) {
    if (!path) return null
    try {
      const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 600)
      return data?.signedUrl || null
    } catch {
      return null
    }
  }

  async function load() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.rpc('admin_pending_drivers')
    if (error) setError(error.message === 'not_authorized' ? 'You are not an admin on this account.' : error.message)
    setList(data || [])
    setLoading(false)
    for (const d of data || []) {
      const [aadhaar, vehicle, licFront, licBack] = await Promise.all([
        signed('kyc', d.aadhaar_url),
        signed('vehicle-photos', d.vehicle_photo_url),
        signed('kyc', d.license_front_url),
        signed('kyc', d.license_back_url),
      ])
      setUrls((u) => ({ ...u, [d.driver_id]: { aadhaar, vehicle, licFront, licBack } }))
    }
  }

  useEffect(() => { load() }, [])

  async function review(driverId, action) {
    if (action === 'reject' && !(notes[driverId] || '').trim()) {
      setError('Add a short reason before rejecting.')
      return
    }
    setWorkingId(driverId)
    const { error } = await supabase.rpc('admin_review_driver', {
      p_driver_id: driverId,
      p_action: action,
      p_note: action === 'reject' ? notes[driverId] || 'Not approved' : null,
    })
    setWorkingId('')
    if (error) { setError(error.message); return }
    setList((l) => l.filter((d) => d.driver_id !== driverId))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-xl font-bold text-forest">Driver approvals</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-full px-3 py-1">{list.length} pending</span>
          <button onClick={load} className="text-xs font-semibold text-forest hover:underline">Refresh</button>
        </div>
      </div>
      <p className="text-sm text-ink/60 mb-4">Review each driver's details and documents, then approve or reject.</p>

      {error && <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {loading ? (
        <div className="text-sm text-ink/50">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-sm text-ink/50 bg-white border border-mist rounded-xl p-6 text-center">No pending drivers 🎉</div>
      ) : (
        <div className="space-y-4">
          {list.map((d) => (
            <div key={d.driver_id} className="bg-white rounded-2xl border border-mist p-4">
              <div className="flex items-center gap-3">
                {d.avatar_url ? (
                  <img src={d.avatar_url} className="w-12 h-12 rounded-full object-cover border border-mist" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-leafbright/15 flex items-center justify-center font-bold text-forest">
                    {(d.full_name || 'D').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <b className="text-forest">{d.full_name}</b>
                  <div className="text-xs text-ink/60">
                    <span className="capitalize">{d.vehicle_type}</span> · {d.vehicle_number}
                    {d.vehicle_model ? ` · ${d.vehicle_model}` : ''}{d.vehicle_mileage ? ` · ${d.vehicle_mileage} km/l` : ''}
                  </div>
                  <div className="text-xs text-ink/50">📞 {d.contact}{d.license_number ? ` · Licence ${d.license_number}` : ''}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                <Photo href={urls[d.driver_id]?.aadhaar} label="Aadhaar" />
                <Photo href={urls[d.driver_id]?.vehicle} label="Vehicle" />
                {(d.vehicle_type === 'bike' || d.vehicle_type === 'car') && (
                  <>
                    <Photo href={urls[d.driver_id]?.licFront} label="Licence front" />
                    <Photo href={urls[d.driver_id]?.licBack} label="Licence back" />
                  </>
                )}
              </div>

              <input
                value={notes[d.driver_id] || ''}
                onChange={(e) => setNotes({ ...notes, [d.driver_id]: e.target.value })}
                placeholder="Reason (required only if rejecting)"
                className="w-full mt-3 rounded-lg border border-mist bg-mist/30 px-3 py-2 text-xs outline-none focus:border-leafbright"
              />

              <div className="flex gap-2 mt-2">
                <button disabled={workingId === d.driver_id} onClick={() => review(d.driver_id, 'approve')}
                  className="rounded-lg bg-leafbright text-white text-sm font-semibold px-4 py-2 hover:bg-leaf disabled:opacity-60">
                  {workingId === d.driver_id ? '…' : 'Approve'}
                </button>
                <button disabled={workingId === d.driver_id} onClick={() => review(d.driver_id, 'reject')}
                  className="rounded-lg bg-white text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 hover:bg-red-50 disabled:opacity-60">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Photo({ href, label }) {
  if (!href) {
    return (
      <div className="w-28 h-20 rounded-lg border border-dashed border-mist bg-mist/20 flex items-center justify-center text-[11px] text-ink/40">
        No {label}
      </div>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      <img src={href} className="w-28 h-20 object-cover rounded-lg border border-mist" alt={label} />
      <div className="text-[11px] text-ink/50 text-center mt-1">{label} ↗</div>
    </a>
  )
}
