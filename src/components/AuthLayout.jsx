/**
 * Wrap any page's content in this to fix the "blank and empty" look.
 * Usage inside an existing page, e.g. Login.jsx:
 *
 *   import AuthLayout from '../components/AuthLayout'
 *   export default function Login() {
 *     return (
 *       <AuthLayout>
 *         <div className="mx-auto max-w-sm">...your existing form JSX...</div>
 *       </AuthLayout>
 *     )
 *   }
 *
 * It does not replace your form — it just gives the page a soft brand
 * backdrop instead of plain white, and vertically centers your content.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-[#ecfdf5] via-white to-white px-4 py-10 sm:px-6">
      <svg
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        aria-hidden="true"
      >
        <circle cx="680" cy="50" r="36" fill="#fde68a" opacity="0.6" />
        <path d="M0 230 L140 140 L260 220 L400 120 L560 230 L700 130 L800 220 L800 300 L0 300 Z" fill="#bbf7d0" opacity="0.5" />
        <path d="M0 260 L180 190 L320 250 L480 170 L800 250 L800 300 L0 300 Z" fill="#86efac" opacity="0.45" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}
