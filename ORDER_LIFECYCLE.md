# Order Status Lifecycle

## Overview

An order has two independent status tracks:
1. **Order Status** - tracks cooking/preparation progress
2. **Payment Status** - tracks payment progress

These two tracks are **completely independent**. Payment status only changes on payment events and is NOT affected by order status changes.

## Order Status Track

```
STEP 1: Customer places order
  Order status:     "Chưa làm"
  Detail status:    "Chưa làm"
  Trigger:          POST /api/Order + POST /api/OrderDetail (from web/app)

STEP 2: Kitchen cooks food
  Detail status:    "Chưa làm" -> "Hoàn tất" (per item)
  Order status:     "Chưa làm" -> "Hoàn tất" (when ALL items are "Hoàn tất")
  Trigger:          PUT /api/OrderDetail/food/{id}/order/{orderId}
                    (Kitchen staff marks each item as done in Kitchen page)
```

## Payment Status Track (Independent)

```
STEP A: Order created
  Payment status:   "Chưa thanh toán" (set on creation)
  Trigger:          POST /api/Order (automatic on order creation)

STEP B: User pays
  Payment status:   "Chưa thanh toán" -> "Đã thanh toán"
  Trigger:          Cash: PUT /api/Order/{id} with paymentStatus="Đã thanh toán"
                    PayOS: POST /api/PayOS/create-payment -> webhook confirms
```

## Key Rules

- Payment status is set to "Chưa thanh toán" when order is created
- Payment status changes to "Đã thanh toán" ONLY when user pays (cash or PayOS)
- Payment status is NOT affected by order status changes
- Order status is NOT affected by payment status changes
- Both tracks are completely independent

## Database Columns

| Column | Table | Values | Dependencies |
|--------|-------|--------|--------------|
| `Status` | Order | "Chưa làm", "Hoàn tất" | Depends on order detail statuses |
| `PaymentStatus` | Order | "Chưa thanh toán", "Đã thanh toán" | Depends ONLY on payment events |
| `Status` | OrderDetail | "Chưa làm", "Hoàn tất" | Depends on kitchen action |

## API Endpoints

| Action | Endpoint | Method | Body |
|--------|----------|--------|------|
| Create order | `/api/Order` | POST | `{tableId, userId, status, total, discount}` |
| Add items | `/api/OrderDetail` | POST | `{orderId, foodId, quantity, unitPrice}` |
| Kitchen done | `/api/OrderDetail/food/{foodId}/order/{orderId}` | PUT | `{orderId, foodId, quantity, unitPrice, status: "Hoàn tất"}` |
| Pay (cash) | `/api/Order/{orderId}` | PUT | `{orderId, ..., paymentStatus: "Đã thanh toán"}` |
| Pay (PayOS) | `/api/PayOS/create-payment` | POST | `{orderId, buyerName, buyerPhone, buyerEmail}` |

## Flow Diagram

```
ORDER STATUS TRACK          PAYMENT STATUS TRACK
(independent)                (independent)
       |                           |
POST /Order ----> "Chưa làm"   "Chưa thanh toán"
       |               |               |
POST /Detail ---> "Chưa làm"       (no change)
       |               |               |
PUT /Detail ----> "Hoàn tất"       (no change)
       |               |               |
(all done?)            |               |
       |               |               |
YES --> "Hoàn tất"     |               |
       |               |               |
       |               |      PUT /Order (cash)
       |               |      --> "Đã thanh toán"
       |               |               |
       |               |      POST /PayOS
       |               |      --> "Đã thanh toán"
```
