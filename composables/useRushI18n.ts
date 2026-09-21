import enCatalog from '~/locales/en.json'

/**
 * Rush i18n — same 15-language registry as SoW/WOU, Vue-idiomatic.
 * - English is the bundled fallback: missing keys fall back to en, never blank.
 * - First visit: navigator.language (zh->zh-cn, pt->pt-br, tl->fil). After that
 *   the stored choice wins. Persists in localStorage ("rush_locale").
 * - t() reads reactive state, so switching locale re-renders every component.
 * - tp() handles one/other plurals (ru/fil rules included).
 */
export const RUSH_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'fil', label: 'Filipino' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'pt-br', label: 'Português (Brasil)' },
  { code: 'ru', label: 'Русский' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh-cn', label: '简体中文' },
] as const

type Catalog = Record<string, any>

const CODES = RUSH_LOCALES.map((l) => l.code)
const ALIASES: Record<string, string> = { zh: 'zh-cn', pt: 'pt-br', tl: 'fil' }
const STORE = 'rush_locale'

const useRushLocale = () => useState<string>('rush-locale', () => 'en')
const useRushStrings = () => useState<Catalog>('rush-strings', () => enCatalog as Catalog)
const useRushLoaded = () =>
  useState<Record<string, boolean>>('rush-loaded', () => ({ en: true }))

export function normalizeRushLocale(input?: string | null): string {
  const v = String(input || '')
    .toLowerCase()
    .replace(/_/g, '-')
  if ((CODES as readonly string[]).includes(v)) return v
  return ALIASES[v] ?? 'en'
}

function detectBrowserLocale(): string {
  if (typeof navigator === 'undefined') return 'en'
  const langs: readonly string[] = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]
  for (const raw of langs) {
    const v = String(raw || '')
      .toLowerCase()
      .replace(/_/g, '-')
    if ((CODES as readonly string[]).includes(v)) return v
    if (ALIASES[v]) return ALIASES[v]
    if (v.startsWith('en')) return 'en'
  }
  return 'en'
}

export function langTag(code: string): string {
  if (code === 'zh-cn') return 'zh-CN'
  if (code === 'pt-br') return 'pt-BR'
  return code
}

function getPath(obj: Catalog, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc !== null && typeof acc === 'object' && part in (acc as Catalog)) {
      return (acc as Catalog)[part]
    }
    return undefined
  }, obj)
}

function fmt(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    params[k] !== undefined ? String(params[k]) : m
  )
}

function pluralSuffix(code: string, n: number): 'one' | 'other' {
  if (code === 'ru') {
    const m10 = Math.abs(n) % 10
    const m100 = Math.abs(n) % 100
    if (m10 === 1 && m100 !== 11) return 'one'
    return 'other'
  }
  if (code === 'fr') return n === 0 || n === 1 ? 'one' : 'other'
  return n === 1 ? 'one' : 'other'
}

export function ordinal(n: number): string {
  const { t, locale } = useRushI18n()
  const code = locale.value
  if (n >= 1 && n <= 8) {
    const v = t(`ord.o${n}`)
    if (v !== `ord.o${n}`) return v
  }
  return t('ord.other', { n })
}

export function timeAgo(ts: number, now = Date.now()): string {
  const { t } = useRushI18n()
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 60) return t('time.just_now')
  const m = Math.floor(s / 60)
  if (m < 60) return t('time.min', { n: m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('time.hour', { n: h })
  return t('time.day', { n: Math.floor(h / 24) })
}

export async function setRushLocale(code: string): Promise<void> {
  const next = normalizeRushLocale(code)
  const loaded = useRushLoaded()
  if (!loaded.value[next]) {
    try {
      const mod = await import(`../locales/${next}.json`)
      loaded.value[next] = true
      useRushStrings().value = (mod.default ?? mod) as Catalog
    } catch {
      useRushStrings().value = enCatalog as Catalog
    }
  } else if (next !== useRushLocale().value) {
    if (next === 'en') {
      useRushStrings().value = enCatalog as Catalog
    } else {
      try {
        const mod = await import(`../locales/${next}.json`)
        useRushStrings().value = (mod.default ?? mod) as Catalog
      } catch {
        useRushStrings().value = enCatalog as Catalog
      }
    }
  }
  useRushLocale().value = next
  try {
    localStorage.setItem(STORE, next)
  } catch {
    /* private mode */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = langTag(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }
  document.dispatchEvent(new CustomEvent('rush:locale', { detail: { code: next } }))
}

export function initRushI18n(): void {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORE)
  } catch {
    /* private mode */
  }
  void setRushLocale(stored ?? detectBrowserLocale())
}

export function useRushI18n() {
  const locale = useRushLocale()
  const strings = useRushStrings()

  function t(key: string, params?: Record<string, string | number>): string {
    // Touch reactive state so template renders re-run on locale switch.
    const active = strings.value
    const lang = locale.value
    void lang
    const v = getPath(active, key) ?? getPath(enCatalog as Catalog, key)
    if (typeof v !== 'string') return key
    return fmt(v, params)
  }

  function tp(base: string, n: number, params?: Record<string, string | number>): string {
    return t(`${base}_${pluralSuffix(locale.value, n)}`, { n, ...params })
  }

  return { locale, t, tp, setLocale: setRushLocale }
}
