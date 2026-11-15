# Trợ lý tư vấn local — bản nâng cấp

## Chạy ngay, không cần cài thêm

Mặc định `CHAT_ENGINE=consultant` (hoặc không có dòng này trong .env) dùng bộ tư vấn theo ngữ cảnh:

- Nhận diện nhu cầu AI agent, quản lý tập trung, website, mobile, hạ tầng và đào tạo.
- Hỏi từng thông tin còn thiếu thay vì trả lời lặp lại.
- Ghi nhận kênh sử dụng, tài liệu, quy mô, khối lượng, ngân sách và thời gian khách mong muốn.
- Nhớ ngữ cảnh trong session; tài liệu hội thoại nằm ở bảng sessions của MySQL, không gửi lên dịch vụ cloud. Ngữ cảnh hoạt động hết hạn sau 1 giờ không trao đổi; session có thời hạn 8 giờ. Bộ nhớ lịch sử hiển thị giữ tối đa 16 tin, các thông tin nhu cầu đã trích xuất được giữ riêng trong cùng phiên.
- Đề xuất dựa trên hồ sơ hiện tại và phân biệt đề xuất với tính năng/cam kết đã có.
- Không bịa báo giá hay lịch bàn giao. Ngân sách khách nói được ghi nhận là mong muốn, không phải báo giá.
- Nút liên hệ có thể điền bản tóm tắt vào ô nhu cầu nếu ô này đang trống. Khách phải tự điền thông tin liên hệ và bấm gửi; trợ lý không tự gửi.
- Nút ↺ bắt đầu cuộc tư vấn mới, xoá ngữ cảnh hội thoại trong phiên.

Đây là hệ thống tư vấn theo quy tắc và ngữ cảnh, **không phải mô hình AI tạo sinh**. Nó không hiểu hoặc giải đáp mọi câu hỏi. Có thể bổ sung quy tắc trong `src/advisor.js`.

## Mô hình AI thật chạy local (tuỳ chọn)

Chỉ bật khi máy có đủ RAM và đã cài Ollama. Không bắt buộc cho yêu cầu AJAX hay để website hoạt động.

1. Xem RAM: Ctrl+Shift+Esc → Performance/Hiệu suất → Memory/Bộ nhớ.
2. Cài Ollama từ trang chính thức `https://ollama.com/download/windows`.
3. Mở terminal mới, tải mô hình local, ví dụ:

```powershell
ollama pull qwen2.5:3b
```

4. Giữ ứng dụng Ollama đang chạy. Có thể kiểm tra mô hình:

```powershell
ollama list
```

5. Thêm vào `.env` của website:

```ini
CHAT_ENGINE=ollama
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

6. Dừng Node.js bằng Ctrl+C rồi chạy lại `npm start`.

Gợi ý lựa chọn khởi đầu: máy 8 GB RAM có thể thử `qwen2.5:1.5b`; máy 16 GB có thể thử `qwen2.5:3b`. Tốc độ/chất lượng còn phụ thuộc CPU, GPU và các ứng dụng đang mở; cần kiểm tra trên máy của bạn. Thay tên model trong cả lệnh pull và `.env` cho khớp. Không chọn model có hậu tố cloud.

Tải Ollama/mô hình ban đầu cần Internet và dung lượng ổ đĩa. Sau khi có mô hình, code website chỉ gửi yêu cầu đến địa chỉ HTTP loopback, chặn URL ngoài máy và không đi theo redirect. Không dùng OpenAI, API key hoặc mô hình cloud. Mô hình nhận phần hồ sơ công ty mới nhất từ MySQL và lịch sử hội thoại giới hạn.

Nếu Ollama chưa chạy, model chưa có hoặc hết thời gian chờ, website trả về tư vấn theo ngữ cảnh và ghi rõ đang dùng dự phòng. Câu trả lời mô hình local được gắn nhãn “Mô hình AI local: ...”; câu trả lời có thể sai, cần xác nhận thông tin quan trọng. Một số dữ liệu định danh/liên hệ luôn lấy trực tiếp từ database để tránh mô hình bịa.

**Đã kiểm thử phần gọi Ollama bằng transport mô phỏng thành công/lỗi và kiểm tra chặn địa chỉ ngoài máy. Chưa chạy mô hình thật trên máy Windows của người nhận, nên chưa xác nhận chất lượng hoặc tốc độ thực tế của model trên máy đó.**

Muốn trở về chế độ nhẹ: đặt `CHAT_ENGINE=consultant` rồi khởi động lại Node.js.

## Kịch bản kiểm tra

1. “Tư vấn AI agent” → hỏi kênh triển khai.
2. “Website và Zalo” → ghi nhận hai kênh, hỏi nguồn tài liệu, không hỏi lại kênh.
3. “Tôi có Excel sản phẩm, 5 nhân viên, khoảng 100 tin nhắn mỗi ngày” → ghi nhận thông tin đã cung cấp.
4. “Tóm tắt nhu cầu” → nhận bản tóm tắt và nút chuyển vào biểu mẫu; chưa gửi khi chưa bấm gửi.
5. Tải lại trang → thấy lịch sử trong cùng phiên. Nhấn ↺ → cuộc tư vấn mới.
6. Đổi tên người đại diện trong quản trị; hỏi lại → dùng dữ liệu MySQL hiện tại.

## Những file thay đổi

`src/advisor.js`, `src/local-ai.js`, `src/lookup.js`, `src/config.js`, `src/app.js`, `public/js/app.js`, `views/index.html`.
Không cần thêm bảng, chạy lại setup hay cài npm package mới. Không chép đè `.env` và không xoá database/uploads khi cập nhật.
