import logoMark from '../assets/dooarsgo-logo-mark.png'

// Shared header logo. Used across the app via <Brand /> — renders the real DooarsGo mark.
export default function Brand({ size = 36 }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <img
        src={logoMark}
        alt="DooarsGo"
        style={{ height: size, width: size }}
        className="object-contain shrink-0"
      />
      <span className="leading-tight">
        <span className="block font-display font-extrabold text-forest text-base sm:text-lg">DooarsGo</span>
        <span className="block text-[10px] text-ink/50 -mt-0.5">Your Local Ride, Anytime.</span>
      </span>
    </span>
  )
}
