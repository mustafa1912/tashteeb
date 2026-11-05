<script setup>
definePageMeta({
  layout: 'public'
})

const marketStore = useMarketStore()
const estimatesStore = useEstimatesStore()

onMounted(() => {
  marketStore.hydrate()
  estimatesStore.hydrate()
})
</script>

<template>
  <div>
    <HomeHero />
    <HomePriceMarquee />
    <HomeTrustAndProcess />
    <HomePackagesAndMarket />
    <HomeSampleAndFaq />
  </div>
</template>
