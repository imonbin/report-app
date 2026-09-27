import SwiftUI

/// 表紙／写真ページを切り替えて編集し、保存する画面
struct ReportEditorView: View {
    @State var report: Report
    var isNew: Bool
    var onSaved: (() -> Void)?

    @Environment(\.dismiss) private var dismiss
    @State private var tab = 0
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 0) {
            Picker("ページ", selection: $tab) {
                Text("表紙").tag(0)
                Text("写真").tag(1)
            }
            .pickerStyle(.segmented)
            .padding()

            if tab == 0 {
                CoverPageView(report: $report)
            } else {
                PhotoPageView(report: $report)
            }
        }
        .navigationTitle(report.workPlace.isEmpty ? "報告書" : report.workPlace)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    save()
                } label: {
                    if isSaving {
                        ProgressView()
                    } else {
                        Text("保存")
                    }
                }
                .disabled(isSaving)
            }
        }
        .alert("保存に失敗しました", isPresented: Binding(
            get: { errorMessage != nil },
            set: { if !$0 { errorMessage = nil } }
        )) {
            Button("OK") { errorMessage = nil }
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private func save() {
        isSaving = true
        Task {
            do {
                try await SupabaseService.shared.save(report)
                isSaving = false
                onSaved?()
                dismiss()
            } catch {
                isSaving = false
                errorMessage = error.localizedDescription
            }
        }
    }
}
