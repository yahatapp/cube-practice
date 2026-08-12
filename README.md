# Cube Practice Timer

通常のルービックキューブ計測と、X-Cross / F2L #1 の読み練習を同じセッションで比較する、モバイルファーストの PWA 雛形です。

## 開発

Nix development shellがNode.js 24、pnpm、Vite+を提供します。

```bash
nix develop
vp install
cp .dev.vars.example .dev.vars
vp run dev
```

静的検査は `vp check`、自動修正は `vp check --fix`を使います。Cloudflare Workers
ランタイムでの確認は`vp run preview`、デプロイは`vp run deploy`を使います。

## 現在の範囲

- Next.js App Router + React Server Components
- Route Handler で 3x3 スクランブル生成
- TanStack Query の RSC prefetch / hydration とクライアント再取得
- 通常 / X-Cross / F2L #1 の簡易タイマーとセッション内平均
- Web App Manifest、Service Worker、モバイル向け UI

設計判断とロードマップは [`docs/architecture.md`](docs/architecture.md) を参照してください。
