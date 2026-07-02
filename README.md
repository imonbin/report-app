# 作業完了報告書管理システム（v8.1 / Supabase版）

日都産業 株式会社三越伊勢丹アイムファシリティーズ・城南信用金庫向け
作業完了報告書の作成・管理アプリ。

## 構成

- フロントエンド: React + Vite
- データ保存: Supabase（PostgreSQL）
- ホスティング: Vercel
- ログイン: 共通パスワード方式（`nitto2026`）

## セットアップ

`DEPLOY_GUIDE.md` を参照してください。Supabase → GitHub → Vercel の順で進めます。

## ローカルで動作確認したい場合

```bash
npm install
cp .env.example .env.local
# .env.local にSupabaseのURLとanonキーを設定
npm run dev
```

## ファイル構成

```
nitto-report/
├── src/
│   ├── App.jsx        ← アプリ本体（画面・テンプレート・ロジック）
│   ├── store.js        ← Supabaseへのデータ読み書き
│   └── main.jsx         ← エントリポイント
├── supabase_setup.sql   ← Supabaseで実行するテーブル作成SQL
├── DEPLOY_GUIDE.md       ← デプロイ手順書
└── .env.example          ← 環境変数のサンプル
```
