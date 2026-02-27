/**
 * 区分値カテゴリ（CODE_TYPE）の定義
 */
export const CODE_TYPE = {
  RECURRENCE_TYPE: '0001', // RecurrenceType (周期タイプ)
  WEEKDAY: '0002', // Weekday (曜日)
  NTH_WEEK: '0003', // NthWeek (第n週)
  CATEGORY: '0004', // Category (カテゴリ)
  TASK_STATUS: '0005', // TaskStatus (家事タスクステータス)
  TASK_ASSIGN_REASON: '0006', // TaskAssignReason (家事タスク割当理由)
  HOUSEHOLD_MEMBER_STATUS: '0007', // HouseholdMembers (世帯メンバー管理)
  INVITATION_STATUS: '0008', // InvitationStatus (世帯招待ステータス)
  SHOPPING_ITEM_STATUS: '0009', // ShoppingItemStatus (買い物アイテムステータス)
  PURCHASE_LOCATION_TYPE: '0010', // PurchaseLocationType (購入場所種別)
  NOTIFICATION_STATUS: '0011', // NotificationStatus (お知らせステータス)
  PROGRAM_TYPE: '0012', // ProgramType (プログラム種別)
  FAVORITE_FLAG: '0013', // FavoriteFlag (お気に入りフラグ)
  NOTIFICATION_LINK_TYPE: '0019', // NotificationLinkType (通知リンク種別)
} as const

/**
 * 0001: 周期タイプ (RecurrenceType)
 */
export const RECURRENCE_TYPE = {
  WEEKLY: '1', // 毎週
  MONTHLY: '2', // 毎月
  NTH_WEEKDAY: '3', // 第n曜日
} as const
export type RecurrenceTypeCode = (typeof RECURRENCE_TYPE)[keyof typeof RECURRENCE_TYPE]

/**
 * 0002: 曜日 (Weekday)
 */
export const WEEKDAY = {
  SUNDAY: '0', // 日曜日
  MONDAY: '1', // 月曜日
  TUESDAY: '2', // 火曜日
  WEDNESDAY: '3', // 水曜日
  THURSDAY: '4', // 木曜日
  FRIDAY: '5', // 金曜日
  SATURDAY: '6', // 土曜日
} as const
export type WeekdayCode = (typeof WEEKDAY)[keyof typeof WEEKDAY]

/**
 * 0003: 第n週 (NthWeek)
 */
export const NTH_WEEK = {
  FIRST_WEEK: '1', // 第1週
  SECOND_WEEK: '2', // 第2週
  THIRD_WEEK: '3', // 第3週
  FOURTH_WEEK: '4', // 第4週
  LAST_WEEK: '5', // 最終週
} as const
export type NthWeekCode = (typeof NTH_WEEK)[keyof typeof NTH_WEEK]

/**
 * 0004: カテゴリ (Category)
 */
export const CATEGORY = {
  CLEAN: 'CLEAN', // 掃除
  GARBAGE: 'GARBAGE', // ゴミ出し
  GARDEN: 'GARDEN', // 庭の手入れ
  KITCHEN: 'KITCHEN', // キッチン関連
  OTHER: 'OTHER', // その他
  PET: 'PET', // ペット関連
} as const
export type CategoryCode = (typeof CATEGORY)[keyof typeof CATEGORY]

/**
 * 0005: 家事タスクステータス (TaskStatus)
 */
export const TASK_STATUS = {
  NOT_DONE: '0', // 未完了
  DONE: '1', // 完了
  SKIPPED: '9', // スキップ
} as const
export type TaskStatusCode = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

/**
 * 0006: 家事タスク割当理由 (TaskAssignReason)
 */
export const TASK_ASSIGN_REASON = {
  SELF_ASSIGNED: '1', // 自発的に担当
  BY_REQUEST: '2', // お願いされて
  FORCED: '9', // 押しつけられ
  SYSTEM_ASSIGNED: '0', // システム割当
} as const

/**
 * 0007: 世帯メンバー管理 (HouseholdMembers)
 */
export const HOUSEHOLD_MEMBER_STATUS = {
  INVITED: '0', // 招待中
  ACTIVE: '1', // 有効
  LEFT: '9', // 離脱
} as const
export type HouseholdMemberStatusCode =
  (typeof HOUSEHOLD_MEMBER_STATUS)[keyof typeof HOUSEHOLD_MEMBER_STATUS]

/**
 * 0008: 世帯招待ステータス (InvitationStatus)
 */
export const INVITATION_STATUS = {
  PENDING: '0', // 招待中
  ACCEPTED: '1', // 承認済み
  DECLINED: '7', // 拒否
  REVOKED: '8', // 取消し
  EXPIRED: '9', // 期限切れ
} as const
export type InvitationStatusCode = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS]

/**
 * 0009: 買い物アイテムステータス (ShoppingItemStatus)
 */
export const SHOPPING_ITEM_STATUS = {
  NOT_PURCHASED: '0', // 未購入
  IN_BASKET: '1', // かごに入れた
  PURCHASED: '9', // 購入済み
} as const
export type ShoppingItemStatusCode =
  (typeof SHOPPING_ITEM_STATUS)[keyof typeof SHOPPING_ITEM_STATUS]

/**
 * 0010: 購入場所種別 (PurchaseLocationType)
 */
export const PURCHASE_LOCATION_TYPE = {
  SUPERMARKET: '1', // スーパー
  ONLINE: '2', // オンライン
  DRUGSTORE: '3', // ドラッグストア
} as const
export type PurchaseLocationTypeCode =
  (typeof PURCHASE_LOCATION_TYPE)[keyof typeof PURCHASE_LOCATION_TYPE]

/**
 * 0011: お知らせステータス (NotificationStatus)
 */
export const NOTIFICATION_STATUS = {
  INACTIVE: '0', // 無効
  ACTIVE: '1', // 有効
} as const

/**
 * 0012: プログラム種別 (ProgramType)
 * ※フロントでは利用しない。
 */
export const PROGRAM_TYPE = {
  ADMIN: '0', // 管理者ブログ
  SYSTEM: '1', // システム
} as const

/**
 * 0013: お気に入りフラグ (FavoriteFlag)
 */
export const FAVORITE_FLAG = {
  NORMAL: '0', // 通常
  FAVORITE: '1', // お気に入り
} as const

/**
 * 0019: 通知リンク種別 (NotificationLinkType)
 */
export const NOTIFICATION_LINK_TYPE = {
  NONE: 'None',
  MY_TASKS: 'MyTasks',
  HOUSEHOLD: 'Household',
  INVITATION: 'Invite',
  SETTINGS: 'Settings',
} as const
export type NotificationLinkTypeCode =
  (typeof NOTIFICATION_LINK_TYPE)[keyof typeof NOTIFICATION_LINK_TYPE]
