import { defineStore } from 'pinia'
import { CATEGORIES } from '~/utils/calc/config.js'
import { getDefaultMaterialForCategory } from '~/utils/calc/catalog.js'
import { calculateEstimate } from '~/utils/calc/engine.js'

const STORAGE_KEY = 'tashteeb_wizard_v1'

function createDefaultSelections(packageKey = 'standard', catalog) {
  const out = {}
  for (const cat of CATEGORIES) {
    const def = getDefaultMaterialForCategory(cat.key, packageKey, catalog)
    if (def) out[cat.key] = def.slug
  }
  return out
}

function createInitialState() {
  return {
    editingEstimateId: null,
    currentStep: 0,
    projectTitle: 'New Cairo apartment',
    apartment: {
      unitType: 'apartment',
      area: 120,
      governorate: 'cairo',
      bedrooms: 3,
      bathrooms: 2,
      kitchens: 1,
      reception: 2,
      balconies: 2
    },
    packageKey: 'standard',
    selections: createDefaultSelections('standard'),
    overrides: {},
    extras: [],
    contingencyPct: 0.12,
    includeLabour: true
  }
}

export const useWizardStore = defineStore('wizard', () => {
  const marketStore = useMarketStore()
  const hydrated = ref(false)

  const editingEstimateId = ref(null)
  const currentStep = ref(0)
  const projectTitle = ref('New Cairo apartment')
  const apartment = ref({
    unitType: 'apartment',
    area: 120,
    governorate: 'cairo',
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    reception: 2,
    balconies: 2
  })
  const packageKey = ref('standard')
  const selections = ref(createDefaultSelections('standard'))
  const overrides = ref({})
  const extras = ref([])
  const contingencyPct = ref(0.12)
  const includeLabour = ref(true)

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          editingEstimateId.value = parsed.editingEstimateId || null
          currentStep.value = Number(parsed.currentStep) || 0
          projectTitle.value = parsed.projectTitle || 'New Cairo apartment'
          if (parsed.apartment) apartment.value = { ...apartment.value, ...parsed.apartment }
          if (parsed.packageKey) packageKey.value = parsed.packageKey
          if (parsed.selections) selections.value = { ...selections.value, ...parsed.selections }
          if (parsed.overrides) overrides.value = { ...parsed.overrides }
          if (Array.isArray(parsed.extras)) extras.value = [...parsed.extras]
          if (parsed.contingencyPct !== undefined) contingencyPct.value = Number(parsed.contingencyPct)
          if (parsed.includeLabour !== undefined) includeLabour.value = Boolean(parsed.includeLabour)
        }
      }
    } catch {
      // keep defaults
    } finally {
      hydrated.value = true
    }
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          editingEstimateId: editingEstimateId.value,
          currentStep: currentStep.value,
          projectTitle: projectTitle.value,
          apartment: apartment.value,
          packageKey: packageKey.value,
          selections: selections.value,
          overrides: overrides.value,
          extras: extras.value,
          contingencyPct: contingencyPct.value,
          includeLabour: includeLabour.value
        })
      )
    } catch {
      // ignore quota errors
    }
  }

  watch(
    [editingEstimateId, currentStep, projectTitle, apartment, packageKey, selections, overrides, extras, contingencyPct, includeLabour],
    () => {
      if (hydrated.value) persist()
    },
    { deep: true }
  )

  const liveEstimate = computed(() =>
    calculateEstimate({
      apartment: apartment.value,
      packageKey: packageKey.value,
      selections: selections.value,
      overrides: overrides.value,
      extras: extras.value,
      contingencyPct: contingencyPct.value,
      includeLabour: includeLabour.value,
      materialsCatalog: marketStore.materials
    })
  )

  function setStep(stepIdx) {
    currentStep.value = Math.max(0, Math.min(4, Number(stepIdx) || 0))
    persist()
  }

  function selectPackage(pkgKey) {
    packageKey.value = pkgKey
    selections.value = createDefaultSelections(pkgKey, marketStore.materials)
    persist()
  }

  function selectMaterial(categoryKey, slug) {
    selections.value = {
      ...selections.value,
      [categoryKey]: slug
    }
    persist()
  }

  function prefillMaterialFromMarket(material) {
    if (!material) return
    hydrate()
    if (material.category && CATEGORIES.some(c => c.key === material.category)) {
      selections.value = {
        ...selections.value,
        [material.category]: material.slug
      }
      currentStep.value = 2 // Jump directly to Materials step
      persist()
    }
  }

  function toggleExtra(extraKey) {
    if (extras.value.includes(extraKey)) {
      extras.value = extras.value.filter(k => k !== extraKey)
    } else {
      extras.value = [...extras.value, extraKey]
    }
    persist()
  }

  function setPriceOverride(slug, usedPrice, reason = '') {
    overrides.value = {
      ...overrides.value,
      [slug]: {
        used_price: Number(usedPrice),
        reason
      }
    }
    persist()
  }

  function resetPriceOverride(slug) {
    const next = { ...overrides.value }
    delete next[slug]
    overrides.value = next
    persist()
  }

  function loadFromInput({ title, input, id = null }) {
    hydrate()
    editingEstimateId.value = id
    if (title) projectTitle.value = title
    if (input?.apartment) apartment.value = { ...apartment.value, ...input.apartment }
    if (input?.packageKey) packageKey.value = input.packageKey
    selections.value = {
      ...createDefaultSelections(input?.packageKey || 'standard', marketStore.materials),
      ...(input?.selections || {})
    }
    overrides.value = { ...(input?.overrides || {}) }
    extras.value = Array.isArray(input?.extras) ? [...input.extras] : []
    if (input?.contingencyPct !== undefined) contingencyPct.value = Number(input.contingencyPct)
    if (input?.includeLabour !== undefined) includeLabour.value = Boolean(input.includeLabour)
    currentStep.value = 0
    persist()
  }

  function resetWizard() {
    const fresh = createInitialState()
    editingEstimateId.value = fresh.editingEstimateId
    currentStep.value = fresh.currentStep
    projectTitle.value = fresh.projectTitle
    apartment.value = fresh.apartment
    packageKey.value = fresh.packageKey
    selections.value = createDefaultSelections('standard', marketStore.materials)
    overrides.value = fresh.overrides
    extras.value = fresh.extras
    contingencyPct.value = fresh.contingencyPct
    includeLabour.value = fresh.includeLabour
    persist()
  }

  function snapshotInput() {
    return {
      apartment: { ...apartment.value },
      packageKey: packageKey.value,
      selections: { ...selections.value },
      overrides: JSON.parse(JSON.stringify(overrides.value || {})),
      extras: [...extras.value],
      contingencyPct: contingencyPct.value,
      includeLabour: includeLabour.value
    }
  }

  return {
    hydrated,
    editingEstimateId,
    currentStep,
    projectTitle,
    apartment,
    packageKey,
    selections,
    overrides,
    extras,
    contingencyPct,
    includeLabour,
    liveEstimate,
    hydrate,
    persist,
    setStep,
    selectPackage,
    selectMaterial,
    prefillMaterialFromMarket,
    toggleExtra,
    setPriceOverride,
    resetPriceOverride,
    loadFromInput,
    resetWizard,
    snapshotInput
  }
})
