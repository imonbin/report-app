# 作業完了報告書（iPhoneシンプル版）

Web版（`作業完了報告書管理システム`）のシンプル版として作った、ネイティブiOS（SwiftUI）アプリです。

- 報告書の種類は「縦（ポートレート）」「横（ランドスケープ）」の2種類のみ
- 表紙ページ・写真ページ（施工前／施工後）
- 保存はSupabaseへのクラウド保存（Web版と同じSupabaseプロジェクトを共有可）

> **重要**: このコードはクラウド上のLinux環境で書かれており、Xcodeでのビルド・実機/シミュレータ確認はまだ行っていません。お手元のMacで下記の手順に沿ってビルドし、動作確認をお願いします。

## 必要なもの

- macOS + Xcode 15以上
- [XcodeGen](https://github.com/yonaskolb/XcodeGen)（`.xcodeproj` をこのフォルダの `project.yml` から生成します）
- Supabaseアカウント（Web版と同じプロジェクトでOK）

## セットアップ手順

### 1. Supabaseにテーブルを追加

1. Supabaseダッシュボード → **SQL Editor** を開く
2. このフォルダの `supabase_ios_setup.sql` の中身を貼り付けて実行
3. Web版の `reports` / `drawings` テーブルとは別の `simple_reports` テーブルが追加されます（Web版のデータには影響しません）
4. Project Settings → API から **Project URL** と **anon public キー** を控える

### 2. Xcodeプロジェクトを生成

```bash
brew install xcodegen
cd ios/NittoReportLite
xcodegen generate
open NittoReportLite.xcodeproj
```

### 3. 設定を書き込む

`NittoReportLite/Config.swift` を開き、以下を書き換える。

```swift
static let supabaseURL = "https://YOUR_PROJECT.supabase.co"
static let supabaseAnonKey = "YOUR_ANON_KEY"
static let loginPassword = "nitto2026" // 好きなパスワードに変更可
```

### 4. ビルド設定

Xcode上で対象ターゲット → **Signing & Capabilities** を開き、

- Team に自分のApple IDを設定（無料のPersonal Teamで実機ビルド可）
- Bundle Identifier が重複する場合は `com.nitto.reportlite` の部分を変更

### 5. 実行

- シミュレータ: カメラは使えないため「ライブラリから選択」のみ動作確認可能
- 実機（iPhone）: カメラ撮影・ライブラリ選択どちらも利用可能。初回起動時にカメラ／写真ライブラリへのアクセス許可を求められます

## 画面構成

- ログイン画面（共通パスワード）
- 報告書一覧（Supabaseから取得、＋で新規作成、スワイプで削除）
- 新規作成時に「縦」「横」を選択
- 編集画面（上部セグメントで「表紙」⇔「写真」を切り替え、右上「保存」でSupabaseに保存）

## 今回のスコープ外（必要であれば追加できます）

- PDF書き出し・写真アプリ／AirDropなどへの共有
- オフライン下書き保存（端末内キャッシュ）
- 縦・横で内容項目を変える（今回は同じ項目で orientation フラグのみ切り替え）
