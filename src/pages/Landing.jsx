import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { useAuth } from '../lib/AuthContext'
import logoFull from '../assets/dooarsgo-logo-full.png'
import logoMark from '../assets/dooarsgo-logo-mark.png'
import heroCar from '../assets/hero-car.jpg'
import heroBike from '../assets/hero-bike.jpg'
import heroToto from '../assets/hero-toto.jpg'

const WHATSAPP_NUMBER = '919239514925'
const DISPLAY_NUMBER = '9239514925'
const GENERAL_EMAIL = 'dooarsgo@gmail.com'
const SUPPORT_EMAIL = 'support.dooarsgo@gmail.com'
const SITE_URL = 'https://www.dooarsgo.online'
const SERVICE_AREA = 'Chepani, Kamakhyaguri, Barobisha and nearby Dooars areas'

// >>> PASTE YOUR REAL SOCIAL LINKS HERE (these are demo links for now) <<<
const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/dooarsgo',           // your Facebook profile
  instagram: 'https://instagram.com/dooarsgo',         // your Instagram
  page: 'https://facebook.com/dooarsgo.page',          // your Facebook PAGE
  linkedin: 'https://linkedin.com/company/dooarsgo',   // your LinkedIn
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
        Book Toto, Bike, or Car -- From Home!
      </div>

      <section id="top" className="relative overflow-hidden bg-gradient-to-b from-[#ecfdf5] to-white px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <img src={logoMark} alt="DooarsGo" className="mx-auto mb-4 h-16 w-16 object-contain sm:h-20 sm:w-20" style={{ animation: 'dg-float 3s ease-in-out infinite' }} />
              <span className="dg-pulse mb-3 inline-block rounded-2xl bg-[#facc15] px-4 py-1.5 text-[11px] font-extrabold text-[#14532d] shadow-sm sm:text-sm">🌲ডুয়ার্স এখন ডিজিটাল — Book your ride, pay and ride 🚗</span>
              <h1 className="text-3xl font-extrabold leading-tight text-[#14532d] sm:text-5xl">
                Your local ride, when you want.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-slate-600">
                Toto, bike, or car -- booked with one call or a WhatsApp message, straight from your home across rural Dooars.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to={user ? '/book' : '/login'} className="rounded-lg bg-[#15803d] px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-[#14532d]">Book a ride</Link>
                <Link to="/login/driver" className="rounded-lg border-2 border-[#15803d] px-6 py-3 text-sm font-bold text-[#15803d] transition-transform hover:scale-105 hover:bg-[#ecfdf5]">Become a Driver</Link>
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
            </div>
          </div>
        </Reveal>
      </section>

      <footer id="contact" className="bg-[#064e3b] px-4 py-12 text-slate-200 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <img src={logoFull} alt="DooarsGo" className="h-9 w-auto brightness-0 invert" />
            <p className="mt-3 max-w-xs text-sm text-slate-300">Affordable, reliable Toto, Bike, and Cab rides for {SERVICE_AREA}.</p>
            <a href={SITE_URL} className="mt-2 block text-sm font-semibold text-emerald-300 hover:text-white">www.dooarsgo.online</a>
            <div className="mt-4 flex gap-2">
              <SocialIcon href={SOCIAL_LINKS.facebook} label="Facebook" path="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
              <SocialIcon href={SOCIAL_LINKS.instagram} label="Instagram" path="M12 2c2.7 0 3 0 4.1.1 1.1 0 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1.1.4 2.2.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c0 1.1-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.3-2.2.4-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-1.1 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1.1-.4-2.2C2 15 2 14.7 2 12s0-3 .1-4.1c0-1.1.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.3 2.2-.4C9 2 9.3 2 12 2Zm0 3.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm4.7-2a1.1 1.1 0 1 1 0 2.1 1.1 1.1 0 0 1 0-2.1Z" />
              <SocialIcon href={SOCIAL_LINKS.linkedin} label="LinkedIn" path="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM7 20.4H3.6V9H7v11.4Z" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Site map</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#top" className="hover:text-white">Home</a></li>
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href="#drivers" className="hover:text-white">Join as driver</a></li>
              <li><a href="#book" className="hover:text-white">Book a ride</a></li>
              <li><Link to="/team" className="hover:text-white">Our team</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href={`tel:${DISPLAY_NUMBER}`} className="hover:text-white">+91 {DISPLAY_NUMBER}</a></li>
              <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-white">WhatsApp support</a></li>
              <li><a href={`mailto:${GENERAL_EMAIL}`} className="hover:text-white">{GENERAL_EMAIL}</a></li>
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">{SUPPORT_EMAIL}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Developer &amp; Architect</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-slate-300">Biswadip Bhattacharjee</li>
              <li><a href="https://www.biswadip.online" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-300 hover:text-white">biswadip.online</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Social</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a></li>
              <li><a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a></li>
              <li><a href={SOCIAL_LINKS.page} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook Page</a></li>
              <li><a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-6xl text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} DooarsGo and Biswadip Bhattacharjee. All rights reserved.</p>
      </footer>
    </div>
  )
}
