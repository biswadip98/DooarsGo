import AppHeader from '../components/AppHeader'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white [font-family:'Inter',system-ui,sans-serif]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-[#14532d]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <p>
            DooarsGo is built and run by one person — not a registered company — with the goal of
            bringing simple, reliable local transport booking to villages and tea-garden areas around
            Kamakhyaguri, Chepani, Barobisha, and nearby parts of the Dooars that don't usually get this
            kind of service. This policy explains what information is collected and why, in plain
            language.
          </p>

          <section>
            <h2 className="text-lg font-bold text-slate-900">What we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Account details: your name, phone number, email address, and gender if you choose to share it.</li>
              <li>Ride details: pickup and drop locations, ride history, and fare information, so a ride can actually be booked and paid for.</li>
              <li>Driver verification: for drivers, an ID document, vehicle details, and a photo, used only to confirm you are who you say you are before you can accept rides.</li>
              <li>Location: your live location while using the app to request or fulfil a ride — this is not tracked when you're not using the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">What we don't do</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>We don't sell your information to advertisers or other companies.</li>
              <li>We don't share your details outside what's needed to complete a ride (for example, showing a driver a customer's pickup point and name).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Why we collect it</h2>
            <p className="mt-2">
              Purely to run the service: to match customers with drivers, calculate fares, verify drivers
              for everyone's safety, and let you contact support if something goes wrong.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Your choices</h2>
            <p className="mt-2">
              You can update your profile details at any time from your account, or write to us to ask
              what information we hold about you, correct it, or have your account and data removed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Contact</h2>
            <p className="mt-2">
              For anything about your data or this policy, write to{' '}
              <a href="mailto:dooarsgo@gmail.com" className="font-semibold text-[#15803d]">dooarsgo@gmail.com</a>{' '}
              or{' '}
              <a href="mailto:support.dooarsgo@gmail.com" className="font-semibold text-[#15803d]">support.dooarsgo@gmail.com</a>.
            </p>
          </section>

          <p className="text-xs text-slate-400">
            This is a plain-language policy for an early-stage, individually-run community project, not
            formal legal advice. It will be revisited as the platform grows.
          </p>
        </div>
      </div>
    </div>
  )
}
