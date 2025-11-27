import { createI18n } from 'vue-i18n'
import es from './es.json'
import en from './en.json'

const messages = { en, es }


const browserLocale = navigator.language.split('-')[0] // ej. "es-PE" -> "es"
const savedLocale = localStorage.getItem('locale')

// idioma final por defecto
const defaultLocale = savedLocale || (browserLocale === 'es' ? 'es' : 'en')


const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages
})


export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

export default i18n
