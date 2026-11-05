/**
 * ManualCsvProvider — Fetches daily price updates from a published Google Sheets CSV
 * or internal research CSV (`slug,price,min_price,max_price,unit`).
 */
export function parsePriceCsv(csvText = '') {
  const lines = String(csvText)
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const slugIdx = headers.indexOf('slug')
  const priceIdx = headers.indexOf('price')
  const minIdx = headers.indexOf('min_price')
  const maxIdx = headers.indexOf('max_price')
  const unitIdx = headers.indexOf('unit')

  if (slugIdx === -1 || priceIdx === -1) return []

  const now = new Date().toISOString()
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    const slug = cols[slugIdx]
    const price = Number(cols[priceIdx])
    if (!slug || !Number.isFinite(price) || price <= 0) continue

    rows.push({
      slug,
      price: Math.round(price),
      min_price: minIdx >= 0 && Number(cols[minIdx]) > 0 ? Math.round(Number(cols[minIdx])) : undefined,
      max_price: maxIdx >= 0 && Number(cols[maxIdx]) > 0 ? Math.round(Number(cols[maxIdx])) : undefined,
      unit: unitIdx >= 0 ? cols[unitIdx] : undefined,
      source: 'manual_csv',
      fetched_at: now
    })
  }

  return rows
}

export const manualCsvProvider = {
  name: 'manual_csv',
  async fetchPrices({ csvUrl = '' } = {}) {
    if (!csvUrl) return []
    try {
      const csvText = await $fetch(csvUrl, { responseType: 'text', timeout: 8000 })
      return parsePriceCsv(csvText)
    } catch {
      return []
    }
  }
}
