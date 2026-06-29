<template>
  <section class="flex flex-col h-full">
    <div ref="content" class="flex-1 bg-[#f5f5f5] overflow-y-auto">
      <div class="header-bg h-[145px] fixed top-0 inset-x-0 rounded-b-3xl"></div>

      <!--  用户头像信息  -->
      <div class="relative px-6 pt-5">
        <div v-if="store.isLogin" class="flex gap-3">
          <img
            v-lazy="store.avatar"
            @click="getProfile"
            class="rounded-full h-16 shadow-md cursor-pointer"
            alt="avatar"
          />
          <div class="flex flex-col justify-between py-1">
            <div @click="getProfile" class="flex gap-2 items-center cursor-pointer">
              <span class="font-medium text-lg">{{
                !store.name ? store.getProcessPhoneNumber() : store.name
              }}</span>
              <span v-if="!store.vip" class="bg-blue-600 text-white rounded-sm text-[10px] px-1"
                >普通用户</span
              >
              <span v-else class="bg-[#FFC75F] rounded-sm text-[10px] px-1">会员用户</span>
            </div>
            <div class="flex gap-1 items-center">
              <span style="font-size: 12px">用户ID: {{ store.userId }}</span>
              <span
                class="underline cursor-pointer"
                style="font-size: 12px"
                @click="copy(store.userId, () => showSuccessToast('复制成功'))"
                >复制</span
              >
            </div>
          </div>
        </div>
        <div v-else @click="getProfile" class="flex gap-3 cursor-pointer">
          <img
            src="/res/avatar-not-login.png"
            class="rounded-full h-16 bg-white border-solid border-white border-[1px]"
            alt="avatar"
          />
          <div class="flex items-center text-xl text-white">未登录</div>
        </div>
      </div>

      <!--  数据统计  -->
      <div
        @click="goToPay"
        class="relative mt-5 mx-2.5 p-4 bg-white rounded-lg flex items-center justify-between cursor-pointer"
      >
        <div class="flex flex-col gap-3">
          <span>对话余额</span>
          <span class="text-[#ff6e65] font-bold">{{ getDialogueBalance }}</span>
        </div>
        <div class="flex flex-col gap-3 opacity-50">
          <span>绘画余额 <span class="text-xs text-gray-400">暂未开放</span></span>
          <span class="text-[#ff6e65] font-bold">-</span>
        </div>
        <van-icon name="arrow" class="cursor-pointer" />
      </div>

      <!--  签到领取余额  -->
      <div
        v-if="canPunchInRef"
        class="relative mt-5 mx-2.5 p-4 bg-white rounded-lg flex items-center justify-between cursor-pointer"
      >
        <div class="flex gap-2">
          <img src="/res/coin.png" class="h-10" alt="coin" />
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 leading-4">
              <span class="time-limited text-white px-2 rounded-sm" style="font-size: 10px"
                >限时</span
              >
              签到领取对话次数
            </div>
            <span>有几率领取到绘画次数噢~</span>
          </div>
        </div>
        <div
          @click="clickServiceFunc(serviceList.filter((t) => t.path === 'task-reward')[0])"
          class="bg-[#ff6e65] text-white px-3 py-1 rounded-full cursor-pointer"
        >
          去领取
        </div>
      </div>

      <!--  我的服务  -->
      <div class="relative mt-5 mx-2.5 p-4 bg-white rounded-lg">
        <div>我的服务</div>
        <van-divider />
        <div class="grid grid-cols-4 gap-5 flex-wrap">
          <van-badge
            v-for="item in serviceList"
            :key="item"
            @click="clickServiceFunc(item)"
            class=""
            :offset="[-20, 8]"
            :show-zero="false"
            :content="item.point || 0"
          >
            <div class="cursor-pointer flex flex-col gap-2 items-center">
              <van-icon :name="item.icon" size="28" color="#ff6e65" />
              <span>{{ item.title }}</span>
            </div>
          </van-badge>
        </div>
      </div>

      <!-- 备案号 -->
      <div class="flex justify-center mt-3">
        <a class="text-gray-900/50 text-xs" target="_blank" href="https://beian.miit.gov.cn/"
          >鲁ICP备2024099705号-1</a
        >
      </div>
    </div>

    <!--  最底部导航栏区域空缺出来  -->
    <div class="h-[50px]"></div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useUserCenterStore } from '@/stores/user-center'
import { useFloatingFunction } from '@/stores/floating-function'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect.js'
import copy from '@/utils/copyInformation'

import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { showSuccessToast } from 'vant'
import axios from '@/utils/axios'

import { useTaskRewardStore } from '@/stores/task-reward'

const taskRewardStore = useTaskRewardStore()

const store = useUserCenterStore()
const historyStore = useFloatingFunction()
const router = useRouter()
const route = useRoute()

// 我的服务功能列表
const serviceList = ref([
  { title: '任务奖励', path: 'task-reward', exist: true, icon: 'point-gift', point: 0 },
  { title: '充值中心', path: 'pay', exist: true, icon: 'shop' },
  { title: '分销推广', path: 'distributionPromotion', exist: true, icon: 'cluster' },
  { title: '卡密兑换', path: 'activationCode', exist: true, icon: 'card' },
  { title: '邀请海报', path: 'invitePoster', exist: true, icon: 'photo' },
  { title: '文章资讯', path: '', exist: false, icon: 'description' },
  { title: '我的收藏', path: 'star-msg', exist: true, icon: 'star' },
  { title: '意见反馈', path: 'feedback', exist: true, icon: 'comment' },
  { title: '联系客服', path: 'concat', exist: true, icon: 'service' },
  { title: '关于我们', path: 'about', exist: true, icon: 'info' },
  { title: '最新课程', path: 'course', exist: false, icon: 'fire' },
  { title: '辅导培训', path: 'training', exist: false, icon: 'notes' }
])

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
    if (item.exist) router.push('/service/' + item.path)
    else router.push('/service/not-found')
  }
}

const goToPay = () => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push('/service/pay')
}

const canPunchInRef = ref(false)
onMounted(async () => {
  const prefix = import.meta.env.VITE_TITLE_PREFIX
  document.title = `${prefix}用户中心`
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
    const taskRewardService = serviceList.value.filter((item) => item.path === 'task-reward')[0]
    const { canPunchIn } = await taskRewardStore.checkIfYouCanPunchIn()
    // 设置可以打卡ref，用来控制用户中心打卡板块的交互逻辑
    canPunchInRef.value = canPunchIn
    taskRewardService.point = await taskRewardStore.getPoints()
  }
})
</script>
<style scoped>
.header-bg {
  background-color: #ee5522;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3CradialGradient id='a' gradientUnits='objectBoundingBox'%3E%3Cstop offset='0' stop-color='%23FF6E65'/%3E%3Cstop offset='1' stop-color='%23ee5522'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='750' x2='1550' y2='750'%3E%3Cstop offset='0' stop-color='%23f76244'/%3E%3Cstop offset='1' stop-color='%23ee5522'/%3E%3C/linearGradient%3E%3Cpath id='s' fill='url(%23b)' d='M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z'/%3E%3Cg id='g'%3E%3Cuse href='%23s' transform='scale(0.12) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.2) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.25) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(0.3) rotate(-20)'/%3E%3Cuse href='%23s' transform='scale(0.4) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(0.5) rotate(20)'/%3E%3Cuse href='%23s' transform='scale(0.6) rotate(60)'/%3E%3Cuse href='%23s' transform='scale(0.7) rotate(10)'/%3E%3Cuse href='%23s' transform='scale(0.835) rotate(-40)'/%3E%3Cuse href='%23s' transform='scale(0.9) rotate(40)'/%3E%3Cuse href='%23s' transform='scale(1.05) rotate(25)'/%3E%3Cuse href='%23s' transform='scale(1.2) rotate(8)'/%3E%3Cuse href='%23s' transform='scale(1.333) rotate(-60)'/%3E%3Cuse href='%23s' transform='scale(1.45) rotate(-30)'/%3E%3Cuse href='%23s' transform='scale(1.6) rotate(10)'/%3E%3C/g%3E%3C/defs%3E%3Cg %3E%3Cg%3E%3Ccircle fill='url(%23a)' r='3000'/%3E%3Cg opacity='0.5'%3E%3Ccircle fill='url(%23a)' r='2000'/%3E%3Ccircle fill='url(%23a)' r='1800'/%3E%3Ccircle fill='url(%23a)' r='1700'/%3E%3Ccircle fill='url(%23a)' r='1651'/%3E%3Ccircle fill='url(%23a)' r='1450'/%3E%3Ccircle fill='url(%23a)' r='1250'/%3E%3Ccircle fill='url(%23a)' r='1175'/%3E%3Ccircle fill='url(%23a)' r='900'/%3E%3Ccircle fill='url(%23a)' r='750'/%3E%3Ccircle fill='url(%23a)' r='500'/%3E%3Ccircle fill='url(%23a)' r='380'/%3E%3Ccircle fill='url(%23a)' r='250'/%3E%3C/g%3E%3Cg transform='rotate(-79.2 0 0)'%3E%3Cuse href='%23g' transform='rotate(10)'/%3E%3Cuse href='%23g' transform='rotate(120)'/%3E%3Cuse href='%23g' transform='rotate(240)'/%3E%3C/g%3E%3Ccircle fill-opacity='0.52' fill='url(%23a)' r='3000'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
}

.time-limited {
  background-image: linear-gradient(to right, #ff8350, #ff7d55, #ff785a, #ff7360, #ff6e65);
}
</style>
