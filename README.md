# Mặc Mộc — cửa hàng thời trang trực tuyến

Ứng dụng thương mại điện tử gồm giao diện Next.js, API Java Spring Boot và MongoDB.

## Chức năng

- Duyệt bộ sưu tập, tìm kiếm theo tên/mô tả, lọc danh mục và sắp xếp giá.
- Xem thông tin sản phẩm, chọn kích cỡ và thêm vào giỏ hàng.
- Giỏ hàng được lưu trên trình duyệt; cập nhật số lượng và xóa sản phẩm.
- Nhập thông tin giao hàng, chọn phương thức thanh toán và tạo đơn hàng.
- API đọc sản phẩm từ MongoDB, giữ tồn kho nguyên tử khi đặt hàng và lưu đơn hàng.
- Khách hàng đăng ký/đăng nhập; mật khẩu được băm bằng BCrypt.
- Quản trị viên xem tổng giá trị đơn, thống kê theo tháng, đơn gần đây và thêm/sửa/xóa sản phẩm.
- Tự khởi tạo dữ liệu mẫu khi MongoDB chưa có sản phẩm.

## Chạy ứng dụng

### 1. Khởi động MongoDB

Từ thư mục dự án:

```bash
docker compose up -d
```

### 2. Chạy API Java

Cần Java 17+ và Maven:

Trên PowerShell, cấu hình tài khoản admin ban đầu trước khi khởi động API. Mật khẩu phải có ít nhất 12 ký tự:

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "ThayBangMatKhauManh12!"
$env:APP_JWT_SECRET = "ThayChuoiBiMatJWTBangChuoiNgauNhienDaiHon32KyTu"
```

Tài khoản admin được tạo từ các biến môi trường khi ứng dụng kết nối MongoDB lần đầu. Đăng nhập qua nút **Đăng nhập** trên giao diện; tài khoản có vai trò admin sẽ thấy liên kết **Quản trị**. Không thể tự đăng ký tài khoản admin từ giao diện. Không dùng chuỗi bí mật mặc định của môi trường phát triển khi triển khai thật.

```bash
cd backend
mvn spring-boot:run
```

API chạy tại `http://localhost:8080`; kiểm tra bằng `GET /api/health`.

### 3. Chạy giao diện Next.js

Cần Node.js 20+:

```bash
cd frontend
npm install
npm run dev
```

Mở `http://localhost:3000`. Giao diện có dữ liệu minh họa dự phòng nếu API chưa chạy; khi API hoạt động, sản phẩm và đơn hàng được đồng bộ với MongoDB.

## API chính

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/health` | Kiểm tra API |
| GET | `/api/products` | Danh sách sản phẩm; hỗ trợ `category`, `q`, `sort` |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| POST | `/api/orders` | Tạo đơn hàng |
| POST | `/api/auth/register` | Đăng ký tài khoản khách hàng |
| POST | `/api/auth/login` | Đăng nhập và nhận JWT |
| GET | `/api/admin/stats` | Thống kê quản trị (cần JWT admin) |
| POST | `/api/admin/products` | Thêm sản phẩm (cần JWT admin) |
| PUT | `/api/admin/products/{id}` | Cập nhật sản phẩm (cần JWT admin) |
| DELETE | `/api/admin/products/{id}` | Xóa sản phẩm (cần JWT admin) |

Đặt `MONGODB_URI` để kết nối MongoDB khác; mặc định dùng `mongodb://localhost:27017/macmoc`.

Do cửa hàng chưa tích hợp cổng thanh toán, thống kê doanh thu là tổng giá trị đơn hàng đã tạo, chưa trừ đơn hủy/hoàn hoặc đối soát tiền thực thu.
