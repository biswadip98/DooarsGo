import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import logoFull from '../assets/dooarsgo-logo-full.png'
import logoMark from '../assets/dooarsgo-logo-mark.png'

// Demo team — logo used as the photo for now; swap names/roles/photos later.
const TEAM = [
  { name: 'Biswadip Bhattacharjee', role: 'Founder & Developer', bio: 'Building reliable local transit for the Dooars.' },
  { name: 'Team Member', role: 'Operations Lead', bio: 'Keeps rides, drivers and support running smoothly.' },
  { name: 'Team Member', role: 'Driver Relations', bio: 'Onboards and supports our driver partners.' },
  { name: 'Team Member', role: 'Customer Support', bio: 'Here to help riders before, during and after a trip.' },
  { name: 'Team Member', role: 'Technology', bio: 'Maintains the app, maps and booking platform.' },
  { name: 'Team Member', role: 'Community & Growth', bio: 'Grows DooarsGo across villages and tea-garden areas.' },
]

export default function Team() {
  return (
    <div className="min-h-screen bg-white text-slate-900 [font-family:'Inter',system-ui,sans-serif]">
      <style>{`
        @keyframes dg-up { from { opacity:0; transform: translateY(14px) } to { opacity:1; transform:none } }
        @keyframes dg-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      `}</style>

      <div className="bg-[#14532d] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        Serving Chepani, Kamakhyaguri, Barobisha and nearby Dooars areas
      </div>
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#ecfdf5] to-white px-4 py-16 sm:px-6">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
            <path d="M0 240 L200 170 L360 230 L540 150 L800 230 L800 300 L0 300 Z" fill="#86efac" opacity="0.4" />
            <path d="M0 270 L300 210 L560 260 L800 200 L800 300 L0 300 Z" fill="#4ade80" opacity="0.35" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-3xl text-center" style={{ animation: 'dg-up .6s ease-out both' }}>
          <img src={logoMark} alt="DooarsGo" className="mx-auto h-16 w-16 object-contain" style={{ animation: 'dg-float 3s ease-in-out infinite' }} />
          <span className="mt-4 inline-block rounded-full bg-[#15803d]/10 px-3 py-1 text-xs font-bold text-[#15803d]">Our team</span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#14532d] sm:text-4xl">The people behind DooarsGo</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            A small local team on a mission to connect every village and tea-garden lane with a safe, affordable ride.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ animation: `dg-up .5s ease-out ${i * 0.07}s both` }}>
              <div className="mx-auto h-24 w-24 rounded-full ring-4 ring-[#facc15]/40 overflow-hidden bg-[#ecfdf5] flex items-center justify-center">
                <img src={logoMark} alt={m.name} className="h-full w-full object-contain p-2" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{m.name}</h3>
              <p className="text-sm font-semibold text-[#15803d]">{m.role}</p>
              <p className="mt-2 text-sm text-slate-500">{m.bio}</p>
            </div>
          ))}
        </div>

        {/* Values strip */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: '🤝', t: 'Local first', b: 'Built by Dooars people, for Dooars people.' },
            { icon: '💚', t: 'Fair to drivers', b: 'Zero commission — drivers keep every rupee.' },
            { icon: '🛡️', t: 'Safe rides', b: 'Every driver is ID- and licence-verified.' },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <div className="text-3xl">{v.icon}</div>
              <div className="mt-2 text-sm font-bold text-[#14532d]">{v.t}</div>
              <p className="mt-1 text-xs text-slate-500">{v.b}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-[#14532d] p-8 text-center text-white sm:p-10">
          <h2 className="text-2xl font-extrabold">Want to join the journey?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-emerald-100">Drive with us and earn on your own schedule across the Dooars.</p>
          <Link to="/signup/driver" className="mt-5 inline-block rounded-lg bg-[#facc15] px-6 py-3 text-sm font-extrabold text-[#14532d] transition-transform hover:scale-105 hover:bg-[#eab308]">
            Become a driver
          </Link>
        </div>
      </section>

      <footer className="bg-[#064e3b] px-4 py-8 text-center text-slate-300 sm:px-6">
        <img src={logoFull} alt="DooarsGo" className="mx-auto h-8 w-auto brightness-0 invert" />
        <p className="mt-2 text-xs text-slate-400">&copy; {new Date().getFullYear()} DooarsGo and Biswadip Bhattacharjee. All rights reserved.</p>
        <Link to="/" className="mt-2 inline-block text-sm font-semibold text-emerald-300 hover:text-white">← Back to home</Link>
      </footer>
    </div>
  )
}
