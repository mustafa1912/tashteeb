<template>
  <div id="top" class="min-h-screen flex flex-col bg-bg text-ink pb-14 md:pb-0 overflow-x-clip max-w-full">
    <AppNavbar />
    <main id="main-content" tabindex="-1" class="flex-1 outline-none">
      <slot />
    </main>
    <FullFooter />
    <MobileBottomNav />
  </div>
</template>
