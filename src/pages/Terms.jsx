import AppHeader from '../components/AppHeader'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white [font-family:'Inter',system-ui,sans-serif]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-[#14532d]">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <p>
            DooarsGo is an independent, community-focused project connecting local Toto, Bike, and Car
            drivers with customers across Chepani, Kamakhyaguri, Barobisha, and nearby Dooars areas. It
            is built and operated by one individual, not a registered company. By using DooarsGo, you
            agree to the following.
          </p>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Using the service</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You must provide accurate account information, including a working phone number.</li>
              <li>Drivers must provide genuine identity and vehicle documents for verification before accepting rides.</li>
              <li>Fares are calculated and shown before a ride is confirmed, based on the current rates set in the app.</li>
              <li>Rides are only available within the service area currently covered by DooarsGo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Cancellations</h2>
            <p className="mt-2">
              Cancellation terms (free cancellation windows, fees for late cancellation or no-shows) are
              shown at the time of booking and may be adjusted as the platform grows.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Conduct</h2>
            <p className="mt-2">
              Customers and drivers are expected to treat each other respectfully. Abusive behaviour,
              fraud, or unsafe driving can result in a suspended or removed account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Limits of the service</h2>
            <p className="mt-2">
              DooarsGo connects riders and drivers — it does not own or operate the vehicles involved.
              As an early-stage, individually-run platform, the service is provided on a best-effort
              basis. Use it at your own judgment, particularly around ride safety and timing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Changes</h2>
            <p className="mt-2">
              These terms may be updated as DooarsGo grows and adds features. Continued use of the app
              after a change means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Contact</h2>
            <p className="mt-2">
              Questions about these terms: {' '}
              <a href="mailto:dooarsgo@gmail.com" className="font-semibold text-[#15803d]">dooarsgo@gmail.com</a>.
            </p>
          </section>

          <p className="text-xs text-slate-400">
            This is a simple, plain-language agreement for an early-stage, individually-run community
            project, not formal legal advice.
          </p>
        </div>
      </div>
    </div>
  )
}
