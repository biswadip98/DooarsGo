import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import Brand from '../../components/Brand'

const VEHICLES = [
  { key: 'toto', label: 'Toto', icon: '🛺' },
  { key: 'bike', label: 'Bike', icon: '🏍️' },
  { key: 'car', label: 'Car', icon: '🚗' },
]

export default function DriverRegister() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    contact: profile?.phone || '',
    vehicleType: 'toto',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleMileage: '',
    licenseNumber: '',
  })
  const [selfie, setSelfie] = useState(null)
  const [aadhaar, setAadhaar] = useState(null)
  const [vehiclePhoto, setVehiclePhoto] = useState(null)
  const [licenseFront, setLicenseFront] = useState(null)
  const [licenseBack, setLicenseBack] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const needsLicense = form.vehicleType === 'bike' || form.vehicleType === 'car' // Toto has no licence

  async function upload(bucket, name, file) {
    const path = `${user.id}/${name}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    return path
  }

  async function handleSubmit() {
    setError('')
    if (!form.fullName || !form.contact || !form.vehicleNumber) {
      setError('Please fill name, contact, and vehicle number.')
      return
    }
    if (needsLicense && (!form.vehicleModel || !form.licenseNumber)) {
      setError('Please add the vehicle name/model and your driving licence number.')
      return
    }
    if (!selfie || !aadhaar || !vehiclePhoto) {
      setError('Please add your photo, Aadhaar and vehicle photos.')
      return
    }
    if (needsLicense && (!licenseFront || !licenseBack)) {
      setError('Please add both sides of your driving licence.')
      return
    }
    if (!agreed) {
      setError('Please accept the safety terms to create your driver profile.')
      return
    }
    setBusy(true)
    try {
      const selfiePath = await upload('avatars', 'selfie.jpg', selfie)
      const aadhaarPath = await upload('kyc', 'aadhaar.jpg', aadhaar)
      const vehiclePath = await upload('vehicle-photos', 'vehicle.jpg', vehiclePhoto)
      const avatarUrl = supabase.storage.from('avatars').getPublicUrl(selfiePath).data.publicUrl

      let licenseFrontPath = null
      let licenseBackPath = null
      if (needsLicense) {
        licenseFrontPath = await upload('kyc', 'license-front.jpg', licenseFront)
        licenseBackPath = await upload('kyc', 'license-back.jpg', licenseBack)
      }

      const { error: dvErr } = await supabase.from('driver_verifications').insert({
        driver_id: user.id,
        full_name: form.fullName.trim(),
        contact: form.contact.trim(),
        aadhaar_url: aadhaarPath,
        vehicle_photo_url: vehiclePath,
        vehicle_type: form.vehicleType,
        vehicle_number: form.vehicleNumber.trim().toUpperCase(),
        vehicle_model: needsLicense ? form.vehicleModel.trim() : null,
        vehicle_mileage: needsLicense ? (form.vehicleMileage.trim() || null) : null,
        license_number: needsLicense ? form.licenseNumber.trim().toUpperCase() : null,
        license_front_url: licenseFrontPath,
        license_back_url: licenseBackPath,
        status: 'pending',
      })
      if (dvErr) throw dvErr

      const { error: pErr } = await supabase
        .from('profiles')
        .update({ is_driver: true, driver_status: 'pending', avatar_url: avatarUrl })
        .eq('id', user.id)
      if (pErr) throw pErr

      await refreshProfile()
      navigate('/driver')
    } catch (e) {
      setError(e.message || 'Something went wrong during registration.')
    } finally {
      setBusy(false)
    }
  }

  const fileField = (label, file, setFile) => (
    <label className="flex-1 cursor-pointer rounded-xl border border-mist bg-white p-3 text-center text-xs font-semibold text-ink/70 hover:border-leafbright">
      {file ? '✅ ' + label : '📷 ' + label}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
    </label>
  )

  const inputCls = 'w-full rounded-xl border border-mist bg-white px-3 py-3 text-sm outline-none focus:border-leafbright'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <Brand size={34} />
        <Link to="/home" className="text-sm font-semibold text-forest">Home</Link>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-5">
        <h1 className="font-display text-2xl font-bold text-forest">Join as a driver</h1>
        <p className="text-ink/60 text-sm mt-1 mb-5">We verify every partner for rider safety.</p>

        <div className="space-y-3">
          {error && (
            <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}

          <input value={form.fullName} onChange={set('fullName')} placeholder="Full name" className={inputCls} />
          <input value={form.contact} onChange={set('contact')} placeholder="Contact number" className={inputCls} />

          <div>
            <div className="text-xs font-semibold text-ink/60 mb-1">Which vehicle will you drive?</div>
            <div className="flex gap-2">
              {VEHICLES.map((v) => (
                <button key={v.key} onClick={() => { setForm({ ...form, vehicleType: v.key }); setAgreed(false) }}
                  className={`flex-1 rounded-xl border p-2.5 text-xs font-semibold ${
                    form.vehicleType === v.key ? 'border-leafbright bg-leafbright/10 text-forest' : 'border-mist text-ink/60'
                  }`}>
                  <span className="block text-xl">{v.icon}</span>{v.label}
                </button>
              ))}
            </div>
          </div>

          <input value={form.vehicleNumber} onChange={set('vehicleNumber')} placeholder="Vehicle number (e.g. WB73 C 1234)" className={inputCls} />

          {/* Bike/Car extra details */}
          {needsLicense && (
            <div className="rounded-xl border border-leafbright/40 bg-leafbright/5 p-3 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-forest">Vehicle & licence</div>
              <input value={form.vehicleModel} onChange={set('vehicleModel')}
                placeholder={form.vehicleType === 'car' ? 'Car name & model (e.g. Maruti Swift)' : 'Bike name & model (e.g. Honda Activa)'}
                className={inputCls} />
              <input value={form.vehicleMileage} onChange={set('vehicleMileage')}
                placeholder="Mileage (km/l) — optional" className={inputCls} />
              <input value={form.licenseNumber} onChange={set('licenseNumber')}
                placeholder="Driving licence number" className={inputCls} />
              <div className="flex gap-2">
                {fileField('Licence front', licenseFront, setLicenseFront)}
                {fileField('Licence back', licenseBack, setLicenseBack)}
              </div>
            </div>
          )}

          <div className="text-xs font-semibold text-ink/60 pt-1">Documents</div>
          <div className="flex gap-2">
            {fileField('Your photo', selfie, setSelfie)}
            {fileField('Aadhaar', aadhaar, setAadhaar)}
            {fileField('Vehicle', vehiclePhoto, setVehiclePhoto)}
          </div>

          {(() => {
            const terms = form.vehicleType === 'bike'
              ? 'I will always carry two helmets — one for me and one for my passenger — and make sure my passenger wears it. I will drive at a safe, normal speed, never ride after consuming alcohol or any drugs, and take full responsibility for the safety of my passenger on every trip.'
              : 'I will drive at a safe, normal and controlled speed, follow all traffic rules, never drive after consuming alcohol or any drugs, and take full responsibility for the comfort and safety of my passengers on every trip.'
            return (
              <label className="flex items-start gap-2 rounded-xl border border-mist bg-white p-3 text-xs text-ink/70 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#15803d]" />
                <span>
                  <b className="text-forest">Safety commitment ({form.vehicleType}):</b> {terms}
                </span>
              </label>
            )
          })()}

          <button onClick={handleSubmit} disabled={busy || !agreed}
            className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60">
            {busy ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </main>
    </div>
  )
}
