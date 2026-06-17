<template>
  <section class="max-h-[2880px] p-3 box-border flex flex-col gap-3">
    <canvas ref="canvasRef" class="rounded-lg shadow-sm overflow-hidden"></canvas>
    <div ref="qrcodeRef" style="position: fixed; opacity: 0"></div>
    <div class="bg-white rounded-lg p-2 shadow-sm overflow-hidden flex flex-col gap-1">
      <p class="font-medium">邀请说明</p>
      <p class="text-xs">
        好友通过您分享或者邀请海报注册登录后，您将获得免费对话额度。惊喜不断，赶快分享吧！
      </p>
    </div>
    <van-button
      @click="onSubmit"
      class="w-full"
      round
      color="linear-gradient(to right, #ff6034, #ee0a24)"
    >
      点击保存图片
    </van-button>
  </section>
</template>
<script setup lang="js">
import { ref, onMounted } from 'vue'
import { useUserCenterStore } from '@/stores/user-center'
import axios from '@/utils/axios'

const userStore = useUserCenterStore()
const qrcodeUrl = ref('')

const canvasRef = ref()
const canvasWidth = ref(1620)
const canvasHeight = ref(2880)
const baseUrl = import.meta.env.VITE_WEB_URL
const qrcodeRef = ref()
function createHDCanvas(canvas, w, h) {
  const ratio = window.devicePixelRatio || 1
  canvas.width = w * ratio // 实际渲染像素
  canvas.height = h * ratio // 实际渲染像素
  canvas.style.width = `${w}px` // 控制显示大小
  canvas.style.height = `${h}px` // 控制显示大小
  const ctx = canvas.getContext('2d')
  ctx.scale(ratio, ratio)
  // canvas 绘制
  return canvas
}
const drawWork = () => {
  const ctx = canvasRef.value.getContext('2d')

  // 创建一个图片对象
  const img = new Image()
  img.src = `${baseUrl}/res/service/invite_large.png` // 替换为你的图片链接

  // 图片加载完成后执行绘制
  img.onload = async () => {
    // 绘制背景
    ctx.drawImage(img, 0, 0, canvasWidth.value, canvasHeight.value)

    // 计算QRCode x y以及宽高
    const qrcodeX = (108 / 366) * canvasWidth.value
    const qrcodeY = (128 / 366) * canvasHeight.value
    const qrcodeWidth = (148 / 366) * canvasWidth.value
    const qrcodeHeight = (148 / 366) * canvasWidth.value

    // eslint-disable-next-line no-undef
    showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '生成中...'
    })
    const response = await axios.request({
      url: `https://api.qrserver.com/v1/create-qr-code?data=${qrcodeUrl.value}`,
      method: 'get',
      responseType: 'arraybuffer'
    })
    // 将获取到的图片数据转换为 Base64 编码
    const imageData = arrayBufferToBase64(response.data)
    // 构建图片的 Data URL
    const base64 = `data:${response.headers['content-type']};base64,${imageData}`
    // eslint-disable-next-line no-undef
    closeToast()

    // 获取生成的二维码图片
    const qrImage = new Image()
    // console.log(base64)
    qrImage.src = base64
    qrImage.onload = () => {
      // 在目标 Canvas 上指定位置绘制二维码
      ctx.drawImage(qrImage, qrcodeX, qrcodeY, qrcodeWidth, qrcodeHeight)
      // showSuccessToast(qrcodeUrl.value)
    }
  }
}

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

const onSubmit = () => {
  // 将canvas导出为图片
  const imageData = canvasRef.value.toDataURL()
  // 转为blob对象
  const byteString = atob(imageData.split(',')[1])
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], { type: 'image/png' })

  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  // 设置文件名
  link.download = '爱设计AIGC-邀请海报.png'
  link.click()
  link.remove()
}

onMounted(() => {
  canvasWidth.value = window.innerWidth - 24
  canvasHeight.value = (canvasWidth.value / 1620) * 2880
  qrcodeUrl.value = `${import.meta.env.VITE_WEB_URL}/modules/register?inviteCode=${userStore.inviteCode}`
  createHDCanvas(canvasRef.value, canvasWidth.value, canvasHeight.value)
  drawWork()
})
</script>
