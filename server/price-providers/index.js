import { seedProvider } from './seed.provider.js'
import { scraperProvider } from './scraper.provider.js'
import { manualCsvProvider } from './manual-csv.provider.js'
import { getMemoryMaterials, setMemoryMaterials, getServerSupabase } from '../utils/db.js'

function computeMedian(values) {
  const sorted = [...values].filter(v => Number.isFinite(v) && v > 0).sort((a, b) => a - b)
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : Math.round(sorted[mid])
}

/**
 * Runs all registered price providers, aggregates median per material,
 * flags >30% single-day anomalies (`flagged_for_review = true`) without corrupting live rates,
 * and falls back gracefully to the last known snapshot if external feeds fail.
 */
export async function runDailyPricePipeline(event = null, inlineQuotes = []) {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
  const { materials: previousMaterials, lastUpdatedAt: previousSyncAt } = getMemoryMaterials()
  const syncTimestamp = new Date().toISOString()

  try {
    const [seedQuotes, csvQuotes, scrapedQuotes] = await Promise.all([
      seedProvider.fetchPrices(),
      manualCsvProvider.fetchPrices({ csvUrl: config.priceCsvUrl }),
      scraperProvider.fetchPrices()
    ])

    const combined = [...seedQuotes, ...csvQuotes, ...scrapedQuotes, ...inlineQuotes]
    const bySlug = new Map()
    for (const q of combined) {
      if (!q?.slug) continue
      const list = bySlug.get(q.slug) || []
      list.push(q)
      bySlug.set(q.slug, list)
    }

    let flaggedCount = 0
    const nextMaterials = previousMaterials.map((existing) => {
      const quotes = bySlug.get(existing.slug) || []
      if (!quotes.length) return existing

      // Prefer live external quotes (csv / scraper / inline) when present; otherwise use seed baseline
      const externalQuotes = quotes.filter(q => q.source !== 'seed')
      const activePool = externalQuotes.length > 0 ? externalQuotes : quotes

      const candidatePrice = computeMedian(activePool.map(q => q.price))
      if (!candidatePrice) return existing

      const prevPrice = Number(existing.price) || candidatePrice
      const dailyJumpRatio = prevPrice > 0 ? Math.abs(candidatePrice - prevPrice) / prevPrice : 0
      const isAnomaly = dailyJumpRatio > 0.30

      if (isAnomaly) {
        flaggedCount += 1
        return {
          ...existing,
          flagged_for_review: true,
          flagged_candidate_price: candidatePrice,
          last_checked_at: syncTimestamp
        }
      }

      const minCandidate = Math.min(...activePool.map(q => q.min_price || Math.round(q.price * 0.9)))
      const maxCandidate = Math.max(...activePool.map(q => q.max_price || Math.round(q.price * 1.12)))

      return {
        ...existing,
        price: candidatePrice,
        min_price: minCandidate,
        max_price: maxCandidate,
        flagged_for_review: false,
        fetched_at: syncTimestamp
      }
    })

    setMemoryMaterials(nextMaterials, syncTimestamp)

    // Persist daily snapshots to Supabase when configured
    const supabase = event ? getServerSupabase(event) : null
    if (supabase) {
      try {
        const snapshotDate = syncTimestamp.slice(0, 10)
        for (const m of nextMaterials) {
          if (m.uuid) {
            await supabase.from('price_snapshots').upsert({
              material_id: m.uuid,
              governorate: 'all',
              price: m.price,
              min_price: m.min_price,
              max_price: m.max_price,
              source: 'daily_pipeline',
              flagged_for_review: Boolean(m.flagged_for_review),
              snapshot_date: snapshotDate,
              fetched_at: syncTimestamp
            })
          }
        }
      } catch {
        // Keep in-memory state intact
      }
    }

    return {
      ok: true,
      syncedCount: nextMaterials.length,
      flaggedCount,
      syncedAt: syncTimestamp,
      staleFallback: false
    }
  } catch (err) {
    // Graceful fallback to last-known good snapshot
    return {
      ok: false,
      syncedCount: previousMaterials.length,
      flaggedCount: 0,
      syncedAt: previousSyncAt,
      staleFallback: true,
      error: err?.message || 'Provider pipeline error'
    }
  }
}
