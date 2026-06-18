<template>
  <router-view></router-view>
  <!--  #b5b5b5  -->
  <van-tabbar route active-color="#ff6e65" inactive-color="#b5b5b5" @change="verify">
    <van-tabbar-item replace to="/">
      <span>AI问答</span>
      <template #icon>
        <van-icon class-prefix="iconfont-ydai" name="chat" size="22" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/pages/ai-assistant">
      <span>专业助理</span>
      <template #icon>
        <van-icon class-prefix="iconfont-ydai" name="assistant" size="22" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/pages/app-center">
      <span>应用中心</span>
      <template #icon>
        <van-icon class-prefix="iconfont-ydai" name="app-center" size="22" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/pages/image-community">
      <span>作品广场</span>
      <template #icon>
        <van-icon class-prefix="iconfont-ydai" name="community" size="22" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item
      replace
      to="/pages/user-center"
      :badge="userCenterPoints === 0 ? '' : userCenterPoints"
    >
      <span>个人中心</span>
      <template #icon>
        <van-icon class-prefix="iconfont-ydai" name="user" size="22" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>
<script setup>
import loginVerify from '@/utils/loginVerify'
import { useUserCenterStore } from '@/stores/user-center'
import { onMounted, ref } from 'vue'
import { autoClear } from '@/utils/clearLocalStorage'

import { useRoute } from 'vue-router'
import { useTaskRewardStore } from '@/stores/task-reward'

const route = useRoute()
const userCenterStore = useUserCenterStore()

const taskRewardStore = useTaskRewardStore()
const userCenterPoints = ref(0)

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
