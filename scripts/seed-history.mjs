#!/usr/bin/env node
/**
 * Generates 180 days of plausible Egyptian finishing material price history
 * for all catalog materials (and upserts into Supabase `price_snapshots` if env vars are present).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MATERIALS_CATALOG } from '../utils/calc/catalog.js'
import { generateMaterialHistory } from '../utils/calc/history.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(__dirname, '../server/data/seeded-history-meta.json')

const summary = MATERIALS_CATALOG.map((mat) => {
  const series = generateMaterialHistory(mat, 180)
  return {
    slug: mat.slug,
    category: mat.category,
    days: series.length,
    startDate: series[0]?.date,
    endDate: series[series.length - 1]?.date,
    startPrice: series[0]?.value,
    currentPrice: series[series.length - 1]?.value
  }
})

fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: summary.length, items: summary }, null, 2))
console.log(`Seeded 180-day price history for ${summary.length} Egyptian finishing materials -> ${outPath}`)
