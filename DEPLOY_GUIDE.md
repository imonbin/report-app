# 作業完了報告書管理システム デプロイ手順書

Vercel + Supabase 構成。所要時間の目安は30〜40分です。

完成すると `https://nitto-report.vercel.app`（または好きな名前）のURLが発行され、
ログインパスワード（`nitto2026`）を知っている人なら誰でもスマホのブラウザから使えます。

---

## 全体の流れ

1. Supabaseでプロジェクト作成 → テーブル作成（10分）
2. GitHubにコードを置く（5分）
3. Vercelでデプロイ（10分）
4. 動作確認（5分）

---

## STEP 1: Supabaseプロジェクト作成

1. https://supabase.com にアクセスし、GitHubアカウントでログイン
2. 「New project」をクリック
3. 以下を入力
   - **Name**: `nitto-report`
   - **Database Password**: 任意の強いパスワード（メモしておく。後で使わないが念のため保管）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック（プロジェクト作成に1〜2分かかります）

### テーブルを作成する

1. 左メニューの **SQL Editor** を開く
2. 「New query」をクリック
3. このフォルダの `supabase_setup.sql` の中身を全部コピーして貼り付け
4. 右下の「Run」をクリック
5. 「Success. No rows returned」と出ればOK

### API情報を控える

1. 左メニューの **Project Settings** → **API** を開く
2. 以下の2つをメモ（後でVercelに設定します）
   - **Project URL**（例: `https://abcdefgh.supabase.co`）
   - **anon public** キー（長い文字列）

---

## STEP 2: GitHubにコードを置く

1. https://github.com で新しいリポジトリを作成（例: `nitto-report`）
   - Public/Privateどちらでも可（Privateを推奨）
2. ダウンロードしたプロジェクトフォルダ一式をこのリポジトリにpush

   ターミナルが使える場合:
   ```bash
   cd nitto-report
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/【あなたのアカウント】/nitto-report.git
   git push -u origin main
   ```

   ターミナルを使わない場合:
   - GitHubのリポジトリページで「uploading an existing file」からドラッグ&ドロップでもOK
   - ※ `node_modules` フォルダがもしあれば含めないでください（`.gitignore`で除外されますが、念のため）

---

## STEP 3: Vercelでデプロイ

1. https://vercel.com にアクセスし、GitHubアカウントでログイン
2. 「Add New」→「Project」
3. 先ほど作った `nitto-report` リポジトリを選択して「Import」
4. 「Environment Variables」の欄に以下を追加
   - `VITE_SUPABASE_URL` … STEP1で控えたProject URL
   - `VITE_SUPABASE_ANON_KEY` … STEP1で控えたanon publicキー
5. 「Deploy」をクリック（1〜2分でビルドが完了します）
6. 完了すると `https://nitto-report-xxxx.vercel.app` のようなURLが発行されます

### 独自のURLにしたい場合（任意）

1. Vercelのプロジェクト画面 → Settings → Domains
2. 好きなサブドメイン（例: `nitto-report.vercel.app`）を設定

---

## STEP 4: 動作確認

1. 発行されたURLにスマホのブラウザでアクセス
2. ログイン画面が出るので `nitto2026` を入力
3. 「＋ 新規作成」で報告書を1件作ってみる
4. 一度ブラウザを閉じて、再度開いて、保存したデータが残っているか確認
5. 別の端末（PCなど）から同じURLにアクセスし、同じデータが見えるか確認

問題なければ、このURLをLINEで共有すれば誰でも使える状態になっています。

---

## 困ったときは

- **デプロイは成功したが画面が真っ白** → Vercelの環境変数の名前（`VITE_SUPABASE_URL`など）にタイプミスがないか確認。設定後は「Redeploy」が必要です。
- **保存できない・データが消える** → SupabaseのSQL Editorで `supabase_setup.sql` がエラーなく実行できているか再確認してください。
- **画像を多く貼ると重い** → 現状はBase64でそのままDBに入れる方式のため、報告書1件あたりの写真が多い・高画質だと保存や読み込みが遅くなることがあります。気になるようであれば、Supabase Storageを使う方式へ切り替えも可能です（その際はまたお声がけください）。
