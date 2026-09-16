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
  })
  const [selfie, setSelfie] = useState(null)
  const [aadhaar, setAadhaar] = useState(null)
  const [vehiclePhoto, setVehiclePhoto] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

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
    if (!selfie || !aadhaar || !vehiclePhoto) {
      setError('Please add all three photos.')
      return
    }
    setBusy(true)
    try {
      // Uploads
      const selfiePath = await upload('avatars', 'selfie.jpg', selfie)
      const aadhaarPath = await upload('kyc', 'aadhaar.jpg', aadhaar)
      const vehiclePath = await upload('vehicle-photos', 'vehicle.jpg', vehiclePhoto)
      const avatarUrl = supabase.storage.from('avatars').getPublicUrl(selfiePath).data.publicUrl

      // KYC record
      const { error: dvErr } = await supabase.from('driver_verifications').insert({
        driver_id: user.id,
        full_name: form.fullName.trim(),
        contact: form.contact.trim(),
        aadhaar_url: aadhaarPath,
        vehicle_photo_url: vehiclePath,
        vehicle_type: form.vehicleType,
        vehicle_number: form.vehicleNumber.trim().toUpperCase(),
        status: 'pending',
      })
      if (dvErr) throw dvErr

      // Flag the profile as a pending driver
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-3 border-b border-black/5 bg-white/80 backdrop-blur flex items-center justify-between">
        <Brand size={34} />
        <Link to="/home" className="text-sm font-semibold text-forest">← Home</Link>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-5">
        <h1 className="font-display text-2xl font-bold text-forest">Join as a driver</h1>
        <p className="text-ink/60 text-sm mt-1 mb-5">We verify every partner for rider safety.</p>

        <div className="space-y-3">
          {error && (
            <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <input value={form.fullName} onChange={set('fullName')} placeholder="Full name"
            className="w-full rounded-xl border border-mist bg-white px-3 py-3 text-sm outline-none focus:border-leafbright" />
          <input value={form.contact} onChange={set('contact')} placeholder="Contact number"
            className="w-full rounded-xl border border-mist bg-white px-3 py-3 text-sm outline-none focus:border-leafbright" />

          <div className="flex gap-2">
            {VEHICLES.map((v) => (
              <button key={v.key} onClick={() => setForm({ ...form, vehicleType: v.key })}
                className={`flex-1 rounded-xl border p-2.5 text-xs font-semibold ${
                  form.vehicleType === v.key ? 'border-leafbright bg-leafbright/10 text-forest' : 'border-mist text-ink/60'
                }`}>
                <span className="block text-xl">{v.icon}</span>{v.label}
              </button>
            ))}
          </div>

          <input value={form.vehicleNumber} onChange={set('vehicleNumber')} placeholder="Vehicle number (e.g. WB73 C 1234)"
            className="w-full rounded-xl border border-mist bg-white px-3 py-3 text-sm outline-none focus:border-leafbright" />

          <div className="flex gap-2">
            {fileField('Your photo', selfie, setSelfie)}
            {fileField('Aadhaar', aadhaar, setAadhaar)}
            {fileField('Vehicle', vehiclePhoto, setVehiclePhoto)}
          </div>

          <button onClick={handleSubmit} disabled={busy}
            className="w-full rounded-xl bg-forest text-white font-semibold py-3 text-sm hover:bg-leaf disabled:opacity-60">
            {busy ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </main>
    </div>
  )
}
