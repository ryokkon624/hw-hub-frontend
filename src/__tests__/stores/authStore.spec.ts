import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import type { AuthSession, LoginUser, HouseholdModel, HouseholdMember } from '@/domain'
import { HOUSEHOLD_MEMBER_STATUS } from '@/constants/code.constants'

const testGlobal = globalThis as typeof globalThis & {
  localStorage: Storage
  fetch: typeof fetch
}

// --- module mocks -------------------------------------------------

vi.mock('@/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    putToPresignedUrl: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  },
}))

vi.mock('@/api/userApi', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    createIconUploadUrl: vi.fn(),
    updateUserIcon: vi.fn(),
    deleteAccount: vi.fn(),
    changeMyPassword: vi.fn(),
  },
}))

// householdStore / codeStore は「useXXXStore が呼ばれたらダミーオブジェクトを返す」モック
const mockHouseholdStore = {
  initFromStorage: vi.fn(),
  fetchMyHouseholds: vi.fn(),
  reset: vi.fn(),
  // 追加: プロパティもモックできるようにする
  households: [] as HouseholdModel[],
  membersByHouseholdId: {} as Record<number, HouseholdMember[]>,
  fetchMembers: vi.fn(),
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
      kind: 'LOGGED_IN',
      session: {
        accessToken: 'register-token',
        user,
      }
    })

    const store = useAuthStore()
    const saveSpy = vi.spyOn(store, 'saveToStorage')

    const result = await store.register({
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
    expect(result).toEqual({ kind: 'LOGGED_IN', session: { accessToken: 'register-token', user } })
  })

  it('register: VERIFICATION_REQUIRED の場合はセッション保存せず結果を返す', async () => {
    vi.mocked(authApi.register).mockResolvedValue({
      kind: 'VERIFICATION_REQUIRED',
      verificationExpiresAt: '2025-01-01',
    })

    const store = useAuthStore()
    const saveSpy = vi.spyOn(store, 'saveToStorage')

    const result = await store.register({
      email: 'verify@example.com',
      password: 'pw',
      displayName: 'Verify',
      locale: 'ja',
    })

    expect(authApi.register).toHaveBeenCalled()
    expect(store.accessToken).toBeNull()
    expect(saveSpy).not.toHaveBeenCalled()
    expect(result).toEqual({
      kind: 'VERIFICATION_REQUIRED',
      verificationExpiresAt: '2025-01-01',
    })
  })

  it('verifyEmail は authApi.verifyEmail を呼ぶ', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ data: undefined, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as import('axios').AxiosResponse)

    await store.verifyEmail('token-abc')

    expect(authApi.verifyEmail).toHaveBeenCalledWith({ token: 'token-abc' })
  })

  it('resendVerification は authApi.resendVerification を呼ぶ', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.resendVerification).mockResolvedValue({ data: undefined, status: 200, statusText: 'OK', headers: {}, config: {} } as unknown as import('axios').AxiosResponse)

    await store.resendVerification('resend@example.com')

    expect(authApi.resendVerification).toHaveBeenCalledWith({ email: 'resend@example.com' })
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
    vi.mocked(authApi.putToPresignedUrl).mockResolvedValue(undefined)
    vi.mocked(userApi.updateUserIcon).mockResolvedValue(undefined)

    const fetchProfileSpy = vi.spyOn(store, 'fetchUserProfile').mockResolvedValue(undefined)

    await store.uploadUserIcon(file)

    // isUploadingIcon のトグル
    expect(store.isUploadingIcon).toBe(false)

    expect(userApi.createIconUploadUrl).toHaveBeenCalledWith({
      fileName: 'icon.png',
      mimeType: 'image/png',
    })
    expect(authApi.putToPresignedUrl).toHaveBeenCalledWith('https://upload.example.com', file)
    // expect(globalThis.fetch).toHaveBeenCalledWith('https://upload.example.com', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'image/png',
    //   },
    //   body: file,
    // })
    expect(userApi.updateUserIcon).toHaveBeenCalledWith({ fileKey: 'file-key-123' })
    expect(fetchProfileSpy).toHaveBeenCalled()
  })

  it('deleteAccount は userApi.deleteAccount を呼び、logout を実行する', async () => {
    const store = useAuthStore()
    const logoutSpy = vi.spyOn(store, 'logout')
    vi.mocked(userApi.deleteAccount).mockResolvedValue(undefined)

    await store.deleteAccount()

    expect(userApi.deleteAccount).toHaveBeenCalled()
    expect(logoutSpy).toHaveBeenCalled()
  })

  it('changeMyPassword は userApi.changeMyPassword を呼び出し、isChangingPassword フラグを管理する', async () => {
    const store = useAuthStore()
    vi.mocked(userApi.changeMyPassword).mockResolvedValue(undefined)

    const promise = store.changeMyPassword({
      currentPassword: 'old',
      newPassword: 'new',
    })

    expect(store.isChangingPassword).toBe(true)
    await promise
    expect(store.isChangingPassword).toBe(false)

    expect(userApi.changeMyPassword).toHaveBeenCalledWith({
      currentPassword: 'old',
      newPassword: 'new',
    })
  })

  // --- validateAccountDeletion ---

  const createMember = (overrides: Partial<HouseholdMember> = {}): HouseholdMember => ({
    householdId: 100,
    userId: 0,
    displayName: 'Member',
    iconUrl: null,
    nickname: null,
    status: HOUSEHOLD_MEMBER_STATUS.ACTIVE, // '1'
    role: 'MEMBER',
    ...overrides,
  })

  it('validateAccountDeletion は自分がオーナーの世帯に他の有効メンバーがいる場合にエラーを投げる', async () => {
    const store = useAuthStore()
    store.currentUser = createLoginUser({ userId: 10 })

    // householdStore の状態をモック
    // householdId=100 の世帯のオーナーは自分(10)
    mockHouseholdStore.households = [
      { householdId: 100, name: 'MyHome', ownerUserId: 10 }
    ]
    // メンバーは自分(10)と他人(20)がいて、両方ACTIVE
    mockHouseholdStore.membersByHouseholdId = {
      100: [
        createMember({ userId: 10, status: HOUSEHOLD_MEMBER_STATUS.ACTIVE }),
        createMember({ userId: 20, status: HOUSEHOLD_MEMBER_STATUS.ACTIVE }),
      ]
    }
    // fetchMembers は何もしない（データは既にある体）
    mockHouseholdStore.fetchMembers.mockResolvedValue(undefined)

    await expect(store.validateAccountDeletion()).rejects.toThrow('VALIDATION_ERROR_OWNER_WITH_MEMBERS')

    expect(mockHouseholdStore.fetchMembers).toHaveBeenCalledWith(100)
  })

  it('validateAccountDeletion は自分がオーナーでも他メンバーが全員非アクティブなら成功する', async () => {
    const store = useAuthStore()
    store.currentUser = createLoginUser({ userId: 10 })

    mockHouseholdStore.households = [
      { householdId: 100, name: 'MyHome', ownerUserId: 10 }
    ]
    mockHouseholdStore.membersByHouseholdId = {
      100: [
        createMember({ userId: 10, status: HOUSEHOLD_MEMBER_STATUS.ACTIVE }),
        createMember({ userId: 20, status: HOUSEHOLD_MEMBER_STATUS.LEFT }), // LEFT='9'
      ]
    }
    mockHouseholdStore.fetchMembers.mockResolvedValue(undefined)

    await expect(store.validateAccountDeletion()).resolves.toBeUndefined()
  })

  it('validateAccountDeletion は自分がオーナーで自分しかいないなら成功する', async () => {
    const store = useAuthStore()
    store.currentUser = createLoginUser({ userId: 10 })

    mockHouseholdStore.households = [
      { householdId: 100, name: 'MyHome', ownerUserId: 10 }
    ]
    mockHouseholdStore.membersByHouseholdId = {
      100: [
        createMember({ userId: 10, status: HOUSEHOLD_MEMBER_STATUS.ACTIVE }),
      ]
    }
    mockHouseholdStore.fetchMembers.mockResolvedValue(undefined)

    await expect(store.validateAccountDeletion()).resolves.toBeUndefined()
  })

  it('validateAccountDeletion は自分が一般メンバーなら成功する', async () => {
    const store = useAuthStore()
    store.currentUser = createLoginUser({ userId: 20 }) // 自分は20

    mockHouseholdStore.households = [
      { householdId: 100, name: 'OthersHome', ownerUserId: 10 } // オーナーは10
    ]
    // メンバーチェックは走らないはずだが、仮に入れておく
    mockHouseholdStore.membersByHouseholdId = {}
    mockHouseholdStore.fetchMembers.mockResolvedValue(undefined)

    await expect(store.validateAccountDeletion()).resolves.toBeUndefined()

    // 自分がオーナーの世帯がないので fetchMembers は呼ばれない
    expect(mockHouseholdStore.fetchMembers).not.toHaveBeenCalled()
  })
})
