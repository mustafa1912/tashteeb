/**
 * Dual-mode Server Persistence Layer (Supabase + Local In-Memory/Seed Fallback).
 * Uses Supabase Service/Anon client when SUPABASE_URL is configured, and falls back
 * transparently to the seeded memory store so `npm run dev` works out of the box.
 */
import { createClient } from '@supabase/supabase-js'
import { SEED_ESTIMATES } from '../data/seed-estimates.js'
import { MATERIALS_CATALOG } from '../data/seed-materials.js'

const memoryEstimates = new Map(SEED_ESTIMATES.map(e => [e.id, e]))
const memoryShares = new Map(SEED_ESTIMATES.map(e => [e.shareToken, e]))
const memoryWatchlists = new Map()
let memoryMaterials = [...MATERIALS_CATALOG]
let lastPriceSyncAt = MATERIALS_CATALOG[0]?.fetched_at || '2026-11-04T06:00:00+02:00'

export function getServerSupabase(event) {
  const config = useRuntimeConfig(event)
  const url = config.public?.supabaseUrl
  const key = config.supabaseServiceRoleKey || config.public?.supabaseAnonKey
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false }
  })
}

export function getMemoryMaterials() {
  return {
    materials: memoryMaterials,
    lastUpdatedAt: lastPriceSyncAt
  }
}

export function setMemoryMaterials(updatedList, syncTimestamp) {
  if (Array.isArray(updatedList) && updatedList.length) {
    memoryMaterials = updatedList
  }
  if (syncTimestamp) {
    lastPriceSyncAt = syncTimestamp
  }
}

export function saveSharedSnapshot(token, record) {
  memoryShares.set(token, record)
  if (record?.id) {
    memoryEstimates.set(record.id, record)
  }
  return token
}

export function getSharedSnapshot(token) {
  return memoryShares.get(token) || null
}

export function getEstimateRecordById(id) {
  const norm = String(id || '').toLowerCase()
  for (const [k, val] of memoryEstimates.entries()) {
    if (k.toLowerCase() === norm || val.refCode?.replace('#', '').toLowerCase() === norm) {
      return val
    }
  }
  return null
}

export function upsertEstimateRecord(record) {
  if (!record?.id) return null
  memoryEstimates.set(record.id, record)
  if (record.shareToken) {
    memoryShares.set(record.shareToken, record)
  }
  return record
}

export function listMemoryEstimates() {
  return Array.from(memoryEstimates.values())
}

export function toggleMemoryWatchlist(userId, slug) {
  const key = String(userId || 'guest')
  const set = memoryWatchlists.get(key) || new Set()
  if (set.has(slug)) {
    set.delete(slug)
  } else {
    set.add(slug)
  }
  memoryWatchlists.set(key, set)
  return set.has(slug)
}
