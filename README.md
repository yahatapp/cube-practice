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

ルートのscriptsはworkspace全体の開発入口です。`web/package.json`のscriptsはNext.jsの開発・ビルド・起動だけを担当し、lintや型検査の設定は持ちません。通常はリポジトリルートからコマンドを実行してください。

現在、ローカル開発に必須の環境変数はありません。今後追加する場合はローカルでは`web/.env.local`、本番とPreview DeploymentではVercelのEnvironment Variablesを使います。

Git hook は依存関係のインストール後に次のコマンドで有効化できます。

```bash
pnpm run hooks:install
```

pre-commit では staged secret、コード品質、diff の空白エラー、ローカル環境ファイル、
500 KiB を超えるファイルを検査します。Codex Cloud では `.codex/setup.sh` が依存関係と
hook を自動セットアップします。

## CI / CD

Pull request と `main` への push では GitHub Actions が secret scan、静的検査、
Next.js production build、production dependency audit を実行します。

デプロイはVercelのGit連携が担当します。Pull requestと`main`以外のブランチにはPreview Deploymentが作成され、`main`へのpushはProduction Deploymentとして公開されます。Vercel側ではRoot Directoryを`web`に設定し、workspace packagesをビルドへ含めるため「Include source files outside of the Root Directory」を有効にしてください。

推奨するリポジトリ保護設定は [`SECURITY.md`](SECURITY.md) に記載しています。

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
