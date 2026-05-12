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
  HOUSEHOLD_MEMBER_STATUS: '0007', // HouseholdMemberStatus (世帯メンバーステータス)
  INVITATION_STATUS: '0008', // InvitationStatus (世帯招待ステータス)
  SHOPPING_ITEM_STATUS: '0009', // ShoppingItemStatus (買い物アイテムステータス)
  PURCHASE_LOCATION_TYPE: '0010', // PurchaseLocationType (購入場所種別)
  NOTIFICATION_STATUS: '0011', // NotificationStatus (お知らせステータス)
  PROGRAM_TYPE: '0012', // ProgramType (プログラム種別)
  FAVORITE_FLAG: '0013', // FavoriteFlag (お気に入りフラグ)
  TASK_RECALC_STATUS: '0014', // TaskRecalcStatus (家事タスク再計算ステータス)
  AUTH_PROVIDER: '0015', // AuthProvider (認証プロバイダー)
  OAUTH_FLOW: '0016', // OAuthFlow (OAuth Flow)
  NOTIFICATION_TYPE: '0017', // NotificationType (通知種別)
  EVENT_STATUS: '0018', // EventStatus (イベントステータス)
  NOTIFICATION_LINK_TYPE: '0019', // NotificationLinkType (通知リンク種別)
  NOTIFICATION_GROUP: '0020', // NotificationGroup (通知グループ)
  INQUIRY_CATEGORY: '0021', // InquiryCategory (問い合わせカテゴリ)
  INQUIRY_STATUS: '0022', // InquiryStatus (問い合わせステータス)
  SENDER_TYPE: '0023', // SenderType (送信者タイプ)
  USER_ROLE: '0024', // UserRole (ユーザーロール)
  PERMISSION: '0025', // Permission (パーミッション)
  THEME_MODE: '0026', // ThemeMode (テーマモード)
  ANNOUNCEMENT_SCOPE: '0027', // AnnouncementScope (アナウンス対象スコープ)
  ANNOUNCEMENT_SEVERITY: '0028', // AnnouncementSeverity (アナウンス重要度)
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
  PET: 'PET', // ペット関連
  CLEANING: 'CLEAN', // 掃除
  GARBAGE: 'GARBAGE', // ゴミ出し
  GARDEN: 'GARDEN', // 庭の手入れ
  KITCHEN: 'KITCHEN', // キッチン関連
  OTHER: 'OTHER', // その他
} as const
export type CategoryCode = (typeof CATEGORY)[keyof typeof CATEGORY]

/**
 * 0005: 家事タスクステータス (TaskStatus)
 */
export const TASK_STATUS = {
  NOT_DONE: '0', // 未対応
  DONE: '1', // 完了
  SKIPPED: '9', // スキップ
} as const
export type TaskStatusCode = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

/**
 * 0006: 家事タスク割当理由 (TaskAssignReason)
 */
export const TASK_ASSIGN_REASON = {
  SELF_ASSIGNED: '0', // 自発的に担当
  BY_REQUEST: '1', // お願いされて担当
  FORCED: '2', // 押しつけられた
  SYSTEM_ASSIGNED: '9', // システム割当
} as const
export type TaskAssignReasonCode = (typeof TASK_ASSIGN_REASON)[keyof typeof TASK_ASSIGN_REASON]

/**
 * 0007: 世帯メンバーステータス (HouseholdMemberStatus)
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
  REVOKED: '8', // 取り消し
  EXPIRED: '9', // 期限切れ
} as const
export type InvitationStatusCode = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS]

/**
 * 0009: 買い物アイテムステータス (ShoppingItemStatus)
 */
export const SHOPPING_ITEM_STATUS = {
  NOT_PURCHASED: '0', // 未購入
  IN_BASKET: '1', // かご
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
  ACTIVE: '1', // 有効
  INACTIVE: '0', // 無効
} as const
export type NotificationStatusCode = (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS]

/**
 * 0012: プログラム種別 (ProgramType)
 */
export const PROGRAM_TYPE = {
  SYSTEM: 'SYSTEM', // システム
  ADMIN: 'ADMIN', // 管理者プログラム
  ONL_AUTH: 'OnlAuth', // ONL_AUTH
  ONL_CODE: 'OnlCode', // ONL_CODE
  ONL_HLDAUTH: 'OnlHldAuth', // ONL_HLDAUTH
  ONL_HLDINVI: 'OnlHldInvi', // ONL_HLDINVI
  ONL_HLDMEM: 'OnlHldMem', // ONL_HLDMEM
  ONL_HLD: 'OnlHld', // ONL_HLD
  ONL_HWR: 'OnlHwr', // ONL_HWR
  ONL_HWRTSK: 'OnlHwrTsk', // ONL_HWRTSK
  ONL_SHPATCH: 'OnlShpAtch', // ONL_SHPATCH
  ONL_SHP: 'OnlShp', // ONL_SHP
  ONL_USRICON: 'OnlUsrIcon', // ONL_USRICON
  ONL_USR: 'OnlUsr', // ONL_USR
  ONL_PWDRST: 'OnlPwdRst', // ONL_PWDRST
  ONL_AUTH_GOOGLE: 'OnlAuthGgl', // ONL_AUTH_GOOGLE
  ONL_NTF_QRY: 'OnlNtfQry', // ONL_NTF_QRY
  ONL_INQRY: 'OnlInqry', // ONL_INQRY
  ONL_USR_ROLE: 'OnlUsrRole', // ONL_USR_ROLE
  ONL_ADM_INQ: 'OnlAdmInq', // ONL_ADM_INQ
  ONL_ADM_USR: 'OnlAdmUsr', // ONL_ADM_USR
  ONL_ADM_HW_TP: 'OnlAdmHwTp', // ONL_ADM_HW_TP
  ONL_ADM_ANN: 'OnlAdmAnn', // ONL_ADM_ANN
  BTC_INV_EXPR: 'BtcInvExpr', // BTC_INV_EXPR
  BTC_TSK_GEN: 'BtcTskGen', // BTC_TSK_GEN
  BTC_TSK_RECL: 'BtcTskRecl', // BTC_TSK_RECL
  BTC_HLD_CLEN: 'BtcHldClen', // BTC_HLD_CLEN
  BTC_NTF_AGGR: 'BtcNtfAggr', // BTC_NTF_AGGR
  BTC_INQ_AI: 'BtcInqAI', // BTC_INQ_AI
} as const
export type ProgramTypeCode = (typeof PROGRAM_TYPE)[keyof typeof PROGRAM_TYPE]

/**
 * 0013: お気に入りフラグ (FavoriteFlag)
 */
export const FAVORITE_FLAG = {
  NORMAL: '0', // 通常
  FAVORITE: '1', // お気に入り
} as const
export type FavoriteFlagCode = (typeof FAVORITE_FLAG)[keyof typeof FAVORITE_FLAG]

/**
 * 0014: 家事タスク再計算ステータス (TaskRecalcStatus)
 */
export const TASK_RECALC_STATUS = {
  PENDING: '0', // 保留中
  PROCESSING: '1', // 処理中
  DONE: '2', // 完了
  FAILED: '9', // 失敗
} as const
export type TaskRecalcStatusCode = (typeof TASK_RECALC_STATUS)[keyof typeof TASK_RECALC_STATUS]

/**
 * 0015: 認証プロバイダー (AuthProvider)
 */
export const AUTH_PROVIDER = {
  LOCAL: 'LOCAL', // Local
  GOOGLE: 'GOOGLE', // Google
} as const
export type AuthProviderCode = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER]

/**
 * 0016: OAuth Flow (OAuthFlow)
 */
export const OAUTH_FLOW = {
  LINK: 'LINK', // Link
  LOGIN: 'LOGIN', // Login
} as const
export type OAuthFlowCode = (typeof OAUTH_FLOW)[keyof typeof OAUTH_FLOW]

/**
 * 0017: 通知種別 (NotificationType)
 */
export const NOTIFICATION_TYPE = {
  INVITATION_ACCEPTED: '0101', // 招待が承認されました
  INVITATION_DECLINED: '0102', // 招待が辞退されました
  HAVE_BEEN_REMOVED: '0201', // おうちから離脱させられました
  LEFT_THE_HOUSEHOLD: '0202', // おうちから離脱しました
  ASSIGNED_TO_THE_OWNER: '0203', // おうちのオーナーにアサインされました
  TASK_ASSIGNED: '0301', // タスクが割り当てられました
  BE_DUMPED_TASK: '0302', // タスクが押し付けられた
  YOUR_TASK_WAS_TAKEN: '0303', // タスクが奪われた
  YOUR_INQUIRY_HAS_BEEN_REPLIED: '0401', // 問い合わせに返信がありました
} as const
export type NotificationTypeCode = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]

/**
 * 0018: イベントステータス (EventStatus)
 */
export const EVENT_STATUS = {
  PENDING: '0', // 保留中
  PROCESSING: '1', // 処理中
  DONE: '2', // 完了
} as const
export type EventStatusCode = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]

/**
 * 0019: 通知リンク種別 (NotificationLinkType)
 */
export const NOTIFICATION_LINK_TYPE = {
  NONE: 'None', // なし
  MY_TASKS: 'MyTasks', // My Tasks
  HOUSEHOLD: 'Household', // おうち設定
  INVITATION: 'Invite', // 招待
  SETTINGS: 'Settings', // 設定
  INQUIRY_DETAIL: 'Inquiry', // 問い合わせ詳細
} as const
export type NotificationLinkTypeCode =
  (typeof NOTIFICATION_LINK_TYPE)[keyof typeof NOTIFICATION_LINK_TYPE]

/**
 * 0020: 通知グループ (NotificationGroup)
 */
export const NOTIFICATION_GROUP = {
  HOUSEHOLD: '100', // おうち関連
  TASK_ASSIGNMENT: '200', // タスク割当
  INQUIRY: '900', // 問い合わせ
} as const
export type NotificationGroupCode = (typeof NOTIFICATION_GROUP)[keyof typeof NOTIFICATION_GROUP]

/**
 * 0021: 問い合わせカテゴリ (InquiryCategory)
 */
export const INQUIRY_CATEGORY = {
  GENERAL: '10', // 一般
  HOUSEWORK: '20', // 家事機能
  SHOPPING: '21', // 買い物機能
  ACCOUNT_SETTINGS: '30', // アカウント設定
  BUG_REPORT: '40', // 不具合報告
  OTHER: '90', // その他
} as const
export type InquiryCategoryCode = (typeof INQUIRY_CATEGORY)[keyof typeof INQUIRY_CATEGORY]

/**
 * 0022: 問い合わせステータス (InquiryStatus)
 */
export const INQUIRY_STATUS = {
  OPEN: '00', // 受付中
  AI_ANSWERED: '10', // AI返信済
  PENDING_STAFF: '20', // スタッフ対応待ち
  STAFF_ANSWERED: '25', // スタッフ返信済
  CLOSED: '90', // クローズ
} as const
export type InquiryStatusCode = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS]

/**
 * 0023: 送信者タイプ (SenderType)
 */
export const SENDER_TYPE = {
  YOU: 'USER', // あなた
  AI_SUPPORT: 'AI', // AIサポート
  STAFF: 'STAFF', // スタッフ
} as const
export type SenderTypeCode = (typeof SENDER_TYPE)[keyof typeof SENDER_TYPE]

/**
 * 0024: ユーザーロール (UserRole)
 */
export const USER_ROLE = {
  ADMIN: 'ADMIN', // 管理者
  SUPPORT: 'SPPRT', // サポート
} as const
export type UserRoleCode = (typeof USER_ROLE)[keyof typeof USER_ROLE]

/**
 * 0025: パーミッション (Permission)
 */
export const PERMISSION = {
  USER_LIST_VIEW: '10', // ユーザー一覧閲覧
  ROLE_MANAGEMENT: '11', // ロール管理
  INQUIRY_REPLY: '20', // 問い合わせ返信
  SYSTEM_TEMPLATE_MANAGEMENT: '30', // システムテンプレート管理
  ANNOUNCEMENT_MANAGEMENT: '40', // アナウンス管理
} as const
export type PermissionCode = (typeof PERMISSION)[keyof typeof PERMISSION]

/**
 * 0026: テーマモード (ThemeMode)
 */
export const THEME_MODE = {
  SYSTEM: 'SYSTEM', // システム
  LIGHT: 'LIGHT', // ライト
  DARK: 'DARK', // ダーク
} as const
export type ThemeModeCode = (typeof THEME_MODE)[keyof typeof THEME_MODE]

/**
 * 0027: アナウンス対象スコープ (AnnouncementScope)
 */
export const ANNOUNCEMENT_SCOPE = {
  ALL: 'ALL', // 全画面
  HOME: 'HOME', // ホーム
  HOUSEWORK_ASSIGN: 'HW_ASSIGN', // 家事割り当て
  MY_TASKS: 'HW_TASK', // マイタスク
  HOUSEWORK_SETTINGS: 'HW_CONF', // 家事設定
  SHOPPING: 'SHOPPING', // 買い物リスト
  ACCOUNT_SETTINGS: 'CONF_ACCT', // アカウント設定
  HOUSEHOLD_SETTINGS: 'CONF_HH', // 世帯設定
  APP_SETTINGS: 'CONF_APP', // アプリ設定
  NOTIFICATION: 'NOTIFY', // 通知
  INQUIRY: 'INQUIRY', // お問い合わせ
  ADMIN: 'ADMIN', // 管理
} as const
export type AnnouncementScopeCode = (typeof ANNOUNCEMENT_SCOPE)[keyof typeof ANNOUNCEMENT_SCOPE]

/**
 * 0028: アナウンス重要度 (AnnouncementSeverity)
 */
export const ANNOUNCEMENT_SEVERITY = {
  INFO: 'INFO', // お知らせ
  WARNING: 'WARN', // 警告
  ERROR: 'ERROR', // 重要
} as const
export type AnnouncementSeverityCode =
  (typeof ANNOUNCEMENT_SEVERITY)[keyof typeof ANNOUNCEMENT_SEVERITY]
