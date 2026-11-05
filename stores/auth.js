import { defineStore } from 'pinia'

const STORAGE_KEY = 'tashteeb_auth_user_v1'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const initialized = ref(false)
  const pendingRedirect = ref(null)

  const isAuthenticated = computed(() => Boolean(user.value?.id))
  const isContractor = computed(() => user.value?.role === 'contractor')

  const initials = computed(() => {
    const name = user.value?.full_name || ''
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  })

  function hydrate() {
    if (!import.meta.client || initialized.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        user.value = JSON.parse(raw)
      }
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  function persist() {
    if (!import.meta.client) return
    if (user.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function setSessionUser(profile) {
    user.value = profile
    initialized.value = true
    persist()
  }

  function updateProfile(patch) {
    if (!user.value) return
    user.value = { ...user.value, ...patch }
    persist()
  }

  function logout() {
    user.value = null
    persist()
  }

  return {
    user,
    initialized,
    pendingRedirect,
    isAuthenticated,
    isContractor,
    initials,
    hydrate,
    setSessionUser,
    updateProfile,
    logout
  }
})
