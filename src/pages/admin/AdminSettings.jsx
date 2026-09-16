import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [zone, setZone] = useState(null)
  const [fares, setFares] = useState([])
  const [multi, setMulti] = useState([])
  const [cancel, setCancel] = useState(null)
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    const [s, z, f, m, c] = await Promise.all([
      supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('service_zones').select('id,name,radius_m,is_active').eq('id', 1).maybeSingle(),
      supabase.from('fare_config').select('*').order('vehicle_type'),
      supabase.from('toto_passenger_multipliers').select('*').order('passengers'),
      supabase.from('cancellation_policy').select('*').eq('id', 1).maybeSingle(),
    ])
    setSettings(s.data)
    setZone({ ...(z.data || {}), lng: '', lat: '' })
    setFares(f.data || [])
    setMulti(m.data || [])
    setCancel(c.data)
    setLoading(false)
  }
  useEffect(() => {
    loadAll()
  }, [])

  function flash(msg) {
    setSaved(msg)
    setError('')
    setTimeout(() => setSaved(''), 2500)
  }
  function fail(e) {
    setError(e?.message || 'Could not save.')
  }

  async function saveSettings() {
    const { commission_rate, min_withdrawal, max_match_radius_m, platform_upi_id } = settings
    const { error } = await supabase
      .from('platform_settings')
      .update({ commission_rate, min_withdrawal, max_match_radius_m, platform_upi_id })
      .eq('id', 1)
    error ? fail(error) : flash('Platform settings saved')
  }

  async function saveFare(f) {
    const { error } = await supabase
      .from('fare_config')
      .update({
        base_fare: f.base_fare,
        per_km_rate: f.per_km_rate,
        minimum_fare: f.minimum_fare,
        night_surcharge: f.night_surcharge,
        surge_multiplier: f.surge_multiplier,
      })
      .eq('vehicle_type', f.vehicle_type)
    error ? fail(error) : flash(`${f.vehicle_type} fare saved`)
  }

  async function saveMulti(row) {
    const { error } = await supabase
      .from('toto_passenger_multipliers')
      .update({ multiplier: row.multiplier, flat_extra: row.flat_extra })
      .eq('passengers', row.passengers)
    error ? fail(error) : flash('Toto multiplier saved')
  }

  async function saveCancel() {
    const { error } = await supabase
      .from('cancellation_policy')
      .update({
        rider_free_before_arrived: cancel.rider_free_before_arrived,
        rider_cancel_fee: cancel.rider_cancel_fee,
        request_expiry_seconds: cancel.request_expiry_seconds,
      })
      .eq('id', 1)
    error ? fail(error) : flash('Cancellation policy saved')
  }

  async function saveZone() {
    if (zone.lng === '' || zone.lat === '') {
      // just update radius
      const { error } = await supabase.from('service_zones').update({ radius_m: zone.radius_m }).eq('id', 1)
      error ? fail(error) : flash('Service radius saved')
      return
    }
    const { data, error } = await supabase.rpc('admin_set_service_zone', {
      p_id: 1,
      p_lng: Number(zone.lng),
      p_lat: Number(zone.lat),
      p_radius_m: Number(zone.radius_m),
    })
    if (error || !data?.ok) fail(error || { message: 'Could not update the zone.' })
    else flash('Service area saved')
  }

  if (loading) return <div className="text-sm text-ink/50">Loading…</div>

  const Field = ({ label, children }) => (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/60 mb-1">{label}</span>
      {children}
    </label>
  )
  const inputCls = 'w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm outline-none focus:border-leafbright'
  const Section = ({ title, children, onSave }) => (
    <div className="bg-white rounded-2xl border border-mist p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-forest">{title}</h3>
        <button onClick={onSave} className="rounded-lg bg-forest text-white text-xs font-semibold px-3 py-1.5 hover:bg-leaf">
          Save
        </button>
      </div>
      {children}
    </div>
  )

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-forest mb-1">Settings</h2>
      <p className="text-sm text-ink/60 mb-4">Changes apply to the website and the app instantly.</p>

      {saved && (
        <div className="mb-3 text-xs font-semibold text-forest bg-leafbright/15 border border-leafbright/30 rounded-lg px-3 py-2">
          ✓ {saved}
        </div>
      )}
      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Platform */}
      {settings && (
        <Section title="Platform & commission" onSave={saveSettings}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Commission rate (e.g. 0.06 = 6%)">
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={settings.commission_rate}
                onChange={(e) => setSettings({ ...settings, commission_rate: e.target.value })}
              />
            </Field>
            <Field label="Minimum withdrawal (₹)">
              <input
                type="number"
                className={inputCls}
                value={settings.min_withdrawal}
                onChange={(e) => setSettings({ ...settings, min_withdrawal: e.target.value })}
              />
            </Field>
            <Field label="Match radius (metres)">
              <input
                type="number"
                className={inputCls}
                value={settings.max_match_radius_m}
                onChange={(e) => setSettings({ ...settings, max_match_radius_m: e.target.value })}
              />
            </Field>
            <Field label="Platform UPI ID">
              <input
                className={inputCls}
                value={settings.platform_upi_id}
                onChange={(e) => setSettings({ ...settings, platform_upi_id: e.target.value })}
              />
            </Field>
          </div>
        </Section>
      )}

      {/* Service area */}
      {zone && (
        <Section title="Service area (15 km zone)" onSave={saveZone}>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Centre longitude">
              <input className={inputCls} placeholder="89.6583" value={zone.lng}
                onChange={(e) => setZone({ ...zone, lng: e.target.value })} />
            </Field>
            <Field label="Centre latitude">
              <input className={inputCls} placeholder="26.2836" value={zone.lat}
                onChange={(e) => setZone({ ...zone, lat: e.target.value })} />
            </Field>
            <Field label="Radius (metres)">
              <input type="number" className={inputCls} value={zone.radius_m}
                onChange={(e) => setZone({ ...zone, radius_m: e.target.value })} />
            </Field>
          </div>
          <p className="text-[11px] text-ink/50 mt-2">
            Leave longitude/latitude blank to change only the radius. To move the centre, right-click the spot in
            Google Maps to copy its lat/long, then paste (longitude first here).
          </p>
        </Section>
      )}

      {/* Fares */}
      <Section title="Fares per vehicle" onSave={() => fares.forEach(saveFare)}>
        <div className="space-y-3">
          {fares.map((f, i) => (
            <div key={f.vehicle_type} className="border border-mist rounded-xl p-3">
              <div className="text-sm font-semibold text-forest capitalize mb-2">{f.vehicle_type}</div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {['base_fare', 'per_km_rate', 'minimum_fare', 'night_surcharge', 'surge_multiplier'].map((k) => (
                  <Field key={k} label={k.replace(/_/g, ' ')}>
                    <input
                      type="number"
                      step="0.1"
                      className={inputCls}
                      value={f[k]}
                      onChange={(e) => {
                        const copy = [...fares]
                        copy[i] = { ...f, [k]: e.target.value }
                        setFares(copy)
                      }}
                    />
                  </Field>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Toto multipliers */}
      <Section title="Toto passenger multipliers" onSave={() => multi.forEach(saveMulti)}>
        <div className="grid grid-cols-4 gap-2">
          {multi.map((row, i) => (
            <div key={row.passengers} className="border border-mist rounded-xl p-2 text-center">
              <div className="text-xs font-semibold text-ink/60">{row.passengers} pax</div>
              <Field label="×">
                <input type="number" step="0.1" className={inputCls} value={row.multiplier}
                  onChange={(e) => { const c = [...multi]; c[i] = { ...row, multiplier: e.target.value }; setMulti(c) }} />
              </Field>
              <Field label="+₹">
                <input type="number" className={inputCls} value={row.flat_extra}
                  onChange={(e) => { const c = [...multi]; c[i] = { ...row, flat_extra: e.target.value }; setMulti(c) }} />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      {/* Cancellation */}
      {cancel && (
        <Section title="Cancellation policy" onSave={saveCancel}>
          <div className="grid grid-cols-2 gap-3 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cancel.rider_free_before_arrived}
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
