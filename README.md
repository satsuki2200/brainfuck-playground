# Brainfuck Playground

Brainfuck言語の学習・練習用インタプリタWebアプリ。

## 機能

- コードエディタ（ステップ実行時に現在の命令をハイライト）
- 一括実行 / ステップ実行 / 自動再生（速度調整付き）
- メモリテープのビジュアル表示（ASCII切り替え対応）
- 標準入出力パネル
- サンプルプログラム5種類（Hello World、Cat、足し算、Fibonacci、ROT13）
- コード共有URL生成（Base64 + URLパラメータ）
- チュートリアルページ

## ローカル起動

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Vercelデプロイ

```bash
npx vercel --prod
```

または GitHub リポジトリを Vercel に接続して自動デプロイ。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- クライアントサイドのみ（バックエンド・DB不要）
