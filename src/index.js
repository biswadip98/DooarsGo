import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import bn from './bn.json'

const saved = (() => { try { return localStorage.getItem('dg_lang') } catch (_) { return null } })()

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, bn: { translation: bn } },
  lng: saved || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setLang(lng) {
  i18n.changeLanguage(lng)
  try { localStorage.setItem('dg_lang', lng) } catch (_) {}
  try { document.documentElement.lang = lng } catch (_) {}
}

try { document.documentElement.lang = i18n.language } catch (_) {}

export default i18n
