# 🍽️ RMS Web Portal

Giao diện web của Hệ thống Quản lý Nhà hàng (RMS) — xây dựng với Next.js 16, React 19 và Tailwind CSS 4.

---

## 🧩 Công Nghệ Sử Dụng

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|:---------:|----------|
| **Next.js** | 16.2.9 | Framework React (App Router, Turbopack) |
| **React** | 19.2.4 | UI Library |
| **TypeScript** | ^5 | Ngôn ngữ phát triển |
| **Tailwind CSS** | ^4 | CSS Utility Framework |
| **Framer Motion** | ^12.40.0 | Animation |
| **Leaflet** | ^1.9.4 | Bản đồ OpenStreetMap |
| **Lucide React** | ^1.17.0 | Icon library |
| **shadcn** | ^4.11.0 | UI Components |
| **class-variance-authority** | ^0.7.1 | Quản lý class variants |
| **PayOS** | — | Cổng thanh toán online |
| **GHTK** | — | Giao hàng tiết kiệm |

---

## 📂 Cấu Trúc Project

```
web-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (providers + Leaflet CDN)
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── account/            # Dashboard
│   │   ├── admin/              # Admin pages
│   │   │   ├── menu/           #   Quản lý thực đơn
│   │   │   ├── revenue/        #   Thống kê doanh thu
│   │   │   └── tables/         #   Quản lý bàn
│   │   ├── api/                # API Proxy routes
│   │   │   ├── ghtk/           #   GHTK shipping proxy
│   │   │   └── osm/            #   OpenStreetMap proxy
│   │   ├── checkout/           # Thanh toán multi-step
│   │   ├── kitchen/            # Quản lý bếp
│   │   ├── menu/               # Thực đơn
│   │   ├── orders/             # Lịch sử đơn hàng
│   │   ├── profile/            # Hồ sơ người dùng
│   │   ├── reservations/       # Đặt bàn
│   │   ├── table/              # Sơ đồ bàn
│   │   └── tracking/           # Theo dõi giao hàng
│   ├── components/
│   │   └── ui/                 # UI Components
│   ├── contexts/
│   │   ├── auth-context.tsx    # Auth: login, register, user state
│   │   ├── cart-context.tsx    # Cart: add, remove, update, totals
│   │   └── toast-context.tsx   # Toast notifications
│   └── lib/
│       └── utils.ts            # Utilities
├── .env.local                  # Environment variables
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS config
├── tsconfig.json               # TypeScript config
└── tailwind.config.ts          # Tailwind config
```

---

## 📄 Danh Sách Trang

| Route | Trang | Quyền | Mô Tả |
|-------|:----:|:-----:|-------|
| `/` | **Trang chủ** | ❌ | Hero banner, danh mục, lưới món ăn, tìm kiếm, CTA |
| `/menu` | **Thực đơn** | ❌ | Full menu với tìm kiếm & lọc danh mục |
| `/account` | **Dashboard** | ✅ | Điều hướng theo vai trò (Admin/Bep/NV/Customer) |
| `/profile` | **Hồ sơ** | ✅ | Cập nhật thông tin cá nhân, đổi mật khẩu |
| `/orders` | **Đơn hàng** | ✅ | Lịch sử đơn hàng với tabs trạng thái, tìm kiếm, sắp xếp |
| `/checkout` | **Thanh toán** | ✅ | Multi-step: chọn địa chỉ (Leaflet map), hình thức giao hàng, PayOS |
| `/kitchen` | **Bếp** | ✅ (Admin/Bep) | Quản lý đơn hàng real-time, đánh dấu hoàn tất, gửi GHTK |
| `/table` | **Bàn ăn** | ✅ | Sơ đồ bàn dạng grid, xem trạng thái |
| `/reservations` | **Đặt bàn** | ❌ | Wizard 3 bước: chọn bàn → thông tin → xác nhận |
| `/tracking/[orderId]` | **Theo dõi** | ✅ | Track giao hàng (Leaflet map + GHTK status) |
| `/admin/tables` | **QL Bàn** | Admin | Thêm, sửa, xóa bàn ăn |
| `/admin/menu` | **QL Thực đơn** | Admin | Thêm, sửa, xóa món ăn |
| `/admin/revenue` | **Doanh thu** | Admin | Thống kê doanh thu với biểu đồ |

---

## 🔄 Luồng Nghiệp Vụ Chính

### 1. Đặt món & Thanh toán
```
Khách hàng → Xem thực đơn → Thêm vào giỏ → Checkout
  → Chọn địa chỉ (Leaflet map)
  → Chọn phương thức thanh toán (COD / PayOS)
  → Xác nhận đơn hàng
```

### 2. Xử lý bếp
```
Bếp nhận đơn mới → Nấu món → Đánh dấu từng món "Hoàn tất"
  → Khi tất cả món hoàn tất → Order.Status = "Hoàn tất"
  → Nếu đơn giao hàng → Bấm "Giao hàng" → GHTK nhận ship
```

### 3. Theo dõi giao hàng
```
Khách hàng → Vào tracking page → Xem bản đồ vị trí
  → Trạng thái GHTK (đã lấy hàng, đang giao, đã giao)
```

### 4. Quản trị
```
Admin → Quản lý thực đơn (CRUD món ăn, danh mục)
  → Quản lý bàn (thêm/sửa/xóa)
  → Xem doanh thu (biểu đồ cột, đường)
  → Quản lý người dùng, nguyên liệu, hóa đơn (qua mobile)
```

---

## ⚙️ Cài Đặt & Chạy

### Yêu cầu
- Node.js ≥ 18
- npm hoặc yarn

### Các bước
```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://192.168.192.85:8080" > .env.local
echo "GHTK_TOKEN=your_ghtk_token" >> .env.local

# 3. Chạy dev server
npm run dev
# → http://localhost:3000
```

### Build cho production
```bash
npm run build
npm start
```

---

## 🧑‍💻 API Proxy Routes

Web portal sử dụng Next.js API Routes để proxy request đến các dịch vụ bên ngoài:

| Route | Proxies đến |
|-------|------------|
| `/api/ghtk/fee` | GHTK — Tính phí vận chuyển |
| `/api/ghtk/order` | GHTK — Tạo đơn giao hàng |
| `/api/ghtk/track/[id]` | GHTK — Tra cứu vận đơn |
| `/api/osm/route` | OpenStreetMap — Định tuyến |
| `/api/osm/search` | Nominatim — Tìm kiếm địa điểm |

---

## 🔑 Tài Khoản Mẫu

| Username | Password | Vai trò | Trang có thể truy cập |
|:---:|:---:|:---:|:---|
| `VAnh` | `VAnh123` | **Admin** | Tất cả trang |
| `khang` | `khang123` | **Bếp** | `/kitchen`, `/account` |
| `ngoc` | `Ngoc123` | **Khách hàng** | `/menu`, `/orders`, `/checkout`, `/account`, `/reservations` |
| `abc` | `abc1234` | **Staff** | `/account`, `/orders` |
| `bao` | `bao2211` | **Cashier** | `/account`, `/table`, `/orders` |

---

## ⚠️ Lưu Ý Khi Phát Triển

1. **Leaflet CSS** — Import `import "leaflet/dist/leaflet.css"` trong layout.tsx gây lỗi Turbopack. Phải dùng CDN `<link>` trong `<head>`.
2. **Stale .next cache** — Xóa thư mục `.next` và chạy lại nếu gặp lỗi không mong đợi.
3. **Hai bản sao project** — Worktree (`.kilo/worktrees/road-marionberry/web-portal/`) và bản gốc (`web-portal/`) là riêng biệt. Chỉnh sửa bên này không ảnh hưởng bên kia.

