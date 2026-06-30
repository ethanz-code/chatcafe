<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <van-form class="mt-3" @submit="onSubmit">
    <van-cell-group class="flex flex-col gap-1 items-center justify-center" inset>
      <img class="w-32 h-32 mt-14" :src="qrcodeUrl" />
      <p class="font-bold mt-3">联系我们</p>
      <p class="text-gray-500 mt-4">服务时间：早上9:00 - 18:00</p>
      <div v-if="contactEmail" class="flex gap-0.5 items-center text-gray-500">
        <span>联系邮箱：{{ contactEmail }}</span>
        <a :href="'mailto:' + contactEmail" class="text-gray-400 underline">发送邮件</a>
      </div>
      <div class="w-2/3 mt-10 my-16">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
        >
          保存二维码图片
        </van-button>
      </div>
    </van-cell-group>
  </van-form>
</template>
<script setup lang="js">
import { ref, onMounted } from 'vue'
import downloadImage from '@/utils/downloadImg.js'
import axios from '@/utils/axios'

const contactEmail = ref('')
const qrcodeUrl = ref(`https://api.qrserver.com/v1/create-qr-code?data=htlabs.com.cn&size=256x256`)

onMounted(() => {
  axios.get('/config/site').then((res) => {
    if (res.status === 200 && res.data?.status === 0) {
      contactEmail.value = res.data.data.contactEmail || ''
    }
  })
})

const onSubmit = () => {
  downloadImage(qrcodeUrl.value, '二维码.png')
}
</script>
