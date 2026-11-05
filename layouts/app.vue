<template>
  <div id="top" class="min-h-screen flex flex-col bg-bg text-ink pb-14 md:pb-0">
    <AppNavbar />
    <main id="main-content" tabindex="-1" class="flex-1 outline-none">
      <slot />
    </main>
    <CompactFooter />
    <MobileBottomNav />
  </div>
</template>
