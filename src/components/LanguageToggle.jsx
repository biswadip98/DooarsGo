import { useTranslation } from 'react-i18next'
import { setLang } from '../i18n'

// Pill / segmented control: English | বাংলা. Active option highlighted.
export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation()
  const lng = i18n.language?.startsWith('bn') ? 'bn' : 'en'
  const opts = [
    { code: 'en', label: 'English' },
    { code: 'bn', label: 'বাংলা' },
  ]
  return (
    <div className={`inline-flex rounded-full border border-black/10 bg-white/80 p-1 shadow-sm ${className}`} role="group" aria-label="Language">
      {opts.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          aria-pressed={lng === o.code}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${lng === o.code ? 'bg-[#15803d] text-white shadow' : 'text-[#14532d] hover:bg-black/5'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
