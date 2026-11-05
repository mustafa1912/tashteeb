# Tashteeb (تشطيب) — Apartment Finishing Cost Estimator for Egypt

**Tashteeb (تشطيب)** is a bilingual (`en` LTR / `ar` RTL) public web application that estimates the real cost of finishing an apartment, duplex, villa, or commercial unit in Egypt. Visitors enter unit dimensions, governorate, finishing tier (*Economy*, *Standard*, *Super Lux*), and room-by-room materials to receive an itemized invoice with purchase quantities (including practical waste), workmanship/labour costs, contingency reserve, likely range, and a construction Gantt timeline.

---

## Key Features

- **5-Step Calculator Wizard (`/calculator`)**: Works logged-out with instant live totals in a persistent dark-teal sidebar (desktop) and sticky bottom bar (mobile), auto-saved to `localStorage`.
- **Exact Purchase-Quantity Engine (`utils/calc/*`)**: Pure JavaScript shared between client and Nitro server. Always rounds purchase units up (`Math.ceil(area * (1 + waste_pct) / coverage_per_unit)`) and prices invoices on actual cartons, buckets, bags, rolls, and electrical/plumbing points.
- **Manual Price Overrides**: Override any market material price with an instant recalculation, amber `EditedPriceBadge`, explicit `"Price edited from X to Y"` invoice audit note, and `<50%` / `>200%` outlier guardrails.
- **Package Comparison (`/estimate/[id]/compare`)**: Side-by-side diff across *Economy*, *Standard*, and *Super Lux* with category deltas and automatic biggest-gap summary.
- **Target-Budget Planner (`/budget`)**: Allocates a target EGP budget across categories by weight, supports **locking** specific materials, redistributes surplus, and suggests smart trade-offs (or closest *Economy* fallback if below minimum threshold).
- **Printable Shopping List (`/estimate/[id]/shopping-list`)**: Grouped by trade/supplier with interactive purchased checkboxes persisted per estimate.
- **Contractor Workspace (`/contractor`)**: Client quotation builder with company branding, markup %, site overhead %, optional 14% VAT toggle, custom line items, payment milestones, and branded client PDFs (`#Q-1042` unified preview).
- **Public SEO Price Market (`/market` & `/market/[slug]`)**: Daily-updated Egyptian finishing materials index, 6-month SVG trend charts, top movers, `sitemap.xml`, `hreflang`, Open Graph tags, and `Product` + `Offer` JSON-LD.
- **Server-Side A4 PDFs & Share Links**: `puppeteer-core` A4 PDF generation (`/api/pdf/[type]/[id]`), `@media print` stylesheets, QR-coded read-only public links (`/s/[token]`), and pre-formatted WhatsApp summaries.
- **Bilingual Arabic (RTL) & English (LTR)**: Full RTL layout mirroring, `IBM Plex Sans Arabic` + `Plus Jakarta Sans` typography, and tabular numerals (`tabular-nums`) on every price.

---

## Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3 Composition API, `<script setup>`, **100% JavaScript — zero TypeScript**)
- **Styling**: Tailwind CSS (`@nuxtjs/tailwindcss`) driven strictly by semantic design tokens (`tailwind.config.js` & `DESIGN.md`)
- **State Management**: Pinia (`@pinia/nuxt`) + `localStorage` persistence
- **Internationalization**: `@nuxtjs/i18n` (`en` default LTR, `/ar` prefix RTL)
- **Backend & Cron**: Nitro server routes (`server/api/**`) + scheduled daily price task (`prices:daily` at `06:00`)
- **Database & Auth**: Supabase (`@supabase/supabase-js` — PostgreSQL + Auth + Row-Level Security) with automatic seeded local fallback when credentials are omitted
- **PDF & Utilities**: `puppeteer-core`, `qrcode`, `cheerio`, `lucide-vue-next`
- **Testing**: `vitest`

---

## Folder Structure

```text
tashteeb/
├── assets/css/              # Tailwind layers, typography tokens & @media print rules
├── components/
│   ├── base/                # Reusable UI primitives (BaseButton, BaseInput, BaseModal, DataTable...)
│   ├── calculator/          # Wizard steps, RunningTotalCard, GuestSaveModal
│   ├── charts/              # Custom SVG Sparkline, LineChart, DonutChart, StackedBar, GanttChart
│   ├── contractor/          # ContractorHero & live QuotationSheetPreview
│   ├── domain/              # MaterialCard, PriceBadge, EditedPriceBadge, PriceEditModal, SessionExpiredModal...
│   └── layout/              # AppNavbar, FullFooter, CompactFooter, MobileBottomNav, LanguageSwitcher
├── composables/             # Formatters & SEO JSON-LD schema helpers
├── i18n/locales/            # English (en.json) & Egyptian Arabic (ar.json) dictionaries
├── layouts/                 # public, app, auth, print, default
├── middleware/              # Client-safe route guard (auth.js)
├── pages/                   # All public, wizard, invoice, market, budget, contractor, auth & print routes
├── plugins/                 # Dual-mode Supabase client plugin
├── scripts/                 # 6-month deterministic price history generator (seed-history.mjs)
├── server/
│   ├── api/                 # Estimates, prices, market, share tokens, watchlist, cron & PDF endpoints
│   ├── data/                # Seeded Egyptian materials, 180-day histories & sample estimates
│   ├── price-providers/     # SeedProvider, ScraperProvider, ManualCsvProvider + >30% jump quarantine
│   ├── routes/              # Dynamic /sitemap.xml route
│   ├── tasks/prices/        # Nitro scheduled task (daily.js)
│   └── utils/               # Supabase service-role / local memory store adapter
├── stores/                  # Pinia stores (wizard, market, estimates, contractor, auth, ui)
├── supabase/                # PostgreSQL schema + RLS (migrations/001_init.sql) & seed.sql
├── tests/calc/              # Vitest unit tests for quantities, engine, compare & budget allocation
└── utils/calc/              # Pure JS calculation engine shared by browser & server
```

---

## Quickstart

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available variables in `.env`:

| Variable | Required? | Description |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | Optional | Base URL for canonical tags, `sitemap.xml`, share links & QR codes (default `http://localhost:3000`). |
| `SUPABASE_URL` | Optional* | Supabase project URL. *If omitted, Tashteeb runs seamlessly in local seeded mode.* |
| `SUPABASE_ANON_KEY` | Optional* | Supabase public anon key for client auth & RLS queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional* | Supabase service-role key used only by server cron & share-link endpoints. |
| `CRON_SECRET` | Optional | Secret header (`x-cron-secret`) protecting `POST /api/cron/prices`. |
| `PRICE_CSV_URL` | Optional | Remote CSV URL for `ManualCsvProvider` market price ingestion. |
| `PUPPETEER_EXECUTABLE_PATH` | Optional | Path to Chrome/Edge/Chromium binary for server-side PDF rendering (auto-detected on Windows/macOS/Linux if blank). |

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` (English LTR) or `http://localhost:3000/ar` (Arabic RTL).

---

## Supabase Setup (Production / Cloud Mode)

Tashteeb works immediately out of the box without external credentials using its built-in local adapter. To connect a live Supabase project:

1. Create a new Supabase project and open the **SQL Editor**.
2. Run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) to create all tables (`profiles`, `categories`, `materials`, `price_history`, `price_Fetch_logs`, `estimates`, `estimate_items`, `shared_links`, `watchlist`, `contractor_profiles`) and Row-Level Security policies.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to populate categories and Egyptian finishing materials.
4. Generate or refresh the deterministic 6-month historical series metadata locally if needed:
   ```bash
   npm run seed:history
   ```
5. Populate `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env`, and enable Email + Phone OTP providers in Supabase Auth.

---

## Daily Market Price Pipeline & Cron

Material prices are ingested through `server/price-providers/index.js`, which chains:
1. **`ManualCsvProvider`** (if `PRICE_CSV_URL` is configured)
2. **`ScraperProvider`** (Cheerio HTML parser skeleton with polite timeout/fallback)
3. **`SeedProvider`** (curated Egyptian market catalog baseline)

### Safety Guardrails
- **Outlier Quarantine (`>30%` daily jump)**: Any incoming price moving more than `±30%` vs. the previous recorded price is automatically quarantined (`flagged: true`) and excluded from overwriting the live price until reviewed.
- **Stale Fallback**: If upstream providers fail, Tashteeb serves the last verified market snapshot and displays a transparent freshness indicator.

### Triggering Price Updates
- **Scheduled**: Nitro runs `prices:daily` automatically at `06:00` (`0 6 * * *` in `nuxt.config.js`).
- **Webhook / Manual Trigger**:
  ```bash
  curl -X POST http://localhost:3000/api/cron/prices \
    -H "x-cron-secret: tashteeb-local-cron-secret-change-me" \
    -H "Content-Type: application/json"
  ```

---

## Server-Side A4 PDF Export

Endpoints under `/api/pdf/[type]/[id]` render dedicated print views (`/print/estimate/[id]`, `/print/shopping-list/[id]`, `/print/quotation/[id]`, `/print/compare/[id]`) into crisp A4 PDFs via `puppeteer-core`:

- `GET /api/pdf/estimate/ts-2408`
- `GET /api/pdf/shopping-list/ts-2408`
- `GET /api/pdf/quotation/ts-2408`
- `GET /api/pdf/compare/ts-2408`

If Chrome/Chromium is installed in a non-standard directory on your server, set `PUPPETEER_EXECUTABLE_PATH` in `.env`. Every page also supports native browser printing (`Ctrl/Cmd + P`) via `assets/css/print.css`.

---

## Testing & Production Build

Run the Vitest unit test suite covering purchase quantity rounding (`Math.ceil`), waste factors, totals, manual price overrides, package comparison diffs, and target-budget allocation:

```bash
npm test
```

Build the production SSR + ISR/SWR bundle:

```bash
npm run build
npm run preview
```

