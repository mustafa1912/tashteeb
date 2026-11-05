import { describe, it, expect } from 'vitest'
import { calculateEstimate } from '../../utils/calc/engine.js'
import { calcPurchaseQuantity } from '../../utils/calc/quantities.js'
import { buildSeedEstimates, BENCHMARK_STANDARD_120_INPUT } from '../../utils/calc/seed-projects.js'
import { MATERIALS_CATALOG } from '../../utils/calc/catalog.js'
import { CATEGORIES } from '../../utils/calc/config.js'
import { formatCategoryLabel } from '../../utils/formatters.js'

describe('Section 9 Data, Math, Claims & Sanity Unit Tests', () => {
  it('1. ONE SOURCE OF TRUTH: Home quick-estimate default matches sample invoice #TS-2408 baseline fixture', () => {
    const quickDefault = calculateEstimate(BENCHMARK_STANDARD_120_INPUT)
    const seedEstimates = buildSeedEstimates()
    const ts2408 = seedEstimates.find(e => e.id.toLowerCase() === 'ts-2408')

    expect(ts2408).toBeDefined()
    expect(quickDefault.grandTotal).toBe(ts2408.computed.grandTotal)
    expect(quickDefault.materialsTotal).toBe(ts2408.computed.materialsTotal)
    expect(quickDefault.labourTotal).toBe(ts2408.computed.labourTotal)
    expect(quickDefault.contingencyAmount).toBe(ts2408.computed.contingencyAmount)
  })

  it('2. WASTE CALCULATION: 132 m² porcelain with 10% waste & 1.44 m²/carton yields exactly 101 cartons', () => {
    // 132 * 1.10 = 145.2 m²
    // 145.2 / 1.44 = 100.833... -> ceil = 101
    const qty = calcPurchaseQuantity({
      area: 132,
      wastePct: 0.10,
      coveragePerUnit: 1.44
    })
    expect(qty).toBe(101)
  })

  it('3. INVOICE ROW MATH: every row visibly satisfies purchased_qty * unit_price + labour === subtotal', () => {
    const estimate = calculateEstimate(BENCHMARK_STANDARD_120_INPUT)

    for (const item of estimate.items) {
      const materialCost = Math.round(item.purchased_qty * item.unit_price)
      const labourCost = Math.round(item.labour)
      const expectedSubtotal = materialCost + labourCost
      const actualSubtotal = Math.round(item.subtotal)

      // Allow maximum 1 EGP rounding tolerance
      expect(Math.abs(expectedSubtotal - actualSubtotal)).toBeLessThanOrEqual(1)
    }

    // Category subtotals sum to baseCost
    const sumCategories = estimate.categories.reduce((acc, c) => acc + c.subtotal, 0)
    expect(Math.abs(sumCategories - estimate.baseCost)).toBeLessThanOrEqual(2)

    // Base cost + contingency === grandTotal
    const expectedGrand = estimate.baseCost + estimate.contingencyAmount
    expect(Math.abs(expectedGrand - estimate.grandTotal)).toBeLessThanOrEqual(1)
  })

  it('4. CEMENT PRICE SANITY: Portland cement reflects ~4,180 EGP/ton Egyptian market retail benchmark', () => {
    const cement = MATERIALS_CATALOG.find(m => m.slug.includes('cement'))
    expect(cement).toBeDefined()
    expect(cement.price).toBeGreaterThanOrEqual(3800)
    expect(cement.price).toBeLessThanOrEqual(4600)
    expect(cement.store_tip_en).toContain('210')
    expect(cement.store_tip_ar).toContain('210')
  })

  it('5. NO LEAKED KEYS: every category key resolves to clean localized human-readable labels without raw keys', () => {
    const rawKeysFound = []
    const allCategoriesInCatalog = [...new Set(MATERIALS_CATALOG.map(m => m.category))]

    for (const catKey of allCategoriesInCatalog) {
      const enLabel = formatCategoryLabel(catKey, 'en')
      const arLabel = formatCategoryLabel(catKey, 'ar')

      if (!enLabel || enLabel === catKey || enLabel.includes('_')) {
        rawKeysFound.push(`EN: ${catKey} -> ${enLabel}`)
      }
      if (!arLabel || arLabel === catKey || arLabel.includes('_')) {
        rawKeysFound.push(`AR: ${catKey} -> ${arLabel}`)
      }
    }

    expect(rawKeysFound).toEqual([])
  })
})

