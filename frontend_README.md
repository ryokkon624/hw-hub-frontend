# Housework Hub (HwHub) - Frontend

## 概要

このリポジトリは、Housework Hub (HwHub) の **フロントエンド（SPA）** を提供します。

- Vue 3 + TypeScript
- Vite
- Pinia（状態管理）
- Vue Router（History モード）
- Tailwind CSS
- Lucide
- 多言語対応（vue-i18n）

ホスティング：

- S3 + CloudFront
- stg 環境例： https://stg.familyapp-hwhub.com

---

## ディレクトリ構成

```
src/
    api # API クライアント
    assets # 画像等の静的リソース
    components # 共通コンポーネント
    composables # Composition API ヘルパ
    constants # 定数定義
    domain # ドメインモデル / 型定義
    i18n # 多言語リソース
    layouts # レイアウト
    router # Vue Router 定義
    stores # Pinia ストア（※API呼び出しはここからのみ）
    utils # ユーティリティ
    views # 画面
    __tests__ # 単体テスト
```

設計ルール：

- **API Callは必ず Store の Action からAPIクラインとを呼び出し実行**
- View / Component から直接 API を呼ばない
- 単方向データフローを厳守
- アイコンを使う場合はLucideを利用し、各ファイルで使うアイコンだけ import する（named import）

---

## デザインシステム

カラートークンはすべて `src/assets/main.css` の `@layer utilities` で定義されています。
新しい色を使う場合は Tailwind の生クラスを直接書かず、必ずトークンを追加してから使用してください。

---

## ローカル開発

### 依存関係のインストール

```bash
npm install
```

### 開発サーバ起動

```bash
npm run dev
```

---

## ビルド

stg 用ビルド：

```bash
npm run build -- --mode stg
```

成果物：

dist/

---

## テスト

```bash
npm run test:unit
```

---

## カバレッジ

```bash
npm run test:unit -- --coverage
```

（CI では GitHub Pages に自動公開）

---

## デプロイフロー（stg）

1. main ブランチに push
2. GitHub Actions が：
   - build
   - test
   - S3 にアップロード
   - CloudFront のキャッシュ削除

---

## CloudFront SPA 設定

- 403 / 404 → /index.html にフォールバックする設定済み
- Vue Router history モード対応

---

## 環境変数

- VITE_API_BASE_URL
- VITE_APP_ENV

などは .env.stg / .env.production で管理

---

## 運用時の確認ポイント

- CloudFront のキャッシュ状態
- S3 の配置ファイル
- API 接続先の向き先

---
