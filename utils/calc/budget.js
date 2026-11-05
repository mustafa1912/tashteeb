/**
 * Target-Budget Planner Engine.
 * Allocates a user's target budget across finishing categories by category weights & priority boosts,
 * respects LOCKED material selections, redistributes leftover budget greedily, generates concrete
 * one-click trade-off suggestions, and handles the "budget too low" Economy fallback gracefully.
 */
import { CATEGORIES } from './config.js'
import { MATERIALS_CATALOG, getCalculatorMaterials } from './catalog.js'
import { calculateEstimate } from './engine.js'

const TIER_ORDER = ['economy', 'standard', 'super_lux']

export function planTargetBudget({
  targetBudget = 450000,
  apartment = { area: 120, governorate: 'cairo', bedrooms: 3, bathrooms: 2, kitchens: 1, reception: 2, balconies: 2 },
  priorityCategories = [],
  lockedSelections = {},
  includeLabour = true,
  contingencyPct = 0.10,
  materialsCatalog = MATERIALS_CATALOG
} = {}) {
  const budget = Math.max(0, Math.round(Number(targetBudget) || 0))
  const catalog = getCalculatorMaterials(materialsCatalog)

  // Helper to get ordered tier options (economy -> standard -> super_lux) for a category
  function getCategoryTiers(catKey) {
    const items = catalog.filter(m => m.category === catKey)
    return TIER_ORDER
      .map(tier => items.find(m => m.tier === tier))
      .filter(Boolean)
  }

  // 1. Baseline Economy plan (while respecting any explicitly locked selections)
  const baselineSelections = {}
  for (const cat of CATEGORIES) {
    if (lockedSelections[cat.key]) {
      baselineSelections[cat.key] = lockedSelections[cat.key]
    } else {
      const tiers = getCategoryTiers(cat.key)
      if (tiers[0]) baselineSelections[cat.key] = tiers[0].slug
    }
  }

  const economyWithLocksEst = calculateEstimate({
    apartment,
    packageKey: 'economy',
    selections: baselineSelections,
    contingencyPct,
    includeLabour,
    materialsCatalog
  })

  // Pure Economy minimum (even without locks) for reference
  const pureEconomyEst = calculateEstimate({
    apartment,
    packageKey: 'economy',
    contingencyPct,
    includeLabour,
    materialsCatalog
  })

  const isBelowMinimum = budget < economyWithLocksEst.grandTotal

  const activeSelections = { ...baselineSelections }

  // 2. Compute priority-adjusted category weights for unlocked categories
  const prioritySet = new Set(priorityCategories || [])
  const unlockedCats = CATEGORIES.filter(c => !lockedSelections[c.key])
  const weightedUnlocked = unlockedCats.map(c => ({
    ...c,
    effectiveWeight: c.budgetWeight * (prioritySet.has(c.key) ? 1.45 : 1.0)
  }))

  const totalUnlockedWeight = weightedUnlocked.reduce((s, c) => s + c.effectiveWeight, 0) || 1

  if (!isBelowMinimum) {
    // Available pre-contingency pool after locked categories are accounted for
    const preContingencyTarget = budget / (1 + contingencyPct)
    const lockedPreContSum = CATEGORIES
      .filter(c => Boolean(lockedSelections[c.key]))
      .reduce((sum, c) => {
        const found = economyWithLocksEst.categories.find(ec => ec.key === c.key)
        return sum + (found?.subtotal || 0)
      }, 0)

    const unlockedPool = Math.max(0, preContingencyTarget - lockedPreContSum)

    // First pass: pick highest tier in each unlocked category that fits its weighted share
    for (const cat of weightedUnlocked) {
      const share = unlockedPool * (cat.effectiveWeight / totalUnlockedWeight)
      const tiers = getCategoryTiers(cat.key)
      let chosenSlug = tiers[0]?.slug

      for (const candidate of tiers) {
        const probeEst = calculateEstimate({
          apartment,
          packageKey: 'economy',
          selections: { ...activeSelections, [cat.key]: candidate.slug },
          contingencyPct,
          includeLabour,
          materialsCatalog
        })
        const catCost = probeEst.categories.find(c => c.key === cat.key)?.subtotal || 0
        if (catCost <= share && probeEst.grandTotal <= budget) {
          chosenSlug = candidate.slug
        }
      }
      if (chosenSlug) {
        activeSelections[cat.key] = chosenSlug
      }
    }

    // Second pass: redistribute leftover budget greedily (priorities first, then highest weight)
    const upgradeOrder = [...weightedUnlocked].sort((a, b) => {
      const aPrio = prioritySet.has(a.key) ? 1 : 0
      const bPrio = prioritySet.has(b.key) ? 1 : 0
      if (bPrio !== aPrio) return bPrio - aPrio
      return b.effectiveWeight - a.effectiveWeight
    })

    let improved = true
    while (improved) {
      improved = false
      for (const cat of upgradeOrder) {
        const tiers = getCategoryTiers(cat.key)
        const curIdx = tiers.findIndex(m => m.slug === activeSelections[cat.key])
        if (curIdx >= 0 && curIdx < tiers.length - 1) {
          const nextMaterial = tiers[curIdx + 1]
          const nextEst = calculateEstimate({
            apartment,
            packageKey: 'standard',
            selections: { ...activeSelections, [cat.key]: nextMaterial.slug },
            contingencyPct,
            includeLabour,
            materialsCatalog
          })
          if (nextEst.grandTotal <= budget) {
            activeSelections[cat.key] = nextMaterial.slug
            improved = true
          }
        }
      }
    }
  }

  const plannedEstimate = calculateEstimate({
    apartment,
    packageKey: 'standard',
    selections: activeSelections,
    contingencyPct,
    includeLabour,
    materialsCatalog
  })

  const plannedTotal = plannedEstimate.grandTotal
  const remainingBudget = budget - plannedTotal

  // 3. Generate smart trade-off suggestions
  const tradeOffs = []
  for (const downCat of CATEGORIES) {
    if (lockedSelections[downCat.key]) continue
    const downTiers = getCategoryTiers(downCat.key)
    const curDownIdx = downTiers.findIndex(m => m.slug === activeSelections[downCat.key])
    if (curDownIdx <= 0) continue // already Economy

    const lowerMaterial = downTiers[curDownIdx - 1]
    const downEst = calculateEstimate({
      apartment,
      packageKey: 'standard',
      selections: { ...activeSelections, [downCat.key]: lowerMaterial.slug },
      contingencyPct,
      includeLabour,
      materialsCatalog
    })
    const savingsEgp = plannedTotal - downEst.grandTotal
    if (savingsEgp <= 0) continue

    // Find a priority or high-impact category we could upgrade with those savings + remainingBudget
    let pairedUpgrade = null
    for (const upCat of CATEGORIES) {
      if (upCat.key === downCat.key || lockedSelections[upCat.key]) continue
      const upTiers = getCategoryTiers(upCat.key)
      const curUpIdx = upTiers.findIndex(m => m.slug === activeSelections[upCat.key])
      if (curUpIdx < 0 || curUpIdx >= upTiers.length - 1) continue

      const higherMaterial = upTiers[curUpIdx + 1]
      const combinedEst = calculateEstimate({
        apartment,
        packageKey: 'standard',
        selections: {
          ...activeSelections,
          [downCat.key]: lowerMaterial.slug,
          [upCat.key]: higherMaterial.slug
        },
        contingencyPct,
        includeLabour,
        materialsCatalog
      })

      if (combinedEst.grandTotal <= budget || combinedEst.grandTotal < plannedTotal) {
        pairedUpgrade = {
          categoryKey: upCat.key,
          label_en: upCat.label_en,
          label_ar: upCat.label_ar,
          toSlug: higherMaterial.slug,
          toTier: higherMaterial.tier,
          toLabel_en: higherMaterial.label_en,
          toLabel_ar: higherMaterial.label_ar,
          resultingTotal: combinedEst.grandTotal
        }
        break
      }
    }

    const fmtSavings = savingsEgp.toLocaleString('en-US')
    tradeOffs.push({
      id: `trade-${downCat.key}`,
      downgradeCategory: downCat.key,
      downgradeLabel_en: downCat.label_en,
      downgradeLabel_ar: downCat.label_ar,
      fromSlug: activeSelections[downCat.key],
      toSlug: lowerMaterial.slug,
      toLabel_en: lowerMaterial.label_en,
      toLabel_ar: lowerMaterial.label_ar,
      savingsEgp,
      upgrade: pairedUpgrade,
      nextSelections: pairedUpgrade
        ? {
            ...activeSelections,
            [downCat.key]: lowerMaterial.slug,
            [pairedUpgrade.categoryKey]: pairedUpgrade.toSlug
          }
        : {
            ...activeSelections,
            [downCat.key]: lowerMaterial.slug
          },
      message_en: pairedUpgrade
        ? `Downgrade ${downCat.label_en} one tier to save ${fmtSavings} EGP and upgrade ${pairedUpgrade.label_en}.`
        : `Downgrade ${downCat.label_en} one tier to free up ${fmtSavings} EGP in cushion.`,
      message_ar: pairedUpgrade
        ? `خفّض بند ${downCat.label_ar} درجة واحدة لتوفير ${fmtSavings} ج.م وترقية بند ${pairedUpgrade.label_ar}.`
        : `خفّض بند ${downCat.label_ar} درجة واحدة لتوفير ${fmtSavings} ج.م ضمن الميزانية.`
    })
  }

  return {
    targetBudget: budget,
    plannedTotal,
    remainingBudget,
    minimumEconomyTotal: pureEconomyEst.grandTotal,
    isBelowMinimum,
    selections: activeSelections,
    lockedSelections: { ...lockedSelections },
    priorityCategories: [...prioritySet],
    estimate: plannedEstimate,
    tradeOffs: tradeOffs.slice(0, 3)
  }
}
