export default function Brand({ size = 44, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
          d="M20 6C12 6 6 12.5 6 20.5c0 9 14 22 14 22s14-13 14-22C34 12.5 28 6 20 6z"
          fill={light ? '#57c437' : '#3aa233'}
        />
        <circle cx="20" cy="19.5" r="6.5" fill="#fff" />
        <path
          d="M12 52c8-9 16-11 26-9 8 1.6 14-1 20-8"
          stroke={light ? '#fff' : '#0f5a2e'}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="54" cy="17" r="7" fill="#f4b400" />
      </svg>
      <div>
        <div className="font-display font-extrabold text-xl leading-none">
          <span className={light ? 'text-white' : 'text-forest'}>Dooars</span>
          <span className="text-leafbright">Go</span>
        </div>
        <div className={`text-[11px] ${light ? 'text-white/80' : 'text-ink/60'}`}>
          Your Local Ride, Anytime.
        </div>
      </div>
    </div>
  )
}