import { getServerSupabase, listMemoryEstimates } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const supabase = getServerSupabase(event)
  const query = getQuery(event)
  const userId = query.userId || null

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        return { estimates: data, source: 'supabase' }
      }
    } catch {
      // Fallback to seeded memory store
    }
  }

  return {
    estimates: listMemoryEstimates(),
    source: 'memory'
  }
})
