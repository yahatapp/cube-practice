# アプリケーション構成

## 目的

最初のリリースは「高機能なキューブビューア」ではなく、日常的に使えるタイマーを中心にする。通常ソルブ、X-Cross、F2L 第1ペア読みを同じ操作感で計測し、どの読みがボトルネックかを見つけられる状態を目指す。

## 技術選定

- Next.js 16.3 / React 19.2: App Router、React Server Components、Route Handlers を利用する。
- Vercel: Next.jsのネイティブ実行環境とGit連携を使い、SSR、React Server Components、Route Handlersを追加アダプターなしで配置する。
- TanStack Query 5: API 由来のサーバー状態を取得・キャッシュする。画面遷移そのものは Next.js App Router が担当する。
- React built-ins: タイマーなど画面内だけの状態は `useState` / `useReducer` で持つ。共有状態が複雑になるまで Zustand 等は追加しない。
- Tailwind CSS 4: デザイントークンとレスポンシブ UI の基盤。現段階では小さなグローバル CSS に集約する。
- PWA: manifest と最小 Service Worker を用意する。オフライン時はアプリシェルを表示できるが、完全なオフライン計測・同期は次段階。
- pnpm workspace: Next.js Webアプリと、将来のExpoアプリから利用する共有ドメインを分離する。

## データフロー

1. `web/src/app/page.tsx`（Server Component）が最初のスクランブルを生成し、TanStack Queryのキャッシュとしてdehydrated stateを渡す。
2. `TimerWorkspace`（Client Component）がそのキャッシュを即時表示する。
3. 次のスクランブルは `GET /api/scrambles`（Route Handler）から取得する。
4. 計測中の状態はクライアントに置き、履歴は端末のLocal Storageへ保存する。将来はプラットフォーム別Repositoryを介してIndexedDB、SQLite、マネージドデータベース同期へ拡張する。

## ディレクトリ

```text
web/                            Next.js Web/PWAプロジェクト
  src/app/                      ルート、RSC、Route Handlers、metadata
  src/features/                 Web固有の機能UIとプラットフォームadapter
  public/                       Service Workerと静的ヘッダー
packages/scramble/              Web・Expo共通のスクランブルドメイン
packages/timerDomain/           Web・Expo共通のSolve型、時間表示、統計
docs/                           設計・調査メモ
```

`packages/`はReact、Next.js、DOM、Node.js専用API、永続化実装へ依存しない。乱数、UUID、時刻、ストレージなどのプラットフォーム機能は各アプリのadapterから注入する。将来Expoを追加する場合は`mobile/`をworkspaceへ追加し、同じ共有パッケージを利用する。

## 段階的ロードマップ

### Phase 1: タイマーとして成立

- WCA に近いホールド開始、+2 / DNF、ao5 / ao12
- IndexedDB にローカル保存し、オフラインでも計測可能にする
- 練習モード、使用したクロス色、自己評価（読めた / 見失った）を記録する

### Phase 2: 読みの分析

- マネージドデータベースに任意同期し、端末をまたいだ履歴とバックアップを提供する
- 通常 / X-Cross / F2L #1 の差、成功率、停止時間を可視化する
- 「F2L #1 読みが弱い」など、十分な標本数がある場合だけ示唆を出す

### Phase 3: キューブ固有機能

- cstimer 互換スクランブラーを Web Worker で動かす
- Cross + F2L 第1ペア探索を別 Worker / Web Worker に隔離する
- 手順テキストの段階再生を先に実装し、需要を確認してから Three.js を遅延ロードする

## Vercel 方針

- VercelのGit連携を使い、Pull requestにはPreview Deployment、`main`へのpushにはProduction Deploymentを作成する。
- VercelプロジェクトのRoot Directoryは`web`とし、Root Directory外のworkspace packagesをビルド対象に含める。
- 秘密情報はソースやローカル環境ファイルへ置かず、VercelのEnvironment Variablesを利用する。
- 永続化サービスはVercel Functionsから利用できる標準的なAPIまたはドライバーを持つものを選び、`packages/`からはプラットフォーム別adapterを介して利用する。
- CIでは`pnpm build`を実行し、Vercel固有の変換処理に依存しないNext.js production buildを検証する。

## 未採用のもの

- 3D キューブ: 初期ロードと実装コストに対して、タイマー中心の価値検証には不要。
- cubejs / min2phase.js: ライセンス、バンドルサイズ、サーバーランタイム / Web Worker 互換性を確認してから採用する。
- Zustand / Redux Toolkit: 現在の状態はコンポーネント内に閉じており、導入理由がまだない。
