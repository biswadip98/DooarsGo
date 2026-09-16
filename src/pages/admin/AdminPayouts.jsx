import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPayouts() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState({})

  async function load() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.rpc('admin_payout_requests')
    if (error) setError(error.message)
    setList(data || [])
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  async function process(id, action) {
    const { error } = await supabase.rpc('process_withdrawal', {
      p_payout_id: id,
      p_action: action, // expected 'paid' / 'reject' (see note below if it errors)
      p_note: note[id] || null,
    })
    if (error) setError(error.message)
    load()
  }

  if (loading) return <div className="text-sm text-ink/50">Loading…</div>

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-forest mb-1">Payouts</h2>
      <p className="text-sm text-ink/60 mb-4">
        Drivers request withdrawals; transfer the money by UPI/bank, then mark it paid.
      </p>
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      {list.length === 0 ? (
        <div className="text-sm text-ink/50 bg-white border border-mist rounded-xl p-4">No pending payout requests.</div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-mist p-4">
              <div className="flex justify-between items-start">
                <div>
                  <b>{p.driver_name}</b>
                  <div className="text-xs text-ink/60">
                    UPI: {p.upi_id || '—'} · wallet balance ₹{p.wallet_balance ?? '—'}
                  </div>
                  <div className="text-xs text-ink/50 mt-0.5">
                    Requested {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-forest">₹{p.amount}</div>
              </div>
              <input
                value={note[p.id] || ''}
                onChange={(e) => setNote({ ...note, [p.id]: e.target.value })}
                placeholder="Reference / note (optional)"
                className="w-full mt-3 rounded-lg border border-mist bg-mist/30 px-3 py-2 text-xs outline-none focus:border-leafbright"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => process(p.id, 'paid')}
                  className="rounded-lg bg-leafbright text-white text-sm font-semibold px-4 py-2 hover:bg-leaf"
                >
                  Mark paid
                </button>
                <button
                  onClick={() => process(p.id, 'reject')}
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
