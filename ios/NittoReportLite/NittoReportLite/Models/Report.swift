import Foundation

enum Orientation: String, Codable, CaseIterable {
    case portrait
    case landscape

    var label: String {
        switch self {
        case .portrait: return "縦（ポートレート）"
        case .landscape: return "横（ランドスケープ）"
        }
    }
}

struct WorkItem: Identifiable, Codable, Equatable {
    var id: String = UUID().uuidString
    var name: String = ""
    var qty: String = ""
    var unit: String = ""
}

struct PhotoSection: Identifiable, Codable, Equatable {
    var id: String = UUID().uuidString
    var title: String = ""
    var beforeImage: String? = nil   // JPEGをBase64にしたもの
    var afterImage: String? = nil
    var beforeComment: String = ""
    var afterComment: String = ""
}

struct Report: Identifiable, Codable, Equatable {
    var id: String = UUID().uuidString
    var orientation: Orientation = .portrait

    // 表紙
    var dateStr: String = Report.today()
    var senderPostal: String = "〒141-0031"
    var senderAddress: String = "東京都品川区西五反田5-5-7"
    var senderBuilding: String = "ケーエムビル5階"
    var senderCompany: String = "日都産業株式会社"
    var clientCompany: String = ""
    var clientDept: String = ""
    var responsible: String = ""
    var workers: String = ""
    var workDate: String = ""
    var workTime: String = ""
    var workPlace: String = ""
    var requester: String = ""
    var workItemsTitle: String = "作業内容"
    var workItems: [WorkItem] = []
    var notes: String = ""

    // 写真
    var photoSections: [PhotoSection] = [PhotoSection(), PhotoSection()]

    var displayTitle: String {
        workPlace.isEmpty ? "無題の報告書" : workPlace
    }

    static func today() -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ja_JP")
        f.dateFormat = "yyyy年M月d日"
        return f.string(from: Date())
    }

    static func new(orientation: Orientation) -> Report {
        Report(orientation: orientation)
    }
}
