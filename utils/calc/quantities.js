/**
 * Pure quantity & geometry calculations for apartment finishing.
 * Enforces ALWAYS Math.ceil() on purchase units so invoices reflect real store purchases.
 */
import { AREA_RULES, ROOM_POINTS_CONFIG } from './config.js'

export function calcPurchaseQuantity({ neededQty, area, wastePct = 0, coveragePerUnit = 1 }) {
  const baseQty = Number(area ?? neededQty) || 0
  if (baseQty <= 0) return 0
  const cov = Number(coveragePerUnit) > 0 ? Number(coveragePerUnit) : 1
  const waste = Math.max(0, Number(wastePct) || 0)
  return Math.ceil((baseQty * (1 + waste)) / cov)
}

export function calcPaintBuckets({
  wallArea,
  coats = AREA_RULES.paintCoats,
  coveragePerBucket = AREA_RULES.paintCoveragePerBucket,
  wastePct = AREA_RULES.paintWastePct
}) {
  const area = Number(wallArea) || 0
  if (area <= 0) return 0
  const numCoats = Math.max(1, Number(coats) || 2)
  const cov = Number(coveragePerBucket) > 0 ? Number(coveragePerBucket) : 110
  const waste = Math.max(0, Number(wastePct) || 0)
  return Math.ceil((area * numCoats * (1 + waste)) / cov)
}

export function computeApartmentAreas(apartment = {}) {
  const floorArea = Math.max(30, Number(apartment.area) || 120)
  const bedrooms = Math.max(0, Number(apartment.bedrooms ?? 3))
  const bathrooms = Math.max(1, Number(apartment.bathrooms ?? 2))
  const kitchens = Math.max(0, Number(apartment.kitchens ?? 1))
  const reception = Math.max(1, Number(apartment.reception ?? 2))
  const balconies = Math.max(0, Number(apartment.balconies ?? 2))

  // Interior room doors + 1 main entrance door
  const doorsCount = Math.max(2, bedrooms + bathrooms + kitchens + 1)
  // Exterior windows + balcony openings
  const windowsCount = Math.max(2, bedrooms + reception + bathrooms + kitchens + balconies)

  const openingsArea =
    doorsCount * AREA_RULES.doorOpeningSqm +
    windowsCount * AREA_RULES.windowOpeningSqm

  const grossWallArea = floorArea * AREA_RULES.ceilingHeight
  // Ensure realistic lower bound even for studio layouts with many openings
  const wallArea = Math.round(Math.max(floorArea * 1.6, grossWallArea - openingsArea) * 10) / 10
  const ceilingArea = floorArea
  const wetWallArea = bathrooms * 22 + kitchens * 16

  const eCfg = ROOM_POINTS_CONFIG.electrical
  const electricalPoints =
    bedrooms * eCfg.bedroom +
    reception * eCfg.reception +
    bathrooms * eCfg.bathroom +
    kitchens * eCfg.kitchen +
    balconies * eCfg.balcony +
    eCfg.corridorBase

  const pCfg = ROOM_POINTS_CONFIG.plumbing
  const plumbingPoints =
    bathrooms * pCfg.bathroom +
    kitchens * pCfg.kitchen

  return {
    floorArea,
    wallArea,
    ceilingArea,
    wetWallArea,
    doorsCount,
    windowsCount,
    openingsArea,
    electricalPoints,
    plumbingPoints
  }
}

export function resolveCategoryBasisQty(categoryKey, areas, apartment = {}) {
  switch (categoryKey) {
    case 'floors':
      return areas.floorArea
    case 'walls':
      return areas.wallArea
    case 'ceilings':
      return areas.ceilingArea
    case 'electrical':
      return areas.electricalPoints
    case 'plumbing':
      return areas.plumbingPoints
    case 'doors':
      return areas.doorsCount
    case 'kitchen':
      return Math.max(1, Number(apartment.kitchens ?? 1))
    case 'bathrooms':
      return Math.max(1, Number(apartment.bathrooms ?? 2))
    default:
      return areas.floorArea
  }
}
