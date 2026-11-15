# API local

Base URL: `http://localhost:3000`. JSON có Content-Type `application/json`.
GET `/api/auth` lấy `{authenticated, username, csrf}` và cookie session. Giữ cookie, gửi header `X-CSRF-Token: <csrf>` cho mọi yêu cầu ghi, kể cả đăng nhập, biểu mẫu tư vấn, upload và chat. Sau đăng nhập nhận token mới. API quản trị còn bắt buộc session admin.

| Method | Đường dẫn | Quyền | Chức năng |
|---|---|---|---|
| GET | /api/auth | Mọi người | Lấy session/CSRF |
| POST | /api/auth/login | CSRF | `{username,password}` |
| POST | /api/auth/logout | Admin + CSRF | Đăng xuất |
| GET | /api/content | Mọi người | `{data,revision}` |
| PUT | /api/content | Admin + CSRF | Lưu `{data,revision}` trong transaction |
| GET | /api/services | Mọi người | Danh sách dịch vụ + revision |
| POST | /api/services | Admin + CSRF | `{item:{title,description,tag,details?,image?},revision}` |
| PUT | /api/services/:id | Admin + CSRF | Sửa item, kèm revision |
| DELETE | /api/services/:id | Admin + CSRF | Body `{revision}` |
| POST | /api/uploads | Admin + CSRF | Multipart field `image`, tối đa 2 MB |
| POST | /api/leads | CSRF | `{name,contact,message,company?,phone?,solution?}` |
| GET | /api/leads | Admin | Tối đa 200 yêu cầu mới nhất |
| PATCH | /api/leads/:id | Admin + CSRF | `{status:"new"|"contacted"|"done"}` |
| DELETE | /api/leads/:id | Admin + CSRF | Xoá yêu cầu |
| GET | /api/status | Mọi người | Kết nối DB, revision; chỉ admin thấy thống kê yêu cầu |
| POST | /api/chat | CSRF | `{message}`, trả kết quả tra cứu hồ sơ |

Các route collection còn áp dụng cho `products`, `projects`, `process`, `values`, `community` thay cho `services`.
Ảnh dùng đường dẫn do API upload trả về, ví dụ `/uploads/<uuid>.png`. Không nhận URL tuỳ ý, SVG hoặc đường dẫn ổ cứng. Mật khẩu quản trị không bao giờ xuất hiện trong API đọc dữ liệu.

Mã lỗi: 400 dữ liệu sai, 401 chưa đăng nhập, 403 CSRF/origin không hợp lệ, 404 không tồn tại, 409 revision cũ, 413 quá dung lượng, 429 quá nhiều yêu cầu, 500 lỗi server ngoài dự kiến.
