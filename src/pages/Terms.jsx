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

export default function Terms() {
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
          <h1 className="font-display text-2xl font-extrabold text-forest">Terms &amp; Conditions</h1>
          <p className="mt-1 text-xs text-ink/50">Last updated: {UPDATED}</p>

          <Section n="1" title="About DooarsGo">
            <p>DooarsGo ("we", "our", "the platform") is a technology platform that helps riders in Chepani, Kamakhyaguri, Barobisha and nearby areas of the Dooars book local Toto, Bike and Car rides from independent driver-partners. By creating an account or using the app, you agree to these Terms.</p>
          </Section>

          <Section n="2" title="Eligibility">
            <p>You must be at least 18 years old to create an account. By using DooarsGo you confirm that the information you provide is true and that you will use the service lawfully.</p>
          </Section>

          <Section n="3" title="Our role">
            <p>DooarsGo is an intermediary that connects riders with independent driver-partners. We are not a transport operator and do not own or operate vehicles. The ride is a service provided by the driver-partner directly to the rider. We facilitate discovery, booking, fare estimates and communication.</p>
          </Section>

          <Section n="4" title="Fares &amp; payment">
            <p>The fare shown in the app is an estimate based on distance, vehicle type, passengers and time. The final amount may vary slightly with the actual route.</p>
            <p><b>Payment is made directly by the rider to the driver</b> in cash or by UPI at the end of the ride. DooarsGo charges <b>no commission</b> and does not process payments. For Car rides, any toll-gate charges on the route are paid by the rider directly at the toll booth and are not part of the fare.</p>
          </Section>

          <Section n="5" title="Cancellations">
            <p>You may cancel a ride before it starts. To be fair to drivers, repeated cancellations within a short period may temporarily pause your ability to book new rides.</p>
          </Section>

          <Section n="6" title="Rider responsibilities">
            <p>Provide an accurate pickup and drop location, be ready at pickup, pay the agreed fare, behave respectfully with the driver, and do not carry illegal or hazardous items. You are responsible for your belongings during the ride.</p>
          </Section>

          <Section n="7" title="Driver-partner responsibilities">
            <p>Driver-partners must be verified through our KYC process, hold valid documents (and a valid driving licence for Bike and Car), drive safely and lawfully, and honour the safety commitment they accept during registration. Bike drivers must carry a helmet for the passenger.</p>
          </Section>

          <Section n="8" title="Safety">
            <p>Every ride uses a pickup code that the rider shares with the driver to start the trip. Driver-partners are identity-verified. Please still use normal caution and share your trip with someone you trust when needed.</p>
          </Section>

          <Section n="9" title="Prohibited use">
            <p>Do not misuse the platform, create fake accounts, harass others, attempt to defraud drivers or riders, or use the service for anything unlawful. We may suspend or remove accounts that break these Terms.</p>
          </Section>

          <Section n="10" title="Limitation of liability">
            <p>DooarsGo provides a booking platform on an "as is" basis. As driver-partners are independent, we are not liable for their acts, delays, the condition of vehicles, or events during a ride, to the maximum extent permitted by law. Nothing here limits any liability that cannot be limited under applicable law.</p>
          </Section>

          <Section n="11" title="Changes to these Terms">
            <p>We may update these Terms from time to time. Continued use of DooarsGo after an update means you accept the revised Terms.</p>
          </Section>

          <Section n="12" title="Governing law">
            <p>These Terms are governed by the laws of India. Any disputes are subject to the jurisdiction of the courts at Alipurduar, West Bengal.</p>
          </Section>

          <Section n="13" title="Contact us">
            <p>Questions about these Terms? Email <a href="mailto:support.dooarsgo@gmail.com" className="font-semibold text-forest">support.dooarsgo@gmail.com</a>.</p>
          </Section>

          <p className="mt-8 text-xs text-ink/50">See also our <Link to="/privacy" className="font-semibold text-forest">Privacy Policy</Link>.</p>
        </div>
      </main>
    </PageBackground>
  )
}
