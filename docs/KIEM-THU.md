# Biên bản kiểm thử bản local

Môi trường kiểm tra: Node.js 24, MySQL Server 8.4 chạy local trong container, Chromium. Người dùng có thể cài MySQL trực tiếp trên Windows; không bắt buộc Docker.

## Backend với MySQL thật

Chạy `npm test` (bộ test tạo database riêng) đã đạt các nhóm:

| Nhóm | Kết quả |
|---|---|
| Chưa đăng nhập bị chuyển sang login và không đọc được yêu cầu tư vấn | Đạt |
| Yêu cầu ghi thiếu CSRF bị chặn; đăng nhập sai không được cấp quyền | Đạt |
| Sửa tên người đại diện, đọc lại thấy đúng dữ liệu | Đạt |
| Cập nhật bằng revision cũ trả 409, không ghi đè | Đạt |
| REST API tạo, sửa, xoá một dịch vụ | Đạt |
| Upload PNG thật, lấy được ảnh bằng URL; file giả bị từ chối | Đạt |
| Lưu logo vào nội dung, database giữ đường dẫn | Đạt |
| Tạo, đọc, cập nhật trạng thái, xoá yêu cầu tư vấn | Đạt |
| API công khai không lộ thống kê yêu cầu tư vấn | Đạt |
| Trợ lý đọc đúng tên người đại diện mới từ MySQL | Đạt |
| Đường dẫn lồng nhau không tồn tại trả 404, CSS vẫn tải được | Đạt |
| Lỗi server mô phỏng trả 500, không hiển thị stack trace | Đạt |
| Khởi tạo lại ứng dụng/kết nối: dữ liệu và session đăng nhập vẫn còn | Đạt |
| Đăng xuất huỷ quyền truy cập bằng cookie cũ | Đạt |

## Trình duyệt thật

Kiểm tra từ giao diện: đăng nhập, sửa tên và lưu; mở trang chủ kiểm tra tên; thêm dịch vụ có ảnh tải lên; mở trang chủ thấy mục mới; gửi biểu mẫu tư vấn; quản trị đổi trạng thái và xoá; dùng khung chat; xác nhận xoá dịch vụ; mở 404 và 500.

Đã sửa lỗi chuyển mục Yêu cầu tư vấn do handler cũ giữ tham chiếu tới renderer chưa hỗ trợ inbox. Sau sửa, toàn bộ luồng trên chạy qua, không ghi nhận lỗi JavaScript ở trang.

Kiểm tra thêm viewport điện thoại 390×844 không tràn ngang; CSS tính toán tiêu đề 18px, nội dung 14px.

Ảnh `docs/screenshots/` được chụp trong quá trình kiểm thử. Đây là dữ liệu kiểm thử local, không phải yêu cầu thật của khách.

## Giới hạn

Chưa kiểm tra trực tiếp trên máy Windows của người nhận. Cần chạy lại theo README và kiểm tra thông tin MySQL của máy đó. Chưa thực hiện kiểm thử tải lớn hoặc triển khai production. Trợ lý chỉ tra cứu theo quy tắc, không phải mô hình AI local.
