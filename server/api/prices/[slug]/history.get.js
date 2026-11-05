import { getMemoryMaterials } from '../../../utils/db.js'
import { generateMaterialHistory } from '~/utils/calc/history.js'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const range = String(query.range || '6M').toUpperCase()

  const { materials, lastUpdatedAt } = getMemoryMaterials()
  const material = materials.find(m => m.slug === slug)

  if (!material) {
    throw createError({ statusCode: 404, statusMessage: `Material '${slug}' not found` })
  }

  const days = range === '1M' ? 30 : range === '3M' ? 90 : range === '1Y' ? 365 : 180
  const points = generateMaterialHistory(material, days)
  const values = points.map(p => p.value)
  const low6m = Math.min(...values)
  const high6m = Math.max(...values)

  return {
    material,
    range,
    lastUpdatedAt,
    points,
    stats: {
      low: low6m,
      high: high6m,
      current: material.price,
      change30d: material.change_30d
    }
  }
})
