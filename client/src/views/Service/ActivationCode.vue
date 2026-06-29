<template>
  <section class="h-full bg-white flex flex-col items-center p-4 pt-0 box-border">
    <van-notice-bar
      class="w-full"
      :scrollable="false"
      color="#1989fa"
      background="#ecf9ff"
      left-icon="info-o"
    >
      输入正确的卡密信息，可兑换对话次数。
    </van-notice-bar>
    <p class="w-full text-gray-500 mt-4">卡密信息</p>
    <van-field
      v-model="content"
      placeholder="请输入卡密数据"
      class="bg-gray-100/80 mt-3 p-2 rounded-md"
    />
    <van-button
      @click="onSubmit"
      class="w-full mt-10"
      round
      color="linear-gradient(to right, #ff6034, #ee0a24)"
    >
      兑换
    </van-button>
  </section>
</template>
<script setup lang="js">
import { ref } from 'vue'
import axios from '@/utils/axios'

const content = ref('')

const onSubmit = async () => {
  content.value = content.value.trim()

  // eslint-disable-next-line no-undef
  if (content.value.length === 0) return showFailToast('请输入卡密')

  const jsonData = {
    code: content.value.toString()
  }
  const response = await axios.request({
    url: '/user/service/activationCode/verify',
    method: 'get',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    params: jsonData
  })
  if (response.status === 200) {
    const parsedData = response.data
    if (parsedData.status === 0) {
      // eslint-disable-next-line no-undef
      showSuccessToast('兑换成功')
    } else {
      // eslint-disable-next-line no-undef
      showFailToast('兑换失败')
    }
  }
}
</script>
