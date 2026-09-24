import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminSettings() {
  const [rules, setRules] = useState([])          // fare_rules (per vehicle)
  const [fs, setFs] = useState(null)              // fare_settings (global)
  const [multi, setMulti] = useState([])          // passenger_multipliers (Toto)
  const [platform, setPlatform] = useState(null)  // platform_settings
  const [zone, setZone] = useState(null)          // service_zones
  const [cancel, setCancel] = useState(null)      // cancellation_policy
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const [r, f, m, p, z, c] = await Promise.all([
      supabase.from('fare_rules').select('*').order('vehicle_type'),
      supabase.from('fare_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('passenger_multipliers').select('*').order('passengers'),
      supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('service_zones').select('id,name,radius_m,is_active').eq('id', 1).maybeSingle(),
      supabase.from('cancellation_policy').select('*').eq('id', 1).maybeSingle(),
    ])
    setRules(r.data || [])
    setFs(f.data || null)
    setMulti(m.data || [])
    setPlatform(p.data || null)
    setZone(z.data ? { ...z.data, lng: '', lat: '' } : null)
    setCancel(c.data || null)
    setLoading(false)
  }
  useEffect(() => { loadAll() }, [])

  const flash = (msg) => { setSaved(msg); setError(''); setTimeout(() => setSaved(''), 2500) }
  const fail = (e) => setError(e?.message || 'Could not save.')

  async function saveRule(f) {
    const { error } = await supabase.from('fare_rules').update({
      minimum_fare: f.minimum_fare,
      included_km: f.included_km,
      extra_per_km: f.extra_per_km,
      per_extra_passenger: f.per_extra_passenger,
      pickup_free_km: f.pickup_free_km,
      pickup_rate_multiplier: f.pickup_rate_multiplier,
    }).eq('vehicle_type', f.vehicle_type)
    error ? fail(error) : flash(`${f.vehicle_type} fare saved`)
  }

  async function saveFareSettings() {
    const { error } = await supabase.from('fare_settings').update({
      night_start: fs.night_start,
      night_end: fs.night_end,
      night_multiplier: fs.night_multiplier,
      rounding: fs.rounding,
    }).eq('id', 1)
    error ? fail(error) : flash('Night & rounding saved')
  }

  async function saveMulti(row) {
    const { error } = await supabase.from('passenger_multipliers')
      .update({ multiplier: row.multiplier }).eq('passengers', row.passengers)
    error ? fail(error) : flash('Toto multipliers saved')
  }

  async function savePlatform() {
    const { error } = await supabase.from('platform_settings').update({
      min_withdrawal: platform.min_withdrawal,
      max_match_radius_m: platform.max_match_radius_m,
      platform_upi_id: platform.platform_upi_id,
    }).eq('id', 1)
    error ? fail(error) : flash('Platform settings saved')
  }

  async function saveZone() {
    if (zone.lng === '' || zone.lat === '') {
      const { error } = await supabase.from('service_zones').update({ radius_m: zone.radius_m }).eq('id', 1)
      error ? fail(error) : flash('Service radius saved')
      return
    }
    const { data, error } = await supabase.rpc('admin_set_service_zone', {
      p_id: 1, p_lng: Number(zone.lng), p_lat: Number(zone.lat), p_radius_m: Number(zone.radius_m),
    })
    if (error || !data?.ok) fail(error || { message: 'Could not update the zone.' })
    else flash('Service area saved')
  }

  async function saveCancel() {
    const { error } = await supabase.from('cancellation_policy').update({
      rider_free_before_arrived: cancel.rider_free_before_arrived,
      rider_cancel_fee: cancel.rider_cancel_fee,
      request_expiry_seconds: cancel.request_expiry_seconds,
    }).eq('id', 1)
    error ? fail(error) : flash('Cancellation policy saved')
  }

  if (loading) return <div className="text-sm text-ink/50">Loading…</div>

  const inputCls = 'w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm outline-none focus:border-leafbright'
  const Field = ({ label, children }) => (
    <label className="block"><span className="block text-xs font-semibold text-ink/60 mb-1">{label}</span>{children}</label>
  )
  const Section = ({ title, subtitle, children, onSave }) => (
    <div className="bg-white rounded-2xl border border-mist p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-forest">{title}</h3>
          {subtitle && <p className="text-[11px] text-ink/50">{subtitle}</p>}
        </div>
        {onSave && <button onClick={onSave} className="rounded-lg bg-forest text-white text-xs font-semibold px-3 py-1.5 hover:bg-leaf">Save</button>}
      </div>
      {children}
    </div>
  )
  const num = (rows, i, key, val) => { const c = [...rows]; c[i] = { ...c[i], [key]: val }; return c }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-forest mb-1">Settings</h2>
      <p className="text-sm text-ink/60 mb-4">Everything here edits the <b>live</b> fare logic — changes apply to new bookings instantly.</p>

      {saved && <div className="mb-3 text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-lg px-3 py-2">✓ {saved}</div>}
      {error && <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {/* Fares per vehicle */}
      <Section title="Fares per vehicle" subtitle="Base covers 0–5 km. Extra ₹/km applies beyond that." onSave={() => rules.forEach(saveRule)}>
        <div className="space-y-3">
          {rules.map((f, i) => (
            <div key={f.vehicle_type} className="border border-mist rounded-xl p-3">
              <div className="text-sm font-semibold text-forest capitalize mb-2">{f.vehicle_type}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Field label="Base fare (₹, 0–5 km)">
                  <input type="number" step="1" className={inputCls} value={f.minimum_fare}
                    onChange={(e) => setRules(num(rules, i, 'minimum_fare', e.target.value))} />
                </Field>
                <Field label="Free km in base">
                  <input type="number" step="0.5" className={inputCls} value={f.included_km}
                    onChange={(e) => setRules(num(rules, i, 'included_km', e.target.value))} />
                </Field>
                <Field label="Extra ₹/km (after base)">
                  <input type="number" step="0.5" className={inputCls} value={f.extra_per_km}
                    onChange={(e) => setRules(num(rules, i, 'extra_per_km', e.target.value))} />
                </Field>
                <Field label="+₹ per extra passenger">
                  <input type="number" step="1" className={inputCls} value={f.per_extra_passenger ?? 0}
                    onChange={(e) => setRules(num(rules, i, 'per_extra_passenger', e.target.value))} />
                </Field>
                <Field label="Free pickup km">
                  <input type="number" step="0.5" className={inputCls} value={f.pickup_free_km}
                    onChange={(e) => setRules(num(rules, i, 'pickup_free_km', e.target.value))} />
                </Field>
                <Field label="Pickup rate × of ₹/km">
                  <input type="number" step="0.1" className={inputCls} value={f.pickup_rate_multiplier}
                    onChange={(e) => setRules(num(rules, i, 'pickup_rate_multiplier', e.target.value))} />
                </Field>
              </div>
              <p className="text-[11px] text-ink/40 mt-1">
                "+₹ per extra passenger" is the flat charge for the 2nd/3rd/4th person (Car uses this; keep 0 for Bike/Toto).
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Toto passenger multipliers */}
      {multi.length > 0 && (
        <Section title="Toto passenger multipliers" subtitle="Toto multiplies the fare by these (Car uses the flat +₹ above instead)." onSave={() => multi.forEach(saveMulti)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {multi.map((row, i) => (
              <Field key={row.passengers} label={`${row.passengers} passenger${row.passengers > 1 ? 's' : ''} ×`}>
                <input type="number" step="0.1" className={inputCls} value={row.multiplier}
                  onChange={(e) => setMulti(num(multi, i, 'multiplier', e.target.value))} />
              </Field>
            ))}
          </div>
        </Section>
      )}

      {/* Night & rounding */}
      {fs && (
        <Section title="Night charge & rounding" onSave={saveFareSettings}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Field label="Night starts">
              <input type="time" className={inputCls} value={(fs.night_start || '').slice(0, 5)}
                onChange={(e) => setFs({ ...fs, night_start: e.target.value })} />
            </Field>
            <Field label="Night ends">
              <input type="time" className={inputCls} value={(fs.night_end || '').slice(0, 5)}
                onChange={(e) => setFs({ ...fs, night_end: e.target.value })} />
            </Field>
            <Field label="Night multiplier (1.5 = +50%)">
              <input type="number" step="0.1" className={inputCls} value={fs.night_multiplier}
                onChange={(e) => setFs({ ...fs, night_multiplier: e.target.value })} />
            </Field>
            <Field label="Round up to nearest ₹">
              <input type="number" step="1" className={inputCls} value={fs.rounding}
                onChange={(e) => setFs({ ...fs, rounding: e.target.value })} />
            </Field>
          </div>
        </Section>
      )}

      {/* Service area */}
      {zone && (
        <Section title="Service area" subtitle="Centre + radius of the zone you serve." onSave={saveZone}>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Centre longitude">
              <input className={inputCls} placeholder="89.724015" value={zone.lng}
                onChange={(e) => setZone({ ...zone, lng: e.target.value })} />
            </Field>
            <Field label="Centre latitude">
              <input className={inputCls} placeholder="26.470342" value={zone.lat}
                onChange={(e) => setZone({ ...zone, lat: e.target.value })} />
            </Field>
            <Field label="Radius (metres)">
              <input type="number" className={inputCls} value={zone.radius_m}
                onChange={(e) => setZone({ ...zone, radius_m: e.target.value })} />
            </Field>
          </div>
          <p className="text-[11px] text-ink/50 mt-2">Leave longitude/latitude blank to change only the radius.</p>
        </Section>
      )}

      {/* Platform */}
      {platform && (
        <Section title="Platform" subtitle="No commission is charged — drivers keep the full fare." onSave={savePlatform}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Minimum withdrawal (₹)">
              <input type="number" className={inputCls} value={platform.min_withdrawal ?? ''}
                onChange={(e) => setPlatform({ ...platform, min_withdrawal: e.target.value })} />
            </Field>
            <Field label="Driver match radius (m)">
              <input type="number" className={inputCls} value={platform.max_match_radius_m ?? ''}
                onChange={(e) => setPlatform({ ...platform, max_match_radius_m: e.target.value })} />
            </Field>
            <Field label="Platform UPI ID">
              <input className={inputCls} value={platform.platform_upi_id ?? ''}
                onChange={(e) => setPlatform({ ...platform, platform_upi_id: e.target.value })} />
            </Field>
          </div>
        </Section>
      )}

      {/* Cancellation */}
      {cancel && (
        <Section title="Cancellation policy" onSave={saveCancel}>
          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!cancel.rider_free_before_arrived}
                onChange={(e) => setCancel({ ...cancel, rider_free_before_arrived: e.target.checked })} />
              Free cancel before driver arrives
            </label>
            <Field label="Cancel fee after that (₹)">
              <input type="number" className={inputCls} value={cancel.rider_cancel_fee}
                onChange={(e) => setCancel({ ...cancel, rider_cancel_fee: e.target.value })} />
            </Field>
            <Field label="Request expiry (seconds)">
              <input type="number" className={inputCls} value={cancel.request_expiry_seconds}
                onChange={(e) => setCancel({ ...cancel, request_expiry_seconds: e.target.value })} />
            </Field>
          </div>
        </Section>
      )}
    </div>
  )
}
