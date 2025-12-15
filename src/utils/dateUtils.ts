/**
 * Date → 'YYYY-MM-DD'変換する。
 * @param d 日付
 * @returns 'YYYY-MM-DD'形式の文字列
 */
export const toYmd = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 'YYYY-MM-DD' or ISO 文字列を Date に変換する。失敗時は nullを返す。
 * @param value 'YYYY-MM-DD'形式の文字列
 * @returns Date
 */
export const parseDateSafe = (value: string | null | undefined): Date | null => {
  if (!value) return null

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null

  // ▽ 不正日付（例: 2025-02-31 → 2025-03-03）を判定する
  const [y, m, day] = value.split('-').map(Number)
  if (d.getFullYear() !== y || d.getMonth() + 1 !== m || d.getDate() !== day) {
    return null
  }

  return d
}

/**
 * base に days 日を足した日付を 'YYYY-MM-DD' で返す。
 * @param base 基準日
 * @param days 追加する日数
 * @returns base に days 日を足した日付。'YYYY-MM-DD'形式の文字列
 */
export const addDays = (base: Date, days: number): string => {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return toYmd(d)
}

/**
 * 今日の日付を'YYYY-MM-DD'形式で返す。
 * @returns 'YYYY-MM-DD'形式の文字列
 */
export const todayYmd = (): string => toYmd(new Date())

/**
 * 基準日が「いまから指定された日数以内」であるかを判定して返す。
 * @param dateStr 基準日。'YYYY-MM-DD'形式の文字列
 * @param days 日数
 * @returns 指定された日数いないであればtrue
 */
export const isWithinDays = (dateStr: string | null | undefined, days: number): boolean => {
  const d = parseDateSafe(dateStr)
  if (!d) return false

  const now = new Date()

  // タイムゾーンの影響を避けるため、どちらも「UTCのその日の0時」に正規化して比較する
  const toUtcMidnight = (dt: Date) => Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())

  const diffMs = toUtcMidnight(now) - toUtcMidnight(d)

  // 未来日は「今から◯日以内」には含めない想定ならここで弾く
  if (diffMs < 0) return false

  const diffDays = diffMs / (24 * 60 * 60 * 1000)
  return diffDays <= days
}

/**
 * 指定された日付を比較する。
 * @param a 'YYYY-MM-DD'形式の文字列
 * @param b 'YYYY-MM-DD'形式の文字列
 * @returns a > bの場合1、a < bの場合-1、a = bの場合0を返す
 */
export const compareYmd = (a: string, b: string): number => {
  if (a === b) return 0
  return a < b ? -1 : 1
}
