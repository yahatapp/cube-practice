# Cube Practice Timer

3×3×3向けのWCA形式スクランブル、計測、セッション統計を備えたモバイルファーストのPWAです。

## 開発

このリポジトリはpnpm workspaceです。`web/`にNext.jsアプリ、`packages/`にWebと将来のExpoアプリで共有するプラットフォーム非依存ロジックを配置します。Nix development shellがNode.js 24、pnpm、Vite+を提供します。

```bash
nix develop
vp install
cp web/.dev.vars.example web/.dev.vars
vp run dev
```

ルートから`pnpm dev`でWebアプリを起動できます。品質管理はVite+へ統一しており、静的検査（format・lint・型検査）は`pnpm check`、個別実行は`pnpm format`、`pnpm lint`、`pnpm typecheck`を使います。共有ドメインのテストは`pnpm test`です。

ルートのscriptsはworkspace全体の開発入口です。`web/package.json`のscriptsはNext.jsとCloudflareの実行・ビルド・デプロイだけを担当し、lintや型検査の設定は持ちません。通常はリポジトリルートからコマンドを実行してください。Cloudflare Workersランタイムでの確認は`pnpm preview`、デプロイは`pnpm deploy`を使います。

## 主な機能

- `web/src`を使ったNext.js App Router + React Server Components
- pnpm workspaceによるWeb・共有ドメイン分離
- `packages/scramble`のプラットフォーム非依存スクランブル生成
- `packages/timerDomain`の共通Solve型・時間表示・統計計算
- Route Handlerで20〜22手の3×3スクランブル生成
- TanStack QueryのRSC prefetch / hydrationとクライアント再取得
- Space長押し・タップ操作に対応したタイマー
- 記録の端末保存、Best・Ao5・Ao12・Ao100統計
- 計測終了後の次スクランブル自動生成、履歴表示・削除
- Material Design 3を基調としたレスポンシブUI
- Web App Manifest、Service Worker、モバイル向け UI

設計判断とロードマップは [`docs/architecture.md`](docs/architecture.md) を参照してください。
