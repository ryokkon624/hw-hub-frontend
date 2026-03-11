/// <reference types="vite/client" />

interface ImportMetaEnv {
  // GitHub Actions の git describe から注入されるバージョン文字列
  // STG: v1.0.0-stg.3 / PRD: v1.0.0 / ローカル: "local"
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
