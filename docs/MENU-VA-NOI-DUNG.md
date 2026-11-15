> Ghi chú phiên bản: tài liệu này mô tả menu thu gọn ở bản 1.2. Từ bản 1.3, menu đã chuyển sang mega menu và các trang danh mục/chi tiết riêng. Xem GIAO-DIEN-CHI-TIET.md cho hướng dẫn hiện tại.

# Menu xổ xuống và thông tin bổ sung

Bản này lấy ý tưởng tương tác từ ảnh tham khảo, sử dụng nhận diện và dữ liệu Platinum hiện có. Không sao chép logo/nội dung của website tham khảo.

## Các mục

- Giới thiệu: về công ty, tầm nhìn/sứ mệnh, giá trị cốt lõi và hoạt động cộng đồng.
- Dịch vụ: liệt kê các dịch vụ đang có trong MySQL. Bấm mục con để tới đúng dịch vụ và mở thông tin tư vấn.
- Sản phẩm: liệt kê sản phẩm hiện có, mở đúng phần chi tiết.
- Dự án: chọn dự án sẽ bỏ bộ lọc đang bật nếu cần, tới và mở đúng dự án.
- Quy trình: liệt kê từng bước hiện có và nội dung trao đổi bổ sung.
- Hỏi đáp: liên kết trực tiếp tới từng câu hỏi hiện có trên trang.
- Liên hệ: trụ sở, chi nhánh, thông tin doanh nghiệp và biểu mẫu tư vấn.

Đây là menu dẫn đến các phần của cùng trang bằng URL fragment (`#...`), không phải các trang nội dung độc lập. Không tạo thêm đường dẫn backend hoặc thay đổi logic 404/500.

## Không ghi đè nội dung

- Menu được dựng từ API/dữ liệu hiện tại, không nhập lại seed, không ghi vào database khi mở menu.
- Tiêu đề, mô tả, tên người đại diện và các nội dung đang có trong MySQL được giữ nguyên.
- Các gợi ý chuẩn bị tư vấn chỉ hiển thị khi chưa có nội dung chi tiết riêng; được ghi rõ là gợi ý trao đổi, không phải cam kết hợp đồng hoặc tính năng đã bàn giao.
- Nội dung bổ sung được thu gọn mặc định để hạn chế chiều dài trang và khoảng trắng.
- Không thêm khách hàng, chứng chỉ, bảng giá hoặc dự án mới chưa được xác nhận.

## Chỉnh sửa

Trong /admin chọn Dịch vụ, Sản phẩm, Dự án hoặc các nhóm khác, bấm Sửa. Có ô “Chi tiết hiển thị khi khách bấm xem”. Thêm nội dung vào ô này rồi Lưu. Với Dịch vụ/Quy trình, nội dung riêng này thay phần gợi ý thu gọn, không thay mô tả chính.

Nếu cần đổi tên mục trong menu Dịch vụ/Sản phẩm/Dự án/Quy trình, sửa tên bản ghi ở quản trị. Nếu thêm/xoá bản ghi, menu tương ứng cập nhật khi trang lấy lại dữ liệu; không sửa HTML thủ công.

## Sử dụng

- Máy tính: rê chuột hoặc bấm mũi tên bên cạnh tên mục. Bấm tên mục chính để xem tổng quan.
- Điện thoại: bấm ☰, rồi bấm mũi tên mở mục con.
- Bàn phím: Tab đến nút, Enter hoặc ArrowDown mở; ArrowUp/ArrowDown chuyển liên kết; Esc đóng và trả focus về nút.
- Có thể sao chép URL có `#...` để dẫn tới đúng phần chi tiết; trang tự mở chi tiết khi tải lại.

## Cập nhật trên máy đang chạy

1. Dừng Node.js bằng Ctrl+C.
2. Giải nén gói cập nhật vào thư mục riêng; chạy CAP-NHAT-MENU.bat và chọn đường dẫn thư mục website đang chứa package.json.
3. Chạy lại npm start; nhấn Ctrl+F5 trong trình duyệt.

Gói cập nhật không chứa `.env`, không thay database hoặc uploads. Không cần chạy setup hay npm ci. Bản cập nhật tích luỹ có cả nâng cấp trợ lý trước đó, nên dùng được cho bản local đầu tiên hoặc bản đã cập nhật trợ lý. Các file code cũ được script sao lưu trước khi chép bản mới. Nếu bạn tự sửa mã giao diện ngoài hệ thống quản trị, hãy so sánh file backup để giữ các tuỳ chỉnh đó.

## Kiểm thử

Đã kiểm tra bằng Chromium: menu lấy đúng tên/số bản ghi; toàn bộ liên kết đích tồn tại; hover/click/keyboard/Escape; chọn dự án ngoài bộ lọc hiện tại; trên viewport 390px không tràn ngang; chỉnh chi tiết dịch vụ trong quản trị; thêm rồi xoá bản ghi khiến menu thay đổi; mô tả chính giữ nguyên; thao tác menu không làm đổi dữ liệu/revision. Chức năng backend/trợ lý hiện có cũng được chạy lại kiểm thử.
