/**
 * Shared formatting utilities for Tashteeb (EN + AR).
 * Enforces Western digits (1,234) with thousands separators in both locales,
 * and appends 'EGP' in English or 'ج.م' in Arabic.
 */

const intFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
})

const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1
})

export function formatNumber(value, decimals = 0) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0'
  return decimals > 0 ? decimalFormatter.format(num) : intFormatter.format(Math.round(num))
}

export function formatCurrency(value, locale = 'en') {
  const formatted = formatNumber(value, 0)
  const unit = locale === 'ar' ? 'ج.م' : 'EGP'
  return `${formatted} ${unit}`
}

export function currencySymbol(locale = 'en') {
  return locale === 'ar' ? 'ج.م' : 'EGP'
}

export function formatCompactK(value) {
  const num = Number(value)
  if (!Number.isFinite(num) || num === 0) return '0'
  if (Math.abs(num) >= 1_000_000) {
    const m = (num / 1_000_000).toFixed(2).replace(/\.?0+$/, '')
    return `${m}M`
  }
  if (Math.abs(num) >= 1_000) {
    return `${Math.round(num / 1_000)}K`
  }
  return formatNumber(num)
}

export function formatPercentChange(pct, includeSign = true) {
  const num = Number(pct)
  if (!Number.isFinite(num)) return '0.0%'
  const abs = Math.abs(num).toFixed(1)
  if (!includeSign) return `${abs}%`
  if (num > 0) return `+${abs}%`
  if (num < 0) return `−${abs}%`
  return `0.0%`
}

export function formatDateDisplay(dateInput, locale = 'en') {
  if (!dateInput) return ''
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (Number.isNaN(date.getTime())) return String(dateInput)
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export function formatMonthYear(dateInput, locale = 'en') {
  if (!dateInput) return ''
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (Number.isNaN(date.getTime())) return String(dateInput)
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    month: 'short',
    year: '2-digit'
  }).format(date)
}

const CATEGORY_MAP = {
  floors: { en: 'Floors', ar: 'الأرضيات والسيراميك' },
  kitchen: { en: 'Kitchen', ar: 'المطبخ' },
  bathrooms: { en: 'Bathrooms & sanitary', ar: 'الحمامات والصحي' },
  walls: { en: 'Walls & paint', ar: 'الحوائط والدهانات' },
  electrical: { en: 'Electrical', ar: 'الكهرباء والتأسيس' },
  plumbing: { en: 'Plumbing', ar: 'السباكة والعزل' },
  doors: { en: 'Doors & windows', ar: 'الأبواب والشبابيك' },
  ceilings: { en: 'Ceilings', ar: 'الأسقف والجبس بورد' },
  raw_materials: { en: 'Raw construction materials', ar: 'الخامات ومواد البناء الأولية' },
  commodities: { en: 'Raw commodities', ar: 'مواد البناء الأساسية' },
  extras: { en: 'Optional additions', ar: 'إضافات واختيارات خاصة' }
}

export function formatCategoryLabel(catKey, locale = 'en') {
  if (!catKey) return ''
  const cleanKey = String(catKey).trim()
  const found = CATEGORY_MAP[cleanKey]
  if (found) {
    return locale === 'ar' ? found.ar : found.en
  }
  return cleanKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function formatWasteCalculation(item, locale = 'en') {
  if (!item) return ''
  const needed = item.needed_qty || 0
  const wastePct = Math.round((item.waste_pct || 0) * 100)
  const gross = Math.round(needed * (1 + (item.waste_pct || 0)) * 10) / 10
  const unit = locale === 'ar' ? (item.unit_ar || item.unit || '') : (item.unit || '')
  const saleUnit = locale === 'ar' ? (item.sale_unit_ar || item.sale_unit || '') : (item.sale_unit || '')
  const wasteWord = locale === 'ar' ? 'هالك' : 'waste'

  if (wastePct <= 0) {
    return `${needed} ${unit} → ${item.purchased_qty} ${saleUnit}`
  }
  return `${needed} ${unit} + ${wastePct}% ${wasteWord} = ${gross} ${unit} → ${item.purchased_qty} ${saleUnit}`
}
