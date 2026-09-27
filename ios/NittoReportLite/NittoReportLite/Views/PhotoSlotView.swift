import SwiftUI
import UIKit

/// 1枚の写真スロット（Web版の PS コンポーネントに相当）
struct PhotoSlotView: View {
    let label: String
    @Binding var imageBase64: String?
    @Binding var comment: String

    @State private var showSourceDialog = false
    @State private var showPicker = false
    @State private var pickerSource: UIImagePickerController.SourceType = .photoLibrary

    var body: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .bottom) {
                Group {
                    if let base64 = imageBase64, let uiImage = ImageCodec.decode(base64) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFill()
                    } else {
                        VStack(spacing: 4) {
                            Image(systemName: "camera")
                                .font(.system(size: 26))
                                .foregroundStyle(.secondary)
                            Text(label)
                                .font(.caption2).bold()
                                .foregroundStyle(.secondary)
                            Text("タップして追加")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(height: 140)
                .clipped()
                .background(Color(.secondarySystemBackground))
                .contentShape(Rectangle())
                .onTapGesture { showSourceDialog = true }

                if imageBase64 != nil {
                    HStack(spacing: 8) {
                        Button("変更") { showSourceDialog = true }
                        Button("削除", role: .destructive) { imageBase64 = nil }
                    }
                    .font(.caption2)
                    .foregroundStyle(.white)
                    .padding(.vertical, 4)
                    .frame(maxWidth: .infinity)
                    .background(Color.black.opacity(0.55))
                }
            }

            TextField("時間・コメントを入力", text: $comment)
                .font(.caption2)
                .padding(6)
                .background(Color(.systemGray6))
        }
        .clipShape(RoundedRectangle(cornerRadius: 6))
        .confirmationDialog("写真を追加", isPresented: $showSourceDialog, titleVisibility: .visible) {
            Button("カメラで撮影") { pickerSource = .camera; showPicker = true }
            Button("ライブラリから選択") { pickerSource = .photoLibrary; showPicker = true }
            if imageBase64 != nil {
                Button("削除", role: .destructive) { imageBase64 = nil }
            }
            Button("キャンセル", role: .cancel) {}
        }
        .sheet(isPresented: $showPicker) {
            ImagePickerView(sourceType: pickerSource) { uiImage in
                imageBase64 = ImageCodec.encode(uiImage)
            }
        }
    }
}
