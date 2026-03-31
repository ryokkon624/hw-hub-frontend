# API 連携状況一覧

本ドキュメントでは、各画面で使用されているバックエンド API の連携状況をまとめます。
エンドポイントは Swagger 仕様に基づいたパスを記述しています。

## 凡例
- **メソッド**: HTTPメソッド (GET, POST, PUT, DELETE, PATCH)
- **関連コンポーネント**: API呼び出しを行っている主な Store または Api ファイル
- **パスパラメータ**: `{id}` や `{token}` などで表記

---

## 1. 認証・アカウント関連

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **ログイン** | POST | `/api/auth/login` | メールアドレス・パスワードでのログイン認証 | `authStore` (`authApi`) |
| **サインアップ** | POST | `/api/auth/register` | 新規アカウント登録 | `authStore` (`authApi`) |
| **メール認証** | POST | `/api/auth/email-verification/verify` | トークンを用いたメール有効化処理 | `authStore` (`authApi`) |
| **認証メール待機** | POST | `/api/auth/email-verification/resend` | 認証メールの再送処理 | `authStore` (`authApi`) |
| **パスワード忘れ** | POST | `/api/auth/password-reset/request` | パスワードリセットメールの送信要求 | `passwordResetStore` (`passwordResetApi`) |
| **パスワード再設定** | POST | `/api/auth/password-reset/confirm` | 新しいパスワードの設定 | `passwordResetStore` (`passwordResetApi`) |
| **招待受け取り** | GET | `/api/household-invitations/{token}` | 招待情報の取得（世帯名などの確認） | `householdInvitationApi` |
| | POST | `/api/household-invitations/{token}/accept` | 招待の受諾（世帯への参加） | `householdInvitationApi` |
| | POST | `/api/household-invitations/{token}/decline` | 招待の辞退 | `householdInvitationApi` |

## 2. メイン機能（ホーム・家事）

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **ホーム** | GET | `/api/users/me/households` | 所属世帯一覧の取得 | `householdStore` (`userApi`) |
| | GET | `/api/households/{id}/members` | 世帯メンバー一覧の取得 | `householdStore` (`householdApi`) |
| | GET | `/api/houseworks` | 家事マスタ一覧の取得 | `houseworkStore` (`houseworkApi`) |
| | GET | `/api/housework-tasks` | 家事タスク（未完了/完了）の取得 | `houseworkTaskStore` (`houseworkTaskApi`) |
| | GET | `/api/households/{id}/shopping-items` | 買い物リストの取得 | `shoppingStore` (`shoppingItemApi`) |
| **家事分担** | GET | `/api/housework-tasks` | 家事タスク一覧の取得（絞り込み含む） | `houseworkTaskStore` (`houseworkTaskApi`) |
| | PATCH | `/api/housework-tasks/{id}/assign` | タスク担当者の変更 | `houseworkTaskStore` (`houseworkTaskApi`) |
| | PATCH | `/api/housework-tasks/bulk-status` | タスクステータスの一括更新（完了/スキップ） | `houseworkTaskStore` (`houseworkTaskApi`) |
| **My Tasks** | GET | `/api/housework-tasks` | 担当タスク一覧の取得 | `houseworkTaskStore` (`houseworkTaskApi`) |
| | PATCH | `/api/housework-tasks/{id}/status` | タスクの完了/スキップ登録 | `houseworkTaskStore` (`houseworkTaskApi`) |
| | PATCH | `/api/housework-tasks/bulk-status` | タスクステータスの一括更新（完了/スキップ） | `houseworkTaskStore` (`houseworkTaskApi`) |
| **家事設定一覧** | GET | `/api/houseworks` | 家事マスタ一覧の取得 | `houseworkStore` (`houseworkApi`) |
| | DELETE | `/api/houseworks/{id}` | 家事マスタの削除 | `houseworkStore` (`houseworkApi`) |
| **家事新規作成** | POST | `/api/houseworks` | 新しい家事マスタの登録 | `houseworkStore` (`houseworkApi`) |
| | GET | `/api/housework-templates` | システムテンプレート全件取得（モーダル表示用） | `houseworkTemplateStore` (`houseworkTemplateApi`) |
| **家事編集** | GET | `/api/houseworks/{id}` | 家事マスタ詳細の取得 | `houseworkStore` (`houseworkApi`) |
| | PUT | `/api/houseworks/{id}` | 家事マスタ情報の更新 | `houseworkStore` (`houseworkApi`) |

## 3. 買い物リスト

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **買い物リスト** | GET | `/api/households/{id}/shopping-items` | 買い物アイテム一覧の取得 | `shoppingStore` (`shoppingItemApi`) |
| | PATCH | `/api/shopping-items/{id}/status` | ステータス変更（未購入/かご/購入済み） | `shoppingStore` (`shoppingItemApi`) |
| | PATCH | `/api/shopping-items/{id}/favorite` | お気に入りの切替 | `shoppingStore` (`shoppingItemApi`) |
| **買い物アイテム作成** | POST | `/api/households/{id}/shopping-items` | 新しい買い物アイテムの登録 | `shoppingStore` (`shoppingItemApi`) |
| | GET | `/api/households/{id}/shopping-items/favorites` | お気に入り買い物アイテム一覧の取得 | `shoppingFavoriteStore` (`shoppingItemApi`) |
| | GET | `/api/households/{id}/shopping-items/history-suggestions` | 過去の買い物履歴からのサジェスト取得 | `shoppingHistoryStore` (`shoppingItemApi`) |
| **買い物アイテム詳細** | PUT | `/api/households/{id}/shopping-items/{itemId}` | アイテム基本情報の更新 | `shoppingStore` (`shoppingItemApi`) |
| | GET | `/api/shopping-items/{itemId}/attachments` | 添付画像一覧の取得 | `attachmentStore` (`shoppingItemAttachmentApi`) |
| | POST | `/api/shopping-items/{itemId}/attachments/upload-url` | 画像アップロード用URLの生成 | `attachmentStore` (`shoppingItemAttachmentApi`) |
| | PUT | (S3 Presigned URL) | 画像の実体アップロード | `authApi` (`putToPresignedUrl`) |
| | POST | `/api/shopping-items/{itemId}/attachments` | アップロード完了画像の登録 | `attachmentStore` (`shoppingItemAttachmentApi`) |
| | DELETE | `/api/shopping-items/{itemId}/attachments/{id}` | 添付画像の削除 | `attachmentStore` (`shoppingItemAttachmentApi`) |

## 4. 設定画面

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **アカウント設定** | GET | `/api/users/me/profile` | ユーザ情報の取得 | `userApi` |
| | PUT | `/api/users/me/profile` | 表示名・言語設定の更新 | `userApi` |
| | PUT | `/api/users/me/password` | パスワードの変更 | `userApi` |
| | POST | `/api/users/me/icon/upload-url` | アイコンアップロード用URL生成 | `userApi` |
| | POST | `/api/users/me/icon` | ユーザアイコン情報の更新 | `userApi` |
| | GET | `/api/users/me/notification-settings` | 通知設定の取得 | `notificationSettingsStore` (`userApi`) |
| | PUT | `/api/users/me/notification-settings` | 通知設定の更新（グローバルON/OFF・グループ別） | `notificationSettingsStore` (`userApi`) |
| | DELETE | `/api/users/me` | アカウントの削除（退会） | `userApi` |
| **世帯設定** | GET | `/api/users/me/households` | 所属世帯一覧の取得 | `householdStore` (`userApi`) |
| | POST | `/api/households` | 新しい世帯の作成 | `householdStore` (`householdApi`) |
| | PUT | `/api/households/{id}` | 世帯名の変更 | `householdStore` (`householdApi`) |
| | DELETE | `/api/households/{id}` | 世帯の削除（オーナーのみ） | `householdStore` (`householdApi`) |
| | PUT | `/api/households/{id}/transfer-owner` | オーナー権限の譲渡 | `householdStore` (`householdApi`) |
| | GET | `/api/households/{id}/members` | メンバー一覧の取得 | `householdStore` (`householdApi`) |
| | PUT | `/api/households/{id}/members/me/nickname` | 世帯内ニックネームの変更 | `householdMemberApi` |
| | DELETE | `/api/households/{id}/members/me` | 世帯からの離脱 | `householdStore` (`householdMemberApi`) |
| | DELETE | `/api/households/{id}/members/{userId}` | メンバーの削除 | `householdStore` (`householdMemberApi`) |
| | GET | `/api/households/{id}/invitations` | 招待中リストの取得 | `invitationStore` (`householdInvitationApi`) |
| | POST | `/api/households/{id}/invitations` | 新規招待の作成 | `invitationStore` (`householdInvitationApi`) |
| | POST | `/api/household-invitations/{token}/revoke` | 招待の取り消し | `invitationStore` (`householdInvitationApi`) |

## 5. 通知センター

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **（全画面共通）** | GET | `/api/notifications/unread-count` | 未読通知件数の取得 | `notificationStore` (`notificationApi`) |
| **通知センター** | GET | `/api/notifications` | 通知一覧の取得 | `notificationStore` (`notificationApi`) |

## 6. その他 API

| API ファイル | メソッド | API エンドポイント | 機能概要 | 備考 |
| :--- | :--- | :--- | :--- | :--- |
| **codeApi** | GET | `/api/codes` | コードマスタ全件取得 | アプリ起動時に取得・キャッシュされる |
| **roleApi** | GET | `/api/users/me/roles` | ログインユーザーのロール・パーミッション取得 | ログイン後に自動取得・`roleStore` にキャッシュ |

## 7. 問い合わせ（ユーザー）

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **問い合わせ一覧** | GET | `/api/inquiries` | 自分の問い合わせ一覧取得 | `inquiryStore` (`inquiryApi`) |
| **問い合わせ詳細** | GET | `/api/inquiries/{inquiryId}` | 問い合わせ詳細（メッセージ含む）取得 | `inquiryStore` (`inquiryApi`) |
| **問い合わせ新規作成** | POST | `/api/inquiries` | 新規問い合わせ送信 | `inquiryStore` (`inquiryApi`) |
| **問い合わせ詳細** | POST | `/api/inquiries/{inquiryId}/messages` | 追加メッセージ送信 | `inquiryStore` (`inquiryApi`) |
| **問い合わせ詳細** | POST | `/api/inquiries/{inquiryId}/close` | 解決済みにする | `inquiryStore` (`inquiryApi`) |
| **問い合わせ詳細** | POST | `/api/inquiries/{inquiryId}/escalate` | スタッフ対応依頼 | `inquiryStore` (`inquiryApi`) |

## 8. 管理画面（要ロール・パーミッション）

### 8-1. ユーザー管理（USER_LIST_VIEW）

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **ユーザー管理** | GET | `/api/users/admin/search` | ユーザー検索（email/isActive/locale 絞り込み） | `adminUserStore` (`adminApi`) |
| | POST | `/api/users/admin` | ユーザー新規登録（認証スキップ・即時active） | `adminUserStore` (`adminApi`) |
| | PUT | `/api/users/admin/{userId}` | ユーザー情報更新（表示名/言語/パスワード/isActive） | `adminUserStore` (`adminApi`) |

### 8-2. ロール管理（ROLE_MANAGE）

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **ロール管理** | GET | `/api/admin/users` | ユーザー検索（email 部分一致） | `adminRoleStore` (`adminApi`) |
| | GET | `/api/users/me/roles` | ロール・パーミッション取得 | `roleStore` (`roleApi`) |
| | POST | `/api/admin/roles/{userId}` | ユーザーへのロール付与 | `adminRoleStore` (`adminApi`) |
| | DELETE | `/api/admin/roles/{userId}/{role}` | ユーザーからのロール削除 | `adminRoleStore` (`adminApi`) |

### 8-3. 問い合わせ管理（INQUIRY_REPLY）

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **問い合わせ管理（対応待ち）** | GET | `/api/admin/inquiries` | PENDING_STAFF 一覧取得（created_at ASC） | `adminInquiryStore` (`adminApi`) |
| **問い合わせ管理（全件検索）** | GET | `/api/admin/inquiries/search` | 全件検索（日付範囲/userId/カテゴリ/ステータス） | `adminInquiryStore` (`adminApi`) |
| **問い合わせ詳細（管理）** | GET | `/api/admin/inquiries/{inquiryId}` | 問い合わせ詳細取得（userId チェックなし） | `adminInquiryStore` (`adminApi`) |
| | POST | `/api/admin/inquiries/{inquiryId}/reply` | スタッフとして返信 | `adminInquiryStore` (`adminApi`) |

### 8-4. 家事テンプレート管理（SYS_TEMPLATE_MNG）

| 画面名 | メソッド | API エンドポイント | 機能概要 | 関連コンポーネント |
| :--- | :--- | :--- | :--- | :--- |
| **テンプレート管理（一覧）** | GET | `/api/admin/housework-templates` | テンプレート全件取得 | `adminHouseworkTemplateStore` (`adminApi`) |
| **テンプレート新規作成** | POST | `/api/admin/housework-templates` | テンプレート登録（3言語/周期設定） | `adminHouseworkTemplateStore` (`adminApi`) |
| **テンプレート編集** | PUT | `/api/admin/housework-templates/{id}` | テンプレート更新 | `adminHouseworkTemplateStore` (`adminApi`) |
| **テンプレート削除** | DELETE | `/api/admin/housework-templates/{id}` | テンプレート削除（物理削除） | `adminHouseworkTemplateStore` (`adminApi`) |
