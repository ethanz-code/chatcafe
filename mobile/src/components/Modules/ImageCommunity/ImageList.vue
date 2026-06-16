<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 mt-2">
    <div v-for="item in datas" :key="item" class="relative shadow-md rounded-lg overflow-hidden">
      <img
        class="w-full h-full aspect-square object-cover object-center"
        v-lazy="item.img.imgUrl"
        @click="enterImageDetail(item)"
      />
      <div class="absolute bottom-0 inset-x-0 bg-white text-black p-2 py-1">
        <div class="text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap">
          {{ getImgPrompt(item) }}
        </div>
        <div class="flex justify-between mt-0.5">
          <div class="flex items-center gap-1.5">
            <img v-lazy="getAvatar(item.user)" class="w-5 h-5 rounded-full" />
            <span
              :class="[
                'text-xs text-ellipsis overflow-hidden whitespace-nowrap',
                item.pageView + item.likes > 999 ? 'w-10' : 'w-16'
              ]"
              >{{
                !item.user.name ? getProcessPhoneNumber(item.user.phoneNumber) : item.user.name
              }}</span
            >
          </div>
          <div class="flex items-center gap-1.5 text-black/60">
            <span class="flex items-center gap-0.5"> <like class="w-4" /> {{ item.likes }} </span>
            <span class="flex items-center gap-0.5">
              <views class="w-4" /> {{ item.pageView }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="js">
import { ThumbLike24Filled as like } from '@vicons/fluent'
import { EyeSharp as views } from '@vicons/ionicons5'
import { useRouter, useRoute } from 'vue-router'
import { useFloatingFunction } from '@/stores/floating-function'
import { useImageCommunityStore } from '@/stores/image-community'
import { onMounted, ref } from 'vue'
import axios from '@/utils/axios'

const props = defineProps({
  forceLoadNetworkData: {
    type: Boolean,
    default: false
  },
  maxCount: {
    type: Number,
    default: -1
  },
  ignoreId: {
    type: Number,
    default: -1
  },
  randomization: {
    type: Boolean,
    default: false
  }
})
const datas = ref([])
const imageCommunity = useImageCommunityStore()
const historyStore = useFloatingFunction()
const route = useRoute()
const router = useRouter()

const getProcessPhoneNumber = (val) => {
  // 将一段手机号的中间四位改为*号并返回
  return val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
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

const enterImageDetail = (item) => {
  // eslint-disable-next-line no-undef
  // showImagePreview({ images: [imgUrl], closeable: true })
  imageCommunity.detailData = item
  if (route.fullPath !== '/modules/image-community-details') {
    historyStore.lastPagePath.push(route.fullPath)
    router.push({
      path: '/modules/image-community-details'
    })
  } else {
    window.location.reload()
  }
}

const getImgPrompt = (item) => {
  if (item.img.model === 'MIDJOURNEY') return item.img.prompt.split(' --')[0]
  else return item.img.prompt
}

const getImageList = async () => {
  // 获取公开图像列表
  const response = await axios.request({
    url: '/community/getAllPublishedImg',
    method: 'get'
  })
  if (response.status === 200) {
    const parsedData = JSON.parse(response.data)
    if (parsedData.status === 0) {
      imageCommunity.allGzData = parsedData.data
    }
  }
}

const ignoreId_work = (id, data) => {
  if (data.id === id) return true
  return false
}
const processImageDatas = () => {
  // 遍历props.imageList
  imageCommunity.allGzData.forEach((item) => {
    if (datas.value.length < props.maxCount || props.maxCount === -1) {
      if (!ignoreId_work(props.ignoreId, item)) {
        datas.value.push(item)
      }
    } else return
  })

  if (props.randomization) {
    datas.value = datas.value.sort(() => Math.random() - 0.5)
  }
}

onMounted(async () => {
  if (props.forceLoadNetworkData) await getImageList()
  processImageDatas()
})
</script>
