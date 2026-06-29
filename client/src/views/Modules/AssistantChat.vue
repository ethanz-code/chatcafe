<template>
  <section class="flex flex-col h-full bg-white">
    <!--  顶部功能栏目  -->
    <van-nav-bar
      class="h-12 shadow-sm"
      :title="assistantInfo.name"
      left-text="返回"
      left-arrow
      fixed
      @click-left="backLastPage"
    />

    <!--  内容区域  -->
    <div ref="contentRef" class="flex-1 flex flex-col items-center overflow-y-auto bg-white mt-12">
      <div
        v-show="!hasMsg"
        aria-label="default"
        class="max-w-full h-full flex flex-col justify-center items-center gap-6"
      ></div>
      <div v-show="hasMsg" class="w-full max-w-full pt-5 pb-10 px-2 box-border">
        <ul v-auto-animate class="flex flex-col gap-10">
          <li :key="item" v-for="(item, index) in dialogContent" :class="index > 1 ? 'mt-6' : ''">
            <div
              :class="['flex gap-2', item.role === 'assistant' ? 'justify-start' : 'justify-end']"
            >
              <!-- 助理头像区域 -->
              <div
                v-if="item.role === 'assistant'"
                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              >
                AI
              </div>

              <!-- 消息内容区域 -->
              <div
                style="width: calc(100% - 48px)"
                :class="[
                  'max-w-[1000px] flex-1 flex flex-col gap-1',
                  item.role === 'assistant' ? 'items-start' : 'items-end'
                ]"
              >
                <!-- 消息发送时间戳 -->
                <div
                  :class="[
                    'text-gray-600 text-[12px] min-h-[20px]',
                    item.func_available ? 'opacity-100' : 'opacity-0'
                  ]"
                >
                  {{ moment(item.time).format('YYYY-MM-DD HH:mm:ss') }}
                </div>

                <div class="relative" style="max-width: calc(100% - 15px)">
                  <Message
                    :show-cursor="item.role === 'assistant' ? false : false"
                    :text="item.content"
                    :item="item"
                  />

                  <!-- 消息主题底部功能区 -->
                  <div
                    v-auto-animate
                    v-if="item.func_available"
                    :class="[
                      'absolute -bottom-5 flex justify-end items-center w-full overflow-x-visible gap-2 text-[12px] text-gray-600',
                      item.role === 'assistant' && item.content.length < 8 ? 'right-0' : 'right-2'
                    ]"
                  >
                    <div
                      @click="rewriteMsg"
                      v-if="lastMsg === index && item.role === 'assistant' && index !== 0"
                      class="flex-shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Replay class="w-3.5" /> 重写
                    </div>
                    <div
                      @click="starMsg(item, index)"
                      v-if="item.role === 'assistant' && index !== 0"
                      class="flex-shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Star v-if="!msgAlreadyStar(item)" class="w-3.5" />
                      <StarFilled v-else class="w-3.5 text-[#ff6e65]" />
                      收藏
                    </div>
                    <div
                      v-if="(item.role === 'user' || !item.collapse) && index !== 0"
                      @click="copyMsg(item.content)"
                      class="flex-shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Copy class="w-3.5" /> 复制
                    </div>
                    <div
                      v-if="(item.role === 'user' || !item.collapse) && index !== 0"
                      @click="deleteMsg(index)"
                      class="flex-shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Delete class="w-3.5" /> 删除
                    </div>
                    <div
                      v-if="item.role === 'assistant' && index !== 0"
                      @click="item.collapse = !item.collapse"
                      class="flex-shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <More v-if="item.collapse" class="w-3.5" />
                      <MoreFilled v-else class="w-3.5 text-[#ff6e65]" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 用户头像区域 -->
              <img v-if="item.role === 'user'" :src="userAvatar" class="w-10 h-10 rounded-full" />
            </div>
          </li>
        </ul>
      </div>

      <div
        v-if="canContinueControl"
        :class="[
          'fixed transition-all duration-300 ease-linear',
          canContinue ? 'opacity-100 bottom-48' : 'opacity-0 bottom-44'
        ]"
      >
        <div
          @click="continueSendMsg"
          class="bg-white border border-solid border-gray-200 shadow-md px-4 py-2 rounded-full flex items-center gap-2"
        >
          <van-icon name="play-circle-o" size="20" />
          播放
        </div>
      </div>
    </div>

    <!--  背景遮罩  -->
    <van-overlay :show="overlayShow" @click="closeFloatingPanelLLM" />

    <!--  选择LLM时弹出  -->
    <van-floating-panel v-model:height="height" :anchors="anchors" duration="0.35">
      <div>
        <!--  浮窗顶部标题相关  -->
        <div class="flex justify-between px-2 text-lg">
          <span class="font-medium">选择模型</span>
          <van-icon name="cross" class="cursor-pointer" @click="closeFloatingPanelLLM" />
        </div>

        <!--  浮窗内容区域  -->
        <div class="mt-3 flex flex-col gap-2 px-3 pb-2">
          <div
            class="flex justify-between items-center cursor-pointer"
            v-for="(item, index) in store.llm"
            :key="item.model"
            @click="selectLLM(index)"
          >
            <div class="flex items-center">
              <img v-if="item.imgUrl" :src="item.imgUrl" class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                AI
              </div>
              <div class="flex flex-col ml-2">
                <span>{{ item.model }}</span>
                <span v-if="item.cost === 0" class="text-gray-500">免费</span>
                <span v-else class="text-gray-500">
                  消耗 <span class="text-[#ff6e65]">{{ item.cost }}</span> 条对话次数
                </span>
              </div>
            </div>
            <van-icon
              v-show="store.llm[index].model === store.selectedModel"
              name="success"
              size="20"
              color="#22c55e"
            />
          </div>
        </div>
      </div>
    </van-floating-panel>

    <!--  底部发送信息栏目  -->
    <div
      ref="bottomFunctionRef"
      style="border-top: 1px solid #f4f5f7"
      class="bg-white p-3 bottom-0 fixed right-0 left-0"
    >
      <!--  选择LLM  -->
      <div
        v-if="currentSelectedLLMIsExist"
        class="mb-2 ml-1 inline-block cursor-pointer"
        @click="openFloatingPanelLLM"
      >
        <div class="flex items-center">
          <span>{{ `${store.selectedModel} /&nbsp;` }}</span>
          <span v-if="currentLLMIsFree" class="text-gray-500">免费</span>
          <span v-else class="text-gray-500"
            >消耗<b class="text-[#ff6e65] font-normal">{{ calculateMsgCost }}</b
            >条对话次数</span
          >
          <CaretSortIcon class="h-5 w-5" />
        </div>
      </div>

      <!--  文本输入区域  -->
      <div
        @click="UserClickTheMessageArea"
        class="flex h-auto gap-3 py-2 items-center rounded-lg bg-gray-50"
      >
        <div class="flex-1 flex h-full items-center">
          <textarea
            v-model="message"
            ref="messageRef"
            @input="checkMessageHeight"
            rows="1"
            class="leading-8 py-0 w-full border-0 bg-gray-50 rounded-lg pl-3 resize-none h-8"
            type="text"
            placeholder="请输入内容"
            :disabled="replying"
          ></textarea>
        </div>
        <van-button
          id="sendMsgButton"
          v-show="message.length > 0"
          class="self-start mr-2"
          size="small"
          color="linear-gradient(to right, #ff6034, #ee0a24)"
          type="success"
          @click="() => sendMessage(message)"
        >
          <div class="flex items-center gap-1">
            <span>发送</span>
            <van-icon name="guide-o" size="18" />
          </div>
        </van-button>
      </div>
    </div>
  </section>
</template>
<script setup lang="js">
import { computed, onMounted, ref, watch } from 'vue'
import { CaretSortIcon } from '@radix-icons/vue'
import { useChatStore } from '@/stores/chat.js'
import { useUserCenterStore } from '@/stores/user-center'
import { useFloatingFunction } from '@/stores/floating-function'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect.js'
import { sendMessage as streamSendMsg } from '@/utils/chat'
import Message from '@/components/TabBar/AIChat/MessageModule.vue'
import copy from '@/utils/copyInformation'
import { useRouter, useRoute } from 'vue-router'
import moment from 'moment'
import axios from '@/utils/axios'
import {
  ArrowClockwise24Regular as Replay,
  SaveCopy24Regular as Copy,
  Delete24Regular as Delete,
  Star24Regular as Star,
  Star24Filled as StarFilled,
  MoreCircle32Regular as More,
  MoreCircle32Filled as MoreFilled
} from '@vicons/fluent'
import { showFailToast } from 'vant'

const props = defineProps(['id'])

const store = useChatStore()
const userCenterStore = useUserCenterStore()
const historyStore = useFloatingFunction()
const router = useRouter()
const route = useRoute()

// -----文本区域高度自适应------
const messageRef = ref(null)
const message = ref('')
const checkMessageHeight = () => {
  const obj = messageRef.value
  obj.style.height = '32px'
  obj.style.height = obj.scrollHeight + 'px'
  calculateContentMarginBottom()
}
// -----文本区域高度自适应------

// ------选择大语言模型--------

const overlayShow = ref(false)
const anchors = [0, Math.round(0.4 * window.innerHeight), Math.round(0.7 * window.innerHeight)]
const height = ref(anchors[0])

const currentSelectedLLMIsExist = ref(false)
const currentLLMIsFree = computed(
  () => store.llm.filter((val) => val.model === store.selectedModel)[0].cost === 0
)

const calculateMsgCost = computed(
  () => store.llm.filter((val) => val.model === store.selectedModel)[0].cost
)

const openFloatingPanelLLM = () => {
  overlayShow.value = true
  height.value = anchors[1]
}
const closeFloatingPanelLLM = () => {
  overlayShow.value = false
  height.value = anchors[0]
}
const selectLLM = (index) => {
  // 将当前选中的语言模型设置为选中
  store.selectedModel = store.llm[index].model

  // 关闭浮动面板
  closeFloatingPanelLLM()
}
watch(height, async (newHeight) => {
  if (newHeight === anchors[0]) closeFloatingPanelLLM()
})
// ------选择大语言模型--------

// --------Content顶部，底部外边距自动计算-----------
const contentRef = ref()
const bottomFunctionRef = ref()
const calculateContentMarginBottom = () => {
  const content = contentRef.value
  const marginBottom = bottomFunctionRef.value.offsetHeight + 1
  content.style.marginBottom = `${marginBottom}px`
}
// --------Content顶部，底部外边距自动计算-----------

// ---------内容区域对话内容---------
let dialogContent = ref([])
let lastMsg = ref(0)

const hasDialogContent = () => {
  return dialogContent.value.length > 0
}
// 不得将此移动到hasDialogContent前面，因为初始值调用了它
let hasMsg = ref(hasDialogContent())

const setDialogContent = () => {
  // dialogContent.value = store.dialogContent.filter(
  //   (item) => item.uuid === store.selectedDialog.uuid
  // )[0].delta
  lastMsg.value = Math.max(dialogContent.value.length - 1, 0)
}

const autoScroll2Bottom = () => {
  // 获取要滚动的Web元素
  const element = contentRef.value // 通过ID获取元素

  // 将滚动条自动滚动到底部
  element.scrollTop = element.scrollHeight - element.clientHeight
}

// 余额不足或服务端其他错误
const insuficientBalance = (error = '') => {
  if (error && !error.includes('Insufficient')) {
    showFailToast(error)
    return
  }
  // eslint-disable-next-line no-undef
  showConfirmDialog({
    title: '对话余额不足',
    message: '您当前对话余额不足，可以通过任务奖励领取余额或者前往充值。',
    confirmButtonText: '充值',
    confirmButtonColor: '#ed776b'
  })
    .then(() => {
      // on confirm
      const timer = setTimeout(() => {
        router.push('/service/pay')
        clearTimeout(timer)
      }, 300)
    })
    .catch(() => {
      // on cancel
    })
}

// 消息列表用户头像
const userAvatar = computed(() => {
  if (userCenterStore.isLogin) {
    if (userCenterStore.avatar === '') return '/res/avatar.png'
    else return userCenterStore.avatar
  } else return '/res/avatar-not-login.png'
})

const replying = ref(false)
const sendMessage = async (prompt, ownNotSendMsg = false) => {
  if (notLoginAndUsePaidLLM()) {
    UserClickTheMessageArea()
    return
  }

  // 检测是否可以发消息
  if (replying.value) return

  // 当前会话第一次发消息
  setDialogContent()
  const timer2 = setTimeout(() => {
    hasMsg.value = true

    // 滚动条自动滚动到底部
    requestAnimationFrame(autoScroll2Bottom)

    clearTimeout(timer2)
  }, 200)

  // 用户发送消息
  if (!ownNotSendMsg) {
    const time = moment().toISOString()
    dialogContent.value.push({
      role: 'user',
      content: prompt,
      func_available: true,
      collapse: false,
      imgUrl: '',
      time
    })
  }

  // 计算最后消息索引，用于重写功能
  lastMsg.value = dialogContent.value.length - 1

  // 信息栏清空
  message.value = ''

  // 将消息栏高度重新计算
  requestAnimationFrame(checkMessageHeight)

  // 请求助理消息
  const timer = setTimeout(() => {
    const before = () => {
      replying.value = true
      lastMsg.value = dialogContent.value.length - 1
      autoScroll2Bottom()
    }
    const processing = () => {
      requestAnimationFrame(autoScroll2Bottom)
    }
    const after = () => {
      replying.value = false
      // 移除光标元素
      const cursor = document.querySelector('.cursor')
      if (cursor) cursor.remove()
    }
    const notFinished = () => {
      canContinue.value = true
      canContinueControl.value = true
    }

    const messages = dialogContent.value.map((item) => {
      return {
        role: item.role,
        content: item.content
      }
    })
    // 最后将第一个信息移除，因为第一个属于是助理聊天中的介绍
    messages.shift()
    streamSendMsg(
      messages,
      store.selectedModel,
      insuficientBalance,
      before,
      processing,
      after,
      notFinished,
      dialogContent,
      props.id
    )
    clearTimeout(timer)
  }, 800)
}
// ---------内容区域对话内容---------

// ---------内容区域消息底部函数功能--------
const copyMsg = (msg) => {
  copy(msg, () => {
    // eslint-disable-next-line no-undef
    showSuccessToast('内容已复制')
  })
}

// 重写信息
const rewriteMsg = () => {
  deleteMsg(lastMsg.value)
  sendMessage(dialogContent.value[Math.max(lastMsg.value - 1, 0)].content, true)
}

// 删除信息
const deleteMsg = (i) => {
  dialogContent.value.splice(i, 1)
}

// 收藏功能
const allStar = ref([])
// 根据对话消息的时间和内容来收藏，同时还根据index收藏上一条来自用户的消息
const starMsg = async ({ time, content }, index) => {
  if (!userCenterStore.isLogin) return showFailToast('未登录')

  const userMsg = dialogContent.value[index - 1]
  const response = await axios.request({
    url: '/user/service/star/starMsg',
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    data: {
      dialogUUID: store.selectedDialog.uuid,
      userMsgTime: userMsg.time,
      userMsg: userMsg.content,
      assistantMsgTime: time,
      assistantMsg: content
    }
  })
  if (response.status === 200) {
      const parsedData = response.data
      if (parsedData.status === 0) {
      // eslint-disable-next-line no-undef
      showSuccessToast('已收藏')
      allStar.value.push(parsedData.data)
    } else if (parsedData.status === 1) {
      // eslint-disable-next-line no-undef
      showFailToast('已取消')
      allStar.value = allStar.value.filter(
        (val) => val.assistantMsgTime !== parsedData.data.assistantMsgTime
      )
    } else {
      // eslint-disable-next-line no-undef
      showFailToast('收藏失败')
    }
  }
}
const msgAlreadyStar = (item) => {
  return allStar.value.some(
    (val) => val.dialogUUID === store.selectedDialog.uuid && val.assistantMsgTime === item.time
  )
}
onMounted(async () => {
  if (!userCenterStore.isLogin) return
  const res = await axios.request({
    url: '/user/service/star/getAllStar',
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token')
    }
  })
  if (res.status === 200) {
    const parsedData = res.data
    if (parsedData.status === 0) {
      allStar.value = parsedData.data
    }
  }
})
// ---------内容区域消息底部函数功能--------

// ---------底部搜索框---------
const notLoginAndUsePaidLLM = () => {
  return (
    !userCenterStore.isLogin &&
    store.llm.filter((val) => val.model === store.selectedModel)[0].cost > 0
  )
}
const UserClickTheMessageArea = () => {
  // 用户未登录，并且当前语言模型需要付费的情况下
  if (notLoginAndUsePaidLLM()) {
    historyStore.lastPagePath.push(route.fullPath)
    router.push('/modules/login')
  }
}
// ---------底部搜索框---------

// ---------底部扩展功能-继续按钮---------
/* 
  会在每次消息发送完之后检测是否因为token长度受到了限制，
  如果受到限制，则出现继续按钮，当用户点击后会代替用户编辑内容：”继续“，并且点击发送按钮
*/
const canContinue = ref(false)
const canContinueControl = ref(false)
// eslint-disable-next-line no-unused-vars
const continueSendMsg = () => {
  canContinue.value = false
  canContinueControl.value = false
  message.value = '继续'
  const sendMsgButton = document.querySelector('#sendMsgButton')
  const timer = setTimeout(() => {
    sendMsgButton.click()
    clearTimeout(timer)
  }, 500)
}
// ---------底部扩展功能-继续按钮---------

// ---------Assistant区域---------
const assistantInfo = ref({
  name: '',
  imgUrl: '',
  description: ''
})

const backLastPage = () => {
  historyStore.backLastPage()
}
// ---------Assistant区域---------

onMounted(() => {
  document.title = '助理-聊天'

  const timer = setTimeout(() => {
    calculateContentMarginBottom()
    autoScroll2Bottom()
    clearTimeout(timer)
  }, 150)

  WhetherToDisableTheEffect(contentRef.value.children[0])

  if (hasDialogContent()) setDialogContent()

  // 获取大语言模型列表
  store.loadLLMData(true).then(async (res) => {
    if (res.length > 0) currentSelectedLLMIsExist.value = true
  })

  // 网络请求助理相关信息
  axios
    .request({
      url: `/assistant/get?id=${props.id}`,
      method: 'get'
    })
    .then((res) => {
      res = res.data
      if (res.status === 0) {
        assistantInfo.value.name = res.data.name
        assistantInfo.value.imgUrl = res.data.imgUrl
        assistantInfo.value.description = res.data.description

        const time = moment().toISOString()
        dialogContent.value.push({
          role: 'assistant',
          content: assistantInfo.value.description,
          func_available: true,
          collapse: false,
          imgUrl: assistantInfo.value.imgUrl,
          time
        })

        hasMsg.value = hasDialogContent()
      }
    })
})
</script>
