// Shared thematic backdrop so no page shows bare white space.
// Wrap any page's content in <PageBackground> ... </PageBackground>.
export default function PageBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen bg-gradient-to-b from-[#ecfdf5] via-white to-[#ecfdf5] ${className}`}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
          {/* sun */}
          <circle cx="1190" cy="180" r="72" fill="#fde68a" opacity="0.65" />
          {/* birds */}
          <path d="M980 250 q 14 -12 28 0 q 14 -12 28 0" fill="none" stroke="#14532d" strokeWidth="3" opacity="0.35" />
          <path d="M1060 210 q 11 -9 22 0 q 11 -9 22 0" fill="none" stroke="#14532d" strokeWidth="3" opacity="0.3" />
          {/* far hills */}
          <path d="M0 620 L200 470 L380 590 L560 440 L760 600 L980 460 L1200 590 L1440 480 L1440 900 L0 900 Z" fill="#bbf7d0" opacity="0.5" />
          {/* mid hills */}
          <path d="M0 700 L240 560 L440 680 L680 540 L900 690 L1140 560 L1440 680 L1440 900 L0 900 Z" fill="#86efac" opacity="0.5" />
          {/* trees */}
          <g fill="#166534" opacity="0.25">
            <circle cx="180" cy="720" r="34" />
            <rect x="174" y="720" width="12" height="40" />
            <circle cx="1290" cy="705" r="40" />
            <rect x="1283" y="705" width="14" height="46" />
          </g>
          {/* near hills */}
          <path d="M0 785 L300 690 L560 775 L820 660 L1120 785 L1440 705 L1440 900 L0 900 Z" fill="#4ade80" opacity="0.4" />
          {/* winding road */}
          <path d="M690 900 C 700 760, 555 720, 620 620 C 675 535, 825 540, 800 455" fill="none" stroke="#14532d" strokeWidth="48" opacity="0.16" strokeLinecap="round" />
          <path d="M690 900 C 700 760, 555 720, 620 620 C 675 535, 825 540, 800 455" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="14 22" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 bg-white/35" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  )
}
