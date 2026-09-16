import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminApprovals() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [urls, setUrls] = useState({})
  const [notes, setNotes] = useState({})
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.rpc('admin_pending_drivers')
    if (error) setError(error.message)
    setList(data || [])
    setLoading(false)
    for (const d of data || []) {
      const a = d.aadhaar_url
        ? (await supabase.storage.from('kyc').createSignedUrl(d.aadhaar_url, 300)).data?.signedUrl
        : null
      const v = d.vehicle_photo_url
        ? (await supabase.storage.from('vehicle-photos').createSignedUrl(d.vehicle_photo_url, 300)).data?.signedUrl
        : null
      setUrls((u) => ({ ...u, [d.driver_id]: { aadhaar: a, vehicle: v } }))
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function review(driverId, action) {
    await supabase.rpc('admin_review_driver', {
      p_driver_id: driverId,
      p_action: action,
      p_note: action === 'reject' ? notes[driverId] || 'Not approved' : null,
    })
    load()
  }

  if (loading) return <div className="text-sm text-ink/50">Loading…</div>

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-forest mb-1">Driver approvals</h2>
      <p className="text-sm text-ink/60 mb-4">Review documents, then approve or reject.</p>
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      {list.length === 0 ? (
        <div className="text-sm text-ink/50 bg-white border border-mist rounded-xl p-4">No pending drivers 🎉</div>
      ) : (
        <div className="space-y-4">
          {list.map((d) => (
            <div key={d.driver_id} className="bg-white rounded-2xl border border-mist p-4">
              <div className="flex items-center gap-3">
                {d.avatar_url && <img src={d.avatar_url} className="w-12 h-12 rounded-full object-cover" alt="" />}
                <div>
                  <b>{d.full_name}</b>
                  <div className="text-xs text-ink/60 capitalize">
                    {d.contact} · {d.vehicle_type} · {d.vehicle_number}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-3">
                {urls[d.driver_id]?.aadhaar && (
                  <a href={urls[d.driver_id].aadhaar} target="_blank" rel="noreferrer">
                    <img src={urls[d.driver_id].aadhaar} className="w-28 h-20 object-cover rounded-lg border border-mist" alt="Aadhaar" />
                    <div className="text-[11px] text-ink/50 text-center mt-1">Aadhaar</div>
                  </a>
                )}
                {urls[d.driver_id]?.vehicle && (
                  <a href={urls[d.driver_id].vehicle} target="_blank" rel="noreferrer">
                    <img src={urls[d.driver_id].vehicle} className="w-28 h-20 object-cover rounded-lg border border-mist" alt="Vehicle" />
                    <div className="text-[11px] text-ink/50 text-center mt-1">Vehicle</div>
                  </a>
                )}
              </div>

              <input
                value={notes[d.driver_id] || ''}
                onChange={(e) => setNotes({ ...notes, [d.driver_id]: e.target.value })}
                placeholder="Reason (only needed if rejecting)"
                className="w-full mt-3 rounded-lg border border-mist bg-mist/30 px-3 py-2 text-xs outline-none focus:border-leafbright"
              />

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => review(d.driver_id, 'approve')}
                  className="rounded-lg bg-leafbright text-white text-sm font-semibold px-4 py-2 hover:bg-leaf"
                >
                  Approve
                </button>
                <button
                  onClick={() => review(d.driver_id, 'reject')}
                  className="rounded-lg bg-white text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 hover:bg-red-50"
                >
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
