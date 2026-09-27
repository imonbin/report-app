import SwiftUI

/// 一覧からタップされたIDをもとにSupabaseから本文を読み込んでから編集画面を出す
struct ReportDetailLoader: View {
    let id: String
    var onSaved: (() -> Void)?

    @State private var report: Report?
    @State private var errorMessage: String?

    var body: some View {
        Group {
            if let report {
                ReportEditorView(report: report, isNew: false, onSaved: onSaved)
            } else if let errorMessage {
                VStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 32))
                        .foregroundStyle(.orange)
                    Text("読み込みに失敗しました")
                        .font(.headline)
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
            } else {
                ProgressView()
                    .task { await load() }
            }
        }
    }

    private func load() async {
        do {
            report = try await SupabaseService.shared.fetchReport(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
