import { getMemoryMaterials } from '../../utils/db.js'

export default defineEventHandler(() => {
  const { materials, lastUpdatedAt } = getMemoryMaterials()

  const risers = [...materials]
    .filter(m => m.change_30d > 0)
    .sort((a, b) => b.change_30d - a.change_30d)
    .slice(0, 5)

  const fallers = [...materials]
    .filter(m => m.change_30d < 0)
    .sort((a, b) => a.change_30d - b.change_30d)
    .slice(0, 5)

  return {
    lastUpdatedAt,
    risers,
    fallers
  }
})
