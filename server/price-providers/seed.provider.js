import { MATERIALS_CATALOG } from '~/utils/calc/catalog.js'

export const seedProvider = {
  name: 'seed',
  async fetchPrices() {
    const now = new Date().toISOString()
    return MATERIALS_CATALOG.map(m => ({
      slug: m.slug,
      price: Number(m.price),
      min_price: Number(m.min_price || Math.round(m.price * 0.9)),
      max_price: Number(m.max_price || Math.round(m.price * 1.12)),
      unit: m.unit,
      source: 'seed',
      fetched_at: m.fetched_at || now
    }))
  }
}
