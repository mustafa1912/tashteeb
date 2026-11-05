<script setup>
import { AlertTriangle } from 'lucide-vue-next'

const ui = useUiStore()
const typedValue = ref('')

watch(
  () => ui.confirmModal,
  () => {
    typedValue.value = ''
  }
)

const isConfirmDisabled = computed(() => {
  const req = ui.confirmModal?.requireTypedText
  if (!req) return false
  return typedValue.value.trim() !== req
})
</script>

<template>
  <BaseModal
    :model-value="Boolean(ui.confirmModal)"
    :title="ui.confirmModal?.title || ''"
    max-width="max-w-md"
    @close="ui.resolveConfirm(false)"
  >
    <template #icon>
      <span
        class="grid h-10 w-10 shrink-0 place-items-center rounded-pill"
        :class="ui.confirmModal?.variant === 'danger' ? 'bg-danger-tint text-danger' : 'bg-warning-tint text-warning'"
      >
        <AlertTriangle class="h-5 w-5" :stroke-width="1.5" aria-hidden="true" />
      </span>
    </template>

    <div v-if="ui.confirmModal" class="space-y-4">
      <p class="text-sm leading-relaxed text-ink-secondary">
        {{ ui.confirmModal.message }}
      </p>

      <div v-if="ui.confirmModal.requireTypedText" class="space-y-1.5">
        <BaseInput
          v-model="typedValue"
          :label="`Type ${ui.confirmModal.requireTypedText} to confirm`"
          :placeholder="ui.confirmModal.requireTypedText"
          ltr
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="ui.resolveConfirm(false)">
        {{ ui.confirmModal?.cancelText || $t('common.cancel') }}
      </BaseButton>
      <BaseButton
        :variant="ui.confirmModal?.variant === 'danger' ? 'danger' : 'primary'"
        :disabled="isConfirmDisabled"
        @click="ui.resolveConfirm(true)"
      >
        {{ ui.confirmModal?.confirmText || $t('common.apply') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
