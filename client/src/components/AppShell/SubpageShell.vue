<template>
  <section class="subpage-shell">
    <header class="subpage-shell__header">
      <button
        type="button"
        class="subpage-shell__back"
        aria-label="返回上一页"
        @click="goBack"
      >
        <van-icon name="arrow-left" size="20" aria-hidden="true" />
      </button>
      <h1 class="subpage-shell__title">{{ title }}</h1>
      <span class="subpage-shell__spacer" aria-hidden="true"></span>
    </header>
    <div class="subpage-shell__content">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useFloatingFunction } from '@/stores/floating-function'

defineProps({
  title: {
    type: String,
    default: '页面',
  },
})

const route = useRoute()
const router = useRouter()
const historyStore = useFloatingFunction()

const goBack = () => {
  if (historyStore.lastPagePath.length > 0) {
    historyStore.backLastPage()
    return
  }

  router.push(route.meta.backTo || '/pages/user-center')
}
</script>

<style scoped>
.subpage-shell {
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow-x: clip;
  background: var(--app-bg);
}

.subpage-shell__header {
  z-index: 10;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  min-height: 52px;
  flex: 0 0 52px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(28, 32, 46, 0.08);
  background: color-mix(in srgb, var(--app-surface) 94%, transparent);
  backdrop-filter: blur(12px);
}

.subpage-shell__back {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ink-700);
  cursor: pointer;
}

.subpage-shell__back:hover {
  background: var(--coral-50);
  color: var(--coral-700);
}

.subpage-shell__back:focus-visible {
  outline: 2px solid var(--coral-500);
  outline-offset: 2px;
}

.subpage-shell__title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--ink-900);
  font-size: 17px;
  font-weight: 650;
  line-height: 24px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subpage-shell__spacer {
  width: 36px;
  height: 36px;
}

.subpage-shell__content {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

@media (prefers-reduced-motion: reduce) {
  .subpage-shell__back {
    transition: none;
  }
}
</style>
