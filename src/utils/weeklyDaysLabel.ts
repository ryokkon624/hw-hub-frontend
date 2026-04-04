import { useCodeStore } from '@/stores/codeStore'
import { resolveCodeLabel, type CodeModel } from '@/domain/code/code.model'
import { CODE_TYPE } from '@/constants/code.constants'

// M_HOUSEWORK.weekly_days_mask の仕様:
// 例: bit0 = 日曜, bit1 = 月曜, ... bit6 = 土曜
export const weeklyDaysMaskToLabel = (mask: number, locale: string): string => {
  const codeStore = useCodeStore()

  const labels: string[] = []

  for (let bit = 0; bit < 7; bit++) {
    const bitFlag = 1 << bit
    if ((mask & bitFlag) !== 0) {
      // codeValue は0〜6 が曜日
      const codeValue = String(bit)
      const code: CodeModel | undefined = codeStore.getOne(CODE_TYPE.WEEKDAY, codeValue)
      if (code) {
        labels.push(resolveCodeLabel(code, locale))
      }
    }
  }

  return labels.join('・')
}
