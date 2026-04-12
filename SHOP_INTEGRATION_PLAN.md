# E-Commerce Shop ↔ Admin CRM Integration Plan

## 📊 Overview

Integracija tri sistema:
1. **Backend API** (`ecommerce-backend`) — NestJS na `http://localhost:4000/api/v1`
2. **Admin CRM** (`ecommerce-admin`) — Next.js na `http://localhost:3000`
3. **Customer Shop** (`green-roots-emporium`) — Vite React na `http://localhost:8080`

---

## 🔴 Problems Identified

### 1. Missing Public Product/Category Endpoints
- **Current:** `/products`, `/categories` zahtevaju JWT + `products.read` / `categories.read` permissions
- **Impact:** Shop frontend TIDAK može da pregleda proizvode bez autentifikacije
- **Solution:** Kreiraj separate **PUBLIC** endpoints: `/public/products`, `/public/categories`

### 2. Customer Authentication Missing
- **Current:** Samo `User` (staff) entities sa roles/permissions
- **Impact:** Kupci ne mogu da se loguju niti prate svoje ordere
- **Solution:** Dodaj `Customer` login endpoint i JWT sa customer claims

### 3. Order Tracking for Customers
- **Current:** `/orders` zahteva `orders.read` permission (admin-only)
- **Impact:** Kupci ne vide svoje ordere
- **Solution:** Kreiraj `/customers/:customerId/orders` endpoint

### 4. Stock Visibility
- **Current:** Product stock info nije vidljiv na public endpoints
- **Impact:** Shop ne zna da li je proizvod dostupan
- **Solution:** Implementiraj `available` / `inStock` polje na public product DTOs

---

## ✅ Solution Architecture

### Phase 1: Add Public Endpoints

#### 1.1 Public Products Endpoint
```
GET /api/v1/public/products?category=&search=&page=&limit=
```
Returns:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "...",
      "price": 1000,
      "currency": "RSD",
      "images": [{ "url": "/uploads/products/...", "alt": "..." }],
      "inStock": true,
      "stock": { "available": 10, "reserved": 2 },
      "categoryId": "uuid",
      "categoryName": "Category"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100 }
}
```

#### 1.2 Public Categories Endpoint
```
GET /api/v1/public/categories
```

#### 1.3 Product Details Endpoint
```
GET /api/v1/public/products/:id
```

### Phase 2: Customer Authentication

#### 2.1 Customer Signup
```
POST /api/v1/auth/register/customer
Body: { email, password, firstName, lastName, phone }
Response: { accessToken, customerId }
```

#### 2.2 Customer Login
```
POST /api/v1/auth/login/customer
Body: { email, password }
Response: { accessToken, customerId }
```

#### 2.3 Customer Profile
```
GET /api/v1/customers/me
Headers: { Authorization: "Bearer <customer-token>" }
```

### Phase 3: Customer Order Management

#### 3.1 Create Order
```
POST /api/v1/orders
(Already exists, but needs customer JWT support)
```

#### 3.2 View My Orders
```
GET /api/v1/customers/me/orders
GET /api/v1/customers/me/orders/:orderId
```

#### 3.3 Track Shipment
```
GET /api/v1/shipments/:shipmentId
```

#### 3.4 Return Request
```
POST /api/v1/returns
```

### Phase 4: Cart Checkout Flow

Cart endpoints already PUBLIC! Flow:
1. `POST /carts` → Create cart with sessionId
2. `POST /carts/:id/items` → Add products
3. `PATCH /carts/:id/assign-customer` → Add customer info
4. `PATCH /carts/:id/shipping-method` → Select shipping
5. `PATCH /carts/:id/payment-method` → Select payment
6. `POST /carts/:id/checkout` → Convert to Order

---

## 🔗 Admin CRM ↔ Shop Sync

### Real-time Events to Show in Admin:

**When customer creates order in shop:**
- ✅ Auto-create as admin-visible Order
- ✅ Notify admin in dashboard (notifications)
- ✅ Log in audit trail

**When admin changes order status in CRM:**
- ✅ Send email to customer? (not yet implemented)
- ✅ Customer sees status change on order tracking page

**When product stock changes:**
- ✅ Shop immediately sees `inStock: false` if stock becomes 0

**When admin creates coupon:**
- ✅ Shop can validate against it in cart

---

## 📋 Implementation Checklist

### Backend Changes Required

- [ ] Create `PublicProductsController` with safe endpoints
- [ ] Create `PublicCategoriesController` with safe endpoints
- [ ] Add `ProductAvailabilityDTO` with `inStock`, `stock` fields
- [ ] Create `CustomerAuthController` for signup/login
- [ ] Add `customer` claim type to JWT strategy (differentiate from `user`)
- [ ] Create `CustomerOrdersController` for customer-specific order views
- [ ] Update `OrderService` to support customer JWT
- [ ] Implement CORS headers for shop frontend origin
- [ ] Add `.env` configuration for CORS

### Frontend (Shop) Changes Required

- [ ] Initialize Vite React project structure
- [ ] Create API client for shop (`axios` instance with shop base URL)
- [ ] Build Product Listing page
- [ ] Build Product Details page
- [ ] Build Cart page
- [ ] Build Checkout flow (shipping, payment method selection)
- [ ] Build Order Confirmation page
- [ ] Build Customer Auth pages (login, register)
- [ ] Build Order Tracking page
- [ ] Real-time cart sync with backend
- [ ] Error handling for 401 (session expired)

### Admin CRM Integration

- [ ] Already polls orders every 5s
- [ ] Display shop orders with badge (New Order)
- [ ] Show order source (shop vs admin-created)
- [ ] Customer info from shop in admin CRM

---

## 🎯 Data Sync Flow Example: New Shop Order

**Scenario:** Customer buys 2 products from shop

1. **Shop Frontend:**
   - Creates cart: `POST /carts`
   - Adds items: `POST /carts/:id/items`
   - Adds customer: `PATCH /carts/:id/assign-customer`
   - Selects shipping
   - Selects payment
   - Checkouts: `POST /carts/:id/checkout`

2. **Backend API:**
   - Creates `Order` entity
   - Creates `OrderItems` for each product
   - Decrements `Product.stockAvailable`
   - Creates `Payment` record
   - Creates `Shipment` record (pending)
   - Logs audit event

3. **Admin CRM (polls `/orders` every 5s):**
   - Fetches new order
   - Shows notification badge
   - Displays in Orders table
   - Admin can:
     - View customer details
     - Change order status
     - Mark items as shipped
     - Process returns

4. **Shop Frontend (polling optional):**
   - Shows "Order Confirmed" page
   - Allows customer to track order
   - Shows shipment status
   - Allows return requests

---

## 🌐 Public vs Protected Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /public/products` | ❌ None | Shop product list |
| `GET /public/categories` | ❌ None | Shop categories |
| `POST /carts` | ❌ None | Create guest cart |
| `POST /auth/login/customer` | ❌ None | Customer login |
| `POST /auth/register/customer` | ❌ None | New customer signup |
| `POST /orders` | ✅ Customer JWT | Customer place order |
| `GET /customers/me/orders` | ✅ Customer JWT | View my orders |
| `POST /returns` | ✅ Customer JWT | Request return |
| `GET /products` | ✅ Admin JWT + permissions | Admin inventory view |
| `PATCH /orders/:id/status` | ✅ Admin JWT + permissions | Admin change status |

---

## 💾 Database Considerations

- **Customer table:** Already exists, add `customerId` to `Order`
- **Cart session:** Track with `sessionId` (browser fingerprint)
- **Order source:** Add `source: 'shop' | 'admin'` field
- **Customer JWT:** Different claim structure than admin User

---

## 🚀 Next Steps

1. **Backend:** Add public product/category controllers
2. **Backend:** Add customer auth endpoints
3. **Backend:** Update order creation to accept customer JWT
4. **Shop Frontend:** Initialize Vite project
5. **Shop Frontend:** Build product listing
6. **Shop Frontend:** Build cart
7. **Shop Frontend:** Build checkout
8. **Integration Testing:** Test shop → admin sync
