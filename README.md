# Pentegra Panel (Cloudflare Workers + D1 + Queues + Durable Objects + Pages)

B2B multi-tenant courier ops panel. Tenant -> restaurant(s) -> courier(s). Production-grade, TypeScript strict, no hardcoded secrets.

## Monorepo
- `apps/api` Cloudflare Workers API (Hono + D1 + Queues + Durable Objects)
- `apps/dashboard` Cloudflare Pages (Vite + React)
- `packages/shared` Zod schemas + DTO + RBAC helper + error codes

## Decisions
- Multi-tenant isolation: all queries are tenant/restaurant scoped.
- JWT HS256: claims `user_id`, `role`, `tenant_id?`, `restaurant_id?`.
- Credential encryption: D1 cipher fields use AES-GCM (master key `CRED_MASTER_KEY_BASE64`).
- Migros AES-256-ECB: `nodejs_compat` + Node `crypto` (WebCrypto has no ECB).
- Webhook ingest: auth + receipt + queue, no heavy work in request.
- Auto-assign: TenantDispatcher Durable Object for race-free assignment.
- SSE: Stream Durable Object for live admin/restaurant feed.
- TokenBroker: single-flight token refresh for Getir.

## Setup (PowerShell)
```powershell
npm i -g wrangler
npm install

# D1 migration (set database_id in wrangler.toml first)
cd .\apps\api
wrangler d1 migrations apply pentegra_db

# API dev
wrangler dev

# Dashboard dev (separate terminal)
cd ..\dashboard
npm run dev
```

## Secrets
Real secrets must never be committed.
```powershell
cd .\apps\api
wrangler secret put JWT_SECRET
wrangler secret put CRED_MASTER_KEY_BASE64
```

Optional dev fallbacks:
- `GETIR_GLOBAL_X_API_KEY`
- `GETIR_GLOBAL_BASIC_AUTH` ("user:pass" format)
- `MIGROS_GLOBAL_BASIC_AUTH` ("user:pass" format)

## Webhook endpoints
- `POST /api/getir/newOrder`
- `POST /api/getir/cancelOrder`
- `POST /api/migros/orderCreated`
- `POST /api/migros/orderCanceled`
- `POST /api/migros/deliveryStatusChanged`
- `POST /api/yemeksepeti/webhook` (stub)

## Migros encryption note
- AES-256-ECB, PKCS7, block size 128.
- `nodejs_compat` enabled in `wrangler.toml`.
- Encrypted POST body: `{ "value": "<base64>" }`.

## Platform integration notes
### Getir
- Inbound auth: `x-api-key` and/or Basic Auth (DB or global env fallback).
- Auto-approve: TokenBroker provides token, then adapter approves.

### Migros
- Inbound auth: Basic Auth required (DB or global env fallback).
- Outbound encryption: AES-256-ECB + PKCS7.
- `Order/v2/UpdateOrderStatus` supported in MVP.

## D1 migrations
`apps/api/migrations/0001_init.sql`

## Tests
```powershell
npm test
```

## Demo users (seed)
Seed SQL file: `apps/api/scripts/seed.sql`
```powershell
cd .\apps\api
wrangler d1 execute pentegra_db --file .\scripts\seed.sql --remote
```

Demo credentials:
- Admin: `admin@demo.local` / `Admin123!`
- Restaurant: `restoran@demo.local` / `Restoran123!`

## Warning
Never store real `x-api-key`, basic auth, tokens, or secrets in repo. Use D1 ciphertext or `wrangler secret`.
