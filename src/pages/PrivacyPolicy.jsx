import { useNavigate, Link } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import Brand from '../components/Brand'

const UPDATED = 'September 2026'

function Section({ n, title, children }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-lg font-bold text-forest">{n}. {title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink/80">{children}</div>
    </section>
  )
}

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  return (
    <PageBackground>
      <header className="px-5 py-4 border-b border-black/5 bg-white/70 backdrop-blur flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <Brand size={32} />
        <span className="w-12" />
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-5">
        <div className="rounded-2xl border border-mist bg-white p-6 shadow-[0_8px_24px_rgba(15,90,46,0.06)]">
          <h1 className="font-display text-2xl font-extrabold text-forest">Privacy Policy</h1>
          <p className="mt-1 text-xs text-ink/50">Last updated: {UPDATED}</p>

          <Section n="1" title="Introduction">
            <p>This policy explains what information DooarsGo collects, why we collect it, and how we protect it when you use our ride-booking service in the Dooars region.</p>
          </Section>

          <Section n="2" title="Information we collect">
            <p><b>Account details:</b> your name, phone number, email address and, optionally, gender.</p>
            <p><b>Location:</b> your pickup and drop locations, and your live location during booking and an active ride, to match you with nearby drivers and show the route.</p>
            <p><b>Driver verification (KYC):</b> for driver-partners, we collect a photo, Aadhaar image, vehicle photo and number, and — for Bike and Car — a driving licence and its details. These documents are stored privately and shown only to our admin team for verification.</p>
            <p><b>Ride data:</b> your trip history, fares, ratings and in-ride chat messages.</p>
          </Section>

          <Section n="3" title="How we use your information">
            <p>To create and manage your account, match riders with drivers, estimate fares, enable the ride and in-ride chat, verify driver-partners for safety, provide support, and improve the service. We do not use your data for anything unrelated to running DooarsGo.</p>
          </Section>

          <Section n="4" title="What is shared, and with whom">
            <p>When a ride is booked, limited details are shared between the matched rider and driver so the trip can happen — for example the driver's name, photo, vehicle and live location are shown to the rider, and the pickup/drop and rider's first name are shown to the driver.</p>
            <p>We use trusted service providers to run the app (such as our database and map/location provider). We do <b>not</b> sell your personal data. We may disclose information if required by law or to protect the safety of users.</p>
          </Section>

          <Section n="5" title="How we protect your data">
            <p>Your data is stored on secured infrastructure. Sensitive KYC documents (Aadhaar, licence, vehicle photos) are kept in private storage accessible only to authorised admins for verification, not to the public.</p>
          </Section>

          <Section n="6" title="Data retention">
            <p>We keep your information for as long as your account is active or as needed to provide the service and meet legal requirements. You can ask us to delete your account and associated personal data.</p>
          </Section>

          <Section n="7" title="Your choices &amp; rights">
            <p>You can view and update your profile in the app. To request access to, correction of, or deletion of your personal data, email us and we will act within a reasonable time.</p>
          </Section>

          <Section n="8" title="Children">
            <p>DooarsGo is intended for users aged 18 and above. We do not knowingly collect data from children.</p>
          </Section>

          <Section n="9" title="Changes to this policy">
            <p>We may update this policy from time to time. We will post the updated version here with a new "last updated" date.</p>
          </Section>

          <Section n="10" title="Contact us">
            <p>For any privacy question or request, email <a href="mailto:support.dooarsgo@gmail.com" className="font-semibold text-forest">support.dooarsgo@gmail.com</a>.</p>
          </Section>

          <p className="mt-8 text-xs text-ink/50">See also our <Link to="/terms" className="font-semibold text-forest">Terms &amp; Conditions</Link>.</p>
        </div>
      </main>
    </PageBackground>
  )
}
