# Cube Practice Timer

通常のルービックキューブ計測と、X-Cross / F2L #1 の読み練習を同じセッションで比較する、モバイルファーストの PWA 雛形です。

## 開発

Node.js 22 以上を使用します（最新 Wrangler の実行要件）。

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Cloudflare Workers ランタイムでの確認は `npm run preview`、デプロイは `npm run deploy` を使います。

## 現在の範囲

- Next.js App Router + React Server Components
- Route Handler で 3x3 スクランブル生成
- TanStack Query の RSC prefetch / hydration とクライアント再取得
- 通常 / X-Cross / F2L #1 の簡易タイマーとセッション内平均
- Web App Manifest、Service Worker、モバイル向け UI

設計判断とロードマップは [`docs/architecture.md`](docs/architecture.md) を参照してください。
