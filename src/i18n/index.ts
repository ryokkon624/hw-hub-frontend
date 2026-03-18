// src/i18n/index.ts
import { createI18n } from 'vue-i18n'

import ja from './ja.json'
import en from './en.json'
import es from './es.json'

export const SUPPORT_LOCALES = ['ja', 'en', 'es'] as const
export type Locale = (typeof SUPPORT_LOCALES)[number]

function detectInitialLocale(): Locale {
  const saved = localStorage.getItem('hwhub_locale') as Locale | null
  if (saved && SUPPORT_LOCALES.includes(saved)) return saved

  const browser = navigator.language.toLowerCase()
  if (browser.startsWith('ja')) return 'ja'
  if (browser.startsWith('es')) return 'es'
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    ja,
    en,
    es,
  },
})

export default i18n
