import { getServerSupabase, upsertEstimateRecord } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || !body.record?.id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing estimate record payload' })
  }

  const record = body.record
  const userId = body.userId || null

  // Always cache in server memory so PDF/share routes can read it immediately
  upsertEstimateRecord(record)

  const supabase = getServerSupabase(event)
  if (supabase && userId) {
    try {
      const calc = record.computed || {}
      await supabase.from('estimates').upsert({
        id: record.uuid || undefined,
        ref_code: record.refCode || `#${record.id.toUpperCase()}`,
        user_id: userId,
        title: record.title,
        status: record.status || 'ready',
        unit_type: record.input?.apartment?.unitType || 'apartment',
        area_m2: record.input?.apartment?.area || 120,
        governorate: record.input?.apartment?.governorate || 'cairo',
        rooms: record.input?.apartment || {},
        package_level: record.input?.packageKey || 'standard',
        selections: record.input?.selections || {},
        extras: record.input?.extras || {},
        contingency_pct: record.input?.contingencyPct ?? 0.12,
        include_labour: record.input?.includeLabour ?? true,
        materials_subtotal: calc.materialsTotal || 0,
        labour_subtotal: calc.labourTotal || 0,
        contingency_amount: calc.contingencyAmount || 0,
        grand_total: calc.grandTotal || 0,
        duration_weeks: calc.timeline?.totalWeeks || 12,
        snapshot_json: record,
        updated_at: new Date().toISOString()
      })
      return { ok: true, id: record.id, source: 'supabase' }
    } catch {
      // Keep memory fallback
    }
  }

  return { ok: true, id: record.id, source: 'memory' }
})
