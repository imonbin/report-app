import SwiftUI

/// 表紙ページの編集画面
struct CoverPageView: View {
    @Binding var report: Report

    var body: some View {
        Form {
            Section("日付・送付先") {
                TextField("日付", text: $report.dateStr)
                TextField("送付先 会社名", text: $report.clientCompany)
                TextField("送付先 部署", text: $report.clientDept)
            }

            Section("差出人（自社情報）") {
                TextField("郵便番号", text: $report.senderPostal)
                TextField("住所", text: $report.senderAddress)
                TextField("建物名", text: $report.senderBuilding)
                TextField("会社名", text: $report.senderCompany)
            }

            Section("作業情報") {
                TextField("責任者", text: $report.responsible)
                TextField("作業者", text: $report.workers)
                TextField("作業日", text: $report.workDate)
                TextField("作業時間", text: $report.workTime)
                TextField("作業場所", text: $report.workPlace)
                TextField("ご依頼者", text: $report.requester)
            }

            Section(report.workItemsTitle.isEmpty ? "作業内容" : report.workItemsTitle) {
                TextField("項目タイトル", text: $report.workItemsTitle)

                ForEach($report.workItems) { $item in
                    HStack {
                        TextField("内容", text: $item.name)
                        TextField("数量", text: $item.qty)
                            .frame(width: 56)
                            .multilineTextAlignment(.center)
                        TextField("単位", text: $item.unit)
                            .frame(width: 48)
                            .multilineTextAlignment(.center)
                    }
                }
                .onDelete { report.workItems.remove(atOffsets: $0) }

                Button {
                    report.workItems.append(WorkItem())
                } label: {
                    Label("行を追加", systemImage: "plus")
                }
            }

            Section("備考") {
                TextField("備考", text: $report.notes, axis: .vertical)
                    .lineLimit(3...6)
            }
        }
    }
}
