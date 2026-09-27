import Foundation

enum SupabaseError: LocalizedError {
    case invalidResponse
    case http(Int, String)
    case notFound

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "サーバーからの応答が不正です"
        case .http(let code, let text):
            return "通信エラー（\(code)）: \(text)"
        case .notFound:
            return "データが見つかりませんでした"
        }
    }
}

/// SupabaseのREST(PostgREST)を直接叩くシンプルなクライアント。
/// 依存ライブラリなしで動くように URLSession のみで実装している。
final class SupabaseService {
    static let shared = SupabaseService()

    private let baseURL: URL
    private let anonKey: String

    private init() {
        guard let url = URL(string: Config.supabaseURL) else {
            fatalError("Config.supabaseURL が不正です。ios/NittoReportLite/NittoReportLite/Config.swift を確認してください。")
        }
        self.baseURL = url
        self.anonKey = Config.supabaseAnonKey
    }

    private func request(
        _ path: String,
        method: String = "GET",
        query: [URLQueryItem] = [],
        body: Data? = nil,
        prefer: String? = nil
    ) async throws -> Data {
        var components = URLComponents(
            url: baseURL.appendingPathComponent("rest/v1/\(path)"),
            resolvingAgainstBaseURL: false
        )!
        if !query.isEmpty { components.queryItems = query }

        var req = URLRequest(url: components.url!)
        req.httpMethod = method
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let prefer { req.setValue(prefer, forHTTPHeaderField: "Prefer") }
        req.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse else { throw SupabaseError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else {
            let text = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError.http(http.statusCode, text)
        }
        return data
    }

    func fetchList() async throws -> [ReportListItem] {
        let data = try await request(
            "simple_reports",
            query: [
                URLQueryItem(name: "select", value: "id,orientation,title,work_place,work_date,updated_at"),
                URLQueryItem(name: "order", value: "updated_at.desc"),
            ]
        )
        return try JSONDecoder().decode([ReportListItem].self, from: data)
    }

    func fetchReport(id: String) async throws -> Report {
        struct Row: Codable { let data: Report }
        let data = try await request(
            "simple_reports",
            query: [
                URLQueryItem(name: "id", value: "eq.\(id)"),
                URLQueryItem(name: "select", value: "data"),
            ]
        )
        let rows = try JSONDecoder().decode([Row].self, from: data)
        guard let row = rows.first else { throw SupabaseError.notFound }
        return row.data
    }

    func save(_ report: Report) async throws {
        struct UpsertRow: Codable {
            let id: String
            let orientation: String
            let title: String
            let work_place: String
            let work_date: String
            let data: Report
        }
        let row = UpsertRow(
            id: report.id,
            orientation: report.orientation.rawValue,
            title: report.displayTitle,
            work_place: report.workPlace,
            work_date: report.workDate,
            data: report
        )
        let body = try JSONEncoder().encode([row])
        _ = try await request(
            "simple_reports",
            method: "POST",
            body: body,
            prefer: "resolution=merge-duplicates,return=minimal"
        )
    }

    func delete(id: String) async throws {
        _ = try await request(
            "simple_reports",
            method: "DELETE",
            query: [URLQueryItem(name: "id", value: "eq.\(id)")]
        )
    }
}

struct ReportListItem: Identifiable, Codable {
    let id: String
    let orientation: String
    let title: String?
    let work_place: String?
    let work_date: String?
    let updated_at: String?
}
