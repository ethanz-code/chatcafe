<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <van-form class="mt-3" @submit="onSubmit">
    <van-cell-group class="flex flex-col gap-1 items-center justify-center" inset>
      <img class="w-32 h-32 mt-14" v-lazy="'/res/service/qrcode.png'" />
      <p class="font-bold mt-3">添加企业公众号</p>
      <p class="text-gray-500 mt-4">服务时间：早上9:00 - 18:00</p>
      <div class="flex gap-0.5 items-center text-gray-500">
        <span>客服电话：0531-66688888</span>
        <a href="tel:0531-66688888" class="text-gray-400 underline">拨打</a>
      </div>
      <div class="w-2/3 mt-10 my-16">
        <van-button
          round
          block
          type="primary"
          color="linear-gradient(to right, #ff6034, #ee0a24)"
          native-type="submit"
        >
          保存二维码图片
        </van-button>
      </div>
    </van-cell-group>
  </van-form>
</template>
<script setup lang="js">
import downloadImage from '@/utils/downloadImg.js'

const onSubmit = () => {
  const imgUrl = import.meta.env.VITE_WEB_URL + '/res/service/qrcode.png'
  downloadImage(imgUrl, '企业公众号-二维码.png')
}
</script>
