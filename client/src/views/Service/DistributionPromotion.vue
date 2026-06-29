<template>
  <section class="bg-white p-3 box-border flex flex-col gap-3 min-h-full">
    <img src="/res/service/distribution_promotion.png" class="w-full rounded-lg object-cover" />
    <van-notice-bar scrollable color="#1989fa" background="#ecf9ff" left-icon="info-o">
      <span>
        累计邀请用户：
        <span class="text-red-500">{{ invitee.length }}</span
        >人
      </span>
      <span class="ml-2">
        赚取对话余额： <span class="text-red-500">{{ 50 * invitee.length }}</span
        >次
      </span>
      <span class="ml-2">每邀请成功一人即可赚取50次对话</span>
    </van-notice-bar>
    <div class="font-medium text-lg mt-3">邀请列表</div>
    <div class="flex flex-col gap-2">
      <div
        v-for="(item, index) in invitee"
        :key="item"
        :class="[
          'flex justify-between border-0 border-b border-solid p-2',
          index != invitee.length - 1 ? 'border-gray-100' : 'border-white'
        ]"
      >
        <div class="flex items-center h-12 gap-2">
          <img v-lazy="getAvatar(item)" class="w-12 h-12 rounded-full" />
          <div class="flex flex-col gap-1">
            <div class="font-medium">{{ getUserName(item) }}</div>
            <div class="text-xs text-gray-500">
              {{ `注册时间：${moment(item.createdAt).format('YYYY-MM-DD HH:mm')}` }}
            </div>
          </div>
        </div>
        <div>{{ `ID:${item.id}` }}</div>
      </div>
      <van-empty v-if="invitee.length === 0" description="无邀请人" />
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import axios from '@/utils/axios.js'
import moment from 'moment'

const invitee = ref([])
const getProcessPhoneNumber = (value) => {
  // 将一段手机号的中间四位改为*号并返回
  return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
const getUserName = (item) => {
  if (item.name) return item.name
  else return getProcessPhoneNumber(item.phoneNumber)
}

const getAvatar = (item) => {
  let avatarName = item.avatar.split('/')
  avatarName = avatarName[avatarName.length - 1]
  if (avatarName.includes('default')) {
    return '/res/avatar-not-login.png'
  } else {
    return item.avatar
  }
}

onMounted(async () => {
  const response = await axios.request({
    url: '/user/service/promotion/getAllInviteeUser',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
  })
  if (response.status === 200) {
    const parsedData = response.data
    if (parsedData.status === 0) {
      invitee.value = parsedData.data
    }
  }
})
</script>
