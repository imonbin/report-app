import Foundation

/// アプリの設定値。ビルド前に必ず書き換えてください。
enum Config {
    /// SupabaseのProject URL（例: "https://abcdefgh.supabase.co"）
    /// 既存のWeb版と同じSupabaseプロジェクトを使う場合は
    /// DEPLOY_GUIDE.md の STEP1 で控えた値と同じものを入れてください。
    static let supabaseURL = "https://YOUR_PROJECT.supabase.co"

    /// Supabaseの anon public キー
    static let supabaseAnonKey = "YOUR_ANON_KEY"

    /// アプリ起動時の共通パスワード（Web版と揃える場合は "nitto2026" のままでOK）
    static let loginPassword = "nitto2026"
}
