# Restaurant Management System (RMS) - Project Log

## Thông tin dự án

**Tên dự án:** Restaurant Management System (RMS) / "Delicious Bites"  
**Mục đích:** Hệ thống quản lý nhà hàng đa nền tảng - quản lý menu, đơn hàng, bàn, hóa đơn, người dùng, nguyên liệu, báo cáo  
**Vị trí workspace:** `C:\Study\QLQA\Restaurant-Manangment-System`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | .NET 8 / ASP.NET Core Web API (C#) |
| ORM | Entity Framework Core 8 (Pomelo MySQL provider) |
| Database | MySQL 8.0 (MariaDB trên server) |
| Mobile Client | React Native / Expo SDK 54 (JavaScript) |
| Android Client | Java, Android SDK (compileSdk 36) |
| Testing - UI | Playwright (.NET / C#) |
| Testing - Unit | Jest + React Native Testing Library |
| Containerization | Docker + Docker Compose |
| Authentication | JWT Bearer tokens |
| Payment Gateway | PayOS (https://payos.vn) |

---

## SSH Server

**Địa chỉ:** `192.168.192.85`  
**Account:** `root`  
**Password:** `CaoBao2211`  
**Hostname:** `vmi1991462.contaboserver.net` (Contabo VPS)  
**OS:** Ubuntu, Kernel 5.4.0-105-generic, x86_64  
**RAM:** 5.8GB  
**Disk:** 391GB (dùng 37GB / 10%)  
**Uptime:** 32+ ngày  

### Kết nối SSH từ PowerShell (Windows)

```powershell
# Cài đặt Posh-SSH module (chỉ cần 1 lần)
Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force
Install-Module -Name Posh-SSH -Force -Scope CurrentUser

# Kết nối SSH
$secPassword = ConvertTo-SecureString "CaoBao2211" -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ("root", $secPassword)
$session = New-SSHSession -ComputerName 192.168.192.85 -Credential $cred -AcceptKey -Force

# Chạy lệnh
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command "your-command-here"
Write-Output $result.Output

# Ngắt kết nối
Remove-SSHSession -SessionId $session.SessionId
```

---

## Docker Containers trên server

| Container | Status | Port | Image |
|---|---|---|---|
| **rms-api-server** | Up | **:8080** | rms-api-server:latest |
| wordpresskhang-1 | Up | :8081 | shinsenter/wordpress |
| wordpressBao-1 | Up | :8082 | shinsenter/wordpress |
| phpmyadmin-1 | Up | :8083 | phpmyadmin |
| wordpress_lab-db-1 | Up | 3306 (internal) | mariadb |
| portainer | Up | :9000, :9443 | portainer-ce |
| nginx-proxy-app-1 | Up | :80, :443 | nginx-proxy-manager |

### Docker Compose (RMS API + DB)

File: `/var/lib/docker/volumes/portainer_data/_data/compose/7/docker-compose.yml`

```yaml
services:
  db:
    image: mariadb:latest
    environment:
      MARIADB_ROOT_PASSWORD: CaoBao2211
    volumes:
      - db:/var/lib/mysql

  rms-api:
    image: rms-api-server:latest
    container_name: rms-api-server
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - DOTNET_RUNNING_IN_CONTAINER=true
      - ConnectionStrings__DefaultConnection=Server=db;Database=webQLQuanAn;User=root;Password=CaoBao2211;AllowPublicKeyRetrieval=True;SslMode=None;
      - Jwt__Key=your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security-purposes
      - Jwt__Issuer=RMS-APIServer
      - Jwt__Audience=RMS-Users
      - Jwt__ExpireDays=7
      - PayOS__ClientId=61a87aec-24a3-4356-a607-a80b4e4cb9e2
      - PayOS__ApiKey=4b0462cd-bba6-4214-a933-23b5ab3866a7
      - PayOS__ChecksumKey=f1a4f7745f3f46d5ab32663e389ba668ad072b2b365d35bb555f213b0f2cef88
    ports:
      - "8080:8080"
    depends_on:
      - db
    restart: unless-stopped
```

---

## Database

**Schema:** `webQLQuanAn`  
**SQL file:** `webQLQuanAn_mysql.sql` (704 lines)  
**12 bảng:** Bill, Bill_Detail, Category, Food_Info, Ingredient, Order, Order_Detail, Recipe, Recipe_Detail, Table, User, UserFavorites

### Users trong database

| UserID | UserName | Password | Role | FullName |
|---|---|---|---|---|
| 1 | abc | abc1234 | NV (Staff) | Duong |
| 2 | bao | bao2211 | TN (Cashier) | Bao |
| 3 | khang | khang123 | Bep (Kitchen) | Khang |
| 4 | VAnh | VAnh123 | Admin | VAnh |
| 3292731962 | ngoc | Ngoc123 | Customer | ngocngoc |

---

## Cấu trúc dự án

```
Restaurant-Manangment-System/
├── RMS-APIServer/                    # Backend API (.NET 8)
│   └── RMS-APIServer/
│       ├── Program.cs                # Entry point
│       ├── Dockerfile                # Docker build
│       ├── appsettings.json          # Config (DB, JWT, PayOS)
│       ├── Controllers/              # 17 controllers (thêm PayOSController)
│       ├── Models/                   # 18 models + 2 DB contexts
│       └── Services/                 # 4 services (thêm PayOSService)
│
├── RMSMobile/                        # Mobile App (React Native/Expo)
│   └── Restaurant-Manangment-System-RMSMobile-Testing/
│       ├── App.js                    # Navigation + sidebar
│       ├── screens/                  # 21 screens (thêm PayOSCheckoutScreen)
│       ├── components/               # 3 reusable components
│       ├── context/                  # Auth, Cart, Toast contexts
│       └── services/apiService.js    # API client (~1983 lines)
│
├── RMSAndroid/                       # Android Native (Java)
├── PLaywright/                       # Integration tests
└── docker-compose.yml                # Container orchestration
```

---

## Những việc đã làm

### 1. Sửa lỗi login 500 Internal Server Error

**Vấn đề:** `Table 'webQLQuanAn.\`User\`' doesn't exist`  
**Nguyên nhân:** Trong `DBContext.cs` và `WebQlquanAnContext.cs`, các bảng reserved words (`User`, `Order`, `Table`) được map với backticks thủ công: `entity.ToTable("\`User\`")`. EF Core (Pomelo) tự động thêm backticks → kết quả变成 double backtick → MySQL không tìm thấy bảng.  
**Cách sửa:** Đổi `entity.ToTable("\`User\`")` → `entity.ToTable("User")` cho cả 3 bảng: `User`, `Order`, `Table` trong cả 2 file DbContext.  
**Deploy:** Upload source → build Docker image → restart container trên server.

### 2. Tích hợp thanh toán online PayOS

#### PayOS Credentials

- **Client ID:** `61a87aec-24a3-4356-a607-a80b4e4cb9e2`
- **API Key:** `4b0462cd-bba6-4214-a933-23b5ab3866a7`
- **Checksum Key:** `f1a4f7745f3f46d5ab32663e389ba668ad072b2b365d35bb555f213b0f2cef88`
- **Dashboard:** https://my.payos.vn
- **API Base URL:** `https://api-merchant.payos.vn`

#### PayOS API Endpoints (Backend)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/PayOS/create-payment` | Tạo link thanh toán PayOS |
| GET | `/api/PayOS/status/{orderCode}` | Kiểm tra trạng thái thanh toán |
| POST | `/api/PayOS/cancel/{orderCode}` | Hủy link thanh toán |
| POST | `/api/PayOS/webhook` | Nhận callback từ PayOS |
| POST | `/api/PayOS/confirm/{orderCode}` | Xác nhận thanh toán thành công |

#### Files đã tạo/sửa cho PayOS

**Backend (API Server):**
- `Services/PayOSService.cs` - **Tạo mới** - Service gọi PayOS API (tạo link, check status, verify webhook, hủy). Dùng HttpClient + HMAC-SHA256 signature.
- `Controllers/PayOSController.cs` - **Tạo mới** - 5 endpoints cho PayOS.
- `Program.cs` - **Sửa** - Đăng ký PayOSService: `builder.Services.AddHttpClient<IPayOSService, PayOSService>()`
- `appsettings.json` - **Sửa** - Thêm section `PayOS` với ClientId, ApiKey, ChecksumKey.

**Mobile App (React Native):**
- `screens/PayOSCheckoutScreen.js` - **Tạo mới** - Màn hình thanh toán PayOS với Linking.openURL, polling trạng thái mỗi 5s, timeout 10 phút.
- `services/apiService.js` - **Sửa** - Thêm 4 methods: `createPayOSPayment`, `getPayOSPaymentStatus`, `confirmPayOSPayment`, `cancelPayOSPayment`
- `App.js` - **Sửa** - Import PayOSCheckoutScreen, đăng ký route `PayOSCheckout` (headerShown: false)
- `screens/BillManagerScreen.js` - **Sửa**:
  - Thêm `useNavigation` hook
  - Thêm `'PayOS - Online'` vào paymentMethods list (icon: `qrcode-scan`)
  - Sửa `handleCreateBill`: khi chọn PayOS → tạo bill → gọi API tạo link PayOS → navigate đến PayOSCheckoutScreen
  - Thêm nút `TEST PAYOS` ở đầu trang để debug

#### Flow thanh toán PayOS

```
1. Staff chọn đơn hàng "Hoàn tất" → nhấn "Create Bill"
2. Chọn phương thức "PayOS Online" (icon QR code)
3. Nhấn "Create Bill"
4. App tạo bill (POST /api/Bill)
5. App cập nhật trạng thái đơn hàng → "Đã tạo bill"
6. App gọi API tạo link PayOS (POST /api/PayOS/create-payment)
7. PayOS trả về checkoutUrl + orderCode
8. App mở PayOSCheckoutScreen
9. PayOSCheckoutScreen mở trình duyệt/WebView với checkoutUrl
10. User chọn ngân hàng → quét QR hoặc nhập thông tin → thanh toán
11. App poll trạng thái mỗi 5 giây (GET /api/PayOS/status/{orderCode})
12. Khi status = "PAID" → xác nhận (POST /api/PayOS/confirm/{orderCode})
13. Hiển thị "Thanh toán thành công!" → quay lại Bill Manager
```

#### PayOS API - Quan trọng

- **Description giới hạn 25 ký tự** (lỗi đã fix: `"Thanh toan don hang ORD..."` → `"DH ORD..."`)
- **Signature:** HMAC-SHA256 với checksum key, data format: `amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl` (sort alphabet)
- **orderCode:** Số nguyên dương (Int32), tạo từ Unix timestamp
- **amount:** Số nguyên (VND), không có phần thập phân
- **Status:** `PENDING` → `PAID` hoặc `CANCELLED` / `EXPIRED`

#### Build & Deploy lên server

```powershell
# 1. Nén source code
Compress-Archive -Path "RMS-APIServer\*" -DestinationPath "rms-api-source.zip" -Force

# 2. Upload lên server
Set-SCPItem -ComputerName 192.168.192.85 -Credential $cred -AcceptKey -Force `
  -Path "rms-api-source.zip" -Destination "/root/rms-build/"

# 3. Unzip + Build Docker image trên server
Invoke-SSHCommand -SessionId $session.SessionId -Command "
  cd /root/rms-build && rm -rf RMS-APIServer &&
  unzip -o rms-api-source.zip -d RMS-APIServer > /dev/null 2>&1 &&
  cd RMS-APIServer && docker build -t rms-api-server:latest .
"

# 4. Restart container với PayOS env vars
Invoke-SSHCommand -SessionId $session.SessionId -Command "
  docker stop rms-api-server && docker rm rms-api-server &&
  docker run -d --name rms-api-server --network wordpress_lab_default \
    -e ASPNETCORE_ENVIRONMENT=Production \
    -e DOTNET_RUNNING_IN_CONTAINER=true \
    -e 'ConnectionStrings__DefaultConnection=Server=db;Database=webQLQuanAn;User=root;Password=CaoBao2211;AllowPublicKeyRetrieval=True;SslMode=None;' \
    -e 'Jwt__Key=your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security-purposes' \
    -e Jwt__Issuer=RMS-APIServer -e Jwt__Audience=RMS-Users -e Jwt__ExpireDays=7 \
    -e 'PayOS__ClientId=61a87aec-24a3-4356-a607-a80b4e4cb9e2' \
    -e 'PayOS__ApiKey=4b0462cd-bba6-4214-a933-23b5ab3866a7' \
    -e 'PayOS__ChecksumKey=f1a4f7745f3f46d5ab32663e389ba668ad072b2b365d35bb555f213b0f2cef88' \
    -p 8080:8080 --restart unless-stopped rms-api-server:latest
"
```

---

## Trạng thái hiện tại

### Đã hoàn thành
- [x] Sửa lỗi login 500 (backtick issue trong DbContext)
- [x] Tạo PayOSService.cs (backend)
- [x] Tạo PayOSController.cs (backend)
- [x] Cấu hình PayOS credentials trong appsettings.json + Docker env
- [x] Tạo PayOSCheckoutScreen.js (mobile)
- [x] Thêm PayOS API methods trong apiService.js
- [x] Thêm "PayOS Online" vào payment methods trong BillManagerScreen
- [x] Sửa handleCreateBill để hỗ trợ PayOS flow
- [x] Đăng ký PayOSCheckoutScreen route trong App.js
- [x] Cài react-native-webview
- [x] Deploy lên server (build Docker image + restart container)
- [x] Test PayOS API trực tiếp (thành công - trả về checkoutUrl hợp lệ)
- [x] Thêm nút TEST PAYOS để debug

### Đang làm
- [ ] Debug: PayOS checkout popup không hiện khi user chọn "PayOS Online" và nhấn "Create Bill"
- [ ] Cần xác nhận: user đã reload app sau khi code thay đổi chưa
- [ ] Cần xác nhận: nút TEST PAYOS có hoạt động không (hiện Alert gì?)

### Vấn đề cần giải quyết
1. **PayOS checkout không hiện popup:** API backend hoạt động OK (test curl thành công), nhưng mobile app không gọi được API PayOS. Có thể do:
   - App chưa reload code mới
   - JavaScript error trong handleCreateBill
   - Navigation issue
2. **CartScreen checkout chưa hoàn chỉnh:** Có `TODO: Implement actual order placement` - checkout chỉ clear cart mà không tạo order
3. **Bill ID collision:** Bill ID tạo bằng `Math.random().toString(36).substr(2, 10)` có thể trùng

---

## Mobile App - Navigation & Screens

### Screens (21 screens)

| Screen | Role | Mô tả |
|---|---|---|
| HomeScreen | All | Dashboard với stats, quick actions |
| MenuScreen | Customer+ | Browse menu, thêm vào giỏ / đặt hàng |
| CartScreen | Customer+ | Giỏ hàng (checkout chưa hoàn chỉnh) |
| OrdersScreen | All | Xem danh sách đơn hàng |
| OrderDetailScreen | All | Chi tiết đơn hàng + trạng thái |
| ProfileScreen | All | Hồ sơ cá nhân |
| LoginScreen | All | Đăng nhập |
| RegisterScreen | All | Đăng ký |
| FavoritesScreen | Customer+ | Món ăn yêu thích |
| TableScreen | Admin+ | Quản lý bàn |
| BillManagerScreen | Admin+ | **Tạo hóa đơn + thanh toán (bao gồm PayOS)** |
| BillScreen | Admin+ | Xem hóa đơn (read-only) |
| ReportScreen | Admin+ | Báo cáo doanh thu |
| MenuManagerScreen | Admin | CRUD menu items |
| IngredientManagerScreen | Admin | Quản lý nguyên liệu |
| OrderDetailManagerScreen | Kitchen/Admin | Cập nhật trạng thái món ăn |
| UserManagementScreen | Admin | CRUD người dùng |
| ChangePasswordScreen | All | Đổi mật khẩu |
| UpdateInformationScreen | All | Cập nhật thông tin |
| **PayOSCheckoutScreen** | All | **Thanh toán PayOS (mới)** |

### Role Permissions

| Role | Allowed Screens |
|---|---|
| NV (Staff) | Home, Table, Menu, Orders, OrderDetail, Profile |
| TN (Cashier) | Home, Orders, BillManager, Profile |
| Bep (Kitchen) | Home, Menu, OrderDetailManager, Profile |
| Customer | Home, Menu, Favorites, Cart, Profile |
| Admin | All (except Favorites & Cart) |

---

## API Base URL

```
http://192.168.192.85:8080
```

Được cấu hình trong `services/apiService.js`:
```javascript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.192.85:8080';
```

---

## Ghi chú kỹ thuật

### Cách Docker build cache hoạt động

Docker sử dụng layer caching. Khi chỉ sửa 1 file (ví dụ PayOSController.cs), Docker sẽ cache các layer trước đó (restore, csproj) và chỉ rebuild layer `COPY . .` + build. Nếu muốn force rebuild toàn bộ, dùng `docker build --no-cache`.

### Cách PayOS signature hoạt động

```csharp
// Data phải sort theo alphabet
var signatureData = $"amount={amount}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}";

// HMAC-SHA256 với checksum key
var keyBytes = Encoding.UTF8.GetBytes(checksumKey);
var dataBytes = Encoding.UTF8.GetBytes(signatureData);
using var hmac = new HMACSHA256(keyBytes);
var hash = hmac.ComputeHash(dataBytes);
var signature = Convert.ToHexString(hash).ToLower();
```

### Posh-SSH module

Dùng để SSH từ PowerShell trên Windows. Hỗ trợ:
- `New-SSHSession` - Tạo session SSH
- `Invoke-SSHCommand` - Chạy lệnh từ xa
- `Set-SCPItem` - Upload file/directory qua SCP
- `Remove-SSHSession` - Đóng session

Lưu ý: `Set-SCPItem` có thể báo lỗi progress bar (`PercentComplete cannot be greater than 100`) nhưng file vẫn upload thành công.
