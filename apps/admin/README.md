# Kurye Takip Admin Paneli (Next.js 14)

Premium SaaS admin paneli. Login ve /app altindaki protected sayfalar mock API ile calisir.

## Komutlar (PowerShell)
```powershell
cd C:\Users\krkmz\git_projem\pentegra-panel\apps\admin
npm install
npm run dev
```

## Klasor Yapisi
```
app/
  api/mock/*       -> mock endpointler
  app/*            -> protected area
  login/           -> login sayfasi
components/
  layout/          -> sidebar, topbar, command palette
  shared/          -> reusable UI (stat, badges, empty states)
  ui/              -> shadcn-styled components
lib/               -> api, auth, utils
styles/            -> design tokens
types/             -> paylasilan type'lar
```

## Mock Endpointler
- GET /api/mock/dashboard
- GET /api/mock/orders
- GET /api/mock/restaurants
- GET /api/mock/couriers
- GET /api/mock/integrations
- POST /api/mock/login

## Notlar
- Secret/credential UI tarafinda hardcode edilmez, masked gosterilir.
- API cagirilari `/api/*` uzerinden yapilir.
