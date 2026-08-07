<template>
  <section class="flex min-h-full flex-col bg-[var(--app-bg)]">
    <div ref="content" class="flex-1 min-h-0">

      <!-- 用户信息卡片 -->
      <div class="bg-white mx-3 mt-3 rounded-xl px-4 py-4">
        <button v-if="store.isLogin" type="button" @click="getProfile" class="flex items-center gap-3 w-full box-border bg-transparent border-0 p-0 text-left">
          <SkeletonImage
            :src="store.avatar"
            :alt="store.name"
            custom-class="h-12 w-12 rounded-full shrink-0"
            rounded="rounded-full"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-base truncate">{{
                !store.name ? store.getProcessPhoneNumber() : store.name
              }}</span>
              <span
                v-if="!store.vip"
                class="bg-blue-600 text-white rounded-sm text-[10px] px-1 shrink-0"
              >普通用户</span>
              <span
                v-else
                class="bg-[#ff6e65] text-white rounded-sm text-[10px] px-1 shrink-0"
              >会员用户</span>
            </div>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="text-xs text-gray-400">ID: {{ store.userId }}</span>
              <span
                class="text-xs text-gray-400 underline cursor-pointer"
                @click="copy(store.userId, () => showSuccessToast('复制成功'))"
              >复制</span>
            </div>
          </div>
          <van-icon name="arrow" class="text-gray-300 ml-auto shrink-0" />
        </button>
        <button v-else type="button" @click="getProfile" class="flex items-center gap-3 cursor-pointer w-full box-border bg-transparent border-0 p-0 text-left">
          <img
            src="/res/avatar-not-login.png"
            class="rounded-full h-12 w-12"
            alt="avatar"
          />
          <span class="text-base text-gray-400">点击登录</span>
          <van-icon name="arrow" class="text-gray-300 ml-auto" />
        </button>
        <button
          v-if="store.isLogin"
          type="button"
          @click="goToPay"
          class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between cursor-pointer w-full bg-transparent border-0 p-0 text-left"
        >
          <div class="flex items-center gap-6">
            <div>
              <span class="text-xs text-gray-400">对话余额</span>
              <span class="ml-2 text-sm font-semibold text-[#ff6e65]">{{ getDialogueBalance }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400">绘画余额</span>
              <span class="ml-2 text-sm font-semibold text-[#ff6e65]">{{ getPaintingBalance }}</span>
            </div>
          </div>
          <van-icon name="arrow" class="text-gray-300" />
        </button>
      </div>

      <!-- 每日签到 -->
      <button
        v-if="canPunchInRef"
        type="button"
        @click="clickServiceFunc(serviceList.filter((t) => t.path === 'task-reward')[0])"
        class="bg-white w-[calc(100%-24px)] mx-auto mt-3 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer box-border border-0 text-left"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <van-icon name="point-gift" size="16" color="#ff6e65" />
          </div>
          <div>
            <div class="text-sm font-medium">每日签到</div>
            <div class="text-xs text-gray-400">领取对话次数奖励</div>
          </div>
        </div>
        <div class="text-xs text-[#ff6e65] font-medium">去签到</div>
      </button>

      <!-- 快捷功能 -->
      <div class="bg-white mx-3 mt-3 rounded-xl px-4 py-4">
        <div class="text-sm font-medium mb-3">快捷功能</div>
        <div class="flex justify-around">
          <button
            v-for="item in quickActions"
            :key="item.title"
            type="button"
            @click="clickServiceFunc(item)"
            class="cursor-pointer flex flex-col items-center gap-1.5 bg-transparent border-0 p-0 min-w-0 max-w-full"
          >
            <span class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <van-icon :name="item.icon" size="24" color="#ff6e65" />
            </span>
            <span class="text-xs text-gray-600">{{ item.title }}</span>
          </button>
        </div>
      </div>

      <!-- 更多服务 -->
      <div class="bg-white mx-3 mt-3 rounded-xl px-3 py-4">
        <div class="text-sm font-medium mb-3 px-1">更多服务</div>
        <div class="grid grid-cols-4 gap-y-5 pb-2">
          <van-badge
            v-for="item in otherServices"
            :key="item.title"
            :offset="[6, -4]"
            :show-zero="false"
            :content="item.point || 0"
            class="min-w-0"
          >
            <button
              type="button"
              @click="clickServiceFunc(item)"
              class="w-full min-w-0 h-16 cursor-pointer flex flex-col items-center gap-1 bg-transparent border-0 p-0"
            >
              <span class="w-10 h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                <van-icon :name="item.icon" :class-prefix="item.iconPrefix" size="20" color="#ff6e65" />
              </span>
              <span class="max-w-full truncate text-xs leading-4 text-gray-500 text-center">{{ item.title }}</span>
            </button>
          </van-badge>
        </div>
      </div>

      <!-- 备案号 -->
      <div v-if="recordNumber" class="flex justify-center mt-4 mb-2">
        <a
          class="text-gray-400 text-xs"
          target="_blank"
          href="https://beian.miit.gov.cn/"
        >{{ recordNumber }}</a>
      </div>
    </div>

  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useUserCenterStore } from '@/stores/user-center'
import { useFloatingFunction } from '@/stores/floating-function'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect.js'
import copy from '@/utils/copyInformation'
import SkeletonImage from '@/components/Common/SkeletonImage.vue'

import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { showSuccessToast, showFailToast } from 'vant'
import axios from '@/utils/axios'

import { useTaskRewardStore } from '@/stores/task-reward'

const taskRewardStore = useTaskRewardStore()

const store = useUserCenterStore()
const historyStore = useFloatingFunction()
const router = useRouter()
const route = useRoute()

// 我的服务功能列表
const serviceList = ref([
  { title: '任务奖励', path: 'task', exist: true, icon: 'point-gift', point: 0 },
  { title: '充值中心', path: 'pay', exist: true, icon: 'shop' },
  { title: '分销推广', path: 'promote', exist: true, icon: 'cluster' },
  { title: '卡密兑换', path: 'code', exist: true, icon: 'card' },
  { title: '邀请海报', path: 'poster', exist: true, icon: 'photo' },
  { title: '我的收藏', path: 'star', exist: true, icon: 'star' },
  { title: '意见反馈', path: 'feedback', exist: true, icon: 'comment' },
  { title: '联系客服', path: 'concat', exist: true, icon: 'service' },
  { title: '关于我们', path: 'about', exist: true, icon: 'info' },
  { title: '辅导培训', path: 'training', exist: false, icon: 'notes' },
  { title: '应用中心', to: '/pages/app-center', exist: true, icon: 'app-center', iconPrefix: 'iconfont-ydai' },
  { title: '作品广场', to: '/pages/image-community', exist: true, icon: 'community', iconPrefix: 'iconfont-ydai' }
])

const quickActionPaths = ['task', 'pay', 'star', 'concat', 'feedback']

const quickActions = computed(() =>
  serviceList.value.filter((item) => quickActionPaths.includes(item.path))
)

const otherServices = computed(() =>
  serviceList.value.filter((item) => !quickActionPaths.includes(item.path))
)

const content = ref()

const getDialogueBalance = computed(() => {
  if (store.isLogin) {
    return `${store.dialogueBalance} 条`
  } else {
    return `${'_'} 条`
  }
})
const getPaintingBalance = computed(() => {
  if (store.isLogin) {
    return `${store.paintingBalance} 条`
  } else {
    return `${'_'} 条`
  }
})

const getProfile = () => {
  // 未登录成功时将跳转到登录界面，这里在切换页面时将记录当前页面路径，以便于返回时能够返回到该页面
  historyStore.lastPagePath.push(route.fullPath)

  if (!store.isLogin) router.push('/modules/login')
  else router.push('/modules/user-profile')
}

// 点击进入用户中心“我的服务”某一功能页面
const clickServiceFunc = (item) => {
  // console.log(item)
  historyStore.lastPagePath.push(route.fullPath)

  if (!store.isLogin) router.push('/modules/login')
  else {
    if (item.to) router.push(item.to)
    else if (item.exist) router.push('/s/' + item.path)
    else showFailToast('功能建设中，敬请期待')
  }
}

const goToPay = () => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push('/s/pay')
}

const canPunchInRef = ref(false)
const recordNumber = ref('')

onMounted(async () => {
  axios.get('/config/site').then((res) => {
    if (res.status === 200 && res.data?.status === 0) {
      recordNumber.value = res.data.data.recordNumber || ''
    }
  })
  WhetherToDisableTheEffect(content.value)

  if (store.isLogin) {
    axios
      .get('/user/profile', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
      .then((res) => {
        if (res.status !== 200) return
        const parsedData = res.data
        store.userId = parsedData.data.id
        store.phoneNumber = parsedData.data.phoneNumber
        store.dialogueBalance = parsedData.data.dialogueBalance
        store.paintingBalance = parsedData.data.paintingBalance
        store.vip = parsedData.data.vip
        if (parsedData.data.name) store.name = parsedData.data.name
        if (store.avatar !== parsedData.data.avatar) {
          store.avatar = parsedData.data.avatar
          location.reload()
        }
      })

    // 用户可以打卡时在任务奖励图标右上方添加红点
    const taskRewardService = serviceList.value.filter((item) => item.path === 'task')[0]
    const { canPunchIn } = await taskRewardStore.checkIfYouCanPunchIn()
    // 设置可以打卡ref，用来控制用户中心打卡板块的交互逻辑
    canPunchInRef.value = canPunchIn
    taskRewardService.point = await taskRewardStore.getPoints()
  }
})
</script>
<style scoped>
</style>
