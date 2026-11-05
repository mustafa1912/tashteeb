# PRODUCT.md — Tashteeb (تشطيب)

## What It Is
Tashteeb is a public, bilingual (English LTR / Arabic RTL) web application and finishing cost estimator built for Egyptian homeowners, buyers, and finishing contractors. It is **not** an internal admin dashboard: any visitor can immediately estimate apartment finishing costs with zero login friction, inspect real Egyptian market material benchmarks, and receive an itemized invoice with purchase quantities (including waste), workmanship/labour, contingency, and a realistic week-by-week construction timeline.

## Target Audience
1. **Homeowners & Buyers in Egypt**: Planning to finish a core-and-shell or semi-finished apartment, duplex, villa, or commercial shop across Cairo, Giza, Alexandria, and other Egyptian governorates. They want honest numbers, clear quantities (cartons, buckets, bags, points), and protection against surprise costs.
2. **Finishing Contractors & Engineers**: Quoting residential projects who want to turn structured cost estimates into branded client-facing quotations with markup, overhead, custom line items, payment milestones, and PDF/WhatsApp export while keeping raw base costs private.

## Voice & Tone
- **Trustworthy, practical, modern, and warm.**
- Honest and transparent: never invent precision claims (never claim "accurate within 8%"). Always communicate clearly: *"Estimates are based on current market prices, practical waste factors and governorate adjustments. Final costs may vary."*
- Every price shown anywhere in the UI must display its freshness status (`Prices updated today 06:00` or stale fallback date).
- Every user-overridden price must remain visibly marked (`Price edited from X to Y`) both inline and in the invoice notes.

## Hard Engineering Constraints
- **Stack**: Nuxt 3 (Vue 3 Composition API, `<script setup>`), **JavaScript ONLY** (zero TypeScript), Tailwind CSS, Pinia, Nitro server routes, Supabase (Postgres + Auth + Row-Level Security), Vitest, Puppeteer (server-side A4 PDF).
- **Languages & Locale**: English (`en`, LTR) and Arabic (`ar`, RTL). Western numerals with thousands separators (`485,200`) in both locales; currency `EGP` in English and `ج.م` after the figure in Arabic.
- **Mathematical Integrity**: Purchase quantities always round up (`Math.ceil`), invoices price purchased quantities, every displayed row satisfies `purchased_qty * unit_price + labour = subtotal`, and all category/summary figures add up identically to the grand total.
