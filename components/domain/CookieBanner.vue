<script setup>
const STORAGE_KEY = 'tashteeb_cookie_notice_v1'
const route = useRoute()
const visible = ref(false)
const isPrintRoute = computed(() => route.path.includes('/print/'))

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      visible.value = true
    }
  } catch {
    visible.value = false
  }
})

function accept() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, 'accepted')
  } catch {
    // ignore storage errors
  }
}
</script>

<template>
  <div
    v-if="visible && !isPrintRoute"
    class="cookie-banner fixed bottom-24 start-4 end-4 sm:end-auto z-50 max-w-sm rounded-card border border-border bg-surface p-3.5 shadow-elevated sm:bottom-5 transition-all"
    role="region"
    aria-label="Storage notice"
  >
    <div class="flex items-center justify-between gap-3">
      <p class="text-xs leading-relaxed text-ink-secondary">
        {{ $t('common.cookieText') }}
      </p>
      <BaseButton variant="secondary" size="sm" class="shrink-0 whitespace-nowrap" @click="accept">
        {{ $t('common.cookieAccept') }}
      </BaseButton>
    </div>
  </div>
</template>
