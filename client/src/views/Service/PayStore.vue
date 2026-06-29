<template>
  <WXTipsMask v-if="mask" />
  <section class="bg-white p-4 box-border min-h-full">
    <p class="font-medium text-lg">充值套餐</p>
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mt-2">
      <div
        v-for="item in goods"
        :key="item.id"
        class="flex flex-col rounded-lg shadow-md overflow-hidden"
      >
        <img
          v-if="item.imgUrl"
          :src="item.imgUrl"
          class="h-[6.5rem] object-contain object-center"
          style="background-image: linear-gradient(135deg, #43cbff 30%, #9708cc 100%)"
        />
        <div
          v-else
          class="h-[6.5rem] flex items-center justify-center text-white text-2xl font-bold"
          style="background-image: linear-gradient(135deg, #43cbff 30%, #9708cc 100%)"
        >
          {{ item.title?.charAt(0) || '?' }}
        </div>
        <div class="p-2 pb-3 box-border">
          <p class="text-xl text-red-500 font-medium">
            <span class="text-sm">¥</span>
            <span>{{ item.price }}</span>
          </p>
          <p class="text-[16px] font-medium mt-2">{{ item.title }}</p>
          <p class="text-gray-500 text-xs mt-3">{{ item.description }}</p>
          <p class="mt-3 text-gray-800">{{ `对话次数：${item.dialogueCount}` }}</p>
          <p v-if="item.paintingCount > 0" class="mt-1 text-gray-800">{{ `绘画次数：${item.paintingCount}` }}</p>
          <van-button
            class="w-full mt-3 h-10"
            round
            @click="goToPay(item.id)"
            color="linear-gradient(to right, #ff6034, #ee0a24)"
          >
            立即充值
          </van-button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/axios'
import WXTipsMask from '@/components/Common/WXTipsMask.vue'
import { isWeixinBrowser } from '@/utils/operationEnv'
import { onUnmounted } from 'vue'
import { PaymentStatusPoller } from '@/utils/paymentPoller'
import { useUserCenterStore } from '@/stores/user-center'

const store = useUserCenterStore()
const mask = ref(false)
const isInWxEnv = () => {
  if (isWeixinBrowser()) {
    mask.value = true
    document.body.classList.add('van-toast--unclickable')
  }
  else document.body.classList.remove('van-toast--unclickable')
}

const goods = ref([])

const route = useRoute()
const goToPay = async (goodId) => {
  // eslint-disable-next-line no-undef
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })
  const payUrl = isWeixinBrowser() ? '/user/service/pay/wx/jsapi' : '/user/service/pay/wx'
  const response = await axios.request({
    url: payUrl,
    method: 'post',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    data: JSON.stringify({ goodId })
  })
  if (response.status === 200) {
    const parsedData = response.data
    if (parsedData.status === -1) {
      // eslint-disable-next-line no-undef
      showFailToast('创建订单失败')
    } else if (parsedData.status === 0) {
      // eslint-disable-next-line no-undef
      closeToast()
      localStorage.setItem('payingOrderNo', parsedData.orderNo)
      window.location.href = parsedData.data.data
    }
  }
}

function refreshUserProfile() {
  axios.get('/user/profile', {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
  }).then((res) => {
    if (res.status !== 200) return
    const parsedData = res.data
    store.userId = parsedData.data.id
    store.phoneNumber = parsedData.data.phoneNumber
    store.dialogueBalance = parsedData.data.dialogueBalance
    store.paintingBalance = parsedData.data.paintingBalance
    store.vip = parsedData.data.vip
    if (parsedData.data.name) store.name = parsedData.data.name
  })
}

let poller = null

onMounted(async () => {
  const orderNo = localStorage.getItem('payingOrderNo')
  if (route.query.state === 'success' && orderNo) {
    // eslint-disable-next-line no-undef
    showLoadingToast({ message: '支付验证中...', forbidClick: true, duration: 0 })
    poller = new PaymentStatusPoller({
      orderNo,
      interval: 3000,
      maxAttempts: 60,
      onSuccess: () => {
        localStorage.removeItem('payingOrderNo')
        // eslint-disable-next-line no-undef
        closeToast()
        // eslint-disable-next-line no-undef
        showSuccessToast('充值成功')
        refreshUserProfile()
      },
      onTimeout: () => {
        localStorage.removeItem('payingOrderNo')
        // eslint-disable-next-line no-undef
        closeToast()
        // eslint-disable-next-line no-undef
        showFailToast('支付确认超时，请联系客服')
      }
    })
    poller.start()
  } else if (route.query.state === 'fail') {
    localStorage.removeItem('payingOrderNo')
    // eslint-disable-next-line no-undef
    showFailToast('付款失敗')
  }

  const response = await axios.request({
    url: '/user/service/pay/getAllGoods',
    method: 'get',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  if (response.status === 200) {
    const parsedData = response.data
    if (parsedData.status === 0) {
      goods.value = parsedData.data
    }
  }

  isInWxEnv()
})

onUnmounted(() => {
  if (poller) poller.stop()
  document.body.classList.remove('van-toast--unclickable')
})
</script>
