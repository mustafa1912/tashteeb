import { getServerSupabase, toggleMemoryWatchlist } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const slug = body?.slug
  const userId = body?.userId || 'guest'

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Material slug is required' })
  }

  const watched = toggleMemoryWatchlist(userId, slug)

  const supabase = getServerSupabase(event)
  if (supabase && body?.userId && body?.materialId) {
    try {
      if (watched) {
        await supabase.from('watchlist').upsert({
          user_id: body.userId,
          material_id: body.materialId
        })
      } else {
        await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', body.userId)
          .eq('material_id', body.materialId)
      }
    } catch {
      // Fallback handled in memory
    }
  }

  return { ok: true, slug, watched }
})
