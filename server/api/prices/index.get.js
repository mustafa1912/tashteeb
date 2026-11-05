import { getMemoryMaterials } from '../../utils/db.js'
import { getSparklineSeries } from '~/utils/calc/history.js'

export default defineEventHandler(() => {
  const { materials, lastUpdatedAt } = getMemoryMaterials()
  return {
    lastUpdatedAt,
    count: materials.length,
    materials: materials.map(m => ({
      ...m,
      sparkline: getSparklineSeries(m, 12)
    }))
  }
})
