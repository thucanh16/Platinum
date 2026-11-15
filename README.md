# Platinum Technology — Website động chạy local

**Node.js + Express + JavaScript + MySQL.** Dùng lại giao diện Platinum, có backend thật, dữ liệu lưu trên máy, tài khoản quản trị riêng, trang lỗi 404/500. Không cần Cloudflare, Sites, tài khoản ChatGPT hay OpenAI API để chạy.

## 1. Chuẩn bị trên Windows

- Cài **Node.js 22 trở lên** (bản LTS được khuyến nghị). Mở terminal mới rồi kiểm tra `node -v` và `npm -v`.
- Cài **MySQL Server 8.x** và bật dịch vụ MySQL. Ghi nhớ tài khoản, mật khẩu, cổng (mặc định 3306). MySQL Workbench chỉ là công cụ quản lý; cần cả MySQL Server.
- Giải nén toàn bộ dự án. Mở thư mục bằng VS Code, chọn Terminal → New Terminal.

Cần Internet lần đầu để tải npm dependencies; sau khi cài xong, website vận hành với Node.js và MySQL local, không gọi dịch vụ ngoài. Express và các thư viện là mã nguồn chạy trên máy, không phải dịch vụ backend thuê ngoài.

## 2. Cài đặt lần đầu

Trong PowerShell tại thư mục có `package.json`:

```powershell
Copy-Item .env.example .env
notepad .env
```

Sửa các dòng sau theo MySQL trên máy của bạn, rồi lưu:

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=platinum_local
```

Nếu mật khẩu có ký tự `#`, đặt toàn bộ giá trị trong dấu nháy kép. Không thay mật khẩu thật trong `.env.example`.

```powershell
npm ci
npm run setup
npm start
```

`setup` tự tạo database, bảng, dữ liệu mẫu và SESSION_SECRET ngẫu nhiên. Sau đó chương trình hỏi tên tài khoản quản trị và mật khẩu (10–72 ký tự; nhập không hiển thị). **Không có mật khẩu quản trị mặc định.** Bạn tự đặt và ghi nhớ tài khoản này. Chạy lại setup không ghi đè dữ liệu đã sửa hoặc mật khẩu đã có.

Nếu MySQL báo không đủ quyền tạo database, dùng Workbench tạo database `platinum_local`, cấp quyền tạo bảng/đọc/ghi cho tài khoản local rồi chạy setup lại.

Mở:

- Website: **http://localhost:3000**
- Đăng nhập: **http://localhost:3000/login**
- Quản trị: **http://localhost:3000/admin**

Đừng mở `index.html` bằng cách nhấp đúp: website phải chạy qua Express. Đường dẫn localhost chỉ hoạt động trên máy đang chạy ứng dụng; không phải link công khai.

Lần chạy tiếp theo: bật MySQL rồi `npm start`. Nhấn Ctrl+C để dừng Node.js. Dữ liệu vẫn ở MySQL. Muốn tạo thêm quản trị viên, chạy `npm run admin:create`.

Có thể dùng `CHAY-LAN-DAU.bat` và `CHAY-WEB.bat` nếu không quen terminal; vẫn phải cài Node.js/MySQL trước.

## 3. Các chức năng

- Giao diện tiếng Việt, responsive; tiêu đề 18px, nội dung 14px.
- Nội dung công ty lấy từ MySQL, không ghi cứng ở giao diện. Các đoạn mô tả độc lập được sửa riêng; đổi người đại diện không thay lịch sử nhà sáng lập.
- Quản trị thông tin công ty, dịch vụ, sản phẩm, dự án, quy trình, giá trị và hoạt động cộng đồng.
- Thêm/sửa/xoá có xác nhận; kiểm tra phiên bản để ngăn ghi đè khi hai cửa sổ cùng sửa.
- Logo và ảnh nội dung tải qua API, lưu trong `public/uploads/`; database lưu đường dẫn. Hỗ trợ PNG/JPEG/WebP tối đa 2 MB.
- Khách gửi yêu cầu; quản trị viên xem, đổi trạng thái, xoá. Thông tin công ty, số điện thoại và giải pháp quan tâm bổ sung được lưu cùng nội dung yêu cầu.
- Đăng nhập bằng session lưu trong MySQL; mật khẩu băm bcrypt, kiểm tra quyền ở backend, CSRF token và truy vấn SQL có tham số.
- Trợ lý **tra cứu theo quy tắc**, lấy hồ sơ mới nhất trong MySQL. Đây không phải AI tạo sinh hay chatbot trả lời mọi câu hỏi.
- Dữ liệu mẫu theo hồ sơ công ty, người đại diện ban đầu là Trương Văn Trường. Logo chữ là bản tạm; bạn tải logo gốc trong quản trị. Ảnh sản phẩm đi kèm là minh hoạ AI, được ghi nhãn.

## 4. Demo trang 404 và 500

1. Vào `http://localhost:3000/duong-dan-khong-ton-tai`: giao diện 404 và HTTP status **404**.
2. Giữ `ENABLE_DEMO_ERRORS=true` trong `.env`, đăng nhập quản trị, vào `http://localhost:3000/demo/500`: lỗi mô phỏng trả giao diện 500 và HTTP status **500**. Chi tiết lỗi chỉ in ở terminal server.
3. Chưa đăng nhập hoặc tắt cờ demo thì `/demo/500` trả 404. Đường dẫn này chỉ để kiểm thử, không sửa/xoá dữ liệu.
4. API lỗi trả JSON và status phù hợp: 400 dữ liệu sai, 401 chưa đăng nhập, 403 CSRF không đúng, 404 không tồn tại, 409 xung đột phiên bản, 500 lỗi ngoài dự kiến.
5. Mở DevTools → Network để kiểm tra **Status Code**, không chỉ nhìn chữ trên trang.

## 5. Cấu trúc

```text
src/
  app.js             Route HTTP/API, đăng nhập, upload, xử lý lỗi
  server.js          Khởi động và dừng server
  db.js              Kết nối MySQL
  content.js         Kiểm tra nội dung, đọc/ghi theo transaction
  session-store.js   Lưu session trong MySQL
  lookup.js          Tra cứu hồ sơ không gọi mạng bên ngoài
  config.js          Đọc cấu hình .env
public/
  css/ js/ images/ uploads/
views/
  index.html login.html errors/404.html errors/500.html
scripts/
  setup.js create-admin.js prompt.js generate-seed.js
database/
  schema.sql seed.sql seed.js
tests/
  integration.test.js
docs/
  HUONG-DAN-BAO-CAO.md KIEM-THU.md API.md
```

`schema.sql` là cấu trúc, `seed.sql` là dữ liệu công ty ban đầu. Không chứa tài khoản/mật khẩu quản trị. Để nhập thủ công, chọn một database mới trong Workbench rồi chạy hai file theo thứ tự; sau đó chạy `npm run setup` để tạo tài khoản và cấu hình.

## 6. Kiểm thử

```powershell
npm test
```

Yêu cầu MySQL theo `.env`; tài khoản kiểm thử cần quyền tạo/xoá database `platinum_test_<mã tiến trình>`. Bộ test tự tạo database riêng rồi xoá khi hoàn tất, không dùng bảng của website. Không chạy với tài khoản database production.

Kiểm thử bao gồm auth/session, CSRF, sửa và đọc lại nội dung, CRUD từng mục, kiểm tra xung đột, upload ảnh thật, yêu cầu tư vấn, 404/500, giữ dữ liệu và phiên đăng nhập sau khi khởi tạo lại ứng dụng. Nếu thiếu quyền tạo database, dùng một tài khoản local có quyền cho tác vụ kiểm thử.

## 7. Sao lưu và bài nộp

- Sao lưu MySQL bằng Workbench Data Export hoặc `mysqldump`. Sao lưu thêm `public/uploads/` vì ảnh nằm ngoài database.
- Khôi phục SQL vào database mới và chép ảnh về `public/uploads/`.
- Nộp mã nguồn, `package-lock.json`, `.env.example`, SQL, README và báo cáo. Không nộp `node_modules/`, file `.env` chứa mật khẩu hoặc dữ liệu yêu cầu tư vấn thật.
- Đây là bản local cho học tập/nộp bài. Không cần triển khai cloud. Khi chuyển sang Internet, cần cấu hình HTTPS, cookie secure, sao lưu và vận hành riêng; mặc định server chỉ lắng nghe loopback.

## 8. Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `node`/`npm` không được nhận diện | Cài Node.js LTS và mở lại terminal |
| `ECONNREFUSED` | Bật MySQL, kiểm tra DB_HOST và DB_PORT |
| `Access denied` | Sửa DB_USER/DB_PASSWORD, kiểm tra quyền tài khoản |
| `Table ... doesn't exist` | Chạy `npm run setup` |
| Cổng 3000 bị chiếm | Đổi PORT trong `.env`, dùng URL theo cổng mới |
| Không đăng nhập được | Kiểm tra tên/mật khẩu quản trị đã tạo, không dùng mật khẩu MySQL để đăng nhập website |
| 403 khi lưu | Tải lại trang để lấy CSRF token; không trộn localhost và 127.0.0.1 giữa các tab |
| 409 khi lưu | Có phiên khác vừa sửa; tải dữ liệu mới rồi thực hiện lại |
| Quên mật khẩu quản trị | Tạo tài khoản mới bằng `npm run admin:create` trên chính máy local |
| Ảnh mất sau khi chuyển máy | Chép cả thư mục `public/uploads/`, không chỉ file SQL |
