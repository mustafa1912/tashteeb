<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: 'max-w-lg'
  },
  bottomSheetOnMobile: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex justify-center bg-ink/55 backdrop-blur-[2px]"
        :class="bottomSheetOnMobile ? 'items-end sm:items-center sm:p-4' : 'items-center p-4'"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Dialog'"
      >
        <div class="fixed inset-0" aria-hidden="true" @click="close" />

        <div
          class="relative z-10 w-full border border-border bg-surface p-5 sm:p-6 shadow-elevated max-h-[90vh] overflow-y-auto"
          :class="[
            maxWidth,
            bottomSheetOnMobile ? 'rounded-t-[16px] sm:rounded-card' : 'rounded-card'
          ]"
        >
          <div
            v-if="bottomSheetOnMobile"
            class="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-border sm:hidden"
            aria-hidden="true"
          />

          <header v-if="title || $slots.header" class="mb-4 flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <slot name="icon" />
              <div>
                <h2 class="text-lg font-semibold text-ink">{{ title }}</h2>
                <p v-if="subtitle" class="mt-0.5 text-sm text-ink-secondary">{{ subtitle }}</p>
              </div>
            </div>

            <button
              type="button"
              :aria-label="$t('common.close')"
              class="grid h-11 w-11 -me-2 -mt-2 shrink-0 place-items-center rounded-control text-ink-secondary hover:bg-sand hover:text-ink"
              @click="close"
            >
              <X class="h-5 w-5" :stroke-width="1.5" aria-hidden="true" />
            </button>
          </header>

          <div>
            <slot />
          </div>

          <footer v-if="$slots.footer" class="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
