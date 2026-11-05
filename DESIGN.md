# DESIGN.md — Tashteeb Locked Design System

## 1. Visual Direction & Three Dials
- **Color Strategy**: **Dominant Hue + Tight Accent** — Nile Teal (`#0F5C6E`, deep `#0D3B47`) paired with warm paper/sand neutrals (`#FAF8F4`, `#FFFFFF`, `#F3EFE8`, `#E6E0D6`) and Terracotta (`#E0662F` / `#F08A5D` on dark) reserved for high-emphasis CTAs, active nav underlines, and secondary data accents.
- **Variance**: **Mid-Low (4/10)** — Confident editorial-financial layout following the Figma reference (`https://etch-brink-06982082.figma.site`), asymmetrical split hero with live Quick Estimate card, clean structured tables for financial trust.
- **Motion**: **Mid-Low (3/10)** — Crisp 150–250ms ease-out micro-interactions on hover/focus/tabs/drawers; zero decorative bounce; full `prefers-reduced-motion: reduce` support.
- **Density**: **Mid (5/10)** — Generous 8pt marketing rhythm (`96px` desktop / `64px` mobile vertical section padding) transitioning to structured `14px` tabular clarity inside Calculator, Invoice, and Price Market tables.

## 2. Color Tokens (Semantic Only — No Hardcoded Hex in Components)
| Token | Hex | Role |
|---|---|---|
| `primary` / `primary-hover` / `primary-pressed` | `#0F5C6E` / `#0B4A59` / `#083B47` | Primary buttons, active borders, brand mark, primary chart series |
| `primary-tint` / `primary-deep` | `#E3F1F4` / `#0D3B47` | Subtle badges & dark hero/feature/footer/running-total surfaces |
| `accent` / `accent-hover` / `accent-tint` / `accent-dark` | `#E0662F` / `#C95A28` / `#FCEBE1` / `#F08A5D` | Active nav underline, dark-band CTAs, highlight badges, labour chart series |
| `bg` / `surface` / `sand` / `border` | `#FAF8F4` / `#FFFFFF` / `#F3EFE8` / `#E6E0D6` | Page background, cards/modals, secondary wells, 1px warm borders |
| `ink` / `ink-secondary` / `ink-muted` | `#1C2B33` / `#5B6B73` / `#8C999F` | Primary copy, supporting text, captions/metadata only |
| `success` / `success-tint` | `#2E8B57` / `#E5F4EC` | Live freshness dot, ready badges, price drops (good for buyer) |
| `danger` / `danger-tint` | `#D64545` / `#FBE9E9` | Destructive actions, validation errors, price spikes |
| `warning` / `warning-tint` | `#E0A21B` / `#FDF4DC` | Edited price badges, amber edited invoice rows, stale price warnings |
| `info` / `info-tint` | `#2F7DD1` / `#E6F0FB` | Informational callouts, methodology notes |
| `chart-1..7` | `#0F5C6E`, `#E0662F`, `#E0A21B`, `#5BA4A4`, `#8C6A4F`, `#A7B8BD`, `#2E8B57` | Donut, stacked bar, Gantt, and multi-series market charts |

## 3. Typography
- **Latin**: `Plus Jakarta Sans` (400, 500, 600, 700, 800), `font-display: swap`.
- **Arabic**: `IBM Plex Sans Arabic` (400, 500, 600, 700), `font-display: swap`, relaxed line-height (`1.65` body, `1.35` headings), minimum size `13px` in RTL.
- **Scale & Rules**:
  - Minimum text size: `12px` (`13px` in Arabic)
  - Table cells: `14px`
  - Body text: `16px`
  - Headings: `font-weight: 600` (with bold display accents where specified), **`letter-spacing: 0` (never negative)** so Latin and Arabic glyphs never collide.
  - All prices, percentages, areas, and quantities apply `tabular-nums` (`font-variant-numeric: tabular-nums`).

## 4. Shape, Spacing & Elevation
- Card border radius: `12px` (`rounded-card`) with `1px solid #E6E0D6` and `shadow-card` (`0 4px 16px rgba(28, 43, 51, 0.06)`).
- Input & Button border radius: `10px` (`rounded-control`), minimum interactive height `44px`.
- Chips & Pills: `999px` (`rounded-pill`).
- Spacing: 8pt rhythm (`4, 8, 12, 16, 24, 32, 48, 64, 96px`).
- Icons: Lucide (`lucide-vue-next`), `1.5px` stroke width; directional icons (`ArrowRight`, `ChevronRight`, `ArrowLeft`) flip via `rtl:-scale-x-100`.
- Focus Ring: `2px` solid `#0F5C6E` with `2px` offset (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).

## 5. RTL & Localization Discipline
- `<html lang="ar" dir="rtl">` managed dynamically via `@nuxtjs/i18n`.
- Logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s-*`) used across all components.
- Controlled `dir="ltr"` / `<bdi>` islands for phone numbers, URLs, email addresses, brand logos, time-series chart X-axes, and Gantt week axes.
