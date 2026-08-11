# アプリケーション構成

## 目的

最初のリリースは「高機能なキューブビューア」ではなく、日常的に使えるタイマーを中心にする。通常ソルブ、X-Cross、F2L 第1ペア読みを同じ操作感で計測し、どの読みがボトルネックかを見つけられる状態を目指す。

## 技術選定

- Next.js 16.3 / React 19.2: App Router、React Server Components、Route Handlers を利用する。
- Cloudflare Workers + OpenNext: Node.js サーバーを常駐させず、Workers にフルスタック Next.js を配置する。
- TanStack Query 5: API 由来のサーバー状態を取得・キャッシュする。画面遷移そのものは Next.js App Router が担当する。
- React built-ins: タイマーなど画面内だけの状態は `useState` / `useReducer` で持つ。共有状態が複雑になるまで Zustand 等は追加しない。
- Tailwind CSS 4: デザイントークンとレスポンシブ UI の基盤。現段階では小さなグローバル CSS に集約する。
- PWA: manifest と最小 Service Worker を用意する。オフライン時はアプリシェルを表示できるが、完全なオフライン計測・同期は次段階。

## データフロー

1. `app/page.tsx`（Server Component）が最初のスクランブルを生成し、TanStack Query のキャッシュとして dehydrated state を渡す。
2. `TimerWorkspace`（Client Component）がそのキャッシュを即時表示する。
3. 次のスクランブルは `GET /api/scrambles`（Route Handler）から取得する。
4. 計測中の状態と履歴は現段階ではクライアントメモリのみ。永続化導入時に D1 へ置き換える。

## ディレクトリ

```text
app/                    ルート、RSC、Route Handlers、PWA metadata
components/             インタラクティブな Client Components
lib/cube/                キューブ領域ロジック（UI 非依存）
lib/queries/             TanStack Query の query key / fetcher
public/                  Service Worker と静的ヘッダー
docs/                    設計・調査メモ
```

## 段階的ロードマップ

### Phase 1: タイマーとして成立

- WCA に近いホールド開始、+2 / DNF、ao5 / ao12
- IndexedDB にローカル保存し、オフラインでも計測可能にする
- 練習モード、使用したクロス色、自己評価（読めた / 見失った）を記録する

### Phase 2: 読みの分析

- D1 に任意同期し、端末をまたいだ履歴とバックアップを提供する
- 通常 / X-Cross / F2L #1 の差、成功率、停止時間を可視化する
- 「F2L #1 読みが弱い」など、十分な標本数がある場合だけ示唆を出す

### Phase 3: キューブ固有機能

- cstimer 互換スクランブラーを Web Worker で動かす
- Cross + F2L 第1ペア探索を別 Worker / Web Worker に隔離する
- 手順テキストの段階再生を先に実装し、需要を確認してから Three.js を遅延ロードする

## Cloudflare 方針

- `wrangler.jsonc` の互換日付を定期的に更新し、`nodejs_compat` を有効にする。
- バインディング型は `npm run cf-typegen` で生成し、手書きしない。
- 秘密情報はソースや Wrangler の vars に置かず、Secrets を利用する。
- D1 / R2 導入時は REST 経由ではなく Workers bindings を使う。
- `npm run preview` を CI に含め、Next.js 開発サーバーだけでなく Workers ランタイムでも検証する。

## 未採用のもの

- 3D キューブ: 初期ロードと実装コストに対して、タイマー中心の価値検証には不要。
- cubejs / min2phase.js: ライセンス、バンドルサイズ、Workers / Web Worker 互換性を確認してから採用する。
- Zustand / Redux Toolkit: 現在の状態はコンポーネント内に閉じており、導入理由がまだない。
