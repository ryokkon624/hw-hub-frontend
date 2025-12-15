import { defineStore } from 'pinia'
import type { CodeModel, CodeType, CodeValue } from '@/domain'
import { codeApi } from '@/api/codeApi'

interface CodeState {
  codesByType: Record<CodeType, CodeModel[]>
  loaded: boolean
  loading: boolean
  error: string | null
}

export const useCodeStore = defineStore('codeStore', {
  state: (): CodeState => ({
    codesByType: {},
    loaded: false,
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * 指定されたコード種別のコードマスタDomain Modelを返す。
     * @param state
     * @returns コードマスタDomain Model
     */
    getByType:
      (state) =>
      (codeType: CodeType): CodeModel[] =>
        state.codesByType[codeType] ?? [],

    /**
     * 指定されたコード種別のコード値を1件返す。
     * @param state
     * @returns コードマスタDomain Model
     */
    getOne:
      (state) =>
      (codeType: CodeType, codeValue: CodeValue): CodeModel | undefined =>
        state.codesByType[codeType]?.find((c) => c.codeValue === codeValue),
  },

  actions: {
    /**
     * コードマスタを取得する。既に取得済みの場合は取得しない。
     * @returns コードマスタDomain Model配列
     */
    async loadAllIfNeeded() {
      if (this.loaded || this.loading) return

      this.loading = true
      this.error = null

      try {
        const codes = await codeApi.fetchAllCodes()
        const map: Record<CodeType, CodeModel[]> = {}

        codes.forEach((code) => {
          const list = map[code.codeType] ?? (map[code.codeType] = [])
          list.push(code)
        })

        this.codesByType = map
        this.loaded = true
      } catch (e: unknown) {
        console.error(e)
        const message = e instanceof Error ? e.message : 'Failed to load codes.'
        this.error = message
      } finally {
        this.loading = false
      }
    },
  },
})
