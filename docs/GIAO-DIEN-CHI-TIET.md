# Giao diện chi tiết Platinum — bản nhiều trang

## Nội dung và thiết kế

Thiết kế lấy cảm hứng từ cách phân nhóm, menu lớn và danh mục trực quan trong ảnh tham khảo. Nhận diện vẫn là Platinum: xanh navy, bạc, cyan và điểm nhấn tím; tiêu đề 18px và chữ nội dung 14px. Không sao chép logo, mascot, lời chứng thực, số dự án hoặc tuyên bố đối tác của website khác.

- Banner minh hoạ 3D hệ sinh thái công nghệ, khu vực giới thiệu sản phẩm nổi bật.
- Mega menu có ảnh, nhóm thông tin và đường dẫn đến danh mục/chi tiết thật.
- Thẻ dịch vụ, sản phẩm và dự án có ảnh minh hoạ; ảnh do quản trị viên tải lên được ưu tiên.
- Trang danh mục có ô tìm kiếm, dự án có bộ lọc lĩnh vực, cập nhật bằng JavaScript/AJAX.
- Trang chi tiết có mô tả hiện tại, nội dung chi tiết, gợi ý trao đổi khi tư vấn và các mục liên quan.
- Trang Giải pháp AI giải thích nguồn dữ liệu, tác vụ, tiêu chí kiểm tra và phối hợp với con người.
- Tìm kiếm toàn website trong các dịch vụ/sản phẩm/dự án, không gọi công cụ tìm kiếm bên ngoài.
- Form tư vấn có thể nhận tên giải pháp từ trang chi tiết; người dùng vẫn tự điền thông tin và xác nhận gửi.
- Trợ lý, đăng nhập quản trị, thêm/sửa/xoá, upload và 404/500 vẫn được giữ.

## Các đường dẫn local

| Đường dẫn | Nội dung |
|---|---|
| / | Trang chủ |
| /gioi-thieu | Công ty, tầm nhìn, giá trị |
| /dich-vu | Danh mục dịch vụ |
| /dich-vu/:id | Dịch vụ theo mã bản ghi MySQL |
| /san-pham | Hệ sinh thái sản phẩm |
| /san-pham/:id | Chi tiết sản phẩm |
| /du-an | Danh mục và bộ lọc dự án |
| /du-an/:id | Chi tiết dự án |
| /giai-phap-ai | Hướng ứng dụng AI theo hồ sơ |
| /quy-trinh | Quy trình hợp tác |
| /hoat-dong | Cộng đồng và hợp tác |
| /hoi-dap | Câu hỏi thường gặp |
| /lien-he | Liên hệ và biểu mẫu |

Ví dụ đầy đủ: http://localhost:3000/dich-vu. Mã bản ghi được lấy từ database, không phải slug tên tự đoán. Nếu mã không tồn tại, server trả trang 404 và HTTP 404, không hiển thị một trang giả thành công.

## Dữ liệu hiện có

Bản nâng cấp không thêm bảng hoặc ghi đè dữ liệu mẫu. Nội dung công ty, tên người đại diện, địa chỉ và các bản ghi đọc từ MySQL đang dùng. Cập nhật mô tả/chi tiết trong quản trị sẽ ảnh hưởng cả trang chủ và trang chi tiết tương ứng.

Nội dung hướng dẫn trao đổi là đề xuất chuẩn bị, không phải báo giá hoặc cam kết tính năng. Không thêm phần đánh giá khách hàng giả, ảnh nhân sự giả, số liệu thành tích hoặc chứng nhận không được cung cấp. Các tên dự án và vai trò tham gia dựa trên hồ sơ; ảnh lĩnh vực là hình minh hoạ, không phải ảnh chụp giao diện dự án thật.

Hình mới do AI tạo được lưu trong public/images, có chú thích khi hiển thị. Không tải ảnh từ CDN khi website chạy. Có thể tải ảnh thật trong quản trị cho từng bản ghi để thay hình mặc định. Logo chữ vẫn là bản tạm nếu bạn chưa tải logo gốc.

## Cập nhật

1. Dừng npm start bằng Ctrl+C.
2. Giải nén gói cập nhật vào thư mục riêng, mở CAP-NHAT-GIAO-DIEN.bat.
3. Chọn đường dẫn thư mục có package.json và .env của website đang dùng.
4. Script sao lưu các file code sẽ thay, chép bản mới và ảnh minh hoạ. Không chép .env, không xoá MySQL hoặc uploads.
5. Chạy lại npm start, Ctrl+F5 trong trình duyệt. Không cần npm ci hoặc npm run setup.

Nếu tự sửa source bằng tay trước đây, xem thư mục backup để giữ các tuỳ chỉnh riêng. Các nội dung sửa qua trang quản trị nằm trong MySQL và không bị script cập nhật thay thế.

## Kiểm thử

Đã kiểm tra với MySQL 8.4 và Chromium: trang danh mục, chi tiết có/không có mã, tìm kiếm AJAX, bộ lọc, mega menu, form nhận nhu cầu từ URL, ảnh tải được, font 18px/14px, điện thoại 390px không tràn ngang, dữ liệu không bị ghi lại khi duyệt trang. Các kiểm thử backend, session, CSRF, CRUD và trợ lý vẫn chạy qua. Mô hình AI Ollama là tuỳ chọn từ bản trước, không được bật mặc định hoặc giả định đang chạy.
