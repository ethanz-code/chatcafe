<template>
  <WXTipsMask v-if="mask" />
  <section class="bg-white p-4 box-border min-h-full">
    <p class="font-medium text-lg">充值套餐</p>
    <div v-if="loading" class="mt-3 flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-gray-500" role="status">
      <van-loading size="24px" color="#ff6034" />
      <span>正在加载套餐</span>
    </div>
    <div v-else-if="loadFailed" class="mt-3 flex min-h-48 flex-col items-center justify-center gap-3 text-center" role="alert">
      <p class="text-sm text-gray-600">套餐加载失败，请检查网络后重试</p>
      <button type="button" class="rounded-md border border-[#ff6034] px-4 py-2 text-sm font-medium text-[#e8502a] active:bg-[#fff3ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6034]" @click="fetchGoods">
        重新加载
      </button>
    </div>
    <div v-else-if="goods.length === 0" class="mt-3 flex min-h-48 items-center justify-center text-sm text-gray-500" role="status">
      暂无可购买套餐
    </div>
    <div v-else class="grid grid-cols-2 gap-3 mt-3">
      <button
        v-for="item in goods"
        :key="item.id"
        type="button"
        :aria-pressed="selectedGoodId === item.id"
        :aria-label="`选择${item.title}，价格${Number(item.price).toFixed(2)}元`"
        @click="selectedGoodId = item.id; goToPay(item.id)"
        class="flex min-w-0 flex-col overflow-hidden rounded-lg border text-left transition-colors active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6034]"
        :class="selectedGoodId === item.id ? 'border-[#ff6034] bg-[#fff8f5] shadow-sm' : 'border-gray-200 bg-white'"
      >
        <div
          v-if="item.imgUrl && !failedImageIds.has(item.id)"
          class="h-[6.5rem] flex items-center justify-center p-3"
          style="background: linear-gradient(135deg, #ff6034 30%, #ff6e65 100%)"
        >
          <img
            :src="item.imgUrl"
            class="h-full w-full object-contain"
            :alt="`${item.title} 套餐图`"
            @error="failedImageIds.add(item.id)"
          />
        </div>
        <div
          v-else
          class="h-[6.5rem] flex items-center justify-center text-white text-2xl font-bold"
          style="background: linear-gradient(135deg, #ff6034 30%, #ff6e65 100%)"
        >
          {{ item.title?.charAt(0) || '?' }}
        </div>
        <div class="flex flex-1 flex-col p-3 box-border">
          <p class="text-xl leading-none text-[#e8502a] font-semibold">
            <span class="text-sm">¥</span>
            <span>{{ Number(item.price).toFixed(2) }}</span>
          </p>
          <p class="mt-2 truncate text-[16px] font-medium text-gray-900">{{ item.title }}</p>
          <div class="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2.5 text-xs">
            <span class="text-gray-500">对话 <strong class="font-semibold text-gray-800">{{ item.dialogueCount }}</strong></span>
            <span class="text-gray-500">绘画 <strong class="font-semibold text-gray-800">{{ item.paintingCount || 0 }}</strong></span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs font-medium" :class="selectedGoodId === item.id ? 'text-[#e8502a]' : 'text-gray-500'">
            <span>{{ selectedGoodId === item.id ? '已选择' : '选择套餐' }}</span>
            <span aria-hidden="true" class="text-base leading-none">›</span>
          </div>
        </div>
      </button>
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
const loading = ref(true)
const loadFailed = ref(false)
const selectedGoodId = ref(null)
const failedImageIds = ref(new Set())

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

async function fetchGoods() {
  loading.value = true
  loadFailed.value = false

  try {
    const response = await axios.request({
      url: '/user/service/pay/getAllGoods',
      method: 'get',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.status !== 200 || response.data?.status !== 0 || !Array.isArray(response.data.data)) {
      throw new Error('Failed to load payment goods')
    }
    goods.value = response.data.data
  } catch (error) {
    goods.value = []
    loadFailed.value = true
    console.error('Failed to load payment goods', error)
  } finally {
    loading.value = false
  }
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

  await fetchGoods()

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
