# Cube Practice Timer

3×3×3向けのWCA形式スクランブル、計測、セッション統計を備えたモバイルファーストのPWAです。

## 開発

このリポジトリはpnpm workspaceです。`web/`にNext.jsアプリ、`packages/`にWebと将来のExpoアプリで共有するプラットフォーム非依存ロジックを配置します。Nix development shellがNode.js 24、pnpm、Vite+を提供します。

```bash
nix develop
vp install
vp run dev
```

ルートから`pnpm dev`でWebアプリを起動できます。品質管理はVite+へ統一しており、静的検査（format・lint・型検査）は`pnpm check`、個別実行は`pnpm format`、`pnpm lint`、`pnpm typecheck`を使います。共有ドメインのテストは`pnpm test`です。

ルートのscriptsはworkspace全体の開発入口です。`web/package.json`のscriptsはNext.jsの開発・静的ビルドとCloudflare Workersでのプレビュー・デプロイを担当し、lintや型検査の設定は持ちません。通常はリポジトリルートからコマンドを実行してください。Workers Static Assetsでの確認は`pnpm preview`、デプロイ設定の検証は`pnpm deploy:dry-run`、デプロイは`pnpm deploy`を使います。

現在、アプリの実行に必須の環境変数はありません。公開値を追加する場合はビルド時の`NEXT_PUBLIC_*`環境変数を使い、秘密情報を静的アプリへ埋め込まないでください。

Git hook は依存関係のインストール後に次のコマンドで有効化できます。

```bash
pnpm run hooks:install
```

pre-commit では staged secret、コード品質、diff の空白エラー、ローカル環境ファイル、
500 KiB を超えるファイルを検査します。Codex Cloud では `.codex/setup.sh` が依存関係と
hook を自動セットアップします。

## CI / CD

Pull requestでは`CI` workflowがsecret scan、静的検査、Next.js static export、
Cloudflare deployment dry-run、production dependency auditを実行します。

Pull requestが`main`へマージされると`Deploy` workflowがリリース検証、監査、静的exportを行い、GitHubの`production` environmentを介してCloudflare Workers Static Assetsへデプロイします。environment secretsに`CLOUDFLARE_ACCOUNT_ID`と、対象Workerをデプロイできる最小権限の`CLOUDFLARE_API_TOKEN`を設定してください。

推奨するリポジトリ保護設定は [`SECURITY.md`](SECURITY.md) に記載しています。

## 主な機能

- `web/src`を使ったNext.js App Routerの静的SPA
- pnpm workspaceによるWeb・共有ドメイン分離
- `packages/scramble`のプラットフォーム非依存スクランブル生成
- `packages/timerDomain`の共通Solve型・時間表示・統計計算
- Web Crypto APIを使ったブラウザ内での20〜22手の3×3スクランブル生成
- Space長押し・タップ操作に対応したタイマー
- 記録の端末保存、Best・Ao5・Ao12・Ao100統計
- 計測終了後の次スクランブル自動生成、履歴表示・削除
- Material Design 3を基調としたレスポンシブUI
- Web App Manifest、Service Worker、モバイル向け UI

設計判断とロードマップは [`docs/architecture.md`](docs/architecture.md) を参照してください。
