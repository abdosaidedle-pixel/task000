# عطارة آدم — Adam's Herbs & Spices

A premium full-stack Arabic RTL e-commerce website for Adam's Herbs & Spices store in Fayoum, Egypt.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/adam-herbs run dev` — run the frontend (port 25074)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, wouter, framer-motion, embla-carousel, recharts
- Fonts: Cairo, Tajawal (Arabic)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/adam-herbs/` — React frontend (RTL Arabic e-commerce)
- `artifacts/api-server/` — Express API server
- `lib/db/` — Drizzle ORM schema & migrations
- `lib/api-spec/` — OpenAPI YAML spec
- `lib/api-zod/` — Generated Zod schemas (from Orval)
- `lib/api-client-react/` — Generated React Query hooks (from Orval)

## Architecture decisions

- Zod validation is only applied to **inputs** (request body/params/query); responses skip `.parse()` since Drizzle returns `Date` objects but the OpenAPI spec declares them as strings — `res.json()` serializes Dates to ISO strings automatically.
- WhatsApp order flow: customer fills name/phone/address → order stored in DB → WhatsApp message opened with order details to +201028193654.
- Admin auth uses express-session (cookie-based); no JWT.
- All routes are mounted at `/api` prefix; the reverse proxy routes `/api/*` to the API server at port 8080.

## Product

- **Public store**: Homepage with hero + featured products carousel, product catalog with category/search filter, shopping cart with checkout, contact page with Google Maps and WhatsApp.
- **Admin dashboard**: Login protected, analytics overview with charts, full CRUD for products/categories/banners/orders.
- **Data**: 36 seeded products, 7 categories, 4 banners, colors: olive green #3B4E38, beige #F9F6F0, honey gold #D4AF37.

## User preferences

- Arabic RTL layout throughout
- Store phone: 01002014050, 01006825659
- WhatsApp: +201028193654
- Address: الفيوم - سنورس - شارع النقراشي أمام مكتبة الطالب
- Google Maps: https://maps.app.goo.gl/mkPXB6TLnNR2PJHc9
- Developer credit footer link: https://abdosaidedle-pixel.github.io/Portofolio-Abdo-main/

## Admin credentials

- Username: `admin`
- Password: `adam2024`
- Set via env vars `ADMIN_USERNAME` / `ADMIN_PASSWORD` in the admin route

## Gotchas

- Never add `.parse()` to API responses that contain Drizzle `Date` fields — use `res.json(data)` directly.
- Product images are stored as external URLs in `imageUrl` column — no file upload yet.
- Run `pnpm --filter @workspace/db run push` then `pnpm --filter @workspace/db run seed` after DB schema changes.
- The design subagent uses `embla-carousel-react` (NOT the React-specific import).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
