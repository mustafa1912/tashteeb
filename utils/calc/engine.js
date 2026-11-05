/**
 * Main Tashteeb Apartment Finishing Calculation Engine.
 * Pure JS — deterministic, integer-exact row math:
 *   purchased_qty * unit_price + labour === subtotal
 *   sum(category.subtotal) === materialsTotal + labourTotal
 *   materialsTotal + labourTotal + contingencyAmount === grandTotal
 */
import {
  CATEGORIES,
  PACKAGES,
  EXTRAS_CATALOG,
  getGovernorateFactor
} from './config.js'
import {
  computeApartmentAreas,
  resolveCategoryBasisQty,
  calcPurchaseQuantity,
  calcPaintBuckets
} from './quantities.js'
import { buildConstructionTimeline } from './timeline.js'
import { MATERIALS_CATALOG, getDefaultMaterialForCategory } from './catalog.js'

export function checkPriceDeviation(originalPrice, usedPrice) {
  const orig = Number(originalPrice) || 0
  const used = Number(usedPrice) || 0
  if (orig <= 0) {
    return {
      isExtremeLow: false,
      isExtremeHigh: false,
      hasWarning: false,
      ratio: 1,
      absDiff: 0,
      pctDiff: 0
    }
  }
  const ratio = used / orig
  const absDiff = used - orig
  const pctDiff = ((used - orig) / orig) * 100
  const isExtremeLow = ratio < 0.5
  const isExtremeHigh = ratio > 2.0
  return {
    isExtremeLow,
    isExtremeHigh,
    hasWarning: isExtremeLow || isExtremeHigh,
    ratio: Number(ratio.toFixed(3)),
    absDiff: Math.round(absDiff),
    pctDiff: Number(pctDiff.toFixed(1))
  }
}

export function calculateEstimate(input = {}) {
  const apartment = {
    unitType: input.apartment?.unitType || 'apartment',
    area: Number(input.apartment?.area) || 120,
    governorate: input.apartment?.governorate || 'cairo',
    bedrooms: Number(input.apartment?.bedrooms ?? 3),
    bathrooms: Number(input.apartment?.bathrooms ?? 2),
    kitchens: Number(input.apartment?.kitchens ?? 1),
    reception: Number(input.apartment?.reception ?? 2),
    balconies: Number(input.apartment?.balconies ?? 2)
  }

  const packageKey = PACKAGES[input.packageKey] ? input.packageKey : 'standard'
  const selections = input.selections || {}
  const overrides = input.overrides || {}
  const extrasKeys = Array.isArray(input.extras) ? input.extras : []
  const contingencyPct = Number.isFinite(Number(input.contingencyPct))
    ? Math.max(0, Math.min(0.35, Number(input.contingencyPct)))
    : 0.12
  const includeLabour = input.includeLabour !== false
  const catalog = Array.isArray(input.materialsCatalog) && input.materialsCatalog.length
    ? input.materialsCatalog
    : MATERIALS_CATALOG

  const areas = computeApartmentAreas(apartment)
  const govFactor = getGovernorateFactor(apartment.governorate)

  const categories = []
  const allItems = []
  const editedItems = []

  for (const cat of CATEGORIES) {
    const requestedSlug = selections[cat.key]
    const material =
      (requestedSlug && catalog.find(m => m.slug === requestedSlug)) ||
      getDefaultMaterialForCategory(cat.key, packageKey, catalog)

    if (!material) continue

    const basisQty = resolveCategoryBasisQty(cat.key, areas, apartment)
    const purchasedQty =
      material.calc_mode === 'paint_buckets'
        ? calcPaintBuckets({
            wallArea: basisQty,
            coveragePerBucket: material.coverage_per_unit,
            wastePct: material.waste_pct
          })
        : calcPurchaseQuantity({
            neededQty: basisQty,
            wastePct: material.waste_pct,
            coveragePerUnit: material.coverage_per_unit
          })

    const marketBasePrice = Math.round(material.price * govFactor)
    const rawOverride = overrides[material.slug] || overrides[cat.key] || null
    const hasOverrideValue =
      rawOverride &&
      rawOverride.used_price !== undefined &&
      rawOverride.used_price !== null &&
      rawOverride.used_price !== '' &&
      Number.isFinite(Number(rawOverride.used_price))

    const usedBasePrice = hasOverrideValue
      ? Math.max(1, Math.round(Number(rawOverride.used_price)))
      : marketBasePrice
    const isOverridden = hasOverrideValue && usedBasePrice !== marketBasePrice

    const usesCoveragePack =
      material.calc_mode !== 'paint_buckets' &&
      Number(material.coverage_per_unit) > 0 &&
      Number(material.coverage_per_unit) !== 1

    const originalUnitPrice = usesCoveragePack
      ? Math.round(marketBasePrice * material.coverage_per_unit)
      : marketBasePrice

    const unitPrice = usesCoveragePack
      ? Math.round(usedBasePrice * material.coverage_per_unit)
      : usedBasePrice

    const materialCost = purchasedQty * unitPrice
    const labourUnitRate = Math.round((material.labour_price || 0) * govFactor)
    const labourCost = includeLabour ? Math.round(basisQty * labourUnitRate) : 0
    const subtotal = materialCost + labourCost

    const deviation = checkPriceDeviation(marketBasePrice, usedBasePrice)
    const overrideInfo = isOverridden
      ? {
          is_overridden: true,
          original_price: marketBasePrice,
          used_price: usedBasePrice,
          original_unit_price: originalUnitPrice,
          used_unit_price: unitPrice,
          unit: material.unit,
          unit_ar: material.unit_ar || material.unit,
          reason: rawOverride.reason || '',
          deviation,
          note_en: `Price edited from ${marketBasePrice.toLocaleString('en-US')} EGP/${material.unit} to ${usedBasePrice.toLocaleString('en-US')} EGP/${material.unit}`,
          note_ar: `تم تعديل السعر من ${marketBasePrice.toLocaleString('en-US')} ج.م/${material.unit_ar || material.unit} إلى ${usedBasePrice.toLocaleString('en-US')} ج.م/${material.unit_ar || material.unit}`
        }
      : null

    const lineItem = {
      id: `${cat.key}-${material.slug}`,
      category: cat.key,
      category_label_en: cat.label_en,
      category_label_ar: cat.label_ar,
      slug: material.slug,
      tier: material.tier,
      label_en: material.label_en,
      label_ar: material.label_ar,
      brand: material.brand,
      unit: material.unit,
      unit_ar: material.unit_ar || material.unit,
      sale_unit: material.sale_unit,
      sale_unit_ar: material.sale_unit_ar || material.sale_unit,
      coverage_per_unit: material.coverage_per_unit,
      waste_pct: material.waste_pct,
      needed_qty: Number(basisQty.toFixed(1)),
      purchased_qty: purchasedQty,
      market_base_price: marketBasePrice,
      used_base_price: usedBasePrice,
      min_price: Math.round((material.min_price || material.price * 0.9) * govFactor),
      max_price: Math.round((material.max_price || material.price * 1.12) * govFactor),
      original_unit_price: originalUnitPrice,
      unit_price: unitPrice,
      material_cost: materialCost,
      labour: labourCost,
      subtotal,
      change_30d: material.change_30d,
      fetched_at: material.fetched_at,
      store_tip_en: material.store_tip_en,
      store_tip_ar: material.store_tip_ar,
      override: overrideInfo
    }

    if (overrideInfo) {
      editedItems.push(lineItem)
    }

    allItems.push(lineItem)
    categories.push({
      key: cat.key,
      label_en: cat.label_en,
      label_ar: cat.label_ar,
      items: [lineItem],
      materials_subtotal: materialCost,
      labour_subtotal: labourCost,
      subtotal
    })
  }

  // Optional Step 4 extras
  const selectedExtraItems = []
  for (const extraKey of extrasKeys) {
    const spec = EXTRAS_CATALOG.find(e => e.key === extraKey)
    if (!spec) continue
    const qty = spec.qtyFromApartment(apartment)
    const uPrice = Math.round(spec.unit_price * govFactor)
    const matCost = qty * uPrice
    const labCost = includeLabour ? qty * Math.round(spec.labour_price * govFactor) : 0
    const sub = matCost + labCost

    const extraLine = {
      id: `extra-${spec.key}`,
      category: 'extras',
      category_label_en: 'Optional extras',
      category_label_ar: 'إضافات اختيارية',
      slug: spec.key,
      tier: packageKey,
      label_en: spec.label_en,
      label_ar: spec.label_ar,
      brand: 'Optional Upgrade',
      unit: spec.sale_unit,
      unit_ar: spec.sale_unit_ar,
      sale_unit: spec.sale_unit,
      sale_unit_ar: spec.sale_unit_ar,
      coverage_per_unit: 1,
      waste_pct: 0,
      needed_qty: qty,
      purchased_qty: qty,
      market_base_price: uPrice,
      used_base_price: uPrice,
      min_price: Math.round(uPrice * 0.9),
      max_price: Math.round(uPrice * 1.1),
      original_unit_price: uPrice,
      unit_price: uPrice,
      material_cost: matCost,
      labour: labCost,
      subtotal: sub,
      change_30d: 0,
      fetched_at: catalog[0]?.fetched_at || new Date().toISOString(),
      store_tip_en: spec.desc_en,
      store_tip_ar: spec.desc_ar,
      override: null
    }
    selectedExtraItems.push(extraLine)
    allItems.push(extraLine)
  }

  if (selectedExtraItems.length > 0) {
    const extMat = selectedExtraItems.reduce((s, i) => s + i.material_cost, 0)
    const extLab = selectedExtraItems.reduce((s, i) => s + i.labour, 0)
    categories.push({
      key: 'extras',
      label_en: 'Optional extras',
      label_ar: 'إضافات اختيارية',
      items: selectedExtraItems,
      materials_subtotal: extMat,
      labour_subtotal: extLab,
      subtotal: extMat + extLab
    })
  }

  const materialsTotal = categories.reduce((sum, c) => sum + c.materials_subtotal, 0)
  const labourTotal = categories.reduce((sum, c) => sum + c.labour_subtotal, 0)
  const baseCost = materialsTotal + labourTotal
  const contingencyAmount = Math.round(baseCost * contingencyPct)
  const grandTotal = baseCost + contingencyAmount

  const rangeMin = Math.round((grandTotal * 0.92) / 100) * 100
  const rangeMax = Math.round((grandTotal * 1.08) / 100) * 100
  const costPerSqm = Math.round(grandTotal / Math.max(1, areas.floorArea))

  const timeline = buildConstructionTimeline({
    area: apartment.area,
    unitType: apartment.unitType,
    extras: extrasKeys
  })

  // Donut breakdown segments summing identically to grandTotal
  const donutSegments = [
    ...categories.map((cat, idx) => ({
      key: cat.key,
      label_en: cat.label_en,
      label_ar: cat.label_ar,
      value: cat.subtotal,
      colorIndex: idx % 6
    })),
    ...(contingencyAmount > 0
      ? [
          {
            key: 'contingency',
            label_en: `Contingency (${Math.round(contingencyPct * 100)}%)`,
            label_ar: `احتياطي طوارئ (${Math.round(contingencyPct * 100)}%)`,
            value: contingencyAmount,
            colorIndex: 6
          }
        ]
      : [])
  ]

  return {
    apartment,
    packageKey,
    governorateFactor: govFactor,
    contingencyPct,
    includeLabour,
    areas,
    categories,
    items: allItems,
    editedItems,
    editedCount: editedItems.length,
    materialsTotal,
    labourTotal,
    baseCost,
    contingencyAmount,
    grandTotal,
    rangeMin,
    rangeMax,
    costPerSqm,
    donutSegments,
    timeline
  }
}
