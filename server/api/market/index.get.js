import { getMemoryMaterials } from '../../utils/db.js'
import { getMarketIndexSeries, getSparklineSeries } from '~/utils/calc/history.js'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const range = String(query.range || '6M').toUpperCase()
  const { materials, lastUpdatedAt } = getMemoryMaterials()

  return {
    lastUpdatedAt,
    index: getMarketIndexSeries(range),
    materials: materials.map(m => ({
      ...m,
      sparkline: getSparklineSeries(m, 12)
    }))
  }
})
