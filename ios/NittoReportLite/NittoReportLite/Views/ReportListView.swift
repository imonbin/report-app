import SwiftUI

/// 報告書の一覧画面（アプリのホーム）
struct ReportListView: View {
    @State private var items: [ReportListItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showNewSheet = false
    @State private var newReport: Report?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && items.isEmpty {
                    ProgressView()
                } else if items.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "doc.text")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                        Text("報告書がありません")
                            .font(.headline)
                        Text("右上の＋から新規作成してください")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    List {
                        ForEach(items) { item in
                            NavigationLink(value: item.id) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text((item.work_place?.isEmpty == false) ? item.work_place! : "無題の報告書")
                                        .font(.headline)
                                    Text("\(item.orientation == "landscape" ? "横" : "縦")・\(item.work_date ?? "")")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .onDelete(perform: deleteItems)
                    }
                }
            }
            .navigationDestination(for: String.self) { id in
                ReportDetailLoader(id: id, onSaved: { Task { await load() } })
            }
            .navigationTitle("報告書一覧")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showNewSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable { await load() }
            .task { await load() }
            .sheet(isPresented: $showNewSheet) {
                NewReportSheet { orientation in
                    showNewSheet = false
                    newReport = Report.new(orientation: orientation)
                }
            }
            .sheet(item: $newReport) { report in
                NavigationStack {
                    ReportEditorView(report: report, isNew: true, onSaved: { Task { await load() } })
                }
            }
            .alert("読み込みに失敗しました", isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            )) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await SupabaseService.shared.fetchList()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func deleteItems(at offsets: IndexSet) {
        let toDelete = offsets.map { items[$0] }
        items.remove(atOffsets: offsets)
        Task {
            for item in toDelete {
                try? await SupabaseService.shared.delete(id: item.id)
            }
        }
    }
}
