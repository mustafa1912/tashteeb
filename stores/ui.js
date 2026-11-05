import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const confirmModal = ref(null)
  const sessionExpiredOpen = ref(false)
  const priceBannerDismissed = ref(false)
  const priceFeedFallbackDate = ref(null)

  function showToast({ title, message = '', type = 'success', duration = 4200 }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    toasts.value.push({ id, title, message, type })
    if (import.meta.client && duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }
    return id
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter(item => item.id !== id)
  }

  function askConfirm(options) {
    return new Promise((resolve) => {
      confirmModal.value = {
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'danger',
        requireTypedText: options.requireTypedText || '',
        resolve
      }
    })
  }

  function resolveConfirm(confirmed) {
    if (confirmModal.value?.resolve) {
      confirmModal.value.resolve(Boolean(confirmed))
    }
    confirmModal.value = null
  }

  function triggerSessionExpired() {
    sessionExpiredOpen.value = true
  }

  function closeSessionExpired() {
    sessionExpiredOpen.value = false
  }

  return {
    toasts,
    confirmModal,
    sessionExpiredOpen,
    priceBannerDismissed,
    priceFeedFallbackDate,
    showToast,
    dismissToast,
    askConfirm,
    resolveConfirm,
    triggerSessionExpired,
    closeSessionExpired
  }
})
