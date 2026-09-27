import SwiftUI

/// Web版と同じ「共通パスワード」でのシンプルなログイン画面
struct LoginView: View {
    var onUnlock: () -> Void

    @State private var password = ""
    @State private var showError = false

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.fill")
                .font(.system(size: 48))
                .foregroundStyle(.blue)
            Text("作業完了報告書")
                .font(.title2).bold()

            SecureField("パスワード", text: $password)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal, 40)
                .submitLabel(.go)
                .onSubmit(attemptUnlock)

            Button("ログイン", action: attemptUnlock)
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .alert("パスワードが違います", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        }
    }

    private func attemptUnlock() {
        if password == Config.loginPassword {
            onUnlock()
        } else {
            showError = true
        }
    }
}
