<template>
  <section class="pay-store">
    <div class="pay-store__content">
      <div v-if="loading" class="pay-store__state" role="status">
        <van-loading size="24px" color="var(--coral-600)" />
        <span>正在加载套餐</span>
      </div>
      <div v-else-if="loadFailed" class="pay-store__state" role="alert">
        <p>套餐加载失败，请检查网络后重试</p>
        <van-button type="primary" round native-type="button" @click="fetchGoods">重新加载</van-button>
      </div>
      <div v-else-if="listedGoods.length" class="pay-store__card">
        <p class="pay-store__card-title">选择充值套餐</p>
        <div class="pay-store__plan-list" role="group" aria-label="可选充值套餐">
          <button
            v-for="item in listedGoods"
            :key="item.id"
            type="button"
            :disabled="isPaying"
            :aria-busy="isPaying"
            :aria-pressed="selectedGoodId === item.id"
            :aria-label="packageLabel(item)"
            class="pay-store__plan"
            :class="{ 'pay-store__plan--active': selectedGoodId === item.id }"
            @click="selectGood(item.id)"
          >
            <span class="pay-store__plan-icon">
              <img
                v-if="item.imgUrl && !failedImageIds.has(item.id)"
                :src="item.imgUrl"
                :alt="`${item.title} 套餐图`"
                @error="failedImageIds.add(item.id)"
              />
              <van-icon v-else name="gem-o" size="20" aria-hidden="true" />
            </span>
            <span class="pay-store__plan-copy">
              <strong class="pay-store__plan-title">{{ item.title }}</strong>
              <span class="pay-store__plan-benefits">
                <span>对话 {{ item.dialogueCount }} 次</span>
                <span v-if="item.paintingCount">绘画 {{ item.paintingCount }} 次</span>
              </span>
            </span>
            <span class="pay-store__plan-right">
              <strong class="pay-store__plan-price">¥{{ formatPrice(item.price) }}</strong>
              <van-icon
                :name="selectedGoodId === item.id ? 'checked' : 'circle'"
                :class="selectedGoodId === item.id ? 'pay-store__check--active' : 'pay-store__check'"
                size="18"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
      </div>
      <div v-else class="pay-store__state" role="status">暂无可购买套餐</div>
    </div>

    <div v-if="listedGoods.length" class="pay-store__footer">
      <div class="pay-store__footer-total">
        <span>合计</span>
        <strong>¥{{ formatPrice(selectedGood?.price) }}</strong>
      </div>
      <button
        type="button"
        class="pay-store__pay-btn"
        :class="{ 'pay-store__pay-btn--active': !!selectedGoodId && !isPaying }"
        :disabled="!selectedGoodId || isPaying"
        :aria-busy="isPaying"
        @click="confirmPay"
      >
        <van-loading v-if="isPaying" size="16px" color="#fff" aria-hidden="true" />
        <span>{{ isPaying ? '正在创建订单' : '立即支付' }}</span>
      </button>
    </div>

    <van-dialog v-model:show="showScanQr" title="微信扫码支付" confirm-button-text="已完成支付" class-name="pay-store__qr-dialog" overlay-class="pay-store__qr-overlay">
      <div class="flex flex-col items-center py-4">
        <img v-if="qrCodeUrl" :src="qrCodeUrl" class="h-48 w-48" alt="支付二维码" />
        <p class="mt-2 text-sm text-gray-500">请使用微信扫码完成支付</p>
      </div>
    </van-dialog>
  </section>
</template>
<script setup lang="js">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/axios'
import { isWeixinBrowser } from '@/utils/operationEnv'
import { onUnmounted } from 'vue'
import { PaymentStatusPoller } from '@/utils/paymentPoller'
import { useUserCenterStore } from '@/stores/user-center'
import { showLoadingToast, closeToast, showSuccessToast, showFailToast } from 'vant'

const store = useUserCenterStore()
const route = useRoute()
let poller = null
let balanceRefreshVersion = 0
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
const isPaying = ref(false)
const failedImageIds = ref(new Set())
const selectedGoodId = ref(null)
const listedGoods = computed(() => {
  const trial = goods.value.find((good) => /体验/.test(good.title))
  return trial ? [trial, ...goods.value.filter((good) => good.id !== trial.id)] : goods.value
})
const selectedGood = computed(() => goods.value.find((good) => good.id === selectedGoodId.value) || null)

const formatPrice = (price) => Number.isFinite(price) ? price.toFixed(2) : '--'

const normalizeCount = (value) => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 ? value : 0
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return 0

  const count = Number(value.trim())
  return Number.isSafeInteger(count) ? count : 0
}

const normalizeGood = (good) => {
  if (!good || typeof good !== 'object' || (typeof good.id !== 'string' && typeof good.id !== 'number')) return null

  const price = Number(good.price)
  if (!Number.isFinite(price) || price < 0) return null

  return {
    ...good,
    title: typeof good.title === 'string' && good.title.trim() ? good.title.trim() : '未命名套餐',
    imgUrl: typeof good.imgUrl === 'string' ? good.imgUrl : '',
    price,
    dialogueCount: normalizeCount(good.dialogueCount),
    paintingCount: normalizeCount(good.paintingCount)
  }
}

const packageLabel = (good) => `选择${good.title}，${formatPrice(good.price)}元，对话${good.dialogueCount}次，绘画${good.paintingCount}次`

const selectGood = (id) => {
  selectedGoodId.value = selectedGoodId.value === id ? null : id
}

const confirmPay = () => {
  if (selectedGoodId.value && !isPaying.value) void goToPay(selectedGoodId.value)
}

const goToPay = async (goodId) => {
  if (isPaying.value) return

  isPaying.value = true
  showLoadingToast({ message: '加载中...', forbidClick: true, duration: 0, className: 'pay-store__toast' })
  const payType = getPayType()
  let payUrl = ''
  if (payType === 'jsapi') payUrl = '/user/service/pay/wx/jsapi'
  else if (payType === 'h5') payUrl = '/user/service/pay/wx'
  else payUrl = '/user/service/pay/wx/scan'

  let scanPollingStarted = false

  try {
    const response = await axios.request({
      url: payUrl,
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: { goodId }
    })
    if (response.status !== 200 || response.data?.status !== 0) {
      throw new Error('Failed to create payment order')
    }

    const parsedData = response.data
    const orderNo = typeof parsedData.orderNo === 'string' ? parsedData.orderNo.trim() : ''
    const codeUrl = typeof parsedData.data?.codeUrl === 'string' ? parsedData.data.codeUrl.trim() : ''
    const redirectUrl = typeof parsedData.data?.data === 'string' ? parsedData.data.data.trim() : ''

    if (!orderNo || (payType === 'scan' && !codeUrl) || (payType !== 'scan' && !redirectUrl)) {
      closeToast()
      isPaying.value = false
      showFailToast({ message: '创建订单失败，请稍后重试', className: 'pay-store__toast' })
      return
    }

    closeToast()
    localStorage.setItem('payingOrderNo', orderNo)

    if (payType === 'scan') {
      qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(codeUrl)}`
      showScanQr.value = true
      scanPollingStarted = startPolling(orderNo)
    } else {
      window.location.href = redirectUrl
    }
  } catch (error) {
    closeToast()
    console.error('Failed to create payment order', error)
    showFailToast({ message: '创建订单失败，请稍后重试', className: 'pay-store__toast' })
  } finally {
    if (!scanPollingStarted) isPaying.value = false
  }
}

function startPolling(orderNo) {
  if (!orderNo) orderNo = localStorage.getItem('payingOrderNo')
  if (!orderNo) return false
  if (poller) {
    poller.stop()
    poller = null
  }
  isPaying.value = true
  showLoadingToast({ message: '支付验证中...', forbidClick: true, duration: 0, className: 'pay-store__toast' })
  poller = new PaymentStatusPoller({
    orderNo,
    interval: 3000,
    maxAttempts: 60,
    onSuccess: () => {
      localStorage.removeItem('payingOrderNo')
      showScanQr.value = false
      closeToast()
      isPaying.value = false
      showSuccessToast({ message: '充值成功', className: 'pay-store__toast' })
      void refreshUserProfile()
    },
    onTimeout: () => {
      localStorage.removeItem('payingOrderNo')
      closeToast()
      isPaying.value = false
      showFailToast({ message: '支付确认超时，请联系客服', className: 'pay-store__toast' })
    }
  })
  poller.start()
  return true
}

async function refreshUserProfile() {
  const refreshVersion = ++balanceRefreshVersion

  try {
    const res = await axios.get('/user/profile', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
    const profile = res.data?.data
    if (res.status !== 200 || !profile || typeof profile !== 'object') throw new Error('Failed to refresh user profile')
    if (refreshVersion !== balanceRefreshVersion) return false

    store.userId = profile.id
    store.phoneNumber = profile.phoneNumber
    store.dialogueBalance = normalizeCount(profile.dialogueBalance)
    store.paintingBalance = normalizeCount(profile.paintingBalance)
    store.vip = profile.vip
    if (profile.name) store.name = profile.name
    return true
  } catch (error) {
    console.error('Failed to refresh user profile', error)
    return false
  }
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
    goods.value = response.data.data.map(normalizeGood).filter(Boolean)
  } catch (error) {
    goods.value = []
    loadFailed.value = true
    console.error('Failed to load payment goods', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  void refreshUserProfile()

  const orderNo = localStorage.getItem('payingOrderNo')
  if (route.query.state === 'success' && orderNo) {
    showLoadingToast({ message: '支付验证中...', forbidClick: true, duration: 0, className: 'pay-store__toast' })
    startPolling(orderNo)
  } else if (route.query.state === 'fail') {
    localStorage.removeItem('payingOrderNo')
    showFailToast({ message: '付款失敗', className: 'pay-store__toast' })
  }

  await fetchGoods()
})

onUnmounted(() => {
  if (poller) {
    poller.stop()
    poller = null
  }
  isPaying.value = false
})
</script>

<style scoped>
.pay-store {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  background: var(--app-bg);
}

.pay-store__content {
  padding: 12px 12px 96px;
}

.pay-store__card {
  padding: 6px 4px 4px;
  border-radius: 12px;
  background: var(--app-surface);
}

.pay-store__card-title {
  margin: 0;
  padding: 12px 12px 2px;
  color: var(--ink-900);
  font-size: 15px;
  font-weight: 650;
}

.pay-store__state {
  display: flex;
  min-height: 188px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 12px;
  background: var(--app-surface);
  color: var(--ink-500);
  font-size: 14px;
  text-align: center;
}

.pay-store__state p {
  margin: 0;
}

.pay-store__plan-list {
  display: grid;
}

.pay-store__plan {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 0;
  border-bottom: 1px solid rgba(28, 32, 46, 0.06);
  border-radius: 10px;
  background: transparent;
  color: var(--ink-900);
  cursor: pointer;
  text-align: left;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.pay-store__plan:last-child {
  border-bottom: 0;
}

.pay-store__plan:hover:not(:disabled) {
  background: var(--coral-50);
}

.pay-store__plan--active {
  color: var(--coral-700);
}

.pay-store__plan--active:hover:not(:disabled) {
  background: var(--coral-50);
}

.pay-store__plan:active:not(:disabled) {
  transform: scale(0.99);
}

.pay-store__plan:focus-visible {
  outline: 2px solid var(--coral-500);
  outline-offset: -2px;
}

.pay-store__plan:disabled {
  cursor: wait;
  opacity: 0.65;
}

.pay-store__plan-icon {
  display: inline-flex;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--coral-500), var(--coral-600));
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 96, 52, 0.28);
}

.pay-store__plan-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pay-store__plan-copy {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.pay-store__plan-title {
  overflow: hidden;
  color: var(--ink-900);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pay-store__plan--active .pay-store__plan-title {
  color: var(--coral-700);
}

.pay-store__plan-benefits {
  display: flex;
  min-width: 0;
  gap: 8px;
  color: var(--ink-500);
  font-size: 12px;
  line-height: 16px;
}

.pay-store__plan-benefits span {
  white-space: nowrap;
}

.pay-store__plan-right {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.pay-store__plan-price {
  color: var(--ink-900);
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
}

.pay-store__plan--active .pay-store__plan-price {
  color: var(--coral-600);
}

.pay-store__check {
  color: #d8dadd;
}

.pay-store__check--active {
  color: var(--coral-500);
}

.pay-store__footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(28, 32, 46, 0.08);
  background: color-mix(in srgb, var(--app-surface) 96%, transparent);
  backdrop-filter: blur(12px);
}

.pay-store__footer-total {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 6px;
  color: var(--ink-500);
  font-size: 12px;
}

.pay-store__footer-total strong {
  overflow: hidden;
  max-width: 100%;
  color: var(--coral-600);
  font-size: 18px;
  font-weight: 750;
  text-overflow: ellipsis;
}

.pay-store__pay-btn {
  display: inline-flex;
  height: 44px;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 22px;
  background: var(--coral-100);
  color: var(--coral-400);
  cursor: not-allowed;
  font-size: 15px;
  font-weight: 650;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.pay-store__pay-btn--active {
  background: linear-gradient(135deg, var(--coral-600), var(--coral-500));
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(255, 96, 52, 0.32);
}

.pay-store__pay-btn:disabled {
  cursor: not-allowed;
}

.pay-store__pay-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.pay-store__pay-btn:focus-visible {
  outline: 2px solid var(--coral-500);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .pay-store button,
  .pay-store__plan {
    transition: none;
  }

  .pay-store :deep(.van-loading__spinner),
  .pay-store :deep(.van-loading__circular circle) {
    animation: none !important;
    transition: none !important;
  }
}
</style>

<style>
@media (prefers-reduced-motion: reduce) {
  .pay-store__qr-dialog.van-dialog,
  .pay-store__qr-overlay.van-overlay,
  .pay-store__toast.van-toast,
  .pay-store__toast .van-loading__spinner,
  .pay-store__toast .van-loading__circular circle {
    animation: none !important;
    transition: none !important;
  }
}
</style>
