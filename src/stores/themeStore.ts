import { defineStore } from 'pinia'
import { ref } from 'vue'
import { THEME_MODE } from '@/constants/code.constants'
import type { ThemeModeCode } from '@/constants/code.constants'
import { userApi } from '@/api/userApi'

const LS_KEY = 'hwhub_theme'
const VALID_MODES: ThemeModeCode[] = [THEME_MODE.SYSTEM, THEME_MODE.LIGHT, THEME_MODE.DARK]

function isValidMode(value: string): value is ThemeModeCode {
  return VALID_MODES.includes(value as ThemeModeCode)
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeModeCode>(THEME_MODE.SYSTEM)
  const isLoggedIn = ref(false)
  let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null
  let mediaQuery: MediaQueryList | null = null

  function applyTheme(currentMode: ThemeModeCode) {
    const html = document.documentElement
    if (currentMode === THEME_MODE.DARK) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else if (currentMode === THEME_MODE.LIGHT) {
      html.classList.add('light')
      html.classList.remove('dark')
    } else {
      html.classList.remove('dark')
      html.classList.remove('light')
    }
  }

  function detachMediaListener() {
    if (mediaQuery && mediaQueryListener) {
      mediaQuery.removeEventListener('change', mediaQueryListener)
      mediaQueryListener = null
    }
  }

  function attachMediaListener() {
    detachMediaListener()
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = () => {
      if (mode.value === THEME_MODE.SYSTEM) {
        applyTheme(THEME_MODE.SYSTEM)
      }
    }
    mediaQuery.addEventListener('change', mediaQueryListener)
  }

  function init() {
    const stored = localStorage.getItem(LS_KEY)
    if (stored && isValidMode(stored)) {
      mode.value = stored
    } else {
      mode.value = THEME_MODE.SYSTEM
    }
    applyTheme(mode.value)
    if (mode.value === THEME_MODE.SYSTEM) {
      attachMediaListener()
    }
  }

  function syncFromServer(themeMode: string | null | undefined) {
    if (!themeMode || !isValidMode(themeMode)) return
    mode.value = themeMode as ThemeModeCode
    localStorage.setItem(LS_KEY, themeMode)
    applyTheme(themeMode as ThemeModeCode)
    if (themeMode === THEME_MODE.SYSTEM) {
      attachMediaListener()
    } else {
      detachMediaListener()
    }
  }

  function markLoggedIn() {
    isLoggedIn.value = true
  }

  function markLoggedOut() {
    isLoggedIn.value = false
  }

  async function setMode(newMode: ThemeModeCode) {
    mode.value = newMode
    localStorage.setItem(LS_KEY, newMode)
    applyTheme(newMode)
    if (newMode === THEME_MODE.SYSTEM) {
      attachMediaListener()
    } else {
      detachMediaListener()
    }
    if (isLoggedIn.value) {
      await userApi.updateTheme(newMode)
    }
  }

  return { mode, init, setMode, syncFromServer, markLoggedIn, markLoggedOut }
})
