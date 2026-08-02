<template>
  <section class="min-h-full bg-gray-50">
    <div v-if="isLoading" class="flex min-h-dvh items-center justify-center">
      <van-loading size="24px">正在加载收藏</van-loading>
    </div>
    <div v-else-if="loadFailed" class="flex min-h-dvh items-center justify-center">
      <van-empty image="error" description="收藏加载失败">
        <van-button type="primary" size="small" @click="loadStars">重试</van-button>
      </van-empty>
    </div>
    <div v-else-if="allStar.length > 0" class="min-h-dvh p-4 box-border">
      <ul class="flex flex-col gap-3">
        <li v-for="(item, index) in allStar" :key="item" class="bg-white px-4 py-3.5 shadow-sm">
          <div class="flex gap-2 items-start">
            <span class="mt-1 shrink-0 bg-[#4073fa] px-1.5 py-0.5 text-xs leading-4 text-white">问</span>
            <MessageModule
              class="min-w-0 flex-1"
              show-cursor="false"
              :text="item.userMsg"
              :item="{ role: 'user', disable: true }"
            />
          </div>
          <div
            :class="[
              'mt-3 flex gap-2.5 items-start overflow-hidden text-gray-700',
              readMore[index] ? '' : 'max-h-52'
            ]"
          >
            <span class="mt-1 shrink-0 bg-[#ff6e65] px-1.5 py-0.5 text-xs leading-4 text-white">答</span>
            <MessageModule
              class="min-w-0 flex-1"
              show-cursor="false"
              :text="item.assistantMsg"
              :item="{ role: 'assistant', disable: true }"
            />
          </div>
          <button
            type="button"
            class="mt-2 flex w-full items-center justify-center gap-1 py-2 text-sm text-blue-500"
            :aria-expanded="readMore[index]"
            @click="readMore[index] = !readMore[index]"
          >
            <template v-if="!readMore[index]">
              展开阅读全文
              <DownFilled class="w-4" />
            </template>
            <template v-else>
              收起
              <UpFilled class="w-4" />
            </template>
          </button>
          <div class="mt-1 flex border-t border-gray-100 pt-2 text-sm text-gray-500">
            <button type="button" class="flex flex-1 items-center justify-center py-2" @click="copyMsg(item.assistantMsg)">
              复制回答
            </button>
            <button type="button" class="flex flex-1 items-center justify-center py-2" @click="starMsg(item, index)">
              <span v-if="hasStar[index]" class="flex items-center gap-1">
                <StarFilled class="w-5 text-[#ff6e65]" /> 取消收藏
              </span>
              <span v-else class="flex items-center gap-1"><Star class="w-5" /> 收藏</span>
            </button>
          </div>
        </li>
      </ul>
      <van-divider>没有更多了</van-divider>
    </div>
    <div v-else class="flex min-h-dvh items-center justify-center">
      <van-empty description="暂无收藏内容" />
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
import { showFailToast, showSuccessToast } from 'vant'

const copyMsg = (msg) => {
  copy(msg, () => {
    showSuccessToast('复制成功')
  })
}

const allStar = ref([])
const hasStar = ref([])
const readMore = ref([])
const isLoading = ref(true)
const loadFailed = ref(false)
const starMsg = async (item, index) => {
  const formData = {
    dialogUUID: item.dialogUUID,
    userMsgTime: item.userMsgTime,
    userMsg: item.userMsg,
    assistantMsgTime: item.assistantMsgTime,
    assistantMsg: item.assistantMsg
  }
  const response = await axios.request({
    url: '/user/service/star/starMsg',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    data: formData
  })
  if (response.status === 200) {
    const parsedData = response.data
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
const loadStars = async () => {
  isLoading.value = true
  loadFailed.value = false

  try {
    const res = await axios.request({
      url: '/user/service/star/getAllStar',
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    const parsedData = res.data
    if (res.status !== 200 || parsedData.status !== 0) throw new Error('Unable to load favorites')

    allStar.value = parsedData.data || []
    // Keep unstarred cards visible until the next fetch, matching the existing favorite flow.
    hasStar.value = allStar.value.map(() => true)
    readMore.value = allStar.value.map(() => false)
  } catch {
    loadFailed.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStars)
</script>
