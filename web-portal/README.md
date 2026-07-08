# 🍽️ RMS Web Portal

Frontend for the Restaurant Management System — built with Next.js 16, React 19, and Tailwind CSS 4.

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/` | Homepage — hero banner, category grid, food grid, search | ❌ |
| `/menu` | Full menu with search & filter | ❌ |
| `/account` | Dashboard with role-based navigation | ✅ |
| `/profile` | Edit profile & change password | ✅ |
| `/checkout` | Multi-step checkout: address (Leaflet map), payment, PayOS | ✅ |
| `/orders` | Order history with tabs, search, sort | ✅ |
| `/kitchen` | Kitchen view — real-time orders, mark complete, ship to GHTK | ✅ (Admin/Bep) |
| `/table` | Table overview with status | ✅ |
| `/reservations` | Table booking (3-step wizard) | ❌ |
| `/tracking/[orderId]` | Order tracking with Leaflet map & GHTK status | ✅ |
| `/admin/tables` | CRUD tables | Admin |
| `/admin/menu` | CRUD food items | Admin |

## Tech Stack

- **Framework:** Next.js 16.2.9 (Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn
- **Animation:** Framer Motion
- **Maps:** Leaflet + OpenStreetMap
- **Shipping:** GHTK integration (fee, order, tracking)
- **Payment:** PayOS online payments

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://192.168.192.85:8080
GHTK_TOKEN=your_ghtk_token
```

## Test Accounts

| Username | Password | Role |
|----------|----------|------|
| `VAnh` | `VAnh123` | Admin |
| `khang` | `khang123` | Kitchen |
| `ngoc` | `Ngoc123` | Customer |

## Order Flow

1. Customer adds items to cart → checks out
2. Kitchen sees order → marks items complete → order status = "Hoàn tất"
3. For delivery orders: Kitchen clicks "Giao hàng" → GHTK ships
4. Customer tracks delivery on `/tracking/[orderId]`

