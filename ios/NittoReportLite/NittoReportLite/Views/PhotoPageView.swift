import SwiftUI

/// 写真ページの編集画面（施工前・施工後の2枚1組を箇所ごとに並べる）
struct PhotoPageView: View {
    @Binding var report: Report

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach($report.photoSections) { $section in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            TextField("箇所名", text: $section.title)
                                .font(.subheadline).bold()
                            Spacer()
                            Button(role: .destructive) {
                                report.photoSections.removeAll { $0.id == section.id }
                            } label: {
                                Image(systemName: "trash")
                            }
                        }

                        HStack(alignment: .top, spacing: 8) {
                            VStack(spacing: 4) {
                                Text("作業前")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                PhotoSlotView(
                                    label: "作業前",
                                    imageBase64: $section.beforeImage,
                                    comment: $section.beforeComment
                                )
                            }
                            VStack(spacing: 4) {
                                Text("作業後")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                PhotoSlotView(
                                    label: "作業後",
                                    imageBase64: $section.afterImage,
                                    comment: $section.afterComment
                                )
                            }
                        }
                    }
                    .padding(10)
                    .background(Color(.secondarySystemBackground).opacity(0.5))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                Button {
                    report.photoSections.append(PhotoSection())
                } label: {
                    Label("箇所を追加", systemImage: "plus")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
            .padding()
        }
    }
}
