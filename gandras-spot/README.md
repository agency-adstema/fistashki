# Gandras Spot — Frontend + Admin

Premium burger restoran sajt sa **admin CRM panelom** povezanim na NestJS backend.

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind v4, Zustand, Socket.IO client
- **Backend:** `backend/` — NestJS, Prisma, PostgreSQL, JWT, Stripe, Socket.IO

## Pokretanje (full stack)

### Backend

```bash
cd backend
cp .env.example .env
docker compose up -d postgres   # ili lokalni PostgreSQL
npm install
npx prisma db push
npm run prisma:seed
npm run start:dev
```

API: http://localhost:4100/api · Swagger: http://localhost:4100/api/docs

### Frontend

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Sajt: http://localhost:3000

## Admin

| URL | Opis |
|-----|------|
| `/admin/login` | Prijava (`admin@gandrasspot.rs` / `admin123`) |
| `/admin` | Dashboard — statistika, grafik, poslednje porudžbine |
| `/admin/orders` | Porudžbine — realtime, prihvatanje, ETA, timeline |
| `/admin/kitchen` | Kitchen mode — velike kartice, countdown |
| `/admin/menu` | Meni CRUD (UI) |
| `/admin/coupons` | Kuponi |
| `/admin/customers` | Kupci |
| `/admin/drivers` | Dostavljači |
| `/admin/reports` | Izveštaji |
| `/admin/settings` | Podešavanja restorana |

## Korisnički flow

1. `/order` — wizard poručivanja → `POST /api/orders`
2. `/order/{token}` — live tracking preko Socket.IO
3. Admin prihvata porudžbinu sa ETA (5–60 min)
4. Status se ažurira u realnom vremenu (zvuk + browser notifikacija)

## Env

```env
NEXT_PUBLIC_API_URL=http://localhost:4100/api
```

Detalji backend setup-a: [`backend/README.md`](backend/README.md)
