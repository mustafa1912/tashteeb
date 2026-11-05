<script setup>
import { KeyRound, ShieldCheck } from 'lucide-vue-next'
import { useUiStore } from '~/stores/ui.js'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

function close() {
  uiStore.closeSessionExpired()
}

function signInAgain() {
  const redirectTarget = route.fullPath || '/'
  uiStore.closeSessionExpired()
  router.push({
    path: localePath('/login'),
    query: { redirect: redirectTarget }
  })
}
</script>

<template>
  <BaseModal
    :model-value="uiStore.sessionExpiredOpen"
    :title="t('system.sessionExpiredTitle')"
    :subtitle="t('system.sessionExpiredSubtitle')"
    max-width="max-w-md"
    @update:model-value="val => !val && close()"
  >
    <template #icon>
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-warning-tint text-warning">
        <KeyRound class="h-5 w-5" :stroke-width="1.5" aria-hidden="true" />
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-ink-secondary leading-relaxed">
        {{ t('system.sessionExpiredBody') }}
      </p>

      <div class="flex items-start gap-2.5 rounded-control border border-border bg-sand p-3.5 text-xs text-ink">
        <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-primary" :stroke-width="1.5" aria-hidden="true" />
        <span>{{ t('system.offlineSavedItem1') }}</span>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="ghost" @click="close">
        {{ t('system.continueAsGuest') }}
      </BaseButton>
      <BaseButton variant="primary" @click="signInAgain">
        {{ t('system.signInAgain') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

