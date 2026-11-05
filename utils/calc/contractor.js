/**
 * Contractor Mode Quotation Engine.
 * Computes overhead, markup, custom items, and optional VAT on top of a raw finishing estimate,
 * while generating client-facing line items that NEVER expose raw contractor costs and ALWAYS sum
 * exact-to-the-pound to the displayed quotation grand total.
 */

export function calculateContractorQuotation({
  baseEstimate,
  overheadPct = 7,
  markupPct = 18,
  vatPct = 0,
  customItems = []
} = {}) {
  const rawCost = Number(baseEstimate?.grandTotal) || 0
  const safeOverheadPct = Math.max(0, Math.min(50, Number(overheadPct) || 0))
  const safeMarkupPct = Math.max(0, Math.min(100, Number(markupPct) || 0))
  const safeVatPct = Math.max(0, Math.min(30, Number(vatPct) || 0))

  const overheadAmount = Math.round(rawCost * (safeOverheadPct / 100))
  const costWithOverhead = rawCost + overheadAmount
  const markupAmount = Math.round(costWithOverhead * (safeMarkupPct / 100))
  const baseClientSubtotal = costWithOverhead + markupAmount

  const normalizedCustomItems = (Array.isArray(customItems) ? customItems : [])
    .filter(item => item && (item.label || item.label_en))
    .map((item, idx) => {
      const qty = Math.max(1, Math.round(Number(item.qty) || 1))
      const unitPrice = Math.max(0, Math.round(Number(item.unit_price) || 0))
      return {
        id: item.id || `custom-${idx + 1}`,
        label_en: item.label_en || item.label,
        label_ar: item.label_ar || item.label_en || item.label,
        unit: item.unit || 'item',
        unit_ar: item.unit_ar || 'بند',
        qty,
        client_unit_price: unitPrice,
        client_subtotal: qty * unitPrice,
        isCustom: true
      }
    })

  const customItemsTotal = normalizedCustomItems.reduce((sum, i) => sum + i.client_subtotal, 0)
  const preVatTotal = baseClientSubtotal + customItemsTotal
  const vatAmount = Math.round(preVatTotal * (safeVatPct / 100))
  const clientGrandTotal = preVatTotal + vatAmount

  // Distribute baseClientSubtotal proportionally across the estimate's categories so client rows sum identically
  const sourceCategories = baseEstimate?.categories || []
  const sourceSum = sourceCategories.reduce((s, c) => s + c.subtotal, 0) || 1

  const clientCategories = sourceCategories.map((cat) => {
    const rawShare = (cat.subtotal / sourceSum) * baseClientSubtotal
    return {
      key: cat.key,
      label_en: cat.label_en,
      label_ar: cat.label_ar,
      scope_en: cat.items?.[0]?.label_en || cat.label_en,
      scope_ar: cat.items?.[0]?.label_ar || cat.label_ar,
      qty: cat.items?.[0]?.purchased_qty || 1,
      sale_unit: cat.items?.[0]?.sale_unit || 'lot',
      sale_unit_ar: cat.items?.[0]?.sale_unit_ar || 'مقطوعية',
      client_subtotal: Math.round(rawShare)
    }
  })

  // Reconcile any 1–3 EGP rounding remainder on the largest category so sum === baseClientSubtotal
  if (clientCategories.length > 0) {
    const currentCatSum = clientCategories.reduce((s, c) => s + c.client_subtotal, 0)
    const diff = baseClientSubtotal - currentCatSum
    if (diff !== 0) {
      let largestIdx = 0
      clientCategories.forEach((c, i) => {
        if (c.client_subtotal > clientCategories[largestIdx].client_subtotal) largestIdx = i
      })
      clientCategories[largestIdx].client_subtotal += diff
    }
  }

  return {
    rawCost,
    overheadPct: safeOverheadPct,
    overheadAmount,
    markupPct: safeMarkupPct,
    markupAmount,
    netMarginAmount: overheadAmount + markupAmount,
    baseClientSubtotal,
    customItems: normalizedCustomItems,
    customItemsTotal,
    preVatTotal,
    vatPct: safeVatPct,
    vatAmount,
    clientGrandTotal,
    clientCostPerSqm: Math.round(clientGrandTotal / Math.max(1, Number(baseEstimate?.apartment?.area) || 120)),
    clientCategories
  }
}
