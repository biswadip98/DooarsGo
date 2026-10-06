import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { useAuth } from '../lib/AuthContext'
import logoFull from '../assets/dooarsgo-logo-full.png'
import logoMark from '../assets/dooarsgo-logo-mark.png'
import heroCar from '../assets/hero-car.jpg'
import heroBike from '../assets/hero-bike.jpg'
import heroToto from '../assets/hero-toto.jpg'

const WHATSAPP_NUMBER = '919239519425'
const DISPLAY_NUMBER = '9239519425'
const GENERAL_EMAIL = 'dooarsgo@gmail.com'
const SUPPORT_EMAIL = 'support.dooarsgo@gmail.com'

const FAQS = [
  { q: 'How do I book a ride?', a: 'Set your pickup and drop, choose Toto, Bike or Car, and tap "Check fare". You see the exact price before you confirm — no surprises.' },
  { q: 'Which areas do you serve?', a: 'We currently serve Chepani, Kamakhyaguri, Barobisha and nearby Dooars areas, within about a 15 km zone.' },
  { q: 'Are there any hidden charges or commission?', a: 'No. The fare shown is what you pay, and drivers keep 100% — we take no commission. For cars, only actual toll-gate charges (if any) are paid separately by the rider.' },
  { q: 'How do I pay?', a: 'You pay the driver directly by cash or UPI at the end of the ride. There are no online payment fees.' },
  { q: 'What if no driver is available?', a: 'If no driver accepts within about 10 minutes, the request closes and you can simply book again.' },
  { q: 'How do I become a driver?', a: 'Tap "Become a driver", register with your documents (plus a licence for Bike/Car), and accept the safety terms. Our team verifies and approves you.' },
  { q: 'Is the ride safe?', a: 'Every driver is ID-verified (and licence-verified for Bike/Car). You also get a pickup code the driver must confirm before the ride can start.' },
  { q: 'Can I cancel a ride?', a: 'Yes, before the ride starts. Please avoid repeated cancellations — too many in a short time briefly pauses your booking, to stay fair to drivers.' },
]
const SITE_URL = 'https://www.dooarsgo.online'
const SERVICE_AREA = 'Chepani, Kamakhyaguri, Barobisha and nearby Dooars areas'

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/1DTgW4oeTc/',
  instagram: 'https://www.instagram.com/dooarsgo',
  page: 'https://www.facebook.com/share/1JdWGuHNtC/',
  linkedin: 'https://www.linkedin.com/in/dooarsgo',
}

// Big cell = Car, small cells = Bike + Toto.
const FLEET_PHOTOS = { car: heroCar, bike: heroBike, toto: heroToto }

const BADGES = [
  { label: 'Safe Journey', icon: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 3.2 5.5 2.1v4c0 3.7-2.4 7.1-5.5 8.4-3.1-1.3-5.5-4.7-5.5-8.4v-4L12 5.2Z' },
  { label: 'Fast Service', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v5.4l4 2.3-1 1.6-5-2.9V7h2Z' },
  { label: 'Reach Local Area Easily', icon: 'M12 2c-4 0-7 3-7 7 0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z' },
  { label: 'Easy Payment', icon: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1H3V6Zm0 3h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Zm3 6h5v2H6v-2Z' },
]

const PILLARS = [
  { title: 'Verified drivers', body: 'Every driver on DooarsGo is ID-checked and reviewed before their first ride.' },
  { title: 'Pickup at your door', body: "No walking to a stand -- the ride comes to wherever you're standing." },
  { title: 'Reaches every village', body: "Built for Dooars' rural roads and tea-garden lanes, not just the highway." },
  { title: 'Fare shown upfront', body: 'You see the price before you ride. No surprise surge, no haggling.' },
]

function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}>
      {children}
    </div>
  )
}

// ---- Install App (PWA) ----------------------------------------------------
// Captures Android/Chrome's install prompt and offers a one-tap install.
// On iPhone (which blocks auto-install) it shows the Add-to-Home-Screen steps.
function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e) }
    const onInstalled = () => { setInstalled(true); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  return { deferred, installed, setDeferred }
}

function InstallButton() {
  const { deferred, installed, setDeferred } = useInstallPrompt()
  const [showIosHelp, setShowIosHelp] = useState(false)
  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  if (installed) return null

  async function handleClick() {
    if (deferred) {
      deferred.prompt()
      try { await deferred.userChoice } catch (_) {}
      setDeferred(null)
    } else if (isIos) {
      setShowIosHelp(true)
    } else {
      // Fallback for browsers that haven't fired the prompt yet.
      setShowIosHelp(true)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-lg border-2 border-[#15803d] px-6 py-3 text-sm font-bold text-[#15803d] transition-transform hover:scale-105 hover:bg-[#ecfdf5]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3a1 1 0 0 1 1 1v9.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L11 13.6V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
        </svg>
        Install App
      </button>

      {showIosHelp && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-5" onClick={() => setShowIosHelp(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-2">📲</div>
            <h3 className="text-lg font-extrabold text-[#14532d]">Install DooarsGo</h3>
            <p className="mt-2 text-sm text-slate-600">
              {isIos
                ? 'Tap the Share button in Safari, then choose "Add to Home Screen".'
                : 'Open your browser menu (⋮) and tap "Install app" or "Add to Home screen".'}
            </p>
            <button onClick={() => setShowIosHelp(false)} className="mt-4 w-full rounded-lg bg-[#15803d] py-2.5 text-sm font-semibold text-white hover:bg-[#14532d]">Got it</button>
          </div>
        </div>
      )}
    </>
  )
}

function FleetPhoto({ src, label }) {
  if (src) {
    return (
      <div className="group relative flex h-full w-full flex-col items-center justify-end overflow-hidden rounded-2xl border border-[#bbf7d0] bg-gradient-to-b from-[#ecfdf5] to-white p-3 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
        <img src={src} alt={label} className="h-full w-full flex-1 object-contain" />
        <span className="mt-2 rounded-md bg-[#14532d] px-3 py-1 text-xs font-bold text-white">{label}</span>
      </div>
    )
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#15803d]/40 bg-white/70 text-center">
      <span className="text-xs font-bold text-[#15803d]">{label}</span>
    </div>
  )
}

function SocialIcon({ href, label, path }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={path} /></svg>
    </a>
  )
}

export default function Landing() {
  const auth = useAuth() || {}
  const user = auth.user ?? auth.session?.user ?? null

  return (
    <div className="min-h-screen bg-white text-slate-900 [font-family:'Inter',system-ui,sans-serif]">
      <style>{`
        @keyframes dg-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .dg-pulse { animation: dg-pulse 2.4s ease-in-out infinite; }
        @keyframes dg-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
      `}</style>

      <div className="bg-[#14532d] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        Serving {SERVICE_AREA}
      </div>

      <PublicHeader />

      <div className="bg-[#14532d] px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
        Book Toto, Bike, or Car — From Home!
      </div>

      <section id="top" className="relative overflow-hidden bg-gradient-to-b from-[#ecfdf5] to-white px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <img src={logoMark} alt="DooarsGo" className="mx-auto mb-4 h-16 w-16 object-contain sm:h-20 sm:w-20" style={{ animation: 'dg-float 3s ease-in-out infinite' }} />
              <span className="dg-pulse mb-3 inline-block rounded-2xl bg-[#facc15] px-4 py-1.5 text-[11px] font-extrabold text-[#14532d] shadow-sm sm:text-sm">🌟 New in Dooars — go digital, book your ride, pay per ride.</span>
              <h1 className="text-3xl font-extrabold leading-tight text-[#14532d] sm:text-5xl">
                Book Toto, Bike or Car — From Home!
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-600">
                Toto, bike, or car — Book a Toto, Bike, or Car from home — by app, call, or WhatsApp — across your local Dooars area.
              </p>
              <p className="mx-auto mt-2 max-w-md text-base font-semibold text-[#15803d]" lang="bn">টোটো, বাইক বা গাড়ি — ঘরে বসেই বুক করুন।</p>
              <div className="mt-7 flex flex-col items-center gap-3">
                <Link to={user ? '/book' : '/login'} className="w-full max-w-xs rounded-xl bg-[#15803d] px-8 py-4 text-center text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#14532d]">Book a Ride</Link>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/login/driver" className="rounded-lg border-2 border-[#15803d] px-6 py-3 text-sm font-bold text-[#15803d] transition-transform hover:scale-105 hover:bg-[#ecfdf5]">Become a Driver</Link>
                  <InstallButton />
                </div>
              </div>
              <a href={`tel:+91${DISPLAY_NUMBER}`} className="mt-4 inline-block text-sm font-bold text-[#14532d] hover:underline">📞 Need Help? Call or WhatsApp: +91 {DISPLAY_NUMBER}</a>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-bold text-[#15803d]">
                <span>✓ ID &amp; licence-verified drivers</span>
                <span>✓ Safe, tracked rides</span>
                <span>✓ 0% commission</span>
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="h-72 sm:h-80"><FleetPhoto src={FLEET_PHOTOS.car} label="Car / Cab" /></div>
            <div className="h-72 sm:h-80"><FleetPhoto src={FLEET_PHOTOS.toto} label="Toto" /></div>
            <div className="h-72 sm:h-80"><FleetPhoto src={FLEET_PHOTOS.bike} label="Bike" /></div>
          </Reveal>

          <Reveal className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {BADGES.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2 text-center transition-transform hover:-translate-y-1">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#15803d] text-white shadow-md">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={b.icon} /></svg>
                </span>
                <span className="text-xs font-bold text-slate-700 sm:text-sm">{b.label}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="bg-[#14532d] px-4 py-3 text-center text-sm font-semibold text-white sm:text-base">Service Area: {SERVICE_AREA}</div>

      <div className="bg-gradient-to-r from-[#facc15] to-[#eab308] px-4 py-4 text-center">
        <span className="dg-pulse inline-block text-2xl font-extrabold text-[#14532d] sm:text-3xl">50% Off First Ride</span>
      </div>

      <section id="services" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal><h2 className="text-2xl font-extrabold text-[#14532d]">Why people ride with DooarsGo</h2></Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <Reveal key={p.title}>
              <div className="h-full rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-lg">
                <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="book" className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <Reveal>
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Call or WhatsApp to book</p>
              <a href={`tel:${DISPLAY_NUMBER}`} className="text-3xl font-extrabold text-[#14532d] transition-colors hover:text-[#15803d]">{DISPLAY_NUMBER.slice(0, 5)} {DISPLAY_NUMBER.slice(5)}</a>
              <p className="mt-2 text-xs text-slate-500">Need help instead? <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#15803d]">{SUPPORT_EMAIL}</a></p>
            </div>
            <div className="flex items-center gap-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`https://wa.me/${WHATSAPP_NUMBER}`)}`} alt="Scan to chat with DooarsGo on WhatsApp" width={110} height={110} className="rounded-lg border border-slate-200" />
              <p className="max-w-[9rem] text-sm font-semibold text-slate-600">Scan to chat on WhatsApp</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="drivers" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="grid items-center gap-8 rounded-2xl bg-[#14532d] p-8 text-white sm:p-10 md:grid-cols-2">
            <div>
              <span className="inline-block rounded bg-[#facc15] px-2 py-1 text-xs font-extrabold text-[#14532d]">Free registration</span>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Join as a Driver</h2>
              <p className="text-sm font-bold text-emerald-200">Toto, Bike, Car, Cab &middot; &#8377;0 registration fee</p>
              <ul className="mt-5 space-y-2 text-sm text-emerald-50">
                <li className="flex items-center gap-2"><span className="text-[#facc15]">&#10003;</span> Keep your full fare, zero registration charges</li>
                <li className="flex items-center gap-2"><span className="text-[#facc15]">&#10003;</span> Work your own hours, part-time or full-time</li>
                <li className="flex items-center gap-2"><span className="text-[#facc15]">&#10003;</span> Local bookings from your own service area</li>
              </ul>
            </div>
            <div className="text-left md:text-right">
              <Link to="/signup/driver" className="inline-block rounded-lg bg-[#facc15] px-6 py-3 text-sm font-extrabold text-[#14532d] transition-transform hover:scale-105 hover:bg-[#eab308]">Join as a driver</Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="about" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 text-center sm:flex-row sm:text-left">
            <img src={logoMark} alt="DooarsGo" className="h-20 w-20 shrink-0 rounded-full border-4 border-[#facc15] object-cover" />
            <div>
              <p className="italic text-slate-700">"DooarsGo was born out of a commitment to connect our villages and tea garden areas with reliable, everyday transit. We're building technology that directly serves our local community."</p>
              <p className="mt-3 text-sm font-bold text-slate-900">Biswadip Bhattacharjee</p>
              <p className="text-xs text-slate-500">Founder &amp; Developer, DooarsGo</p>
              <a href="mailto:biswadip@dooarsgo.online" className="mt-2 inline-block text-sm font-bold text-[#15803d] hover:underline">📧 biswadip@dooarsgo.online</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Help & Support — FAQ */}
      <section id="faq" className="bg-[#ecfdf5] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#15803d]/10 px-3 py-1 text-xs font-bold text-[#15803d]">Help &amp; Support</span>
            <h2 className="mt-3 text-3xl font-extrabold text-[#14532d] sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-2 text-slate-600">Quick answers to what riders and drivers ask us most.</p>
          </div>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  {f.q}
                  <svg className="h-5 w-5 shrink-0 text-[#15803d] transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-sm font-semibold text-slate-700">Still need help? We're happy to assist.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="rounded-lg bg-[#15803d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14532d]">Email support</a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="rounded-lg border border-[#15803d] px-4 py-2 text-sm font-semibold text-[#15803d] hover:bg-[#15803d]/5">WhatsApp us</a>
            </div>
            <p className="mt-3 text-xs text-slate-500">{SUPPORT_EMAIL}</p>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#064e3b] px-4 py-12 text-slate-200 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="inline-block rounded-xl bg-white p-2 shadow-sm">
              <img src={logoFull} alt="DooarsGo" className="h-9 w-auto" />
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-300">Affordable, reliable Toto, Bike, and Cab rides for {SERVICE_AREA}.</p>
            <a href={SITE_URL} className="mt-2 block text-sm font-semibold text-emerald-300 hover:text-white">www.dooarsgo.online</a>
            <div className="mt-4 flex gap-2">
              <SocialIcon href={SOCIAL_LINKS.facebook} label="Facebook" path="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
              <SocialIcon href={SOCIAL_LINKS.instagram} label="Instagram" path="M12 2c2.7 0 3 0 4.1.1 1.1 0 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1.1.4 2.2.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1.1-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.3-2.2.4-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1.1 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1.1-.4-2.2C2 15 2 14.7 2 12s0-3 .1-4.1c0-1.1.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.3 2.2-.4C9 2 9.3 2 12 2Zm0 3.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm4.7-2a1.1 1.1 0 1 1 0 2.1 1.1 1.1 0 0 1 0-2.1Z" />
              <SocialIcon href={SOCIAL_LINKS.linkedin} label="LinkedIn" path="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM7 20.4H3.6V9H7v11.4Z" />
            </div>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#top" className="hover:text-white">Home</a></li>
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href="#drivers" className="hover:text-white">Join as driver</a></li>
              <li><a href="#book" className="hover:text-white">Book a ride</a></li>
              <li><Link to="/team" className="hover:text-white">Our team</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold text-white">Help &amp; Support</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><a href={`tel:+91${DISPLAY_NUMBER}`} className="hover:text-white">+91 {DISPLAY_NUMBER}</a></li>
              <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-white">WhatsApp support</a></li>
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">{SUPPORT_EMAIL}</a></li>
              <li><a href={`mailto:${GENERAL_EMAIL}`} className="hover:text-white">{GENERAL_EMAIL}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-white">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white">Social</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
              <li><a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a></li>
              <li><a href={SOCIAL_LINKS.page} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook Page</a></li>
              <li><a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center gap-2 text-center text-xs text-slate-400 sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {new Date().getFullYear()} DooarsGo | Biswadip Bhattacharjee. All rights reserved.</p>
          <p>Developed &amp; architected by <a href="https://www.biswadip.online" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-300 hover:text-white"> 
          Biswadip Bhattacharjee | www.biswadip.online</a></p>
        </div>
      </footer>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with DooarsGo on WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
        </svg>
      </a>
    </div>
  )
}
