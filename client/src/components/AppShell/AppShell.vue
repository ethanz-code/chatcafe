<template>
  <div class="app-shell">
    <footer v-if="hasNavigation" id="app-shell-navigation" class="app-shell__navigation">
      <slot name="navigation" />
    </footer>
    <main class="app-shell__content">
      <slot name="content" />
    </main>
  </div>
</template>

<script setup>
defineProps({
  hasNavigation: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.app-shell {
  --app-shell-width: var(--app-content-width);
  --app-shell-bg: var(--app-bg);
  --app-safe-bottom: env(safe-area-inset-bottom, 0px);
  --app-tab-bar-height: 56px;

  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, var(--app-shell-width));
  height: 100dvh;
  min-height: 0;
  margin-inline: auto;
  overflow: hidden;
  background: var(--app-shell-bg);
}

.app-shell__content {
  order: 1;
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.app-shell__navigation {
  order: 2;
  height: calc(var(--app-tab-bar-height) + var(--app-safe-bottom));
  flex: 0 0 calc(var(--app-tab-bar-height) + var(--app-safe-bottom));
  min-height: 0;
}
</style>
