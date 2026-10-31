# Gandras Spot — Backend API

NestJS + PostgreSQL + Prisma + Socket.IO + Stripe REST API za online poručivanje hrane.

## Brzi start (lokalno)

### 1. PostgreSQL

```bash
cd gandras-spot/backend
docker compose up -d postgres
```

### 2. Env

```bash
cp .env.example .env
```

### 3. Instalacija i baza

```bash
npm install
npx prisma db push
npm run prisma:seed
```

### 4. Pokretanje API-ja

```bash
npm run start:dev
```

- API: http://localhost:4100/api
- Swagger: http://localhost:4100/api/docs

## Supabase Postgres

U `.env` postavi `DATABASE_URL` iz Supabase projekta. Obavezno dodaj `?sslmode=require` na kraj connection string-a.

### 5. Frontend (iz `gandras-spot/`)

```bash
cd ..
echo "NEXT_PUBLIC_API_URL=http://localhost:4100/api" > .env.local
npm install
npm run dev
```

- Sajt: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- **Demo:** `admin@gandrasspot.rs` / `admin123`

## Docker (API + Postgres)

```bash
docker compose up --build
```

## Moduli

| Modul | Putanja | Opis |
|-------|---------|------|
| Auth | `POST /api/auth/login` | JWT login, role-based |
| Orders | `POST /api/orders` | Kreiranje (public) |
| Orders | `GET /api/orders/track/:token` | Tracking (public) |
| Orders | `PATCH /api/orders/:id/accept` | Prihvatanje + ETA |
| Dashboard | `GET /api/admin/dashboard` | Statistika |
| Menu | `GET /api/products` | Javni meni |
| Kitchen | `GET /api/kitchen/orders` | Kitchen mode |
| Payments | `POST /api/payments/stripe/create-intent` | Stripe |
| Reports | `GET /api/admin/reports` | CSV/Excel export |

## Realtime (Socket.IO)

Namespace: `/orders`

- **Admin:** `auth: { token: JWT }` → eventi `order:new`, `order:updated`
- **Tracking:** `auth: { trackToken: publicToken }` → `order:updated`

## Multi-tenant

Svi podaci imaju `restaurantId`. JWT sadrži `restaurantId` — admin vidi samo svoj restoran.

Seed kreira restoran `gandras-spot`. Env `RESTAURANT_SLUG` određuje koji restoran prima public porudžbine.

## Stripe

Postavi `STRIPE_SECRET_KEY` i `STRIPE_WEBHOOK_SECRET` u `.env`. Webhook: `POST /api/webhooks/stripe` (raw body).

## Testovi

```bash
npm run test:e2e
```

## Produkcija

```bash
npm run build
npm run start:prod
```

Ili `docker compose up --build` sa produkcijskim env varijablama.
