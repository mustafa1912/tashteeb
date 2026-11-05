import { defineStore } from 'pinia'
import { calculateContractorQuotation } from '~/utils/calc/contractor.js'

const STORAGE_KEY = 'tashteeb_contractor_v1'

export const useContractorStore = defineStore('contractor', () => {
  const estimatesStore = useEstimatesStore()
  const hydrated = ref(false)

  const selectedEstimateId = ref('ts-2408')
  const quoteRef = ref('#Q-1042')

  const companyProfile = ref({
    companyName: 'El Masry Finishing & Architecture',
    companyNameAr: 'المصري للتشطيبات والعمارة الداخلية',
    engineerName: 'Eng. Karim El Masry',
    phone: '+20 100 482 9100',
    email: 'quotes@elmasry-finishing.eg',
    address: '5th Settlement, New Cairo',
    taxCard: '418-902-771',
    logoDataUrl: ''
  })

  const clientInfo = ref({
    clientName: 'Mahmoud Adel',
    clientPhone: '+20 122 640 3310',
    unitAddress: 'Hyde Park, New Cairo · Apt 304 (120 m²)'
  })

  const pricing = ref({
    overheadPct: 7,
    markupPct: 18,
    vatPct: 0
  })

  const customItems = ref([
    {
      id: 'cust-1',
      label_en: '3D interior renders & site engineering supervision',
      label_ar: 'تصميم ثلاثي الأبعاد وإشراف هندسي كامل على التنفيذ',
      unit: 'package',
      unit_ar: 'مقطوعية',
      qty: 1,
      unit_price: 18000
    }
  ])

  const terms = ref({
    validityDays: 14,
    milestones_en: '40% mobilization & rough-in · 35% tiling & ceilings · 20% paint & carpentry · 5% final handover',
    milestones_ar: '40% دفعة تعاقد وتأسيس · 35% سيراميك وأسقف · 20% دهانات ونجارة · 5% عند التسليم النهائي',
    warranty_en: '24-month workmanship warranty on all concealed MEP & waterproofing works.',
    warranty_ar: 'ضمان هندسي لمدة 24 شهراً على كافة أعمال التأسيس والعزل والتشطيبات.'
  })

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    estimatesStore.hydrate()
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.selectedEstimateId) selectedEstimateId.value = parsed.selectedEstimateId
        if (parsed.quoteRef) quoteRef.value = parsed.quoteRef
        if (parsed.companyProfile) companyProfile.value = { ...companyProfile.value, ...parsed.companyProfile }
        if (parsed.clientInfo) clientInfo.value = { ...clientInfo.value, ...parsed.clientInfo }
        if (parsed.pricing) pricing.value = { ...pricing.value, ...parsed.pricing }
        if (Array.isArray(parsed.customItems)) customItems.value = parsed.customItems
        if (parsed.terms) terms.value = { ...terms.value, ...parsed.terms }
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
          selectedEstimateId: selectedEstimateId.value,
          quoteRef: quoteRef.value,
          companyProfile: companyProfile.value,
          clientInfo: clientInfo.value,
          pricing: pricing.value,
          customItems: customItems.value,
          terms: terms.value
        })
      )
    } catch {
      // ignore
    }
  }

  watch(
    [selectedEstimateId, quoteRef, companyProfile, clientInfo, pricing, customItems, terms],
    () => {
      if (hydrated.value) persist()
    },
    { deep: true }
  )

  const activeEstimateRecord = computed(() =>
    estimatesStore.getById(selectedEstimateId.value) || estimatesStore.estimates[0] || null
  )

  // Single source of truth used by BOTH Contractor Hero preview AND Quotation Sheet Builder
  const quotation = computed(() =>
    calculateContractorQuotation({
      baseEstimate: activeEstimateRecord.value?.computed,
      overheadPct: pricing.value.overheadPct,
      markupPct: pricing.value.markupPct,
      vatPct: pricing.value.vatPct,
      customItems: customItems.value
    })
  )

  function addCustomItem(item = {}) {
    customItems.value.push({
      id: `cust-${Date.now()}`,
      label_en: item.label_en || 'Custom finishing work item',
      label_ar: item.label_ar || item.label_en || 'بند أعمال إضافي',
      unit: item.unit || 'item',
      unit_ar: item.unit_ar || 'بند',
      qty: Number(item.qty) || 1,
      unit_price: Number(item.unit_price) || 5000
    })
    persist()
  }

  function removeCustomItem(id) {
    customItems.value = customItems.value.filter(i => i.id !== id)
    persist()
  }

  return {
    hydrated,
    selectedEstimateId,
    quoteRef,
    companyProfile,
    clientInfo,
    pricing,
    customItems,
    terms,
    activeEstimateRecord,
    quotation,
    hydrate,
    persist,
    addCustomItem,
    removeCustomItem
  }
})
