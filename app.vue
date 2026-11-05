<script setup>
import { useUiStore } from '~/stores/ui.js'

const { t } = useI18n()
const route = useRoute()
const uiStore = useUiStore()

const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true
})

useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang || 'en',
    dir: head.value.htmlAttrs?.dir || 'ltr'
  },
  link: [...(head.value.link || [])],
  meta: [...(head.value.meta || [])]
}))

const isPrintRoute = computed(() => route.path.includes('/print/'))

function handleOffline() {
  uiStore.showToast({
    title: t('system.offlineBadge'),
    message: t('system.offlineSavedItem1'),
    type: 'warning',
    duration: 6000
  })
}

function handleOnline() {
  uiStore.showToast({
    title: t('system.connectionRestored'),
    message: t('system.connectionRestoredBody'),
    type: 'success'
  })
}

onMounted(() => {
  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)
})

onBeforeUnmount(() => {
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)
})
</script>

<template>
  <div class="min-h-screen bg-bg text-ink antialiased">
    <a
      v-if="!isPrintRoute"
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-control focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-surface focus:shadow-elevated"
    >
      {{ t('nav.skipToContent') }}
    </a>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastContainer />
    <ConfirmDialog />
    <SessionExpiredModal />
    <CookieBanner />
  </div>
</template>
