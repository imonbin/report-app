import SwiftUI

struct RootView: View {
    @AppStorage("isUnlocked") private var isUnlocked = false

    var body: some View {
        if isUnlocked {
            ReportListView()
        } else {
            LoginView(onUnlock: { isUnlocked = true })
        }
    }
}
