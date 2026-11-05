/**
 * Construction schedule generator with realistic Egyptian crew dependencies.
 * Sequence:
 *   demolition -> plumbing & electrical (parallel) -> plastering ->
 *   gypsum ceilings -> floors -> paint -> doors & fixtures (incl. cleaning)
 */

export function buildConstructionTimeline({ area = 120, unitType = 'apartment', extras = [] } = {}) {
  const sqm = Math.max(40, Number(area) || 120)
  const sizeScale = sqm / 120
  const typeFactor = unitType === 'villa' ? 1.25 : unitType === 'duplex' ? 1.15 : 1.0
  const scale = sizeScale * typeFactor

  const dur = (baseWeeks, minW = 1, maxW = 6) =>
    Math.min(maxW, Math.max(minW, Math.round(baseWeeks * scale)))

  const wDemolition = dur(1.5, 1, 3)
  const wPlumbing = dur(2.5, 2, 4)
  const wElectrical = dur(2.5, 2, 4)
  const wPlastering = dur(2.2, 2, 4)
  const wCeilings = dur(2.0, 1, 4)
  const wFloors = dur(2.5, 2, 5)
  const wPaint = dur(2.2, 2, 4)
  const hasKitchenExtra = Array.isArray(extras) && extras.includes('ready_kitchen')
  const wFixtures = dur(hasKitchenExtra ? 2.5 : 2.0, 2, 4)

  const tasks = []

  // 1. Demolition & site prep
  const s1 = 1
  const e1 = s1 + wDemolition - 1
  tasks.push({
    id: 'demolition',
    label_en: 'Demolition & site prep',
    label_ar: 'التعديلات المعمارية وتجهيز الموقع',
    startWeek: s1,
    endWeek: e1,
    durationWeeks: wDemolition,
    parallel: false
  })

  // 2 & 3. Plumbing & Electrical first-fix (PARALLEL)
  const s2 = e1 + 1
  const ePlumb = s2 + wPlumbing - 1
  const eElec = s2 + wElectrical - 1
  tasks.push({
    id: 'plumbing',
    label_en: 'Plumbing rough-in & waterproofing',
    label_ar: 'تأسيس السباكة والعزل واختبار الكبس',
    startWeek: s2,
    endWeek: ePlumb,
    durationWeeks: wPlumbing,
    parallel: true
  })
  tasks.push({
    id: 'electrical',
    label_en: 'Electrical conduits & wiring',
    label_ar: 'تأسيس خراطيم وسلوك الكهرباء واللوحة',
    startWeek: s2,
    endWeek: eElec,
    durationWeeks: wElectrical,
    parallel: true
  })

  const afterMep = Math.max(ePlumb, eElec)

  // 4. Plastering
  const s4 = afterMep + 1
  const e4 = s4 + wPlastering - 1
  tasks.push({
    id: 'plastering',
    label_en: 'Plastering & wall alignment',
    label_ar: 'المحارة والبؤج والأوتار',
    startWeek: s4,
    endWeek: e4,
    durationWeeks: wPlastering,
    parallel: false
  })

  // 5. Gypsum ceilings
  const s5 = e4 + 1
  const e5 = s5 + wCeilings - 1
  tasks.push({
    id: 'ceilings',
    label_en: 'Gypsum board ceilings & shadow gaps',
    label_ar: 'الجبس بورد وبيوت النور',
    startWeek: s5,
    endWeek: e5,
    durationWeeks: wCeilings,
    parallel: false
  })

  // 6. Floors & wall tiling
  const s6 = e5 + 1
  const e6 = s6 + wFloors - 1
  tasks.push({
    id: 'floors',
    label_en: 'Flooring, porcelain & wet-area tiling',
    label_ar: 'تركيب البورسلين وسيراميك الحمامات والمطبخ',
    startWeek: s6,
    endWeek: e6,
    durationWeeks: wFloors,
    parallel: false
  })

  // 7. Putty, primer & paint
  const s7 = e6 + 1
  const e7 = s7 + wPaint - 1
  tasks.push({
    id: 'paint',
    label_en: 'Putty, primer & final paint coats',
    label_ar: 'سحب المعجون والبطانة والوجه النهائي للدهانات',
    startWeek: s7,
    endWeek: e7,
    durationWeeks: wPaint,
    parallel: false
  })

  // 8. Doors, fixtures & final cleaning
  const s8 = e7 + 1
  const e8 = s8 + wFixtures - 1
  tasks.push({
    id: 'fixtures',
    label_en: 'Doors, sanitary fixtures & final cleaning',
    label_ar: 'تركيب الأبواب والتشطيبات النهائية والنظافة',
    startWeek: s8,
    endWeek: e8,
    durationWeeks: wFixtures,
    parallel: false
  })

  return {
    tasks,
    totalWeeks: e8
  }
}
