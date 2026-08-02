<template>
  <router-view></router-view>
  <FluidTabBar
    :tabs="tabs"
    :active-path="route.path"
    :badge="{ '/pages/user-center': userCenterPoints === 0 ? '' : userCenterPoints }"
    @navigate="navigate"
  />
</template>
<script setup>
import FluidTabBar from '@/components/TabBar/FluidTabBar.vue'
import loginVerify from '@/utils/loginVerify'
import { useUserCenterStore } from '@/stores/user-center'
import { onMounted, ref } from 'vue'
import { autoClear } from '@/utils/clearLocalStorage'

import { useRoute, useRouter } from 'vue-router'
import { useTaskRewardStore } from '@/stores/task-reward'

const route = useRoute()
const router = useRouter()
const userCenterStore = useUserCenterStore()

const taskRewardStore = useTaskRewardStore()
const userCenterPoints = ref(0)
const tabs = [
  { path: '/', label: 'AI问答', icon: 'chat' },
  { path: '/pages/ai-assistant', label: '专业助理', icon: 'assistant' },
  { path: '/pages/user-center', label: '个人中心', icon: 'user' },
]

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
  verify()
  router.replace(path)
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
