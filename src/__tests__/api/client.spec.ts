// src/__tests__/api/client.spec.ts
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import type { InternalAxiosRequestConfig, AxiosError } from 'axios'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

// ============================================================
// ヘルパー：ダミーの Route を作る
// （function 宣言にして hoisting させる）
// ============================================================

function makeDummyRoute(name?: string, fullPath = ''): RouteLocationNormalizedLoaded {
  return {
    name,
    fullPath,
    path: fullPath,
    params: {},
    query: {},
    hash: '',
    matched: [],
    redirectedFrom: undefined,
    meta: {},
  } as RouteLocationNormalizedLoaded
}

// ============================================================
// 先に store / router をモック
// ============================================================

vi.mock('@/stores/authStore', () => {
  const logout = vi.fn()

  let token: string | null = null
  let bootstrapping = false

  const useAuthStore = () => ({
    get accessToken() {
      return token
    },
    set accessToken(v: string | null) {
      token = v
    },
    get isAuthenticated() {
      return token != null
    },
    get isBootstrapping() {
      return bootstrapping
    },
    set isBootstrapping(v: boolean) {
      bootstrapping = v
    },
    logout,
  })

  return { __esModule: true, useAuthStore }
})

vi.mock('@/router', () => {
  const push = vi.fn()

  const router = {
    currentRoute: {
      value: makeDummyRoute(undefined, ''),
    },
    push,
  }

  return { __esModule: true, router }
})

// ============================================================
// モック設定後に client.ts を import
// ============================================================

import { apiClient } from '@/api/client'
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'

// ============================================================
// interceptor ハンドラ取得用（any 禁止版）
// ============================================================

type RequestInterceptorHandler = {
  fulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
}

type ResponseInterceptorHandler = {
  rejected?: (error: AxiosError) => Promise<unknown>
}

const getRequestFulfilled = () => {
  const handlers = (
    apiClient.interceptors.request as unknown as {
      handlers: RequestInterceptorHandler[]
    }
  ).handlers
  const h = handlers.find((x) => typeof x.fulfilled === 'function')
  if (!h || !h.fulfilled) throw new Error('request interceptor not found')
  return h.fulfilled
}

const getResponseRejected = () => {
  const handlers = (
    apiClient.interceptors.response as unknown as {
      handlers: ResponseInterceptorHandler[]
    }
  ).handlers
  const h = handlers.find((x) => typeof x.rejected === 'function')
  if (!h || !h.rejected) throw new Error('response interceptor not found')
  return h.rejected
}

// router.push / logout を Mock として扱うヘルパー
const getPushMock = () => router.push as unknown as Mock
const getLogoutMock = () => {
  const store = useAuthStore()
  return store.logout as unknown as Mock
}

// ============================================================
// beforeEach
// ============================================================

beforeEach(() => {
  vi.clearAllMocks()
  const store = useAuthStore()
  store.accessToken = null
  router.currentRoute.value = makeDummyRoute(undefined, '')
})

// ============================================================
// request interceptor
// ============================================================

describe('apiClient request interceptor', () => {
  it('accessToken が無い場合、Authorization が付与されない', () => {
    const store = useAuthStore()
    store.accessToken = null

    const fulfilled = getRequestFulfilled()

    const config = { headers: {} } as InternalAxiosRequestConfig
    const result = fulfilled(config)

    expect((result.headers as unknown as Record<string, unknown>).Authorization).toBeUndefined()
  })

  it('accessToken がある場合、Authorization が付与される', () => {
    const store = useAuthStore()
    store.accessToken = 'abc123'

    const fulfilled = getRequestFulfilled()

    const config = { headers: {} } as InternalAxiosRequestConfig
    const result = fulfilled(config)

    expect((result.headers as unknown as Record<string, unknown>).Authorization).toBe(
      'Bearer abc123',
    )
  })
})

// ============================================================
// response interceptor - ErrorResponse あり
// ============================================================

describe('apiClient response interceptor - ErrorResponse あり', () => {
  it('401 → logout & redirect（redirect あり）', async () => {
    const rejected = getResponseRejected()
    const logout = getLogoutMock()
    const push = getPushMock()

    router.currentRoute.value = makeDummyRoute('home', '/home')

    const axiosError = {
      response: {
        status: 401,
        data: {
          errorCode: 'AUTH001',
          message: 'Unauthorized',
          details: [{ field: 'token', message: 'expired' }],
        },
      },
    } as unknown as AxiosError

    await expect(rejected(axiosError)).rejects.toMatchObject({
      status: 401,
      errorCode: 'AUTH001',
      message: 'Unauthorized',
      details: [{ field: 'token', message: 'expired' }],
    })

    expect(logout).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith({
      name: 'login',
      query: { redirect: '/home' },
    })
  })

  it('401 かつ現在地が login → redirect 無し', async () => {
    const rejected = getResponseRejected()
    const logout = getLogoutMock()
    const push = getPushMock()

    router.currentRoute.value = makeDummyRoute('login', '/login')

    const axiosError = {
      response: {
        status: 401,
        data: {
          errorCode: 'AUTH001',
          message: 'Unauthorized',
          details: [],
        },
      },
    } as unknown as AxiosError

    await expect(rejected(axiosError)).rejects.toMatchObject({
      status: 401,
      errorCode: 'AUTH001',
      message: 'Unauthorized',
      details: [],
    })

    expect(logout).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith({ name: 'login' })
  })

  it('401 かつ isBootstrapping=true の場合 → logout/redirect は呼ばれず、reject だけされる', async () => {
    const rejected = getResponseRejected()
    const logout = getLogoutMock()
    const push = getPushMock()

    // store の isBootstrapping を true に設定
    const store = useAuthStore()
    store.isBootstrapping = true

    const axiosError = {
      response: {
        status: 401,
        data: { errorCode: 'AUTH001' },
      },
    } as unknown as AxiosError

    // isBootstrapping = true のときは reject されるが、logout / redirect は呼ばれない
    await expect(rejected(axiosError)).rejects.toMatchObject({
      response: { status: 401 },
    })

    expect(logout).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})

// ============================================================
// response interceptor - ErrorResponse でない場合
// ============================================================

describe('apiClient response interceptor - 非 ErrorResponse', () => {
  it('UNKNOWN として reject される', async () => {
    const rejected = getResponseRejected()
    const logout = getLogoutMock()
    const push = getPushMock()

    router.currentRoute.value = makeDummyRoute('home', '/home')

    const axiosError = {
      response: {
        status: 500,
        data: { foo: 'bar' }, // ErrorResponse 形式ではない
      },
    } as unknown as AxiosError

    await expect(rejected(axiosError)).rejects.toMatchObject({
      status: 500,
      errorCode: 'UNKNOWN',
      message: 'Unexpected error occurred.',
      details: [],
    })

    // 500 の場合は logout / redirect は走らない想定なので、ここは 0 回を確認してもよいし
    expect(logout).toHaveBeenCalledTimes(0)
    expect(push).toHaveBeenCalledTimes(0)
  })
})
