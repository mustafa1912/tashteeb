export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const authStore = useAuthStore()
  let hasSession = authStore.isAuthenticated

  // During initial SSR hydration pass, inspect localStorage without mutating reactive state
  // before `onMounted()` finishes hydrating the server-rendered DOM.
  if (!authStore.initialized) {
    try {
      const raw = localStorage.getItem('tashteeb_auth_user_v1')
      hasSession = Boolean(raw && JSON.parse(raw)?.id)
    } catch {
      hasSession = false
    }
  }

  if (!hasSession) {
    const localePath = useLocalePath()
    authStore.pendingRedirect = to.fullPath
    return navigateTo({
      path: localePath('/login'),
      query: { redirect: to.fullPath }
    })
  }
})
