import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/api/userApi', () => ({
  userApi: {
    updateTheme: vi.fn(),
  },
}))

describe('themeStore', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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

  it('syncFromServer はサーバーの値でモードとLSを上書きする', async () => {
    localStorage.setItem('hwhub_theme', 'LIGHT')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    store.syncFromServer('DARK')

    expect(store.mode).toBe('DARK')
    expect(localStorage.getItem('hwhub_theme')).toBe('DARK')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('syncFromServer に null/undefined が渡された場合は何もしない', async () => {
    localStorage.setItem('hwhub_theme', 'LIGHT')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    store.syncFromServer(null as unknown as string)

    expect(store.mode).toBe('LIGHT')
    expect(localStorage.getItem('hwhub_theme')).toBe('LIGHT')
  })

  it('setMode はログイン中の場合 userApi.updateTheme を呼ぶ', async () => {
    const { userApi } = await import('@/api/userApi')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    // ログイン済みとしてmarkする
    store.markLoggedIn()

    await store.setMode('DARK')

    expect(userApi.updateTheme).toHaveBeenCalledWith('DARK')
  })

  it('setMode は未ログイン時は userApi.updateTheme を呼ばない', async () => {
    const { userApi } = await import('@/api/userApi')
    const { useThemeStore } = await import('@/stores/themeStore')
    const store = useThemeStore()
    store.init()

    // ログアウト状態（markLoggedInを呼ばない）
    await store.setMode('DARK')

    expect(userApi.updateTheme).not.toHaveBeenCalled()
  })
})
