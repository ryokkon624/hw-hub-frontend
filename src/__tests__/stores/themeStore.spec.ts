import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('themeStore', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.className = ''

    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    vi.stubGlobal('matchMedia', mockMatchMedia)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('LS空 → init で mode === SYSTEM、html に light/dark クラスなし', async () => {
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    expect(store.mode).toBe('SYSTEM')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('LS "DARK" → init で <html> に dark 付与', async () => {
    localStorage.setItem('hwhub_theme', 'DARK')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    expect(store.mode).toBe('DARK')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('setMode("LIGHT") → <html> に light、LS に "LIGHT" 保存', async () => {
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()
    store.setMode('LIGHT')

    expect(store.mode).toBe('LIGHT')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('hwhub_theme')).toBe('LIGHT')
  })

  it('setMode("SYSTEM") → LS に "SYSTEM"、html クラス外れる', async () => {
    localStorage.setItem('hwhub_theme', 'DARK')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()
    store.setMode('SYSTEM')

    expect(store.mode).toBe('SYSTEM')
    expect(localStorage.getItem('hwhub_theme')).toBe('SYSTEM')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('不正値 → SYSTEM にフォールバック', async () => {
    localStorage.setItem('hwhub_theme', 'INVALID_VALUE')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    expect(store.mode).toBe('SYSTEM')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })
})
