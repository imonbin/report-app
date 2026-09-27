import SwiftUI

/// 新規作成時に「縦」「横」を選ぶだけのシンプルなシート
struct NewReportSheet: View {
    var onCreate: (Orientation) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var orientation: Orientation = .portrait

    var body: some View {
        NavigationStack {
            Form {
                Picker("種類", selection: $orientation) {
                    ForEach(Orientation.allCases, id: \.self) { o in
                        Text(o.label).tag(o)
                    }
                }
                .pickerStyle(.inline)
            }
            .navigationTitle("新規報告書")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("作成") { onCreate(orientation) }
                }
            }
        }
    }
}
