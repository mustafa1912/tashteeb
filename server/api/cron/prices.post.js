import { runDailyPricePipeline } from '../../price-providers/index.js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const expectedSecret = config.cronSecret

  const headerSecret = getHeader(event, 'x-cron-secret')
  const authHeader = getHeader(event, 'authorization') || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!expectedSecret || (headerSecret !== expectedSecret && bearerToken !== expectedSecret)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: invalid or missing CRON_SECRET'
    })
  }

  const body = await readBody(event).catch(() => ({}))
  const inlineQuotes = Array.isArray(body?.quotes) ? body.quotes : []

  return await runDailyPricePipeline(event, inlineQuotes)
})
