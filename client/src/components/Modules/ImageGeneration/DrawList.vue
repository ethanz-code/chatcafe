<template>
  <section
    ref="card_parent"
    class="flex flex-col sm:flex-none sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
  >
    <div
      v-for="item in getFilterGenImageList()"
      :key="item"
      style="box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px"
      class="flex max-w-[398px] flex-col items-center gap-3 rounded-lg mx-5 py-3"
    >
      <!-- 单个卡片顶部信息 -->
      <div class="flex justify-between items-center" style="width: calc(100% - 40px)">
        <!-- 标签 -->
        <div>
          <van-tag
            v-show="item.status === '绘画失败'"
            color="#feeeee"
            text-color="#dc4a35"
            size="large"
            >绘画失败</van-tag
          >
          <van-tag
            v-show="item.status === '绘画完成'"
            color="#e3fff0"
            text-color="#39a57b"
            size="large"
            >绘画完成</van-tag
          >
          <van-tag
            v-show="item.status === '进行中'"
            color="#fef9c3"
            text-color="#eab308"
            size="large"
            >进行中</van-tag
          >
        </div>
        <!-- 右边功能区域 -->
        <div class="flex items-center gap-3">
          <CopyIcon
            @click="
              copy(item.prompt.split(' --')[0], () => {
                showSuccessToast('复制成功')
              })
            "
            class="cursor-pointer"
            width="20"
            height="20"
          />
          <DownloadIcon
            v-if="item.status === '绘画完成'"
            @click="saveImg(item)"
            class="cursor-pointer"
            width="20"
            height="20"
          />
          <ReplayIcon
            @click="
              () => {
                replay(item.prompt.split(' --')[0])
              }
            "
            class="cursor-pointer"
            width="20"
            height="20"
          />
          <ShareIcon
            v-if="item.status === '绘画完成'"
            @click="share(item.id)"
            class="cursor-pointer"
            width="20"
            height="20"
          />
          <DeleteIcon
            @click="
              genImageStore.deleteGenImage(item.id, () => {
                showSuccessToast('删除成功')
              })
            "
            class="cursor-pointer"
            width="20"
            height="20"
          />
        </div>
      </div>
      <!-- 单个卡片中间图片信息 -->
      <div
        @click="item.status === '绘画完成' ? clickImgPreview(item.imgUrl) : () => {}"
        style="width: calc(100% - 40px)"
        class="rounded-lg overflow-hidden flex flex-col items-center cursor-pointer"
      >
        <div class="w-full flex relative max-h-[366px]">
          <!-- 正在加载中时显示Skeleton加载动画，不然直接显示图片，无论成功失败 -->
          <!-- <van-skeleton-image
            v-if="item.status === '进行中'"
            :animate="true"
            style="width: 100%; height: 100%; aspect-ratio: 1 / 1"
            class="animate-pulse"
          /> -->
          <img
            v-if="item.status === '进行中'"
            v-lazy="'/res/loading.gif'"
            class="w-full aspect-square object-cover rounded-lg object-center"
          />
          <img
            v-else
            v-lazy="item.imgUrl !== '' ? item.imgUrl : '/res/error.png'"
            @load="() => closeToastCurLastGenImgLoaded(item.imgUrl)"
            class="w-full aspect-square rounded-lg object-cover object-center"
          />
          <div class="bg-black/35 w-full absolute bottom-0 py-3.5">
            <p class="more-line-ellipsis px-2 text-white font-light">
              {{ item.prompt.split(' --')[0] }}
            </p>
          </div>
        </div>
      </div>
      <!-- 单个卡片底部信息 -->
      <div class="flex justify-between items-center" style="width: calc(100% - 40px)">
        <span class="text-gray-500">{{
          `时间：${moment(item.time).format('YYYY-MM-DD HH:mm')}`
        }}</span>
        <div
          class="bg-yellow-50 text-yellow-500 border border-solid border-yellow-500 rounded-md py-0.5 px-1.5 opacity-80"
        >
          {{ item.model }}
        </div>
      </div>
    </div>
    <van-empty v-if="getFilterGenImageList().length === 0" description="未查找到任何绘画！" />
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import {
  CopyAdd24Regular as CopyIcon,
  ArrowDownload24Regular as DownloadIcon,
  ArrowHookUpLeft24Regular as ReplayIcon,
  Share24Regular as ShareIcon,
  Delete24Regular as DeleteIcon
} from '@vicons/fluent'
import { useUserCenterStore } from '@/stores/user-center'
import { useGenImageStore } from '@/stores/gen-image'
import moment from 'moment'
import copy from '@/utils/copyInformation'
import downloadImg from '@/utils/downloadImg'
import autoAnimate from '@formkit/auto-animate'
import { closeToast, showSuccessToast, showFailToast } from 'vant'
import axios from '@/utils/axios'

const userStore = useUserCenterStore()
const genImageStore = useGenImageStore()
const props = defineProps(['type'])
const emits = defineEmits(['togglePage'])
// const props = defineProps(['type'])

// 获取经过过滤筛选的绘画列表
const getFilterGenImageList = () => {
  if (props.type === '全部') {
    return genImageStore.genImageList
  }
  return genImageStore.genImageList.filter((item) => {
    return item.status === props.type
  })
}

// 通过autoAnimate启用动画效果所用的ref
const card_parent = ref(null)
// 重播，意思是将传入的文本粘贴到生成图片文本输入框中。
const replay = (prompt) => {
  genImageStore.curInputPrompt = prompt
  // 跳转到生成图片页面(这里不用useRouter是因为我们这里说的页面是在同一页面内嵌入的)
  emits('togglePage')
}

// 将作品下载下来
const saveImg = (item) => {
  downloadImg(item.imgUrl, `${moment().unix()}.jpg`, () => {
    showSuccessToast('下载完成')
  })

  // 请求第一次搜索助理的接口
  axios.request({
    url: '/user/firstSavePainting',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
  })
}

// 将作品分享到作品广场
const share = (imgId) => {
  // eslint-disable-next-line no-undef
  showConfirmDialog({
    title: '提示',
    message: '作品发布后您可在“作品广场”找到自己发布的图片，任何人都可以公开访问，是否发布作品？',
    confirmButtonText: '发布',
    cancelButtonText: '取消'
  })
    .then(async () => {
      // on confirm
      const jsonData = JSON.stringify({
        imgId: imgId
      })
      const response = await axios.request({
        url: '/community/publishImg',
        method: 'post',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: jsonData
      })
      if (response.status === 200) {
        const parsedData = response.data
        if (parsedData.status === 0) {
          showSuccessToast('分享成功')
        } else {
          showFailToast('作品已存在')
        }
      }
    })
    .catch(() => {
      // on cancel
    })
}

const clickImgPreview = (imgUrl) => {
  // eslint-disable-next-line no-undef
  showImagePreview({ images: [imgUrl], closeable: true })
}

// 当最新生成的图片加载完成后将调用关闭吐司
const closeToastCount = ref(0)
const closeToastCurLastGenImgLoaded = (imgUrl) => {
  if (imgUrl === genImageStore.lastGenerateLoadImg) {
    if (closeToastCount.value === 0) return closeToastCount.value++

    closeToast()
    genImageStore.lastGenerateLoadImg = '#'
    closeToastCount.value = 0
  }
}

onMounted(() => {
  // console.log(props.type)
  // 设置列表动画
  autoAnimate(card_parent.value)

  // 用户登录后直接从数据库拉取绘画数据
  if (userStore.isLogin) {
    // console.log('拉取绘画数据')
    genImageStore.getAllGenImage()
  }

  // 将元素滚动到顶部
  const timer = setTimeout(() => {
    card_parent.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    clearTimeout(timer)
  }, 150)
})
</script>
<style scoped>
.more-line-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
