<script setup>
import { BookmarkCheck, UserPlus, LogIn } from 'lucide-vue-next'

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  redirectPath: {
    type: String,
    default: '/calculator'
  }
})

const emit = defineEmits(['close'])
const { locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <BaseModal
    :open="open"
    :title="locale === 'ar' ? 'احفظ مقايسة شقتك على حسابك' : 'Save your estimate across devices'"
    :description="
      locale === 'ar'
        ? 'تم حفظ خطواتك تلقائياً في متصفحك الحالي. أنشئ حساباً مجانياً للرجوع لمقايساتك وتصديرها في أي وقت.'
        : 'Your progress is already saved in this browser. Create a free account to sync, reopen, and manage all your estimates anywhere.'
    "
    @close="emit('close')"
  >
    <div class="space-y-3">
      <div class="rounded-card border border-success/30 bg-success-tint/60 p-3.5 flex items-start gap-3">
        <BookmarkCheck class="h-5 w-5 text-success shrink-0 mt-0.5" :stroke-width="1.5" />
        <p class="text-xs text-ink leading-relaxed">
          {{
            locale === 'ar'
              ? 'لن تفقد أي بيانات أدخلتها — سننقل شقتك واختياراتك تلقائياً فور تسجيل الدخول.'
              : 'Zero data loss — your apartment details, chosen materials, and price overrides carry over automatically.'
          }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        <BaseButton
          variant="primary"
          block
          :to="`${localePath('/signup')}?redirect=${encodeURIComponent(redirectPath)}`"
        >
          <UserPlus class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'إنشاء حساب مجاني' : 'Create free account' }}</span>
        </BaseButton>

        <BaseButton
          variant="secondary"
          block
          :to="`${localePath('/login')}?redirect=${encodeURIComponent(redirectPath)}`"
        >
          <LogIn class="h-4 w-4" :stroke-width="1.5" />
          <span>{{ locale === 'ar' ? 'تسجيل الدخول' : 'Log in' }}</span>
        </BaseButton>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="ghost" size="sm" @click="emit('close')">
        {{ locale === 'ar' ? 'المتابعة كزائر في هذا المتصفح' : 'Continue as guest in this browser' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
