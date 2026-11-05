import { describe, it, expect } from 'vitest'
import { calculateEstimate, checkPriceDeviation } from '../../utils/calc/engine.js'
import { calculateContractorQuotation } from '../../utils/calc/contractor.js'

describe('Calculation Engine Totals, Row Math & Overrides', () => {
  const baseApartment = {
    unitType: 'apartment',
    area: 120,
    governorate: 'cairo',
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    reception: 2,
    balconies: 2
  }

  it.each(['economy', 'standard', 'super_lux'])(
    'guarantees exact row math and subtotal sums for %s package',
    (pkg) => {
      const est = calculateEstimate({
        apartment: baseApartment,
        packageKey: pkg,
        contingencyPct: 0.12,
        extras: ['waste_removal']
      })

      for (const item of est.items) {
        expect(item.purchased_qty * item.unit_price).toBe(item.material_cost)
        expect(item.purchased_qty * item.unit_price + item.labour).toBe(item.subtotal)
      }

      const sumCatMaterials = est.categories.reduce((s, c) => s + c.materials_subtotal, 0)
      const sumCatLabour = est.categories.reduce((s, c) => s + c.labour_subtotal, 0)
      const sumCatSubtotals = est.categories.reduce((s, c) => s + c.subtotal, 0)

      expect(sumCatMaterials).toBe(est.materialsTotal)
      expect(sumCatLabour).toBe(est.labourTotal)
      expect(sumCatSubtotals).toBe(est.materialsTotal + est.labourTotal)
      expect(est.materialsTotal + est.labourTotal + est.contingencyAmount).toBe(est.grandTotal)

      // Donut segments must equal grandTotal identically
      const donutSum = est.donutSegments.reduce((s, seg) => s + seg.value, 0)
      expect(donutSum).toBe(est.grandTotal)
    }
  )

  it('applies price overrides with explicit notes and recomputes totals accurately', () => {
    const baseline = calculateEstimate({
      apartment: baseApartment,
      packageKey: 'standard'
    })

    const overridden = calculateEstimate({
      apartment: baseApartment,
      packageKey: 'standard',
      overrides: {
        'porcelain-60x60-cleopatra': {
          used_price: 520,
          reason: 'Imported Spanish porcelain quote from Sallab'
        }
      }
    })

    expect(overridden.editedCount).toBe(1)
    expect(overridden.grandTotal).toBeGreaterThan(baseline.grandTotal)

    const floorItem = overridden.items.find(i => i.slug === 'porcelain-60x60-cleopatra')
    expect(floorItem.override.is_overridden).toBe(true)
    expect(floorItem.override.original_price).toBe(450)
    expect(floorItem.override.used_price).toBe(520)
    expect(floorItem.override.note_en).toContain('Price edited from 450 EGP/m² to 520 EGP/m²')
    expect(floorItem.override.deviation.hasWarning).toBe(false)
  })

  it('flags extreme price overrides (<50% or >200% of market average)', () => {
    const normal = checkPriceDeviation(450, 520)
    const tooLow = checkPriceDeviation(450, 200) // 44.4%
    const tooHigh = checkPriceDeviation(450, 950) // 211.1%

    expect(normal.hasWarning).toBe(false)
    expect(tooLow.isExtremeLow).toBe(true)
    expect(tooLow.hasWarning).toBe(true)
    expect(tooHigh.isExtremeHigh).toBe(true)
    expect(tooHigh.hasWarning).toBe(true)
  })

  it('applies governorate multipliers cleanly', () => {
    const cairoEst = calculateEstimate({ apartment: { ...baseApartment, governorate: 'cairo' } })
    const redSeaEst = calculateEstimate({ apartment: { ...baseApartment, governorate: 'red_sea' } })
    const deltaEst = calculateEstimate({ apartment: { ...baseApartment, governorate: 'dakahlia' } })

    expect(redSeaEst.grandTotal).toBeGreaterThan(cairoEst.grandTotal)
    expect(deltaEst.grandTotal).toBeLessThan(cairoEst.grandTotal)
  })

  it('computes exact contractor quotation breakdown with zero rounding drift', () => {
    const baseEst = calculateEstimate({ apartment: baseApartment, packageKey: 'standard' })
    const quote = calculateContractorQuotation({
      baseEstimate: baseEst,
      overheadPct: 7,
      markupPct: 18,
      vatPct: 14,
      customItems: [{ label_en: '3D Interior Supervision', qty: 1, unit_price: 15000 }]
    })

    const catSum = quote.clientCategories.reduce((s, c) => s + c.client_subtotal, 0)
    expect(catSum).toBe(quote.baseClientSubtotal)
    expect(quote.rawCost + quote.overheadAmount + quote.markupAmount).toBe(quote.baseClientSubtotal)
    expect(quote.baseClientSubtotal + quote.customItemsTotal + quote.vatAmount).toBe(quote.clientGrandTotal)
  })
})
