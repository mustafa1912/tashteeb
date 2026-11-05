import { describe, it, expect } from 'vitest'
import { comparePackages } from '../../utils/calc/compare.js'

describe('Package Comparison Engine', () => {
  const apartment = {
    area: 120,
    governorate: 'cairo',
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    reception: 2,
    balconies: 2
  }

  it('computes category diffs, identifies biggest gap, and formats insight sentence', () => {
    const diff = comparePackages({
      apartment,
      packageA: 'standard',
      packageB: 'super_lux',
      locale: 'en'
    })

    expect(diff.totalDiffEgp).toBe(diff.estB.grandTotal - diff.estA.grandTotal)
    expect(diff.totalDiffEgp).toBeGreaterThan(0)
    expect(diff.biggestGap).toBeTruthy()
    expect(diff.biggestGap.key).toBe('floors')
    expect(diff.summarySentence).toContain('Super Lux costs')
    expect(diff.summarySentence).toContain('more')
    expect(diff.summarySentence).toContain('Floors')
    expect(diff.summary_ar).toContain('الأرضيات')
  })

  it('handles lower-cost comparison accurately (Standard -> Economy)', () => {
    const diff = comparePackages({
      apartment,
      packageA: 'standard',
      packageB: 'economy',
      locale: 'en'
    })

    expect(diff.totalDiffEgp).toBeLessThan(0)
    expect(diff.summarySentence).toContain('Economy costs')
    expect(diff.summarySentence).toContain('less')
  })
})
