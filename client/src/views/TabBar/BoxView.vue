<template>
  <div class="tab-page-shell">
    <router-view v-slot="{ Component, route: currentRoute }">
      <PageViewport :mode="currentRoute.meta.viewport">
        <template #content>
          <div class="tab-page-view">
            <transition :name="isPrimaryRoute(currentRoute.path) ? tabTransitionName : ''">
              <KeepAlive v-if="currentRoute.meta.keepAlive">
                <TabRoute :component="Component" :key="currentRoute.path" />
              </KeepAlive>
              <TabRoute v-else :component="Component" :key="currentRoute.path" />
            </transition>
          </div>
        </template>
      </PageViewport>
    </router-view>
    <teleport to="#app-shell-navigation">
      <FluidTabBar
        :tabs="tabs"
        :active-path="route.path"
        :badge="{ '/pages/user-center': userCenterPoints === 0 ? '' : userCenterPoints }"
        @navigate="navigate"
      />
    </teleport>
  </div>
</template>
<script setup>
import PageViewport from '@/components/AppShell/PageViewport.vue'
import FluidTabBar from '@/components/TabBar/FluidTabBar.vue'
import loginVerify from '@/utils/loginVerify'
import { useUserCenterStore } from '@/stores/user-center'
import { defineComponent, h, onMounted, ref, watch } from 'vue'
import { autoClear } from '@/utils/clearLocalStorage'

import { useRoute, useRouter } from 'vue-router'
import { useTaskRewardStore } from '@/stores/task-reward'

const route = useRoute()
const router = useRouter()
const userCenterStore = useUserCenterStore()

const taskRewardStore = useTaskRewardStore()
const userCenterPoints = ref(0)
const primaryPaths = ['/', '/pages/ai-assistant', '/pages/user-center']
const tabTransitionName = ref('')
const pendingTabNavigation = ref(null)
const tabs = [
  { path: '/', label: 'AI问答', icon: 'chat' },
  { path: '/pages/ai-assistant', label: '专业助理', icon: 'assistant' },
  { path: '/pages/user-center', label: '个人中心', icon: 'user' },
]

const TabRoute = defineComponent({
  name: 'TabRoute',
  props: {
    component: {
      type: [Object, Function],
      required: true,
    },
  },
  setup(props) {
    return () => h('div', { class: 'tab-page-route' }, [h(props.component)])
  },
})

const isPrimaryRoute = (path) => primaryPaths.includes(path)

watch(
  () => route.path,
  (to, from) => {
    const pendingNavigation = pendingTabNavigation.value
    tabTransitionName.value = ''

    if (pendingNavigation?.path !== to) {
      pendingTabNavigation.value = null
      return
    }

    pendingTabNavigation.value = null

    if (!isPrimaryRoute(to) || !isPrimaryRoute(from)) return

    tabTransitionName.value = pendingNavigation.direction
  },
  { flush: 'sync' }
)

// 每次切换底部标签或页面加载都会验证用户登录状态
const verify = async () => {
  const token = localStorage.getItem('token')
  loginVerify(token).then(async (res) => {
    // 当用户登录token验证不通过时则reset用户状态
    if (!res) {
      localStorage.removeItem('token')
      userCenterStore.reset()
    } else {
      userCenterPoints.value = await taskRewardStore.getPoints()
    }
  })
}

const navigate = (path) => {
  const fromIndex = primaryPaths.indexOf(route.path)
  const toIndex = primaryPaths.indexOf(path)
  const navigation =
    fromIndex === -1 || toIndex === -1 || fromIndex === toIndex
      ? null
      : {
          path,
          direction: toIndex > fromIndex ? 'tab-forward' : 'tab-back',
        }

  pendingTabNavigation.value = navigation
  verify()
  void router.replace(path).then(
    () => {
      if (pendingTabNavigation.value === navigation) pendingTabNavigation.value = null
    },
    () => {
      if (pendingTabNavigation.value === navigation) pendingTabNavigation.value = null
    }
  )
}

// 尝试读取本地秘钥看是否存在
const localItemIsExists = (itemName) => {
  return localStorage.getItem(itemName) ? true : false
}

// 检测当前是否未登录，并且存在一些本地数据照成干扰
const isNotLoginIssues = () => {
  if (userCenterStore.isLogin && localItemIsExists('token')) return
  autoClear()
}

onMounted(() => {
  verify()
  isNotLoginIssues()
})
</script>

<style scoped>
.tab-page-shell {
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.tab-page-view {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.tab-page-route {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-forward-enter-active,
.tab-forward-leave-active,
.tab-back-enter-active,
.tab-back-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.tab-forward-enter-from,
.tab-back-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.tab-forward-leave-to,
.tab-back-enter-from {
  opacity: 0;
  transform: translateX(-18px);
}

@media (prefers-reduced-motion: reduce) {
  .tab-forward-enter-active,
  .tab-forward-leave-active,
  .tab-back-enter-active,
  .tab-back-leave-active {
    transition-duration: 1ms;
  }
}
</style>
