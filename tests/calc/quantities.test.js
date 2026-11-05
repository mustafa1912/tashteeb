import { describe, it, expect } from 'vitest'
import {
  calcPurchaseQuantity,
  calcPaintBuckets,
  computeApartmentAreas
} from '../../utils/calc/quantities.js'
import { buildConstructionTimeline } from '../../utils/calc/timeline.js'

describe('Quantity & Area Calculations', () => {
  it('computes exact ceil cartons for 132 m² porcelain 60×60 with 10% waste (101 cartons, NOT 84)', () => {
    const cartons = calcPurchaseQuantity({
      area: 132,
      wastePct: 0.10,
      coveragePerUnit: 1.44
    })
    expect(cartons).toBe(101)
    expect(cartons).not.toBe(84)
  })

  it('always ceils fractional parquet boxes (2.2 m²/box, 8% waste)', () => {
    // 100 * 1.08 / 2.2 = 49.0909 -> ceil = 50 boxes
    const boxes = calcPurchaseQuantity({
      area: 100,
      wastePct: 0.08,
      coveragePerUnit: 2.2
    })
    expect(boxes).toBe(50)
  })

  it('computes 18L paint buckets with 2 coats, 110 m²/coat coverage, and 5% waste', () => {
    // 300 m² * 2 coats * 1.05 / 110 = 630 / 110 = 5.727 -> 6 buckets
    const buckets = calcPaintBuckets({
      wallArea: 300,
      coats: 2,
      coveragePerBucket: 110,
      wastePct: 0.05
    })
    expect(buckets).toBe(6)
  })

  it('derives net wall area from floorArea * 2.8 minus door (2 m²) & window (1.5 m²) openings', () => {
    const areas = computeApartmentAreas({
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      kitchens: 1,
      reception: 2,
      balconies: 2
    })
    // doorsCount = 3 + 2 + 1 + 1 = 7 (14 m²); windowsCount = 3 + 2 + 2 + 1 + 2 = 10 (15 m²) => openings = 29 m²
    // gross = 120 * 2.8 = 336 m² => net wallArea = 307 m²
    expect(areas.doorsCount).toBe(7)
    expect(areas.windowsCount).toBe(10)
    expect(areas.openingsArea).toBe(29)
    expect(areas.wallArea).toBe(307)
    expect(areas.ceilingArea).toBe(120)
    expect(areas.electricalPoints).toBe(72)
    expect(areas.plumbingPoints).toBe(18)
  })

  it('schedules Plumbing and Electrical rough-in in parallel after Demolition', () => {
    const { tasks, totalWeeks } = buildConstructionTimeline({ area: 120 })
    const demo = tasks.find(t => t.id === 'demolition')
    const plumb = tasks.find(t => t.id === 'plumbing')
    const elec = tasks.find(t => t.id === 'electrical')
    const plaster = tasks.find(t => t.id === 'plastering')

    expect(plumb.startWeek).toBe(demo.endWeek + 1)
    expect(elec.startWeek).toBe(plumb.startWeek)
    expect(plaster.startWeek).toBe(Math.max(plumb.endWeek, elec.endWeek) + 1)
    expect(totalWeeks).toBeGreaterThanOrEqual(12)
  })
})
