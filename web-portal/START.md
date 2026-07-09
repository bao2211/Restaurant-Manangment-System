# Web Portal - RMS Restaurant Management System

## Prerequisites
- Node.js 18+ installed
- API server running at http://192.168.192.85:8080

## Quick Start
```bash
cd web-portal
npm install
npm run dev
```
Site available at http://localhost:3000 or http://192.168.192.130:3000 (ZeroTier)

## Production Build
```bash
npm run build
npx next start -H 0.0.0.0 -p 3000
```

## Environment Variables
Create `.env.local` in the `web-portal/` directory:
```
NEXT_PUBLIC_API_BASE_URL=http://192.168.192.85:8080
```

## Test Accounts
| Username | Password | Role |
|----------|----------|------|
| `VAnh` | `VAnh123` | Admin |
| `bao` | `bao2211` | Cashier (TN) |
| `khang` | `khang123` | Kitchen (Bep) |
| `ngoc` | `Ngoc123` | Customer |
| `abc` | `abc1234` | Staff (NV) |

## Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/` | Homepage - food browsing, search, categories | Public |
| `/menu` | Full menu with search and filter | Public |
| `/orders` | Order history with dual status tags, search, sort | All users |
| `/reservations` | 3-step table booking flow | All users |
| `/kitchen` | Kitchen order management (mark items complete) | Admin, Bep |
| `/table` | Table status overview | Admin only |
| `/account` | User profile + admin management links | All users |
| `/admin/tables` | CRUD for tables | Admin only |
| `/admin/menu` | CRUD for food items | Admin only |

## Features
- **Cart** - Add/remove items, quantity controls, sidebar drawer
- **Search** - Header search with dropdown, scroll-to and highlight
- **Categories** - Filter food items by category with active state
- **Checkout** - Table selection + payment method selector
- **PayOS** - QR code payment via VietQR, auto-polls for status
- **Kitchen** - Grid layout with urgency indicators, auto-refresh, sort button
- **Order Status** - Dual tags: Progress (cooked/not) + Payment (paid/unpaid)
- **Auth** - Login/register with localStorage persistence
- **Role-based nav** - Admin sees management tabs, kitchen staff see Bep tab

## API Server
The web portal connects to the .NET API server:
- Base URL: `http://192.168.192.85:8080`
- Food data: `GET /api/FoodInfo`
- Orders: `GET /api/Order`, `POST /api/Order`
- Tables: `GET /api/Table`
- Users: `POST /api/User/login`
- PayOS: `POST /api/PayOS/create-payment`

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- shadcn/ui components
