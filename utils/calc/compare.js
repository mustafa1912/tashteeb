/**
 * Package & Saved Estimate Comparison Engine.
 * Runs or accepts two estimates, diffs every category & line item (EGP and %),
 * identifies the biggest gap, and generates a clear insight sentence.
 */
import { PACKAGES } from './config.js'
import { calculateEstimate } from './engine.js'

export function compareEstimates(estA, estB, locale = 'en') {
  const totalDiffEgp = estB.grandTotal - estA.grandTotal
  const totalDiffPct = estA.grandTotal > 0
    ? Number(((totalDiffEgp / estA.grandTotal) * 100).toFixed(1))
    : 0

  const allCategoryKeys = Array.from(
    new Set([
      ...estA.categories.map(c => c.key),
      ...estB.categories.map(c => c.key)
    ])
  )

  const categoryDiffs = allCategoryKeys.map((key) => {
    const catA = estA.categories.find(c => c.key === key)
    const catB = estB.categories.find(c => c.key === key)
    const subA = catA?.subtotal || 0
    const subB = catB?.subtotal || 0
    const diffEgp = subB - subA
    const diffPct = subA > 0 ? Number(((diffEgp / subA) * 100).toFixed(1)) : (subB > 0 ? 100 : 0)

    return {
      key,
      label_en: catB?.label_en || catA?.label_en || key,
      label_ar: catB?.label_ar || catA?.label_ar || key,
      subtotalA: subA,
      subtotalB: subB,
      diffEgp,
      diffPct,
      itemA: catA?.items?.[0] || null,
      itemB: catB?.items?.[0] || null
    }
  })

  // Biggest absolute gap category
  const biggestGap = categoryDiffs.reduce(
    (best, cur) => (Math.abs(cur.diffEgp) > Math.abs(best?.diffEgp || 0) ? cur : best),
    categoryDiffs[0] || null
  )

  const nameBEn = estB.title || PACKAGES[estB.packageKey]?.label_en || 'Option B'
  const nameBAr = estB.title_ar || PACKAGES[estB.packageKey]?.label_ar || 'الخيار الثاني'
  const absDiffFmt = Math.abs(totalDiffEgp).toLocaleString('en-US')
  const signPct = totalDiffPct >= 0 ? `+${totalDiffPct}%` : `${totalDiffPct}%`

  let summaryEn = ''
  let summaryAr = ''

  if (totalDiffEgp === 0) {
    summaryEn = 'Both options result in the exact same total cost.'
    summaryAr = 'الخياران يعطيان نفس التكلفة الإجمالية تماماً.'
  } else {
    const moreOrLessEn = totalDiffEgp > 0 ? 'more' : 'less'
    const moreOrLessAr = totalDiffEgp > 0 ? 'يزيد بمقدار' : 'يوفر مقدار'
    const gapLabelEn = biggestGap ? biggestGap.label_en : 'materials'
    const gapLabelAr = biggestGap ? biggestGap.label_ar : 'الخامات'

    summaryEn = `${nameBEn} costs ${absDiffFmt} EGP ${moreOrLessEn} (${signPct}), mostly in ${gapLabelEn}.`
    summaryAr = `${nameBAr} ${moreOrLessAr} ${absDiffFmt} ج.م (${signPct})، ويتركز الفارق الأكبر في ${gapLabelAr}.`
  }

  return {
    estA,
    estB,
    totalDiffEgp,
    totalDiffPct,
    materialsDiffEgp: estB.materialsTotal - estA.materialsTotal,
    labourDiffEgp: estB.labourTotal - estA.labourTotal,
    contingencyDiffEgp: estB.contingencyAmount - estA.contingencyAmount,
    costPerSqmDiff: estB.costPerSqm - estA.costPerSqm,
    weeksDiff: (estB.timeline?.totalWeeks || 0) - (estA.timeline?.totalWeeks || 0),
    categoryDiffs,
    biggestGap,
    summarySentence: locale === 'ar' ? summaryAr : summaryEn,
    summary_en: summaryEn,
    summary_ar: summaryAr
  }
}

export function comparePackages({
  apartment,
  packageA = 'standard',
  packageB = 'super_lux',
  overrides = {},
  extras = [],
  contingencyPct = 0.12,
  includeLabour = true,
  materialsCatalog,
  locale = 'en'
} = {}) {
  const estA = calculateEstimate({
    apartment,
    packageKey: packageA,
    overrides,
    extras,
    contingencyPct,
    includeLabour,
    materialsCatalog
  })

  const estB = calculateEstimate({
    apartment,
    packageKey: packageB,
    overrides,
    extras,
    contingencyPct,
    includeLabour,
    materialsCatalog
  })

  return compareEstimates(estA, estB, locale)
}
