import { getServerSupabase, getSharedSnapshot } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing share token' })
  }

  // Check memory / seeded share snapshots first (handles demo-ts-2408, demo-ts-2409, demo-ts-2410 & newly created shares)
  const localMatch = getSharedSnapshot(token)
  if (localMatch) {
    return { record: localMatch, source: 'memory' }
  }

  const supabase = getServerSupabase(event)
  if (supabase) {
    try {
      const { data: link } = await supabase
        .from('shared_links')
        .select('token, is_active, estimates(*)')
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle()

      if (link?.estimates?.snapshot_json) {
        return { record: link.estimates.snapshot_json, source: 'supabase' }
      }
    } catch {
      // ignore
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'Shared estimate not found or expired' })
})
