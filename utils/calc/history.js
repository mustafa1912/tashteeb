/**
 * Deterministic 180-day historical price series generator for Egyptian finishing materials
 * and the composite Tashteeb Market Index.
 */

function hashSlug(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function generateMaterialHistory(material, days = 180) {
  const currentPrice = Number(material?.price) || 100
  const change30d = Number(material?.change_30d) || 0
  const seed = hashSlug(material?.slug || 'tashteeb')

  // Anchor end date to 2026-11-04
  const endDate = new Date('2026-11-04T06:00:00Z')
  const price30dAgo = currentPrice / (1 + change30d / 100)
  // Extrapolate 180d start with gentle Egyptian market drift (~4%–9% over 6M)
  const drift6m = change30d >= 0 ? Math.max(0.045, (change30d / 100) * 2.4) : -0.03
  const price180dAgo = currentPrice / (1 + drift6m)

  const points = []
  for (let i = 0; i < days; i++) {
    const d = new Date(endDate.getTime() - (days - 1 - i) * 86_400_000)
    const isoDate = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    let baseVal
    if (i === days - 1) {
      baseVal = currentPrice
    } else if (i === days - 31) {
      baseVal = price30dAgo
    } else if (i < days - 31) {
      const t = i / Math.max(1, days - 31)
      const wave = Math.sin(t * Math.PI * 3 + (seed % 7)) * currentPrice * 0.012
      baseVal = price180dAgo + (price30dAgo - price180dAgo) * t + wave
    } else {
      const t = (i - (days - 31)) / 30
      const wave = Math.sin(t * Math.PI * 2 + (seed % 5)) * currentPrice * 0.006
      baseVal = price30dAgo + (currentPrice - price30dAgo) * t + wave
    }

    points.push({
      date: isoDate,
      label,
      value: Math.max(1, Math.round(baseVal))
    })
  }

  return points
}

export function getSparklineSeries(material, count = 12) {
  const full = generateMaterialHistory(material, 36)
  const step = Math.max(1, Math.floor(full.length / count))
  const out = []
  for (let i = 0; i < full.length; i += step) {
    out.push(full[i].value)
  }
  if (out[out.length - 1] !== material.price) {
    out.push(material.price)
  }
  return out
}

export function getMarketIndexSeries(range = '6M') {
  const fullDays = range === '1M' ? 30 : range === '3M' ? 90 : range === '1Y' ? 365 : 180
  const endDate = new Date('2026-11-04T06:00:00Z')
  const endIndex = 108.4
  const startIndex = range === '1M' ? 106.5 : range === '3M' ? 104.2 : range === '1Y' ? 98.6 : 101.8

  const stepDays = fullDays > 120 ? 6 : fullDays > 45 ? 3 : 1
  const points = []

  for (let dayOffset = fullDays; dayOffset >= 0; dayOffset -= stepDays) {
    const d = new Date(endDate.getTime() - dayOffset * 86_400_000)
    const progress = 1 - dayOffset / fullDays
    const wave = Math.sin(progress * Math.PI * 3.5) * 0.55
    const val = dayOffset === 0 ? endIndex : Number((startIndex + (endIndex - startIndex) * progress + wave).toFixed(1))

    points.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      value: val
    })
  }

  return {
    currentValue: endIndex,
    change30d: 1.8,
    change6m: 6.5,
    baseLabel: 'Jan 2026 = 100',
    points
  }
}
