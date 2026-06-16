<template>
  <section class="bg-white min-h-full">
    <div v-if="allStar.length > 0" class="min-h-dvh p-4 box-border bg-gray-50">
      <ul class="flex flex-col gap-4">
        <li v-for="(item, index) in allStar" :key="item" class="bg-white p-3.5 relative">
          <div class="flex gap-2 items-start">
            <div class="p-1 leading-3 bg-[#4073fa] text-white">问</div>
            <MessageModule
              show-cursor="false"
              :text="item.userMsg"
              :item="{ role: 'user', disable: true }"
            />
          </div>
          <div
            :class="[
              'flex gap-2 items-start overflow-hidden text-gray-700',
              readMore[index] ? '' : 'max-h-52'
            ]"
          >
            <div class="p-1 leading-3 bg-[#ff6034] text-white">答</div>
            <MessageModule
              show-cursor="false"
              :text="item.assistantMsg"
              :item="{ role: 'assistant', disable: true }"
            />
          </div>
          <div
            @click="readMore[index] = !readMore[index]"
            :style="{
              background: readMore[index]
                ? ''
                : 'linear-gradient(to top, rgba(255, 255, 255, 1) 20%, rgba(255, 255, 255, 0))'
            }"
            class="absolute pt-16 pl-4 bottom-9 inset-x-0 text-blue-500"
          >
            <div v-if="!readMore[index]" class="flex gap-1 justify-center items-center">
              展开阅读全文
              <DownFilled class="w-4" />
            </div>
            <div v-else class="flex gap-1 justify-center items-center">
              收起
              <UpFilled class="w-4" />
            </div>
          </div>
          <div class="flex justify-between mt-5 pl-8 pr-3 text-gray-500">
            <div @click="copyMsg(item.assistantMsg)" class="cursor-pointer">复制</div>
            <div @click="starMsg(item, index)" class="cursor-pointer">
              <div class="flex items-center gap-1" v-if="hasStar[index]">
                <StarFilled class="w-5 text-[#ff6e65]" /> 取消收藏
              </div>
              <div class="flex items-center gap-1" v-else><Star class="w-5" /> 收藏</div>
            </div>
          </div>
        </li>
      </ul>
      <van-divider>没有更多了</van-divider>
    </div>
    <div v-else>
      <van-empty description="无任何收藏" />
    </div>
  </section>
</template>
<script setup lang="js">
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios.js'
import MessageModule from '@/components/TabBar/AIChat/MessageModule.vue'
import {
  Star24Regular as Star,
  Star24Filled as StarFilled,
  ChevronDown24Filled as DownFilled,
  ChevronUp24Filled as UpFilled
} from '@vicons/fluent'
import copy from '@/utils/copyInformation'
import { showSuccessToast } from 'vant'

const copyMsg = (msg) => {
  copy(msg, () => {
    showSuccessToast('复制成功')
  })
}

const allStar = ref([])
const hasStar = ref([])
const readMore = ref([])
const starMsg = async (item, index) => {
  const formData = new FormData()
  formData.append('dialogUUID', item.dialogUUID)
  formData.append('userMsgTime', item.userMsgTime)
  formData.append('userMsg', item.userMsg)
  formData.append('assistantMsgTime', item.assistantMsgTime)
  formData.append('assistantMsg', item.assistantMsg)
  const response = await axios.request({
    url: '/user/service/star/starMsg',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    data: formData
  })
  if (response.status === 200) {
    const parsedData = JSON.parse(response.data)
    if (parsedData.status === 0) {
      // eslint-disable-next-line no-undef
      showSuccessToast('已收藏')
      hasStar.value[index] = true
    } else if (parsedData.status === 1) {
      // eslint-disable-next-line no-undef
      showFailToast('已取消')
      hasStar.value[index] = false
    } else {
      // eslint-disable-next-line no-undef
      showFailToast('收藏失败')
    }
  }
}
onMounted(async () => {
  const res = await axios.request({
    url: '/user/service/star/getAllStar',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
  })
  if (res.status === 200) {
    const parsedData = JSON.parse(res.data)
    if (parsedData.status === 0) {
      allStar.value = parsedData.data
      // 循环为hasStar push布尔值true,
      // 用于处理收藏逻辑，当用户取消收藏后不立马消失，而是显示已取消收藏的提示，刷新后才消失
      for (let i = 0; i < allStar.value.length; i++) {
        hasStar.value.push(true)
      }
      // 循环push布尔值false到readMore
      // 用于处理展开阅读全文逻辑，当用户点击展开阅读全文时，将readMore的值改为true，
      // 这样当用户点击展开阅读全文时，readMore的值就为true，从而实现展开阅读全文的逻辑
      for (let i = 0; i < allStar.value.length; i++) {
        readMore.value.push(false)
      }
    }
  }
})
</script>
