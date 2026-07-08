# 🍽️ RMS - Restaurant Management System

A full-stack restaurant management application for ordering, kitchen management, payments, and delivery.

**Student:** Cao Thien Bao — ID: 23DH114212

---

## 📚 Tech Stack

| Layer | Technology | Directory |
|-------|-----------|-----------|
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS 4 | [`web-portal/`](web-portal/) |
| **Backend** | ASP.NET Core 8.0 (Pomelo MySQL) | [`RMS-APIServer/`](RMS-APIServer/) |
| **Database** | MariaDB on Docker | Server: `192.168.192.85:3306` |
| **Mobile** | React Native (Expo) | [`RMSMobile/`](RMSMobile/) |

---

## 🚀 Quick Start

### Web Portal
```bash
cd web-portal
npm install
npm run dev
# → http://localhost:3000
```

### API Server (Docker)
```bash
cd RMS-APIServer/Restaurant-Manangment-System-RMS-APIServer/RMS-APIServer
dotnet publish -c Release -o ./publish
# Deploy to server & build Docker image
docker build -t bao2211/rms-apiserver:mysql .
docker run -d --name rms-api-server --network root_rms-network -p 8080:8080 \
  -e DB__HOST=wordpress_lab-db-1 \
  -e DB__DATABASE=webQLQuanAn \
  -e DB__USER=root \
  -e DB__PASSWORD=CaoBao2211 \
  bao2211/rms-apiserver:mysql
```

---

## 🗺️ Web Portal Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | ❌ | Homepage — hero, search, categories, food grid |
| `/menu` | ❌ | Full menu with search & filters |
| `/account` | ✅ | Dashboard with role-based links |
| `/profile` | ✅ | Edit profile + change password |
| `/orders` | ✅ | Order history with status tabs |
| `/checkout` | ✅ | Multi-step checkout: map, delivery, payment (PayOS) |
| `/kitchen` | ✅ (Admin/Bep) | Kitchen order management with ship-to-GHTK |
| `/table` | ✅ | Table overview grid |
| `/reservations` | ❌ | Table booking |
| `/tracking/[orderId]` | ✅ | Order tracking with Leaflet map |
| `/admin/tables` | Admin | CRUD tables |
| `/admin/menu` | Admin | CRUD food items |

---

## 🗄️ Database — 14 Tables

```
Order, Order_Detail, Bill, Bill_Detail, Food_Info, Category,
User, Table, Ingredient, Recipe, Recipe_Detail,
UserFavorites, OrderHistory, TableReservationHistory
```

> ⚠️ No DB-level foreign keys — relationships enforced via EF Core.

---

## 📦 Shipping Integration (GHTK)

| Endpoint | Path | Status |
|----------|------|--------|
| Fee calculation | `GET /api/ghtk/fee` | ✅ Staging |
| Create order | `POST /api/ghtk/order` | ✅ Staging |
| Track delivery | `GET /api/ghtk/track/[id]` | ✅ Staging |

- Staging: `https://services-staging.ghtklab.com/services`
- Production: `https://services.giaohangtietkiem.vn/services`

---

## 🔑 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| `VAnh` | `VAnh123` | Admin |
| `khang` | `khang123` | Kitchen (Bep) |
| `bao` | `bao2211` | Cashier |
| `ngoc` | `Ngoc123` | Customer |
| `abc` | `abc1234` | Staff |

---

## 🌐 Server Access

| Resource | Address |
|----------|---------|
| Server IP | `192.168.192.85` |
| API Server | `http://192.168.192.85:8080` |
| Portainer | `http://192.168.192.85:9000` |
| phpMyAdmin | `http://192.168.192.85:8083` |
| MariaDB | `192.168.192.85:3306` (container: `wordpress_lab-db-1`) |

---

## ⚠️ Known Issues

1. **Two status tracks** — Orders have independent cooking status (`Status`) and payment status (`PaymentStatus`), they never affect each other
2. **PUT partial updates** — `OrderController.PutOrder` and `OrderDetailController.PutOrderDetail` use fetch-then-patch. Other controllers may still wipe fields on partial updates
3. **Legacy DB data** — Status values from SQL Server migration have inconsistent casing and encoding corruption
4. **Leaflet CSS** — Must use CDN `<link>` in layout (Turbopack can't resolve npm import)
5. **Stale .next cache** — Delete `.next` folder and restart if you see unexpected errors
6. **Two project copies** — Changes to `web-portal/` don't affect `.kilo/worktrees/road-marionberry/web-portal/`
