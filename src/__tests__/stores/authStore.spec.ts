import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import type { AuthSession, LoginUser } from '@/domain'

const testGlobal = globalThis as typeof globalThis & {
  localStorage: Storage
  fetch: typeof fetch
}

// --- module mocks -------------------------------------------------

vi.mock('@/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

vi.mock('@/api/userApi', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    createIconUploadUrl: vi.fn(),
    updateUserIcon: vi.fn(),
  },
}))

// householdStore / codeStore は「useXXXStore が呼ばれたらダミーオブジェクトを返す」モック
const mockHouseholdStore = {
  initFromStorage: vi.fn(),
  fetchMyHouseholds: vi.fn(),
  reset: vi.fn(),
}

const mockCodeStore = {
  loadAllIfNeeded: vi.fn(),
}

vi.mock('@/stores/householdStore', () => ({
  useHouseholdStore: () => mockHouseholdStore,
}))

vi.mock('@/stores/codeStore', () => ({
  useCodeStore: () => mockCodeStore,
}))

// --- localStorage モック -------------------------------------------------

const createLocalStorageMock = (): Storage => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length
    },
  } as Storage
}

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // localStorage を毎回リセット
    testGlobal.localStorage = createLocalStorageMock()

    // fetch もモック（アイコンアップロード用）
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    testGlobal.fetch = fetchMock
  })

  const createLoginUser = (overrides: Partial<LoginUser> = {}): LoginUser => ({
    userId: 1,
    email: 'test@example.com',
    displayName: 'Tester',
    locale: 'ja',
    iconUrl: null,
    ...overrides,
  })

  const STORAGE_KEY = 'hwhub.auth'

  it('初期状態では isAuthenticated は false', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.accessToken).toBeNull()
    expect(store.currentUser).toBeNull()
  })

  it('saveToStorage は accessToken / currentUser を JSON で保存する', () => {
    const store = useAuthStore()
    const user = createLoginUser()
    store.accessToken = 'token-123'
    store.currentUser = user

    store.saveToStorage()

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()

    const parsed = JSON.parse(raw!) as AuthSession
    expect(parsed.accessToken).toBe('token-123')
    expect(parsed.user).toEqual(user)
  })

  it('initFromStorage は保存済みセッションを復元し、householdStore.initFromStorage を呼ぶ', () => {
    const session: AuthSession = {
      accessToken: 'stored-token',
      user: createLoginUser({ displayName: 'FromStorage' }),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))

    const store = useAuthStore()
    store.initFromStorage()

    expect(store.accessToken).toBe('stored-token')
    expect(store.currentUser?.displayName).toBe('FromStorage')
    expect(mockHouseholdStore.initFromStorage).toHaveBeenCalled()
  })

  it('initFromStorage はパースエラー時に localStorage からキーを削除する', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json')

    const store = useAuthStore()
    store.initFromStorage()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('login は authApi.login を呼び、state / localStorage / 付随ストアを更新する', async () => {
    const user = createLoginUser()
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'login-token',
      user,
    })

    const store = useAuthStore()

    const saveSpy = vi.spyOn(store, 'saveToStorage')

    await store.login('test@example.com', 'password')

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })

    expect(store.accessToken).toBe('login-token')
    expect(store.currentUser).toEqual(user)
    expect(saveSpy).toHaveBeenCalled()

    expect(mockHouseholdStore.fetchMyHouseholds).toHaveBeenCalled()
    expect(mockCodeStore.loadAllIfNeeded).toHaveBeenCalled()
  })

  it('register は authApi.register を呼び、login と同様に状態を更新する', async () => {
    const user = createLoginUser({ displayName: 'NewUser' })
    vi.mocked(authApi.register).mockResolvedValue({
      accessToken: 'register-token',
      user,
    })

    const store = useAuthStore()
    const saveSpy = vi.spyOn(store, 'saveToStorage')

    await store.register({
      email: 'new@example.com',
      password: 'pw',
      displayName: 'NewUser',
      locale: 'ja',
      invitationToken: null,
    })

    expect(authApi.register).toHaveBeenCalled()
    expect(store.accessToken).toBe('register-token')
    expect(store.currentUser).toEqual(user)
    expect(saveSpy).toHaveBeenCalled()
    expect(mockHouseholdStore.fetchMyHouseholds).toHaveBeenCalled()
    expect(mockCodeStore.loadAllIfNeeded).toHaveBeenCalled()
  })

  it('logout は state と localStorage をクリアし、householdStore.reset を呼ぶ', () => {
    const store = useAuthStore()
    store.accessToken = 'token'
    store.currentUser = createLoginUser()
    store.saveToStorage()

    store.logout()

    expect(store.accessToken).toBeNull()
    expect(store.currentUser).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(mockHouseholdStore.reset).toHaveBeenCalled()
  })

  it('fetchUserProfile は userApi.getProfile の結果で currentUser を更新し、saveToStorage を呼ぶ', async () => {
    vi.mocked(userApi.getProfile).mockResolvedValue({
      userId: 1,
      email: 'profile@example.com',
      displayName: 'FromProfile',
      locale: 'ja',
      iconUrl: 'https://example.com/icon.png',
    })

    const store = useAuthStore()
    const saveSpy = vi.spyOn(store, 'saveToStorage')

    await store.fetchUserProfile()

    expect(userApi.getProfile).toHaveBeenCalled()
    expect(store.currentUser).toEqual({
      userId: 1,
      email: 'profile@example.com',
      displayName: 'FromProfile',
      locale: 'ja',
      iconUrl: 'https://example.com/icon.png',
    })
    expect(saveSpy).toHaveBeenCalled()
  })

  it('updateAccountProfile は userApi.updateProfile を呼び、currentUser を更新して saveToStorage を呼ぶ', async () => {
    const store = useAuthStore()
    store.currentUser = createLoginUser({
      displayName: 'Old',
      locale: 'ja',
    })

    vi.mocked(userApi.updateProfile).mockResolvedValue(undefined)

    const saveSpy = vi.spyOn(store, 'saveToStorage')

    await store.updateAccountProfile({ displayName: 'NewName', locale: 'en' })

    expect(userApi.updateProfile).toHaveBeenCalledWith({
      displayName: 'NewName',
      locale: 'en',
    })

    expect(store.currentUser?.displayName).toBe('NewName')
    expect(store.currentUser?.locale).toBe('en')
    expect(saveSpy).toHaveBeenCalled()
  })

  it('uploadUserIcon はアップロード処理一連を行い、最後に fetchUserProfile を呼ぶ', async () => {
    const store = useAuthStore()
    const file = new File(['dummy'], 'icon.png', { type: 'image/png' })

    vi.mocked(userApi.createIconUploadUrl).mockResolvedValue({
      uploadUrl: 'https://upload.example.com',
      fileKey: 'file-key-123',
    })
    vi.mocked(userApi.updateUserIcon).mockResolvedValue(undefined)

    const fetchProfileSpy = vi.spyOn(store, 'fetchUserProfile').mockResolvedValue(undefined)

    await store.uploadUserIcon(file)

    // isUploadingIcon のトグル
    expect(store.isUploadingIcon).toBe(false)

    expect(userApi.createIconUploadUrl).toHaveBeenCalledWith({
      fileName: 'icon.png',
      mimeType: 'image/png',
    })
    expect(globalThis.fetch).toHaveBeenCalledWith('https://upload.example.com', {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
      },
      body: file,
    })
    expect(userApi.updateUserIcon).toHaveBeenCalledWith({ fileKey: 'file-key-123' })
    expect(fetchProfileSpy).toHaveBeenCalled()
  })
})
