import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCodeStore } from '@/stores/codeStore'
import { resolveCodeLabel } from '@/utils/codeLabelResolver'
import type { CodeModel } from '@/domain/code/code.model'

export function useCodes() {
  const codeStore = useCodeStore()
  const { locale } = useI18n()

  // 指定タイプのコード一覧
  const codesOf = (type: string) => computed<CodeModel[]>(() => codeStore.getByType(type))

  // 単一コード → ラベル
  const labelOf = (type: string, value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return ''
    const code = codeStore.getOne(type, String(value))
    return code ? resolveCodeLabel(code, locale.value) : ''
  }

  // セレクトボックス向けの options
  const optionsOf = (type: string) =>
    computed(() =>
      codeStore.getByType(type).map((c) => ({
        value: c.codeValue,
        label: resolveCodeLabel(c, locale.value),
      })),
    )

  return {
    codesOf,
    labelOf,
    optionsOf,
  }
}
