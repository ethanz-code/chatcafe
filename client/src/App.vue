<template>
  <AppShell :has-navigation="hasNavigation">
    <template #content>
      <ErrorPage v-if="hasError" />
      <router-view v-else v-slot="{ Component, route: currentRoute }">
        <transition :name="transitionName">
          <component :is="Component" :key="getRouteKey(currentRoute)" />
        </transition>
      </router-view>
    </template>
  </AppShell>
  <div ref="deleteLS">
    <van-button v-if="isDebug" id="draggable" class="fixed left-0 top-20 shadow-lg" type="danger"
      >dev如遇问题需点我清除数据</van-button
    >
  </div>
</template>
<script setup lang="js">
import { computed, onMounted, onErrorCaptured, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/components/AppShell/AppShell.vue'
import ErrorPage from '@/views/Modules/ErrorPage.vue'
import { useFloatingFunction } from '@/stores/floating-function'

const isDebug = ref(false)
const deleteLS = ref()
const hasError = ref(false)
const transitionName = ref('app-shell-push')
let historyPosition = window.history.state?.position ?? 0

const route = useRoute()
const router = useRouter()
const historyStore = useFloatingFunction()
const hasNavigation = computed(() => route.meta.shell === 'tab')

// 主 tab 页面（/pages 下）为层级 0，其它子页面为层级 1
const getDepth = (route) => {
  if (route.path === '/' || route.path.startsWith('/pages')) return 0
  return 1
}

const getRouteKey = (route) => {
  if (route.meta.transition === 'tab') return route.matched[0]?.path ?? route.path
  return route.path
}

// 前进 push（从右往左滑入）/ 后退 pop（从左往右滑入）
router.afterEach((to, from) => {
  const shouldTransition = to.meta.transition === 'push' || from.meta.transition === 'push'
  const nextHistoryPosition = window.history.state?.position ?? historyPosition
  const isBrowserBack = nextHistoryPosition < historyPosition
  historyPosition = nextHistoryPosition
  const isBackNavigation = historyStore.consumeBackNavigation() || isBrowserBack

  transitionName.value = shouldTransition
    ? isBackNavigation || getDepth(to) < getDepth(from)
      ? 'app-shell-pop'
      : 'app-shell-push'
    : ''
})

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  console.error('[App error]', info, err)
  return false
})

onMounted(() => {
  if (isDebug.value) {
    deleteLS.value.addEventListener('click', () => {
      localStorage.clear()
    })
  }
})
</script>

<style>
/* Concurrent directional transitions inside AppShell's stable content region. */
.app-shell-push-enter-active,
.app-shell-push-leave-active,
.app-shell-pop-enter-active,
.app-shell-pop-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition:
    transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
    opacity 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

/* Forward: the old page exits left and the new page enters from the right. */
.app-shell-push-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.app-shell-push-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.app-shell-push-enter-to,
.app-shell-pop-enter-to {
  transform: translateX(0);
  opacity: 1;
}

/* Back: the old page exits right and the new page enters from the left. */
.app-shell-pop-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.app-shell-pop-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .app-shell-push-enter-active,
  .app-shell-push-leave-active,
  .app-shell-pop-enter-active,
  .app-shell-pop-leave-active {
    transition-duration: 1ms;
  }
}
</style>
