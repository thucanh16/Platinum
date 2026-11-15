# Gợi ý báo cáo và demo

## Giới thiệu
Đề tài: Xây dựng website giới thiệu Công ty TNHH Công nghệ Platinum và hệ thống quản trị nội dung chạy local.
Mục tiêu: tự xây dựng giao diện, backend và database, không dùng backend/database cloud. Website có thêm/sửa/xoá và giữ dữ liệu sau khi tải lại trang.

## Kiến trúc
Trình duyệt HTML/CSS/JavaScript → HTTP API Express → MySQL.
Ảnh tải lên → Express kiểm tra quyền và định dạng → thư mục local; MySQL lưu đường dẫn.
Đăng nhập → bcrypt kiểm tra mật khẩu băm → session cookie HttpOnly; session ở MySQL.

## Các bảng
- admins: tài khoản, mật khẩu băm.
- company_info: thông tin công ty dạng JSON, revision để kiểm tra phiên bản.
- content_items: từng nội dung độc lập, group_key phân biệt services/products/projects/process/values/community.
- consultation_requests: yêu cầu tư vấn và trạng thái.
- sessions: phiên đăng nhập, hạn sử dụng.

Một bảng content_items có cấu trúc chung giúp tránh lặp mã cho sáu nhóm nội dung. Các bản ghi có khóa id, nhóm, tiêu đề, mô tả, nhãn, chi tiết, đường dẫn ảnh và thứ tự. Không phải sáu bảng riêng như bản kế hoạch ban đầu. Toàn bộ cập nhật tài liệu quản trị chạy trong transaction và kiểm tra revision.

## Kịch bản demo 5–7 phút
1. Mở trang chủ, giải thích nội dung được gọi từ `/api/content` và MySQL.
2. Mở `/admin` khi chưa đăng nhập: tự chuyển `/login`.
3. Đăng nhập; đổi tên người đại diện, bấm Lưu; mở trang chủ thấy tên mới. Đoạn lịch sử nhà sáng lập là nội dung riêng.
4. Tạo một dịch vụ, sửa mô tả, tải ảnh, kiểm tra trên trang chủ; xoá và xác nhận.
5. Gửi biểu mẫu tư vấn; xem trong quản trị, đổi trạng thái “Đã liên hệ”.
6. Tắt Node bằng Ctrl+C, chạy lại npm start; dữ liệu vẫn còn.
7. Mở đường dẫn sai: status 404. Đăng nhập và mở `/demo/500`: status 500. Xem Network để chứng minh mã HTTP.
8. Trình bày `.env.example`, file SQL và hướng dẫn cài trên máy khác.

## URL và đường dẫn
- URL tuyệt đối: `http://localhost:3000/admin`.
- Đường dẫn từ gốc: `/css/style.css`; vẫn tải đúng khi URL là `/a/b/khong-ton-tai`.
- Đường dẫn tương đối: `./logo.png` hoặc `../images/logo.png`; được tính từ URL tài liệu hiện tại.
- Không dùng đường dẫn ổ cứng kiểu `C:\...` trong HTML gửi cho trình duyệt.

## AJAX
`fetch()` gửi yêu cầu tới API mà không tải lại toàn bộ trang. JavaScript nhận JSON, cập nhật giao diện. Đây là kỹ thuật gọi dữ liệu bất đồng bộ (AJAX), dù dữ liệu thực tế là JSON chứ không phải XML.
Nếu giám đốc ghi “AI/AX”, cần xác nhận có phải AJAX hay một thuật ngữ khác; không coi giả định này là yêu cầu đã xác nhận.

## Phạm vi trợ lý
Tra cứu hồ sơ theo quy tắc, đọc MySQL mới nhất, không gọi AI cloud. Không tuyên bố mô hình AI hay trả lời mọi câu hỏi. Có thể nghiên cứu AI local sau khi hoàn thành bản nộp.

## Vai trò AI hỗ trợ lập trình
Có thể trình bày Codex hỗ trợ xây dựng, kiểm tra và giải thích mã. Người nộp cần hiểu các file, tự chạy thử, kiểm tra kết quả và ghi nhận hỗ trợ AI theo yêu cầu của công ty/trường.
