import QRCode from 'qrcode'
import { getEstimateRecordById, getServerSupabase } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig(event)
  const siteUrl = config.public?.siteUrl || 'http://localhost:3000'

  let record = getEstimateRecordById(id)

  if (!record) {
    const supabase = getServerSupabase(event)
    if (supabase) {
      try {
        const { data } = await supabase
          .from('estimates')
          .select('snapshot_json')
          .or(`ref_code.ilike.#${id},id.eq.${id}`)
          .maybeSingle()
        if (data?.snapshot_json) {
          record = data.snapshot_json
        }
      } catch {
        // ignore
      }
    }
  }

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: `Estimate ${id} not found` })
  }

  const shareToken = record.shareToken || `demo-${record.id}`
  const shareUrl = `${siteUrl}/s/${shareToken}`
  let qrDataUrl = ''
  try {
    qrDataUrl = await QRCode.toDataURL(shareUrl, {
      margin: 1,
      width: 112,
      color: {
        dark: '#0F5C6E',
        light: '#FFFFFF'
      }
    })
  } catch {
    qrDataUrl = ''
  }

  return {
    record,
    shareUrl,
    qrDataUrl
  }
})
