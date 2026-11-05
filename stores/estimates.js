import { defineStore } from 'pinia'
import { calculateEstimate } from '~/utils/calc/engine.js'
import { buildSeedEstimates } from '~/utils/calc/seed-projects.js'

const STORAGE_KEY = 'tashteeb_saved_estimates_v1'

export const useEstimatesStore = defineStore('estimates', () => {
  const marketStore = useMarketStore()
  const estimates = ref(buildSeedEstimates())
  const hydrated = ref(false)

  function recomputeRecord(record) {
    const computed = calculateEstimate({
      ...record.input,
      materialsCatalog: marketStore.materials
    })
    return {
      ...record,
      computed
    }
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure canonical seed ts-2408 always exists for direct /estimate/ts-2408 links
          const seeds = buildSeedEstimates()
          const existingIds = new Set(parsed.map(e => e.id))
          const merged = [
            ...parsed.map(recomputeRecord),
            ...seeds.filter(s => !existingIds.has(s.id))
          ]
          estimates.value = merged
        }
      }
    } catch {
      estimates.value = buildSeedEstimates()
    } finally {
      hydrated.value = true
    }
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates.value))
    } catch {
      // ignore storage quota errors
    }
  }

  function syncToServer(record) {
    if (!import.meta.client || !record?.id) return
    const authStore = useAuthStore()
    $fetch('/api/estimates/save', {
      method: 'POST',
      body: {
        record,
        userId: authStore.user?.id || null
      }
    }).catch(() => {})
  }

  function getById(id) {
    const norm = String(id || '').toLowerCase()
    const found = estimates.value.find(
      e => e.id.toLowerCase() === norm || e.refCode?.replace('#', '').toLowerCase() === norm
    )
    return found || null
  }

  function getByShareToken(token) {
    return estimates.value.find(e => e.shareToken === token) || null
  }

  function createOrUpdateFromWizard(wizardStore, status = 'ready') {
    hydrate()
    const input = wizardStore.snapshotInput()
    const computed = calculateEstimate({
      ...input,
      materialsCatalog: marketStore.materials
    })
    const now = new Date().toISOString()

    if (wizardStore.editingEstimateId) {
      const idx = estimates.value.findIndex(e => e.id === wizardStore.editingEstimateId)
      if (idx !== -1) {
        const updated = {
          ...estimates.value[idx],
          title: wizardStore.projectTitle || estimates.value[idx].title,
          status,
          updatedAt: now,
          input,
          computed
        }
        estimates.value.splice(idx, 1, updated)
        persist()
        syncToServer(updated)
        return updated
      }
    }

    const numCode = Math.floor(2411 + Math.random() * 7000)
    const id = `ts-${numCode}`
    const record = {
      id,
      refCode: `#TS-${numCode}`,
      shareToken: `sh-${numCode}-${Math.random().toString(36).slice(2, 7)}`,
      title: wizardStore.projectTitle || `${input.apartment.area} m² apartment`,
      title_ar: wizardStore.projectTitle || `شقة سكنية ${input.apartment.area} م²`,
      status,
      createdAt: now,
      updatedAt: now,
      purchasedItemIds: [],
      input,
      computed
    }

    estimates.value.unshift(record)
    persist()
    syncToServer(record)
    return record
  }

  function updateOverrideOnEstimate(estimateId, slug, usedPrice, reason = '') {
    hydrate()
    const idx = estimates.value.findIndex(e => e.id === estimateId)
    if (idx === -1) return null

    const target = estimates.value[idx]
    const nextOverrides = { ...(target.input.overrides || {}) }
    if (usedPrice === null || usedPrice === undefined) {
      delete nextOverrides[slug]
    } else {
      nextOverrides[slug] = {
        used_price: Number(usedPrice),
        reason
      }
    }

    const nextInput = {
      ...target.input,
      overrides: nextOverrides
    }

    const updated = {
      ...target,
      updatedAt: new Date().toISOString(),
      input: nextInput,
      computed: calculateEstimate({
        ...nextInput,
        materialsCatalog: marketStore.materials
      })
    }

    estimates.value.splice(idx, 1, updated)
    persist()
    syncToServer(updated)
    return updated
  }

  function renameEstimate(estimateId, newTitle) {
    hydrate()
    const idx = estimates.value.findIndex(e => e.id === estimateId)
    if (idx === -1 || !newTitle?.trim()) return null
    estimates.value[idx] = {
      ...estimates.value[idx],
      title: newTitle.trim(),
      title_ar: newTitle.trim(),
      updatedAt: new Date().toISOString()
    }
    persist()
    syncToServer(estimates.value[idx])
    return estimates.value[idx]
  }

  function duplicateEstimate(estimateId) {
    hydrate()
    const orig = getById(estimateId)
    if (!orig) return null
    const numCode = Math.floor(2411 + Math.random() * 7000)
    const now = new Date().toISOString()
    const copy = {
      ...JSON.parse(JSON.stringify(orig)),
      id: `ts-${numCode}`,
      refCode: `#TS-${numCode}`,
      shareToken: `sh-${numCode}-${Math.random().toString(36).slice(2, 7)}`,
      title: `${orig.title} (Copy)`,
      title_ar: `${orig.title_ar || orig.title} (نسخة)`,
      createdAt: now,
      updatedAt: now
    }
    estimates.value.unshift(copy)
    persist()
    syncToServer(copy)
    return copy
  }

  function deleteEstimate(estimateId) {
    hydrate()
    estimates.value = estimates.value.filter(e => e.id !== estimateId)
    persist()
  }

  function toggleShoppingPurchased(estimateId, itemId) {
    hydrate()
    const idx = estimates.value.findIndex(e => e.id === estimateId)
    if (idx === -1) return
    const cur = new Set(estimates.value[idx].purchasedItemIds || [])
    if (cur.has(itemId)) {
      cur.delete(itemId)
    } else {
      cur.add(itemId)
    }
    estimates.value[idx] = {
      ...estimates.value[idx],
      purchasedItemIds: [...cur]
    }
    persist()
  }

  function ensureShareToken(estimateId) {
    hydrate()
    const idx = estimates.value.findIndex(e => e.id === estimateId)
    if (idx === -1) return null
    if (!estimates.value[idx].shareToken) {
      estimates.value[idx].shareToken = `sh-${estimateId}-${Math.random().toString(36).slice(2, 7)}`
      persist()
    }
    if (import.meta.client) {
      $fetch('/api/share/create', {
        method: 'POST',
        body: { record: estimates.value[idx] }
      }).catch(() => {})
    }
    return estimates.value[idx].shareToken
  }

  return {
    estimates,
    hydrated,
    hydrate,
    persist,
    getById,
    getByShareToken,
    createOrUpdateFromWizard,
    updateOverrideOnEstimate,
    renameEstimate,
    duplicateEstimate,
    deleteEstimate,
    toggleShoppingPurchased,
    ensureShareToken
  }
})
