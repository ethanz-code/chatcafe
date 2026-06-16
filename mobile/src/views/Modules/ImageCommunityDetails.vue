<template>
  <section class="min-h-full bg-white">
    <van-nav-bar title="作品详情" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="relative px-2 box-border flex flex-col gap-2">
      <img
        @click="previewImage"
        v-lazy="getRawImage()"
        @load="imageLoaded"
        class="w-full h-52 object-cover rounded-lg shadow-lg"
      />
      <div class="absolute top-2 right-4 bg-black text-white p-2 rounded-lg">
        {{ `${createdDays()}天前创作` }}
      </div>
      <div class="px-2 flex flex-col gap-2 mb-10">
        <div class="flex justify-between">
          <div class="flex items-center gap-1.5">
            <img v-lazy="getAvatar(detailData.user)" class="w-7 h-7 rounded-full" />
            <span class="text-md font-bold">{{ detailData.user.name }}</span>
          </div>
          <div class="flex items-center gap-3 text-black/60">
            <span @click="clickLike" class="flex items-center gap-1">
              <like :class="['w-4', hasLike ? 'text-[#ff6e65]' : '']" /> {{ detailData.likes }}
            </span>
            <span class="flex items-center gap-1">
              <views class="w-4" /> {{ detailData.pageView }}
            </span>
          </div>
        </div>
        <div class="flex gap-2 items-center">
          <Headline :text="'Model: '" />
          <div class="text-[#ff6e65] font-bold">
            {{ detailData.img.model }}
          </div>
        </div>
        <Headline :text="'Prompt'" />
        <div class="bg-black text-white rounded-lg p-2">
          <p class="text-clamp-3">{{ getImgPrompt() }}</p>
        </div>
        <div class="flex gap-2 justify-end">
          <van-button size="small" @click="downloadImage(getRawImage())" type="primary"
            >下载图片</van-button
          >
          <van-button size="small" @click="copyPrompt" type="default">复制提示词</van-button>
        </div>
      </div>
      <van-divider>底部作品推荐</van-divider>
      <!-- 图像列表 -->
      <ImageList class="mb-4" :max-count="4" :ignore-id="detailData.id" :randomization="true" />
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useFloatingFunction } from '@/stores/floating-function'
import { useImageCommunityStore } from '@/stores/image-community'
import { ThumbLike24Filled as like } from '@vicons/fluent'
import { EyeSharp as views } from '@vicons/ionicons5'
import moment from 'moment'
import Headline from '@/components/Modules/ImageGeneration/Headline.vue'
import copy from '@/utils/copyInformation'
import ImageList from '@/components/Modules/ImageCommunity/ImageList.vue'
import downloadImg from '@/utils/downloadImg'
import axios from '@/utils/axios'
import { useUserCenterStore } from '@/stores/user-center'

const userStore = useUserCenterStore()
const { detailData } = useImageCommunityStore()
const icStore = useImageCommunityStore()
const historyStore = useFloatingFunction()

const onClickLeft = () => historyStore.backLastPage()

const apiAddress = import.meta.env.VITE_BASE_URL
const getRawImage = () => {
  if (detailData.img.imgUrl.startsWith(apiAddress))
    return detailData.img.imgUrl.split('gz')[0] + '.jpg'
  else return detailData.img.imgUrl
}
const previewImage = () => {
  // eslint-disable-next-line no-undef
  showImagePreview({ images: [getRawImage()], closeable: true })
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
let loadedCount = 0
const showCreateDays = ref(false)
const createdDays = () => {
  const days = moment(moment().toISOString()).diff(moment(detailData.img.time), 'days')
  return days
}
const imageLoaded = () => {
  loadedCount++
  if (loadedCount === 2) {
    // 计算显示出作品创作天数
    showCreateDays.value = true
  }
}
const downloadImage = (url) => {
  downloadImg(url, `${moment().unix()}.jpg`, () => {
    // eslint-disable-next-line no-undef
    showSuccessToast('下载完成')
  })
}
const getImgPrompt = () => {
  if (detailData.img.model === 'MIDJOURNEY') return detailData.img.prompt.split(' --')[0]
  else return detailData.img.prompt
}
const copyPrompt = () => {
  // eslint-disable-next-line no-undef
  copy(getImgPrompt(), () => showSuccessToast('复制成功'))
}
const clickLike = () => {
  if (hasLike.value) return
  // eslint-disable-next-line no-undef
  if (!userStore.isLogin) return showFailToast('请先登录')
  hasLike.value = true
  detailData.likes++

  axios.request({
    url: '/community/addLikes',
    method: 'post',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    data: JSON.stringify({ id: detailData.id })
  })
}

const hasLike = ref(false)
onMounted(() => {
  // 新增图片浏览量
  axios.request({
    url: '/community/addPageView',
    method: 'post',
    data: JSON.stringify({ id: detailData.id })
  })
  icStore.detailData.pageView++

  // 验证点赞状态
  if (userStore.isLogin)
    axios
      .request({
        url: '/community/verifyLikesStatus',
        method: 'get',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: { id: detailData.id }
      })
      .then((res) => {
        if (res.status === 200) {
          const parsedData = JSON.parse(res.data)
          if (parsedData.status === 0 && parsedData.data) {
            hasLike.value = true
          }
        }
      })
})
</script>
<style scoped>
.text-clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
</style>
