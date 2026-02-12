# Google OAuth

## 1. 概要
HwHubではメールアドレス/パスワードを使ったログインとGoogleアカウントを使ったログインをサポートする。当文章はGoogleアカウントを使ったログインとGoogleアカウントの連携について記載する。

## 2. シーケンス図

```mermaid
sequenceDiagram
  participant U as User Browser (Vue)
  participant G as Google OAuth
  participant CF as Cloudflare (DNS/HTTPS)
  participant ALB as ALB (public)
  participant ECS as ECS Backend (private)

  U->>G: 1) GET /o/oauth2/v2/auth (PKCE, state)
  G-->>U: 2) Redirect back to redirect_uri?code=...&state=...

  U->>CF: 3) POST https://stg.../api/auth/google (code, code_verifier)
  CF->>ALB: 4) Forward
  ALB->>ECS: 5) Forward to backend

  ECS->>G: 6) POST https://oauth2.googleapis.com/token (code + verifier)
  G-->>ECS: 7) id_token / access_token

  ECS-->>U: 8) HwHub JWT (accessToken etc)
  U->>U: 9) store token, go home
```

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant FE as Frontend (Vue)
  participant BE as Backend (Spring)
  participant OAUTH as Google OAuth
  participant TOK as Google Token Endpoint
  participant USERINFO as Google UserInfo
  participant DB as DB (m_user)
  participant JWT as JwtProvider

  %% ========== Google LOGIN ==========
  rect rgb(245,245,255)
    note over U,BE: Google Login Flow (/oauth/google/start -> /oauth/google/callback)

    U->>FE: Click "Continue with Google"
    FE->>BE: GET /oauth/google/start
    BE->>BE: state生成 (kind="", subject="", exp, nonce) + 署名
    BE-->>FE: 302 Location: https://accounts.google.com/...&state=...
    FE->>OAUTH: Redirect (Authorization Request)

    OAUTH-->>FE: Redirect to redirect_uri with code + state
    FE->>BE: GET /oauth/google/callback?code&state (+ cookie state)
    BE->>BE: state検証 (cookie一致 + 署名 + exp)

    BE->>TOK: POST /token (code -> access_token)
    TOK-->>BE: access_token (+ id_token等)
    BE->>USERINFO: GET /userinfo (Bearer access_token)
    USERINFO-->>BE: sub,email,name,picture,...

    BE->>DB: loginOrCreate (sub/emailでユーザー特定/作成)
    DB-->>BE: UserModel(userId,...)
    BE->>JWT: generateToken(userId, displayName)
    JWT-->>BE: jwt

    BE-->>FE: 302 Location: {front}/login?notice=googleLoginSuccess&token=jwt
    FE->>FE: completeOAuthLogin(jwt) -> fetchProfile etc.
  end

  %% ========== Google LINK (logged-in user) ==========
  rect rgb(245,255,245)
    note over U,BE: Google Link Flow (/api/users/me/google/link/start -> /oauth/google/callback)

    U->>FE: Settings -> "Link Google"
    FE->>BE: GET /api/users/me/google/link/start (Bearer jwt)
    BE->>BE: userId取得 (Authentication)
    BE->>BE: state生成 (kind="LINK", subject=userId, exp, nonce) + 署名
    BE-->>FE: 200 { authorizationUrl }  or 302 (どちらでも可)
    FE->>OAUTH: Redirect (Authorization Request)

    OAUTH-->>FE: Redirect to redirect_uri with code + state
    FE->>BE: GET /oauth/google/callback?code&state (+ cookie state)
    BE->>BE: state検証 (cookie一致 + 署名 + exp)
    BE->>BE: purpose=extractPurpose(state) == "LINK"
    BE->>BE: linkUserId=extractSubject(state)

    BE->>TOK: POST /token (code -> access_token)
    TOK-->>BE: access_token
    BE->>USERINFO: GET /userinfo (Bearer access_token)
    USERINFO-->>BE: sub,email,name,...

    BE->>DB: linkGoogleAccount(linkUserId, sub,email,name)
    note over BE,DB: password_hash=NULL など（以後パスワードログイン不可）
    DB-->>BE: updated

    BE->>JWT: generateToken(linkUserId, displayName)
    JWT-->>BE: jwt(new)

    BE-->>FE: 302 Location: {front}/settings/account?notice=googleLinked&token=jwt
    FE->>FE: completeOAuthLogin(jwt) -> fetchProfile etc.
  end
```

## 3. API仕様

### 3.1. Google OAuth: ログイン
OAuthでHwHubにログインする際に利用するAPI群。

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /oauth/google/start | Google OAuth開始。stateを生成し、Cookieに保存後、Googleの認証画面にリダイレクトする。 |
| GET | /oauth/google/callback | Google OAuthコールバック。stateを検証後、Googleからアクセストークンを取得し、HwHubのJWTを生成して返す。 |

### 3.2. Google Link: アカウントの連携
ログイン中のHwHubアカウントにGoogleアカウントを連携する際に利用するAPI群。

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /api/users/me/google/link/start | Google Link開始。stateを生成し、Cookieに保存後、Googleの認証画面にリダイレクトする。 |
| GET | /api/users/me/google/link/callback | Google Linkコールバック。stateを検証後、Googleからアクセストークンを取得し、HwHubのJWTを生成して返す。 |
