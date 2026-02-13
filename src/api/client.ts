import axios, { AxiosError } from 'axios'
import { isErrorResponse, type ErrorResponse } from '@/domain/error'
import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

export default apiClient
export { apiClient }

// リクエストごとに Authorization ヘッダを付ける
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    if (authStore.accessToken) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

let isHandling401 = false

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error?.response?.status

    if (status === 401 && !isHandling401) {
      try {
        const authStore = useAuthStore()
        // 認証状態が揺れている最中は logout しない
        if (authStore.isBootstrapping || authStore.isAuthTransition) {
          // isHandling401 を立てないことで処理を止める
          return Promise.reject(error)
        }
        isHandling401 = true
        authStore.logout()

        // 今いる場所を記録しておいて、ログイン後に戻す
        const currentRoute = router.currentRoute.value
        const redirect =
          currentRoute.name && currentRoute.name !== 'login'
            ? { name: 'login', query: { redirect: currentRoute.fullPath } }
            : { name: 'login' }

        await router.push(redirect)
      } finally {
        isHandling401 = false
      }
    }

    if (error.response && isErrorResponse(error.response.data)) {
      const data = error.response.data as ErrorResponse

      // カスタムエラーオブジェクトとして reject
      return Promise.reject({
        status: error.response.status,
        errorCode: data.errorCode,
        message: data.message,
        details: data.details ?? [],
        original: error,
      } as ApiError)
    }

    // バックエンドの共通 ErrorResponse じゃない場合
    return Promise.reject({
      status: error.response?.status,
      errorCode: 'UNKNOWN',
      message: 'Unexpected error occurred.',
      details: [],
      original: error,
    } as ApiError)
  },
)

export interface ApiError {
  status?: number
  errorCode: string
  message: string
  details: { field: string; message: string }[]
  original: AxiosError
}
