<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="h-full bg-white flex flex-col items-center p-4 box-border">
    <p class="w-full text-gray-500">反馈类型</p>
    <van-radio-group v-model="checked" direction="horizontal" class="w-full mt-4">
      <van-radio name="故障">故障</van-radio>
      <van-radio name="建议">建议</van-radio>
      <van-radio name="投诉">投诉</van-radio>
    </van-radio-group>

    <p class="w-full text-gray-500 mt-4">反馈内容</p>
    <van-field
      v-model="content"
      rows="2"
      autosize
      class="bg-gray-100/80 mt-3 p-2 rounded-md"
      type="textarea"
      maxlength="50"
      placeholder="请输入反馈内容"
      show-word-limit
    />

    <p class="w-full text-gray-500 mt-4">联系方式</p>
    <van-field
      v-model="concat"
      placeholder="请输入联系方式（邮箱或手机号）"
      class="bg-gray-100/80 mt-3 p-2 rounded-md"
    />

    <van-button
      @click="onSubmit"
      class="w-full mt-10"
      round
      color="linear-gradient(to right, #ff6034, #ee0a24)"
    >
      立即提交
    </van-button>
  </section>
</template>
<script setup lang="js">
import { ref } from 'vue'
import axios from '@/utils/axios'

const checked = ref('故障')
const content = ref('')
const concat = ref('')
const phoneNumberPattern = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const onSubmit = async () => {
  // 检测反馈内容是否为空
  // eslint-disable-next-line no-undef
  if (content.value.length === 0) return showFailToast('输入反馈内容')

  // 检测联系方式是否为手机号或邮箱
  if (!phoneNumberPattern.test(concat.value) && !emailPattern.test(concat.value))
    // eslint-disable-next-line no-undef
    return showFailToast('联系方式格式不正确')

  const formData = new FormData()
  formData.append('type', checked.value)
  formData.append('content', content.value)
  formData.append('contact', concat.value)
  const response = await axios.request({
    url: '/user/service/feedback',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    data: formData
  })
  if (response.status === 200) {
    const parsedData = JSON.parse(response.data)
    if (parsedData.status === 0) {
      // 提交成功
      // eslint-disable-next-line no-undef
      showSuccessToast('提交成功')

      // 重置表单
      checked.value = '故障'
      content.value = ''
      concat.value = ''
    }
  }
}
</script>
