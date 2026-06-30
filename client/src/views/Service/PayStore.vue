<template>
  <WXTipsMask v-if="mask" />
  <section class="bg-white p-4 box-border min-h-full">
    <p class="font-medium text-lg">充值套餐</p>
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mt-2">
      <div
        v-for="item in goods"
        :key="item.id"
        @click="goToPay(item.id)"
        class="flex flex-col rounded-lg shadow-md overflow-hidden cursor-pointer active:opacity-80"
      >
        <div
          v-if="item.imgUrl"
          class="h-[6.5rem] flex items-center justify-center p-3"
          style="background: linear-gradient(135deg, #ff6034 30%, #ff6e65 100%)"
        >
          <img
            :src="item.imgUrl"
            class="h-full w-full object-contain"
          />
        </div>
        <div
          v-else
          class="h-[6.5rem] flex items-center justify-center text-white text-2xl font-bold"
          style="background: linear-gradient(135deg, #ff6034 30%, #ff6e65 100%)"
        >
          {{ item.title?.charAt(0) || '?' }}
        </div>
        <div class="p-3 pb-3 box-border">
          <p class="text-xl text-[#ff6e65] font-medium">
            <span class="text-sm">¥</span>
            <span>{{ Number(item.price).toFixed(2) }}</span>
          </p>
          <p class="text-[16px] font-medium mt-1.5">{{ item.title }}</p>
          <div class="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
            <span class="text-xs text-gray-500">{{ `对话 ${item.dialogueCount} 次` }}</span>
            <span v-if="item.paintingCount > 0" class="text-xs text-gray-500">{{ `绘画 ${item.paintingCount} 次` }}</span>
          </div>
        </div>
      </div>
    </div>

    <van-dialog v-model:show="showScanQr" title="微信扫码支付" confirm-button-text="已完成支付">
      <div class="flex flex-col items-center py-4">
        <img v-if="qrCodeUrl" :src="qrCodeUrl" class="w-48 h-48" alt="支付二维码" />
        <p class="text-sm text-gray-500 mt-2">请使用微信扫码完成支付</p>
      </div>
    </van-dialog>
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
import { showLoadingToast, closeToast, showSuccessToast, showFailToast } from 'vant'

const store = useUserCenterStore()
const mask = ref(false)
const showScanQr = ref(false)
const qrCodeUrl = ref('')

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function getPayType() {
  if (isWeixinBrowser()) return 'jsapi'
  if (isMobileDevice()) return 'h5'
  return 'scan'
}

const goods = ref([])

const route = useRoute()

let poller = null

const goToPay = async (goodId) => {
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0 })
  const payType = getPayType()
  let payUrl = ''
  if (payType === 'jsapi') payUrl = '/user/service/pay/wx/jsapi'
  else if (payType === 'h5') payUrl = '/user/service/pay/wx'
  else payUrl = '/user/service/pay/wx/scan'

  const response = await axios.request({
    url: payUrl,
    method: 'post',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    data: { goodId }
  })
  if (response.status === 200) {
    const parsedData = response.data
    if (parsedData.status === -1) {
      closeToast()
      showFailToast('创建订单失败')
    } else if (parsedData.status === 0) {
      closeToast()
      localStorage.setItem('payingOrderNo', parsedData.orderNo)

      if (payType === 'scan') {
        qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(parsedData.data.codeUrl)}`
        showScanQr.value = true
        startPolling(parsedData.orderNo)
      } else {
        window.location.href = parsedData.data.data
      }
    }
  }
}

function startPolling(orderNo) {
  if (!orderNo) orderNo = localStorage.getItem('payingOrderNo')
  if (!orderNo) return
  showLoadingToast({ message: '支付验证中...', forbidClick: true, duration: 0 })
  poller = new PaymentStatusPoller({
    orderNo,
    interval: 3000,
    maxAttempts: 60,
    onSuccess: () => {
      localStorage.removeItem('payingOrderNo')
      showScanQr.value = false
      closeToast()
      showSuccessToast('充值成功')
      refreshUserProfile()
    },
    onTimeout: () => {
      localStorage.removeItem('payingOrderNo')
      closeToast()
      showFailToast('支付确认超时，请联系客服')
    }
  })
  poller.start()
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

onMounted(async () => {
  const orderNo = localStorage.getItem('payingOrderNo')
  if (route.query.state === 'success' && orderNo) {
    showLoadingToast({ message: '支付验证中...', forbidClick: true, duration: 0 })
    startPolling(orderNo)
  } else if (route.query.state === 'fail') {
    localStorage.removeItem('payingOrderNo')
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

  if (isWeixinBrowser() && !route.query.state) {
    mask.value = true
    document.body.classList.add('van-toast--unclickable')
  }
})

onUnmounted(() => {
  if (poller) {
    poller.stop()
    poller = null
  }
  document.body.classList.remove('van-toast--unclickable')
})
</script>