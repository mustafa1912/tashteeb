import { describe, it, expect } from 'vitest'
import { planTargetBudget } from '../../utils/calc/budget.js'

describe('Target-Budget Planner Engine', () => {
  const apartment = {
    area: 120,
    governorate: 'cairo',
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    reception: 2,
    balconies: 2
  }

  it('allocates tiers within target budget and upgrades priority categories', () => {
    const result = planTargetBudget({
      targetBudget: 500000,
      apartment,
      priorityCategories: ['floors', 'kitchen']
    })

    expect(result.isBelowMinimum).toBe(false)
    expect(result.plannedTotal).toBeLessThanOrEqual(500000)
    expect(result.remainingBudget).toBeGreaterThanOrEqual(0)
    expect(result.tradeOffs.length).toBeGreaterThan(0)
  })

  it('preserves locked materials and allocates remaining budget around them', () => {
    const lockedSlug = 'imported-marble-slabs-crema-marfil'
    const result = planTargetBudget({
      targetBudget: 580000,
      apartment,
      lockedSelections: {
        floors: lockedSlug
      }
    })

    expect(result.selections.floors).toBe(lockedSlug)
    const floorItem = result.estimate.items.find(i => i.category === 'floors')
    expect(floorItem.slug).toBe(lockedSlug)
  })

  it('returns closest Economy plan with isBelowMinimum=true when budget is too low', () => {
    const result = planTargetBudget({
      targetBudget: 150000,
      apartment
    })

    expect(result.isBelowMinimum).toBe(true)
    expect(result.remainingBudget).toBeLessThan(0)
    expect(result.plannedTotal).toBe(result.minimumEconomyTotal)
  })
})
