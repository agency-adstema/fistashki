# 📊 Stock Management Logic - Detaljno Objašnjenje

## Primer sa brojkama (kao što si pitao):

```
Početno stanje:
Product "X" → stockQuantity = 100

Scenario:
1. Order A - 10 komada kupi
   stockQuantity = 100 - 10 = 90 ✓

2. Order B - 8 komada kupi
   stockQuantity = 90 - 8 = 82 ✓

3. Return iz Order A - 5 komada vraćeno
   stockQuantity = 82 + 5 = 87 ✓

4. Order C - 3 komada kupi
   stockQuantity = 87 - 3 = 84 ✓

Finalno: 84 komada (početnih 100 - 13 prodano + 5 vraćeno)
```

---

## 🔍 Gde je kod napisan?

### 1. **ORDER CREATION** - Deductovanje stock-a

**File**: `src/modules/orders/orders.service.ts` (Line 193-210)

```typescript
// 7. Deduct stock for tracked products
for (const snap of itemSnapshots) {
  if (snap.trackQuantity) {
    const res = await tx.product.updateMany({
      where: {
        id: snap.productId,
        stockQuantity: { gte: snap.quantity },  // Validacija: ima li dosta?
      },
      data: { stockQuantity: { decrement: snap.quantity } },  // ODUZIMANJE
    });

    if (res.count === 0) {
      throw new BadRequestException(
        `Insufficient stock for: ${snap.productName}`,  // GREŠKA ako nema
      );
    }
  }
}
```

**Šta se dešava?**

- ✅ Proverava da li `trackQuantity = true` (praćenje stanja)
- ✅ Validira da li ima dosta stocka: `stockQuantity >= quantity`
- ✅ Oduzima: `stockQuantity = stockQuantity - quantity`
- ❌ Ako nema dosta → baca grešku, order se ne pravi

---

### 2. **ORDER CANCELLATION** - Vraćanje stock-a

**File**: `src/modules/orders/orders.service.ts` (Line 457-497)

```typescript
// Restore stock for items with tracked products
for (const item of cancelledOrder.items) {
  if (item.product && item.product.trackQuantity) {
    await tx.product.update({
      where: { id: item.product.id },
      data: { stockQuantity: { increment: item.quantity } },  // DODAVANJE
    });
  }
}
```

**Šta se dešava?**

- ✅ Ako se order otkaže → vraćaju se komadi u stock
- ✅ Povećava: `stockQuantity = stockQuantity + quantity`
- ✅ Samo za proizvode sa `trackQuantity = true`

---

### 3. **RETURN REQUEST - MARK RECEIVED** - Vraćanje stock-a

**File**: `src/modules/returns/returns.service.ts` (Line 265-307)

```typescript
// Restock tracked products (Kada kupac vrati proizvod)
const restockedItems: Array<{ productId: string; qty: number }> = [];
for (const item of r.items) {
  if (item.product?.trackQuantity) {
    await tx.product.update({
      where: { id: item.product.id },
      data: { stockQuantity: { increment: item.quantity } },  // DODAVANJE
    });
    restockedItems.push({ productId: item.product.id, qty: item.quantity });
  }
}
```

**Šta se dešava?**

- ✅ Status: `RETURN → RECEIVED` (primljen je povrat)
- ✅ Vraćaju se komadi: `stockQuantity = stockQuantity + quantity`
- ✅ Loguje se restock akcija u audit logs

---

## 📝 Detalji implementacije:

### Stock Operations (Sve u Prisma):


| Operacija            | Kod                  | Uticaj        |
| -------------------- | -------------------- | ------------- |
| **Order - Create**   | `{ decrement: qty }` | ➖ Oduzmi      |
| **Order - Cancel**   | `{ increment: qty }` | ➕ Dodaj nazad |
| **Return - Receive** | `{ increment: qty }` | ➕ Dodaj nazad |
| **Return - Reject**  | Nema izmene          | ➖ Ostaje isto |


### Transactional Safety:

Sve operacije koriste **Prisma Transactions**:

```typescript
await this.prisma.$transaction(async (tx) => {
  // Sve izmene se dešavaju ATOMSKI
  // Ili sve uspevaju, ili se sve vraćaju (rollback)
  await tx.order.update(...);
  await tx.product.update(...);  // ← Stock promenjena istovremeno
  // Ako bilo šta padne → sve se vraća nazad
});
```

---

## ⚙️ Key Features:

1. **Atomic Operations** - Stock i order se menjaju istovremeno (ne može biti nekonzistentnosti)
2. **Track Flag** - Samo proizvodi sa `trackQuantity = true` se prate
3. **Validation** - Pre prerade se validira da li ima dosta stocka
4. **Audit Logging** - Svaka promena se loguje za istoriju
5. **Rollback on Error** - Ako nešto pođe po zlu, sve se vraća

---

## 🧪 Test scenario (tvoj primer):

```
START: stock = 100

// 1. Kreiram Order A sa 10 komada
Order.create({ items: [{ qty: 10 }] })
→ Product.update({ stockQuantity: { decrement: 10 } })
→ stock = 90

// 2. Kupac vraća 5 komada
Return.markReceived()
→ Product.update({ stockQuantity: { increment: 5 } })
→ stock = 95

// 3. Kreiram Order B sa 3 komada
Order.create({ items: [{ qty: 3 }] })
→ Product.update({ stockQuantity: { decrement: 3 } })
→ stock = 92

// 4. Order B se otkazuje
Order.cancel()
→ Product.update({ stockQuantity: { increment: 3 } })
→ stock = 95

RESULT: stock = 95 (kao u tvom primeru!) ✅
```

---

## 🔗 Povezani fajlovi:

- `prisma/schema.prisma` - Model za Product.stockQuantity
- `src/modules/orders/orders.service.ts` - Order logika
- `src/modules/returns/returns.service.ts` - Return logika
- `src/modules/products/products.service.ts` - Product model

Sve je validacijom zaštićeno i transakcijama obezbeđeno da ne može biti race conditions! 🛡️