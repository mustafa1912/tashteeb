import { getServerSupabase, saveSharedSnapshot, getEstimateRecordById } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const record = body?.record || (body?.estimateId ? getEstimateRecordById(body.estimateId) : null)

  if (!record) {
    throw createError({ statusCode: 400, statusMessage: 'Estimate record is required to create share link' })
  }

  const token =
    record.shareToken ||
    body?.token ||
    `sh-${record.id}-${Math.random().toString(36).slice(2, 8)}`

  const snapshot = {
    ...record,
    shareToken: token
  }

  saveSharedSnapshot(token, snapshot)

  const supabase = getServerSupabase(event)
  if (supabase && record.uuid) {
    try {
      await supabase.from('shared_links').upsert({
        estimate_id: record.uuid,
        token,
        is_active: true
      }, { onConflict: 'token' })
    } catch {
      // Fallback handled in memoryShares
    }
  }

  return {
    ok: true,
    token,
    shareUrl: `/s/${token}`
  }
})
