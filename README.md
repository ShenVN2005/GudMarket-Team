# 🛒 GudMarket — Sàn Mua Bán Đồ Cũ An Toàn (Giữ Tiền Hộ 48H)

> **C2C Marketplace with Safe Escrow & 48h Inspection Window**  
> Dành cho thành viên trong team: Đọc hướng dẫn "mì ăn liền" bên dưới để chạy toàn bộ hệ thống từ A-Z trong 3 phút.

---

## 1. Hướng Dẫn Chạy Nhanh (Mì Ăn Liền — 3 Phút)

### Yêu cầu cài sẵn trên máy:
1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Bật ứng dụng Docker Desktop lên trước)
2. **[Node.js](https://nodejs.org/)** (v20 hoặc v22 LTS)
3. **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)**

---

### Bước 1: Bật Database (PostgreSQL 16)
Mở một cửa sổ Terminal tại thư mục gốc của dự án (`GudMarket/`):
```bash
docker compose up -d
```
> **Database đã sẵn sàng tại port `5432`:**
> - DB Name: `gudmarket_db`
> - User: `appuser`
> - Password: `secretpassword`

---

### Bước 2: Chạy Frontend (Giao diện React + Vite)
Mở một tab Terminal mới:
```bash
cd Frontend
npm install
npm run dev
```
> **Truy cập web tại:** [http://localhost:5173](http://localhost:5173)

---

### Bước 3: Chạy Backend (API .NET 8)
Mở thêm một tab Terminal mới:
```bash
cd Backend
dotnet restore
dotnet run
```
> **Truy cập tài liệu API Swagger tại:** [http://localhost:5039/swagger](http://localhost:5039/swagger)

---

## 2. Bản Đồ Cổng & Địa Chỉ (Port Mapping)

| Thành phần | Địa chỉ truy cập | Ghi chú |
| :--- | :--- | :--- |
| **Frontend Web** | `http://localhost:5173` | Giao diện React + Tailwind CSS v4 |
| **Backend API (HTTP)** | `http://localhost:5039` | API chính .NET 8 |
| **Backend Swagger** | `http://localhost:5039/swagger` | Giao diện test API |
| **PostgreSQL Database** | `localhost:5432` | Chạy trong Docker container |
| **PgAdmin 4 (nếu bật)** | `http://localhost:5050` | Giao diện quản lý DB trực quan |

---

## 3. Tài Khoản Test Sẵn Trên Giao Diện

Hệ thống đã có sẵn tài khoản mẫu để bạn kiểm tra trực tiếp:

- **Tài khoản Người dùng (Buyer / Seller):**
  - Email: `nguyenvanan@gmail.com`
  - Mật khẩu: `123456`
  - Quyền hạn: Đăng bán hàng, mua hàng, quản lý đơn hàng 48h, nạp/rút tiền ví.
- **Tài khoản Quản trị viên (Admin):**
  - Header có sẵn nút **Quản trị sàn** (Duyệt tin đăng, Phân xử khiếu nại bằng chứng ảnh/video, Duyệt rút tiền VietQR 24/7).

---

## 4. Cấu Trúc Thư Mục Dự Án

```text
GudMarket/
├── Frontend/                 # Mã nguồn Giao diện (React 19 + TypeScript + Tailwind v4)
│   ├── src/
│   │   ├── api/             # Client gọi API & Kiểu dữ liệu TypeScript (types.ts)
│   │   ├── components/      # Modal Đăng bán, Đăng nhập, Khiếu nại, Stepper, Timer
│   │   ├── pages/           # Quản lý Tin đăng, Đơn hàng 2 chiều, Ví tiền, Admin Dashboard
│   │   ├── App.tsx          # Trang chủ Marketplace
│   │   └── index.css        # Cấu hình Tailwind v4 (@import "tailwindcss")
│   └── package.json         # Danh sách thư viện Frontend
│
├── Backend/                  # Mã nguồn Backend (.NET 8 Web API)
│   ├── Controllers/         # Các API Auth, Sản phẩm, Đơn hàng, Ví, Rút tiền
│   ├── Services/            # Nghiệp vụ giữ tiền Escrow, Worker đếm giờ 72h/48h
│   ├── appsettings.json     # Cấu hình Database, JWT, payOS
│   └── Backend.csproj       # Danh sách thư viện NuGet Backend
│
├── docker-compose.yml        # File khởi động PostgreSQL 16 & PgAdmin 4
├── .gitignore                # File loại bỏ các thư mục rác (node_modules, bin, obj)
└── README.md                 # Tài liệu bàn giao này
```

---

## 5. Quy Ước Làm Việc Nhóm Với Git (Tránh Xung Đột)

1. **Tuyệt đối không push code trực tiếp lên nhánh `main`:**
   Nhánh `main` chỉ chứa code đã hoàn chỉnh và chạy ổn định.

2. **Quy trình khi làm một tính năng mới:**
   ```bash
   # 1. Cập nhật code mới nhất từ team về
   git checkout main
   git pull origin main

   # 2. Tạo nhánh mới để làm việc (đặt tên rõ ràng)
   git checkout -b feature/ten-tinh-nang

   # 3. Làm xong thì add và commit
   git add .
   git commit -m "Mô tả ngắn gọn việc vừa làm"

   # 4. Đẩy nhánh của bạn lên GitHub
   git push origin feature/ten-tinh-nang
   ```
3. Lên giao diện GitHub bấm **New Pull Request (PR)** để cả team cùng review và gộp vào nhánh `main`.

---

## 6. Xử Lý Các Lỗi Thường Gặp (Troubleshooting)

- **Lỗi: `Cannot connect to the Docker daemon`**  
  Bạn chưa bật ứng dụng **Docker Desktop**. Hãy mở Docker Desktop lên và chờ nó hiện màu xanh ("Engine running").

- **Lỗi: `Port 5432 is already in use`**  
  Máy bạn đang có sẵn một dịch vụ PostgreSQL chạy ngầm. Hãy tắt service PostgreSQL trên máy (hoặc sửa port `5433:5432` trong `docker-compose.yml`).

- **Lỗi Frontend: `Cannot find module ...`**  
  Chạy lại lệnh: `cd Frontend && npm install`

- **Lỗi Backend: `The command could not be loaded`**  
  Chạy lại lệnh: `cd Backend && dotnet restore && dotnet build`

