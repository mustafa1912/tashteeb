function fixNullProtoInPlace(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return value
  }
  seen.add(value)
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      fixNullProtoInPlace(value[i], seen)
    }
    return value
  }
  if (Object.getPrototypeOf(value) === null) {
    Object.setPrototypeOf(value, Object.prototype)
  }
  for (const key of Object.keys(value)) {
    fixNullProtoInPlace(value[key], seen)
  }
  return value
}

export default defineNuxtPlugin((nuxtApp) => {
  fixNullProtoInPlace(nuxtApp.payload)
  nuxtApp.hook('app:rendered', ({ ssrContext }) => {
    fixNullProtoInPlace(nuxtApp.payload)
    if (ssrContext?.payload) {
      fixNullProtoInPlace(ssrContext.payload)
    }
  })
})
