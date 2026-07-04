# RMS Project Handover

## Project Overview
Restaurant Management System (RMS) with:
- **Backend:** ASP.NET Core 8.0 API at `http://192.168.192.85:8080`
- **Database:** MySQL 8.0 on Docker
- **Frontend:** Next.js 16 web portal + React Native (Expo) mobile app
- **Student:** Cao Thien Bao, ID: 23DH114212
- **Location:** `D:\School\CNPMNC\RMS\Restaurant-Manangment-System`

---

## Order Status Flow (CRITICAL — READ THIS FIRST)

Order has TWO INDEPENDENT status tracks that NEVER affect each other:

### Track 1: Order Status (cooking progress)
```
"Chưa làm" → "Hoàn tất"
```
- **Trigger:** Kitchen marks ALL order items as "Hoàn tất"
- **Where:** `kitchen/page.tsx` → `completeItem()` function
- **API:** `PUT /api/Order/{orderId}` with `{ status: "Hoàn tất" }`

### Track 2: Payment Status (payment progress)
```
"Chưa thanh toán" → "Đã thanh toán"
```
- **Trigger:** User pays (cash or PayOS)
- **Where:** `header.tsx` → `CartSidebar` `handleCheckout()` and `PayOSModal`
- **API:** `PUT /api/Order/{orderId}` with `{ paymentStatus: "Đã thanh toán" }`

### Rules
- Payment status is set to "Chưa thanh toán" on order creation
- Payment status ONLY changes on payment events
- Order status ONLY changes when kitchen completes all items
- They are COMPLETELY INDEPENDENT

### Status Values
| Track | Column | Values |
|-------|--------|--------|
| Order | `Status` | "Chưa làm", "Hoàn tất" |
| Payment | `PaymentStatus` | "Chưa thanh toán", "Đã thanh toán" |

### API Endpoints
| Action | Endpoint | Method | Body |
|--------|----------|--------|------|
| Create order | `/api/Order` | POST | `{tableId, userId, status:"Chưa làm", total, discount, paymentStatus:"Chưa thanh toán"}` |
| Add item | `/api/OrderDetail` | POST | `{orderId, foodId, quantity, unitPrice}` |
| Kitchen done | `/api/OrderDetail/food/{foodId}/order/{orderId}` | PUT | `{orderId, foodId, quantity, unitPrice, status:"Hoàn tất"}` |
| Pay | `/api/Order/{orderId}` | PUT | `{orderId, paymentStatus:"Đã thanh toán"}` |

---

## Server Access
- **IP:** `192.168.192.85`
- **SSH:** `root` / `CaoBao2211` (hangs — use Portainer at `http://192.168.192.85:9000`)
- **MySQL:** container `rms-mysql`, port 3306, root/CaoBao2211, database `webQLQuanAn`
- **API:** container `rms-api-server`, port 8080

## User Accounts
| Role | Username | Password |
|------|----------|----------|
| Admin | VAnh | VAnh123 |
| Staff | abc | abc1234 |
| Kitchen | khang | khang123 |
| Cashier | bao | bao2211 |
| Customer | ngoc | Ngoc123 |

## Web Portal
```bash
cd D:\School\CNPMNC\RMS\Restaurant-Manangment-System\web-portal
npm install
npm run dev
```
- Local: `http://localhost:3000`
- Network: `http://192.168.192.130:3000`

## Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/menu` | Menu with search |
| `/orders` | Order history |
| `/reservations` | Table booking |
| `/kitchen` | Kitchen order management (Admin/Bep) |
| `/table` | Table overview (Admin) |
| `/account` | Dashboard with links |
| `/profile` | Edit user profile |
| `/admin/tables` | CRUD tables (Admin) |
| `/admin/menu` | CRUD food items (Admin) |

## Key Files
| File | Purpose |
|------|---------|
| `web-portal/src/contexts/auth-context.tsx` | Auth, login, register, updateUser |
| `web-portal/src/components/ui/header.tsx` | Cart, checkout, login modal, navigation |
| `web-portal/src/app/kitchen/page.tsx` | Kitchen order management |
| `web-portal/src/app/orders/page.tsx` | Order history with status tabs |
| `web-portal/src/app/profile/page.tsx` | User profile edit |
| `web-portal/src/app/account/page.tsx` | Account dashboard |
| `web-portal/next.config.ts` | allowedDevOrigins config |
| `web-portal/ORDER_LIFECYCLE.md` | Detailed status documentation |

## WordPress LAB2
- **Bài tập 1:** Categories, Tags, Pages, Users, Settings — DONE
- **Bài tập 2:** Themes — DONE
- **Bài tập 3:** Plugins — DONE
- **Bài tập 4:** Navigation menu — DONE
- WordPress at `http://192.168.192.85:8082`, admin/CaoBao2211

## Figma
- Page layouts created for Client Flow and Admin Flow
- Screenshots saved as `.png` files
