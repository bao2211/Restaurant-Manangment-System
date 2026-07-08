# RMS Project Context — Session Handover

## Project Overview
Restaurant Management System (RMS) — a full-stack app for restaurant ordering, kitchen management, and admin operations.

**Student:** Cao Thien Bao, ID: 23DH114212

### Stack
| Layer | Technology | Location |
|-------|-----------|----------|
| Frontend | Next.js 16.2.9 + React 19 + Tailwind 4 | `web-portal/` |
| Backend | ASP.NET Core 8.0 (Pomelo MySQL) | `RMS-APIServer/` |
| Database | MariaDB on Docker (container `wordpress_lab-db-1`) | `192.168.192.85:3306` |
| API Server | Docker container `rms-api-server` | `192.168.192.85:8080` |
| Mobile | React Native (Expo) | `RMSMobile/` |

---

## Server Access
| Resource | Details |
|----------|---------|
| Server IP | `192.168.192.85` |
| SSH | `root / CaoBao2211` (often hangs — prefer Portainer) |
| Portainer | `http://192.168.192.85:9000` |
| MariaDB | Container `wordpress_lab-db-1`, port `3306`, user `root`, pass `CaoBao2211`, database `webQLQuanAn` |
| API Container | `rms-api-server`, port `8080`, image `bao2211/rms-apiserver:mysql` |
| Web Portal | Local dev at `localhost:3000` (or 3001/3002 if busy) |

---

## Database Schema (14 tables)

### Tables
| Table | Key Fields | Notes |
|-------|-----------|-------|
| `Bill` | BillId, Total, Discount, TotalFinal, Payment, CreatedTime, OrderId, UserId | |
| `Bill_Detail` | BillId, OrderId, Quantity, UnitPrice | |
| `Category` | CateId, CateName, Description | |
| `Food_Info` | FoodId, FoodName, FoodImage, UnitPrice, Description, CateId | FK → Category |
| `Ingredient` | IngreId, IngreName, Stock, UnitMeasurement | |
| `Order` | OrderId, CreatedTime, Status, Total, Note, Discount, TableId, ReservationId, UserId, PaymentStatus | **Two independent status tracks** |
| `OrderDetail` | FoodId, OrderId, UnitPrice, Status, Quantity | Composite PK (FoodId + OrderId) |
| `Recipe` | RecipeId, RecipeDescription, FoodId | FK → Food_Info |
| `Recipe_Detail` | RecipeId, IngreId, UnitMeasurement, Quantity | Composite PK |
| `Table` | TableId, TableName, NumOfSeats, Status | |
| `TableReservationHistory` | (reservation data) | |
| `User` | UserId, UserName, Password, Role, Right, FullName, Phone, Email | |
| `UserFavorites` | (favorites data) | |
| `OrderHistory` | (history data) | |

**Note:** DB has NO foreign key constraints — relationships are handled in EF Core app code.

### User Accounts
| Role | Username | Password |
|------|----------|----------|
| Admin | VAnh | VAnh123 |
| Staff | abc | abc1234 |
| Kitchen | khang | khang123 |
| Cashier | bao | bao2211 |
| Customer | ngoc | Ngoc123 |

---

## CRITICAL: Order Status System

Orders have **TWO INDEPENDENT status tracks** that NEVER affect each other:

### Track 1: Order Status (cooking progress)
- **Values:** `"Chưa làm"` → `"Hoàn tất"`
- **Trigger:** Kitchen marks ALL order items as complete
- **API:** `PUT /api/Order/{orderId}` with `{ orderId, status: "Hoàn tất" }`
- **Frontend:** `kitchen/page.tsx` → `completeItem()` function

### Track 2: Payment Status (payment progress)
- **Values:** `"Chưa thanh toán"` → `"Đã thanh toán"`
- **Trigger:** User pays (cash or PayOS)
- **API:** `PUT /api/Order/{orderId}` with `{ orderId, paymentStatus: "Đã thanh toán" }`
- **Frontend:** `header.tsx` → CartSidebar `handleCheckout()` and PayOSModal

### Rules
- Payment status is set to `"Chưa thanh toán"` on order creation
- Payment status ONLY changes on payment events
- Order status ONLY changes when kitchen completes all items
- They are COMPLETELY INDEPENDENT
- `PUT /api/Order/{id}` does **PARTIAL updates** — only non-null fields are patched

### Legacy Status Values in DB (from SQL Server migration)
The database contains inconsistent status values from the original SQL Server data:
- `"Chưa làm"`, `"chưa làm"`, `"pending"`, `"Pending"` — all mean cooking pending
- `"Hoàn tất"`, `"completed"`, `"Ho?n t?t"` (encoding corruption) — all mean cooking done
- `"Đã tạo bill"`, `"Đã tính tiền"` — bill-related statuses
- `"Đã thanh toán"` — payment completed

---

## API Endpoints

### Base URL
```
http://192.168.192.85:8080
```

### CRUD Endpoints
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/Bill` | |
| GET | `/api/BillDetail` | |
| GET | `/api/Category` | |
| GET | `/api/FoodInfo` | Returns with `cateId` and `categoryName` |
| GET | `/api/Ingredient` | |
| GET | `/api/Order` | Returns with `id` field (OrderDto) |
| GET | `/api/OrderDetail` | |
| GET | `/api/Recipe` | |
| GET | `/api/RecipeDetail` | |
| GET | `/api/Table` | |
| GET | `/api/User` | |

### Order Endpoints (special)
| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/Order/{id}` | Detail with `orderId`, `createdTime`, includes orderDetails |
| GET | `/api/Order/user/{userId}` | User's orders, uses `orderId` field |
| GET | `/api/Order/table/{tableId}` | Orders by table |
| GET | `/api/Order/status/{status}` | Orders by status |
| POST | `/api/Order` | Create order (auto-generates OrderId if not provided) |
| PUT | `/api/Order/{id}` | **PARTIAL update** — only non-null fields patched |
| DELETE | `/api/Order/{id}` | |

### OrderDetail Endpoints
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/OrderDetail/order/{orderId}` | Items for an order |
| GET | `/api/OrderDetail/food/{foodId}/order/{orderId}` | Single item detail |
| POST | `/api/OrderDetail` | Add item to order |
| PUT | `/api/OrderDetail/food/{foodId}/order/{orderId}` | **PARTIAL update** |
| DELETE | `/api/OrderDetail/food/{foodId}/order/{orderId}` | |
| POST | `/api/OrderDetail/fix-null-statuses` | Utility: sets null statuses to "Chưa làm" |

### Auth & User Endpoints
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/User/login` | `{ userName, password }` |
| POST | `/api/User` | Register (full User object) |
| PUT | `/api/User/{id}` | Update (requires full user body) |

### PayOS Endpoints
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/PayOS/create-payment` | Creates PayOS payment link |
| GET | `/api/PayOS/status/{orderCode}` | Check payment status |
| POST | `/api/PayOS/confirm/{orderCode}` | Confirm payment |
| POST | `/api/PayOS/cancel/{orderCode}` | Cancel payment |
| POST | `/api/PayOS/webhook` | PayOS webhook callback |

### Table Endpoints
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/Table/available` | Available tables |

### Frontend API Proxy Routes (Next.js)
| Route | Proxies to |
|-------|-----------|
| `/api/ghtk/fee` | GHTK shipping fee |
| `/api/ghtk/order` | GHTK order creation |
| `/api/ghtk/track/[orderId]` | GHTK tracking |
| `/api/osm/route` | OpenStreetMap routing |
| `/api/osm/search` | Nominatim geocoding |

---

## Web Portal Pages

### Route Map
| Route | File | Description | Auth Required |
|-------|------|-------------|---------------|
| `/` | `app/page.tsx` | Homepage with food grid, search, categories | No |
| `/menu` | `app/menu/page.tsx` | Full menu with search | No |
| `/account` | `app/account/page.tsx` | Dashboard with role-based links | Yes |
| `/profile` | `app/profile/page.tsx` | Edit profile + change password | Yes |
| `/orders` | `app/orders/page.tsx` | Order history with status tabs | Yes |
| `/checkout` | `app/checkout/page.tsx` | Checkout with map, delivery, PayOS | Yes |
| `/kitchen` | `app/kitchen/page.tsx` | Kitchen order management | Admin/Bep |
| `/table` | `app/table/page.tsx` | Table overview | Yes |
| `/reservations` | `app/reservations/page.tsx` | Table booking | Yes |
| `/tracking/[orderId]` | `app/tracking/[orderId]/page.tsx` | Order tracking with map | Yes |
| `/admin/tables` | `app/admin/tables/page.tsx` | CRUD tables | Admin |
| `/admin/menu` | `app/admin/menu/page.tsx` | CRUD food items | Admin |
| `/admin/revenue` | `app/admin/revenue/page.tsx` | Revenue statistics & charts | Admin |

### Navigation by Role
- **Admin:** All pages + admin pages
- **Kitchen (Bep):** `/kitchen`, `/account`
- **Staff (NV):** `/account`, `/orders`
- **Customer:** `/menu`, `/orders`, `/checkout`, `/account`, `/reservations`

---

## Key Files — Frontend

### Contexts
| File | Purpose |
|------|---------|
| `src/contexts/auth-context.tsx` | Auth: login, register, updateUser, user state. Stores password in UserInfo (needed for PUT). |
| `src/contexts/cart-context.tsx` | Cart: addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice |
| `src/contexts/toast-context.tsx` | Toast notifications (3s auto-dismiss) |

### Components
| File | Purpose |
|------|---------|
| `src/components/ui/header.tsx` | **CRITICAL** — Cart sidebar, checkout flow, PayOS modal, login modal, search, navigation. 697 lines. |
| `src/components/ui/footer.tsx` | Page footer |
| `src/components/ui/button.tsx` | shadcn button |
| `src/components/ui/food-grid.tsx` | Food items grid |
| `src/components/ui/category-grid.tsx` | Category display |
| `src/components/ui/hero-banner.tsx` | Hero banner |
| `src/components/ui/promo-banner.tsx` | Promo banner |
| `src/components/ui/interactive-image-accordion.tsx` | Image accordion |

### Layout
`src/app/layout.tsx` — Root layout with providers: `ToastProvider → AuthProvider → CartProvider`. Uses Inter + Playfair Display fonts. Leaflet CSS loaded via CDN `<link>` in `<head>` (Turbopack can't resolve the npm import).

### Environment
```
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://192.168.192.85:8080
```

### Config
```ts
// next.config.ts
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.192.130"],
  turbopack: { root: path.resolve(__dirname) },
};
```

---

## Key Files — Backend

### Project Structure
```
RMS-APIServer/Restaurant-Manangment-System-RMS-APIServer/RMS-APIServer/
├── Controllers/         (14 controllers)
├── Models/              (14 models + 2 DbContexts + DTOs)
├── Services/            (PayOSService.cs)
├── Middleware/           (CorsMiddleware.cs)
├── Program.cs           (entry point)
├── appsettings.json     (DB connection, JWT, PayOS keys)
├── Dockerfile           (multi-stage, .NET 8)
└── RMS-APIServer.csproj (Pomelo MySQL 8.0.2)
```

### Critical Backend Files
| File | Purpose |
|------|---------|
| `Program.cs` | Entry point: Pomelo MySQL DbContext, CORS (AllowAll/Development/Production), PayOS service, Swagger |
| `Models/DBContext.cs` | Primary EF Core DbContext for MySQL |
| `Models/WebQlquanAnContext.cs` | Secondary DbContext (legacy) |
| `Models/Order.cs` | Order model with `PaymentStatus` property |
| `Models/OrderDto.cs` | DTOs: `OrderDto` (list), `CreateOrderDto` (create), `CreateOrderDetailDto` |
| `Controllers/OrderController.cs` | Order CRUD — **PutOrder uses partial update pattern** (fetch-then-patch) |
| `Controllers/OrderDetailController.cs` | OrderDetail CRUD — **PutOrderDetail uses partial update pattern** |
| `Controllers/PayOSController.cs` | PayOS payment endpoints |
| `Services/PayOSService.cs` | PayOS HTTP client with HMAC signature verification |
| `Middleware/CorsMiddleware.cs` | Custom CORS middleware for Docker compatibility |
| `appsettings.json` | DB: `Server=wordpress_lab-db-1;Port=3306;Database=webQLQuanAn;User=root;Password=CaoBao2211;` |

### PayOS Config
```json
{
  "PayOS": {
    "ClientId": "61a87aec-24a3-4356-a607-a80b4e4cb9e2",
    "ApiKey": "4b0462cd-bba6-4214-a933-23b5ab3866a7",
    "ChecksumKey": "f1a4f7745f3f46d5ab32663e389ba668ad072b2b365d35bb555f213b0f2cef88"
  }
}
```

---

## Deployment Process

### Web Portal (local)
```bash
cd web-portal
npm install
npm run dev
# Runs at localhost:3000 (or next available port)
```

### API Server (Docker)
```bash
# On local machine — build and publish
cd RMS-APIServer/.../RMS-APIServer
dotnet publish -c Release -o ./publish

# Zip and upload to server
# On remote server (192.168.192.85):
# 1. Unzip published files
# 2. Create Dockerfile (or use existing)
# 3. Build image:
docker build -t bao2211/rms-apiserver:mysql .
# 4. Stop old container:
docker stop rms-api-server && docker rm rms-api-server
# 5. Run new container:
docker run -d --name rms-api-server --network root_rms-network -p 8080:8080 bao2211/rms-apiserver:mysql
```

---

## Known Issues & Gotchas

### Frontend
1. **Leaflet CSS import** — `import "leaflet/dist/leaflet.css"` in layout.tsx causes Turbopack error. Use CDN `<link>` in `<head>` instead.
2. **header.tsx was deleted in worktree** — git status shows ` D`. Restore with `git checkout HEAD -- web-portal/src/components/ui/header.tsx`.
3. **Stale .next cache** — After fixing layout.tsx, delete `.next` folder and restart dev server.
4. **Two project copies** — Worktree at `.kilo/worktrees/road-marionberry/web-portal/` AND original at `Restaurant-Manangment-System/web-portal/`. Changes to one don't affect the other.

### Backend
5. **PUT partial update pattern** — `OrderController.PutOrder` and `OrderDetailController.PutOrderDetail` use fetch-then-patch. Other controllers (FoodInfo, Category, Table, Ingredient, Recipe, RecipeDetail) still use `_context.Entry().State = EntityState.Modified` which **wipes fields to null** on partial updates.
6. **Two DbContexts** — `DBContext` and `WebQlquanAnContext` both exist. Controllers use `DBContext`. The `WebQlquanAnContext` is legacy.
7. **Order ID format** — Auto-generated as `ORD` + 7-digit timestamp. DB constraint requires exactly 10 characters (padded).
8. **No DB foreign keys** — Relationships enforced only in EF Core, not in database.

### API Field Naming Inconsistency
- `GET /api/Order` (list) returns `id` field (via `OrderDto.Id`)
- `GET /api/Order/{id}` (detail) returns `orderId` field
- `GET /api/Order/user/{userId}` returns `orderId` field
- Frontend must handle both `id` and `orderId` when referencing orders

### Database Legacy Data
- Status values from SQL Server migration are inconsistent
- Encoding corruption: `"Ho?n t?t"` instead of `"Hoàn tất"`
- Mixed English/Vietnamese: `"pending"`, `"completed"` alongside Vietnamese values
- Some orders have payment statuses in the wrong column (`Status` instead of `PaymentStatus`)

---

## PayOS Payment Flow
```
1. User clicks "Thanh toán PayOS" in cart sidebar
2. Frontend POST /api/PayOS/create-payment { orderId, amount, orderCode }
3. Backend creates PayOS payment link, returns checkoutUrl
4. User redirected to PayOS QR page
5. Frontend polls GET /api/PayOS/status/{orderCode}
6. On success: POST /api/PayOS/confirm/{orderCode}
7. Then: PUT /api/Order/{orderId} { paymentStatus: "Đã thanh toán" }
```

---

## Project File Tree (key files)
```
Restaurant-Manangment-System/
├── .kilo/worktrees/road-marionberry/    ← ACTIVE WORKTREE
│   ├── context.md                       ← THIS FILE
│   ├── HANDOVER.md                      ← Previous handover doc
│   ├── web-portal/
│   │   ├── .env.local
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx           ← Root layout (providers + Leaflet CDN)
│   │       │   ├── page.tsx             ← Homepage
│   │       │   ├── globals.css
│   │       │   ├── account/page.tsx
│   │       │   ├── admin/{menu,revenue,tables}/page.tsx
│   │       │   ├── api/{ghtk,osm}/**/route.ts
│   │       │   ├── checkout/page.tsx
│   │       │   ├── kitchen/page.tsx
│   │       │   ├── menu/page.tsx
│   │       │   ├── orders/page.tsx
│   │       │   ├── profile/page.tsx
│   │       │   ├── reservations/page.tsx
│   │       │   ├── table/page.tsx
│   │       │   └── tracking/[orderId]/page.tsx
│   │       ├── components/ui/
│   │       │   ├── header.tsx           ← CRITICAL: cart, checkout, PayOS, login
│   │       │   ├── footer.tsx
│   │       │   ├── button.tsx
│   │       │   ├── food-grid.tsx
│   │       │   ├── category-grid.tsx
│   │       │   ├── hero-banner.tsx
│   │       │   ├── promo-banner.tsx
│   │       │   └── interactive-image-accordion.tsx
│   │       ├── contexts/
│   │       │   ├── auth-context.tsx
│   │       │   ├── cart-context.tsx
│   │       │   └── toast-context.tsx
│   │       └── lib/utils.ts
│   ├── RMS-APIServer/.../RMS-APIServer/
│   │   ├── Controllers/    (14 files)
│   │   ├── Models/         (14 models + DTOs + 2 DbContexts)
│   │   ├── Services/       (PayOSService.cs)
│   │   ├── Middleware/     (CorsMiddleware.cs)
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── Dockerfile
│   │   └── RMS-APIServer.csproj
│   └── RMSMobile/          ← Expo React Native mobile app
├── web-portal/              ← ORIGINAL COPY (also editable)
├── RMS-APIServer/           ← ORIGINAL COPY
└── HANDOVER.md              ← Previous handover
```
