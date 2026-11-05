/**
 * Canonical sample estimates shared across Home preview, My Estimates, Shared links,
 * Shopping List, Compare, and Contractor Quotation workspace.
 * Every estimate is computed live via `calculateEstimate` so row math & grand totals
 * are 100% consistent across every screen.
 */
import { calculateEstimate } from './engine.js'

export const BENCHMARK_STANDARD_120_INPUT = {
  apartment: {
    unitType: 'apartment',
    area: 120,
    governorate: 'cairo',
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    reception: 2,
    balconies: 2
  },
  packageKey: 'standard',
  selections: {},
  overrides: {},
  extras: [],
  contingencyPct: 0.12,
  includeLabour: true
}

export function buildSeedEstimates() {
  // 1. Primary Benchmark Project (#TS-2408 — New Cairo apartment, 120 m², Standard)
  // One single source of truth: computes from BENCHMARK_STANDARD_120_INPUT
  const ts2408Input = { ...BENCHMARK_STANDARD_120_INPUT }
  const ts2408Calc = calculateEstimate(ts2408Input)

  // 2. Economy Benchmark (#TS-2409 — Maadi rental renovation, 95 m², Economy)
  const ts2409Input = {
    apartment: {
      unitType: 'apartment',
      area: 95,
      governorate: 'cairo',
      bedrooms: 2,
      bathrooms: 1,
      kitchens: 1,
      reception: 2,
      balconies: 1
    },
    packageKey: 'economy',
    selections: {},
    overrides: {},
    extras: ['final_cleaning'],
    contingencyPct: 0.10,
    includeLabour: true
  }

  const ts2409Calc = calculateEstimate(ts2409Input)

  // 3. Super Lux Benchmark (#TS-2410 — Madinaty family home, 165 m², Super Lux)
  const ts2410Input = {
    apartment: {
      unitType: 'apartment',
      area: 165,
      governorate: 'cairo',
      bedrooms: 3,
      bathrooms: 3,
      kitchens: 1,
      reception: 3,
      balconies: 2
    },
    packageKey: 'super_lux',
    selections: {},
    overrides: {},
    extras: ['central_ac', 'smart_home'],
    contingencyPct: 0.12,
    includeLabour: true
  }

  const ts2410Calc = calculateEstimate(ts2410Input)

  return [
    {
      id: 'ts-2408',
      refCode: '#TS-2408',
      shareToken: 'demo-ts-2408',
      title: 'New Cairo apartment',
      title_ar: 'شقة التجمع الخامس',
      status: 'ready',
      createdAt: '2026-08-24T09:30:00+02:00',
      updatedAt: '2026-11-04T06:00:00+02:00',
      purchasedItemIds: ['floors-porcelain-60x60-cleopatra', 'electrical-elsewedy-wiring-venus-switches-abb-panel'],
      input: ts2408Input,
      computed: ts2408Calc
    },
    {
      id: 'ts-2409',
      refCode: '#TS-2409',
      shareToken: 'demo-ts-2409',
      title: 'Maadi rental renovation',
      title_ar: 'تجديد شقة إيجار بالمعادي',
      status: 'ready',
      createdAt: '2026-09-14T14:15:00+02:00',
      updatedAt: '2026-11-04T06:00:00+02:00',
      purchasedItemIds: [],
      input: ts2409Input,
      computed: ts2409Calc
    },
    {
      id: 'ts-2410',
      refCode: '#TS-2410',
      shareToken: 'demo-ts-2410',
      title: 'Madinaty family home',
      title_ar: 'شقة عائلية بمدينتي B11',
      status: 'in_progress',
      createdAt: '2026-10-19T18:00:00+02:00',
      updatedAt: '2026-11-04T06:00:00+02:00',
      purchasedItemIds: [],
      input: ts2410Input,
      computed: ts2410Calc
    }
  ]
}
