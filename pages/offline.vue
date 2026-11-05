<script setup>
import { WifiOff, Wifi, RefreshCw, Calculator, CheckCircle2 } from 'lucide-vue-next'
import { useUiStore } from '~/stores/ui.js'

definePageMeta({
  layout: 'public'
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const uiStore = useUiStore()

useSeoMeta({
  title: () => `${t('system.offlineBadge')} — ${t('brand.name')}`,
  robots: 'noindex, nofollow'
})

const isOnline = ref(false)
const checking = ref(false)

function syncNetworkStatus() {
  if (import.meta.client && navigator.onLine === false) {
    isOnline.value = false
  }
}

onMounted(() => {
  syncNetworkStatus()
  window.addEventListener('online', syncNetworkStatus)
  window.addEventListener('offline', syncNetworkStatus)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('online', syncNetworkStatus)
    window.removeEventListener('offline', syncNetworkStatus)
  }
})

const safetyPoints = computed(() => [
  t('system.offlineSavedItem1'),
  t('system.offlineSavedItem2'),
  t('system.offlineSavedItem3')
])

async function retryConnection() {
  checking.value = true
  try {
    await $fetch('/api/prices', { timeout: 4500 })
    isOnline.value = true
    uiStore.showToast({
      title: t('system.connectionRestored'),
      message: t('system.connectionRestoredBody'),
      type: 'success'
    })
    router.push(localePath('/'))
  } catch {
    isOnline.value = false
    uiStore.showToast({
      title: t('system.stillOffline'),
      message: t('system.stillOfflineBody'),
      type: 'warning'
    })
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="shell">
      <div class="mx-auto max-w-2xl rounded-card border border-border bg-surface p-8 sm:p-12 shadow-card">
        <!-- Status Pill & Icon -->
        <div class="flex flex-col items-center text-center">
          <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-card border border-border bg-sand">
            <Wifi
              v-if="isOnline"
              class="h-8 w-8 text-success"
              :stroke-width="1.5"
              aria-hidden="true"
            />
            <WifiOff
              v-else
              class="h-8 w-8 text-warning"
              :stroke-width="1.5"
              aria-hidden="true"
            />
          </div>

          <span
            class="inline-flex items-center gap-2 rounded-pill px-3.5 py-1 text-xs font-semibold"
            :class="isOnline ? 'bg-success-tint text-success' : 'bg-warning-tint text-ink'"
          >
            <span
              class="h-2 w-2 rounded-pill"
              :class="isOnline ? 'bg-success' : 'bg-warning'"
              aria-hidden="true"
            />
            {{ isOnline ? t('system.onlineBadge') : t('system.offlineBadge') }}
          </span>

          <h1 class="mt-4 text-2xl sm:text-3xl font-semibold text-ink">
            {{ t('system.offlineTitle') }}
          </h1>

          <p class="mt-3 max-w-xl text-base text-ink-secondary leading-relaxed">
            {{ t('system.offlineBody') }}
          </p>
        </div>

        <!-- Local Storage Reassurance Box -->
        <div class="mt-8 rounded-card border border-border bg-bg p-5 sm:p-6">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">
            {{ locale === 'ar' ? 'ما يظل متاحاً بدون اتصال' : 'Protected locally in your browser' }}
          </p>
          <ul class="mt-3.5 space-y-3">
            <li
              v-for="(point, index) in safetyPoints"
              :key="index"
              class="flex items-start gap-2.5 text-sm text-ink"
            >
              <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0 text-success" :stroke-width="1.5" aria-hidden="true" />
              <span>{{ point }}</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <BaseButton
            variant="primary"
            size="lg"
            :loading="checking"
            @click="retryConnection"
          >
            <RefreshCw class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t('system.retryConnection') }}</span>
          </BaseButton>

          <BaseButton
            :to="localePath('/calculator')"
            variant="secondary"
            size="lg"
          >
            <Calculator class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t('system.continueOfflineCalc') }}</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

