# 🌐 ADSTEMA Network Orders API - Integration Guide

## Overview

ADSTEMA Network Orders API omogućava partnerima (networkeri, lenderi) da šalju narudžbine direktno u ADSTEMA CRM sistem. Narudžbine se prate kao **PENDING** dok se ne potvrde od strane call centera.

**Use Case:** Kreme, čajevi, kapi, badovi - proizvodi dostupni samo preko partner landing stranica, ne na glavnom e-commerce sajtu.

---

## 📋 API Endpoints

### 1. CREATE ORDER (Šalji narudžbinu)

**Endpoint:** `POST /api/v1/network-orders/create`

**Headers:**
```
X-Network-Key: nk_partner_name_xyz123
Content-Type: application/json
```

**Request Body:**
```json
{
  "externalId": "order-ext-123456",
  "customerEmail": "kupac@example.com",
  "customerPhone": "+381600000001",
  "customerName": "Marko Marković",
  "items": [
    {
      "sku": "KREMA-001",
      "name": "Anti-Aging Cream",
      "quantity": 2,
      "price": 2500
    },
    {
      "sku": "CAJU-TRAVA",
      "name": "Herbal Tea Mix",
      "quantity": 1,
      "price": 1500
    }
  ],
  "totalAmount": 6500,
  "currency": "RSD",
  "notes": "Dostaviti posle 18:00",
  "confirmationUrl": "https://partner.com/orders",
  "webhookUrl": "https://partner.com/webhooks/orders"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Order received. ID: order-ext-123456. Status: PENDING. Waiting for CRM confirmation.",
  "data": {
    "id": "cmnt8b3xk0001ngjq7f5n2b3k",
    "externalId": "order-ext-123456",
    "status": "PENDING",
    "customerEmail": "kupac@example.com",
    "customerName": "Marko Marković",
    "totalAmount": 6500,
    "currency": "RSD",
    "createdAt": "2026-04-15T14:30:00Z"
  }
}
```

**Greške:**
```json
{
  "success": false,
  "error": "Invalid network API key format"
}
```

---

### 2. CHECK ORDER STATUS (Proverai status)

**Endpoint:** `GET /api/v1/network-orders/{externalId}`

**Headers:**
```
X-Network-Key: nk_partner_name_xyz123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmnt8b3xk0001ngjq7f5n2b3k",
    "externalId": "order-ext-123456",
    "status": "CONFIRMED",
    "customerEmail": "kupac@example.com",
    "customerName": "Marko Marković",
    "totalAmount": 6500,
    "currency": "RSD",
    "createdAt": "2026-04-15T14:30:00Z",
    "confirmedAt": "2026-04-15T14:35:00Z",
    "order": {
      "id": "cmnt8b4xk0002ngjq7f5n2b3m",
      "orderNumber": "ORD-002891",
      "status": "PENDING"
    }
  }
}
```

**Mogući statusaji:**
- `PENDING` - Čeka na potvrdu od call centera
- `CONFIRMED` - Call centar potvrdio (kupc potvrdio putem telefona)
- `REJECTED` - Odbijeno
- `COMPLETED` - Završeno
- `FAILED` - Greška pri obradi

---

## 🔔 Webhook Notifications

Kada call centar potvrdi ili odbije narudžbinu, ADSTEMA šalje webhook notifikaciju na URL koji si dao:

### Webhook Payload:
```json
{
  "externalId": "order-ext-123456",
  "status": "CONFIRMED",
  "orderNumber": "ORD-002891",
  "timestamp": "2026-04-15T14:35:00Z",
  "message": "Order confirmed"
}
```

### Webhook Security:
Svaka notifikacija sadrži `X-Adstema-Signature` header sa HMAC-SHA256 potpisom:

```
X-Adstema-Signature: a1b2c3d4e5f6g7h8i9j0...
```

**Verifikacija (Node.js primer):**
```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hash = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return hash === signature;
}

// U webhook handler-u:
if (!verifySignature(body, req.headers['x-adstema-signature'], WEBHOOK_SECRET)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## 📌 Integration Steps

### 1. Zatraži Network API Key

Kontaktiraj ADSTEMA timu za dobijanje `X-Network-Key`:
- Email: support@adstema.com
- Format: `nk_partner_name_uniqueid`

### 2. Implementiraj Order Creation

Na svojoj landing stranici (gde se prodaju kreme, čajevi, itd.):

```javascript
// Primer: React/Node.js
async function submitOrder(formData) {
  const response = await fetch('https://api.adstema.com/api/v1/network-orders/create', {
    method: 'POST',
    headers: {
      'X-Network-Key': 'nk_your_partner_xyz123',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      externalId: `order-${Date.now()}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerName: formData.name,
      items: formData.cartItems,
      totalAmount: formData.total,
      currency: 'RSD',
      webhookUrl: 'https://your-site.com/webhooks/orders',
    }),
  });

  const data = await response.json();
  if (data.success) {
    console.log('Order submitted:', data.data.id);
    return data.data;
  } else {
    console.error('Order failed:', data.error);
  }
}
```

### 3. Setup Webhook Receiver

Na svojoj strani, prosledi webhook notifikacije:

```javascript
// Express.js primer
app.post('/webhooks/orders', (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-adstema-signature'];

  // Verify signature
  if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log(`Order ${payload.externalId} - Status: ${payload.status}`);

  // Update tvoju bazu, pošalji email kupcu, itd.
  if (payload.status === 'CONFIRMED') {
    // Kreiraj salesforce lead, pošalji email sa instrukcijama
  } else if (payload.status === 'REJECTED') {
    // Pošalji email da je odbijeno
  }

  res.json({ received: true });
});
```

### 4. Track Orders

Periodično proveravaj status narudžbina:

```javascript
async function checkOrderStatus(externalId) {
  const response = await fetch(
    `https://api.adstema.com/api/v1/network-orders/${externalId}`,
    {
      headers: {
        'X-Network-Key': 'nk_your_partner_xyz123',
      },
    }
  );

  return response.json();
}
```

---

## 🔐 Security Best Practices

1. **Zaštiti API Key**
   - Čuvaj u `.env` fajlu, nikad u kodu
   - Rotiraj periodično
   - Ako cureći, odmah javi

2. **Validacija na strani CRM-a**
   - Sve narudžbine prolaze kroz CRM validaciju
   - Samo authorized partneri mogu slati ordere
   - IP whitelist opciono dostupan

3. **Webhook Security**
   - Verifikuj HMAC signature na svakom webhook-u
   - Retry logiku za failed notifikacije
   - Timeout: 5 sekundi po notifikaciji

---

## 📊 Order Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Partner Landing Stranica                             │
│    (Kupac popunjava formu - kreme, čajevi, itd.)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ POST /network-orders/create
┌─────────────────────────────────────────────────────────┐
│ 2. ADSTEMA Backend                                      │
│    Status: PENDING                                      │
│    Čeka call center potvrdu                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. ADSTEMA CRM Admin Panel                              │
│    Call centar gleda "Network Orders" sekciju           │
│    Poziva kupca i potvrđuje                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ PATCH /network-orders/{id}/confirm
┌─────────────────────────────────────────────────────────┐
│ 4. Order Confirmed                                      │
│    Status: CONFIRMED ili REJECTED                       │
│    Webhook šalje notifikaciju partneru                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ Webhook POST
┌─────────────────────────────────────────────────────────┐
│ 5. Partner Webhook Receiver                             │
│    Ažurira svoju bazu                                   │
│    Pošalje email kupcu                                  │
│    Startuje fulfillment                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Exemplo

```bash
# 1. Kreiraj test order
curl -X POST https://api.adstema.com/api/v1/network-orders/create \
  -H "X-Network-Key: nk_test_partner_dev" \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "test-order-001",
    "customerEmail": "test@example.com",
    "customerPhone": "+381600000001",
    "customerName": "Test User",
    "items": [
      {
        "sku": "TEST-001",
        "name": "Test Product",
        "quantity": 1,
        "price": 1000
      }
    ],
    "totalAmount": 1000,
    "currency": "RSD"
  }'

# 2. Proverai status
curl -X GET https://api.adstema.com/api/v1/network-orders/test-order-001 \
  -H "X-Network-Key: nk_test_partner_dev"
```

---

## 📞 Support

- **Email:** api-support@adstema.com
- **Dokumentacija:** https://docs.adstema.com/network-orders
- **Status:** https://status.adstema.com

---

## Verzija

**API v1.0** - Dostupna od 15.04.2026
