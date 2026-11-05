import { defineStore } from 'pinia'
import { MATERIALS_CATALOG, getCalculatorMaterials } from '~/utils/calc/catalog.js'
import { getGovernorateFactor } from '~/utils/calc/config.js'
import { generateMaterialHistory, getSparklineSeries, getMarketIndexSeries } from '~/utils/calc/history.js'

const WATCHLIST_KEY = 'tashteeb_watchlist_v1'

export const useMarketStore = defineStore('market', () => {
  const materials = ref([...MATERIALS_CATALOG])
  const selectedGovernorate = ref('cairo')
  const watchlistSlugs = ref(['porcelain-60x60-cleopatra', 'jotun-fenomastic-my-home-rich-matt-18l', 'portland-cement-cem-i-42-5n-ton'])
  const hydrated = ref(false)
  const lastUpdatedAt = ref(MATERIALS_CATALOG[0]?.fetched_at || '2026-11-04T06:00:00+02:00')

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) watchlistSlugs.value = parsed
      }
    } catch {
      // ignore storage errors
    } finally {
      hydrated.value = true
    }
  }

  function persistWatchlist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlistSlugs.value))
    } catch {
      // ignore
    }
  }

  const calculatorMaterials = computed(() => getCalculatorMaterials(materials.value))

  const adjustedMaterials = computed(() => {
    const factor = getGovernorateFactor(selectedGovernorate.value)
    return materials.value.map(m => ({
      ...m,
      price: Math.round(m.price * factor),
      min_price: Math.round((m.min_price || m.price * 0.9) * factor),
      max_price: Math.round((m.max_price || m.price * 1.12) * factor),
      sparkline: getSparklineSeries(m, 12)
    }))
  })

  const watchlistItems = computed(() =>
    adjustedMaterials.value.filter(m => watchlistSlugs.value.includes(m.slug))
  )

  const biggestRisers = computed(() =>
    [...adjustedMaterials.value]
      .filter(m => m.change_30d > 0)
      .sort((a, b) => b.change_30d - a.change_30d)
      .slice(0, 4)
  )

  const biggestFallers = computed(() =>
    [...adjustedMaterials.value]
      .filter(m => m.change_30d < 0)
      .sort((a, b) => a.change_30d - b.change_30d)
      .slice(0, 4)
  )

  function getBySlug(slug) {
    return materials.value.find(m => m.slug === slug) || null
  }

  function getHistory(slug, range = '6M') {
    const mat = getBySlug(slug)
    if (!mat) return []
    const days = range === '1M' ? 30 : range === '3M' ? 90 : range === '1Y' ? 365 : 180
    return generateMaterialHistory(mat, days)
  }

  function getIndexSeries(range = '6M') {
    return getMarketIndexSeries(range)
  }

  function isWatched(slug) {
    return watchlistSlugs.value.includes(slug)
  }

  function toggleWatchlist(slug) {
    hydrate()
    if (watchlistSlugs.value.includes(slug)) {
      watchlistSlugs.value = watchlistSlugs.value.filter(s => s !== slug)
    } else {
      watchlistSlugs.value.push(slug)
    }
    persistWatchlist()
    return watchlistSlugs.value.includes(slug)
  }

  async function refreshFromApi() {
    try {
      const res = await $fetch('/api/prices')
      if (Array.isArray(res?.materials) && res.materials.length) {
        materials.value = res.materials
        if (res.lastUpdatedAt) lastUpdatedAt.value = res.lastUpdatedAt
      }
    } catch {
      // Keep local seed catalog seamlessly
    }
  }

  return {
    materials,
    calculatorMaterials,
    adjustedMaterials,
    selectedGovernorate,
    watchlistSlugs,
    watchlistItems,
    biggestRisers,
    biggestFallers,
    lastUpdatedAt,
    hydrate,
    getBySlug,
    getHistory,
    getIndexSeries,
    isWatched,
    toggleWatchlist,
    refreshFromApi
  }
})
