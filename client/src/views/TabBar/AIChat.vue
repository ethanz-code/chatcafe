<template>
  <section class="flex flex-col h-full bg-white">
    <SidebarDialog @new-dialog="newDialog" />

    <!--  顶部功能栏目  -->
    <div
      class="bg-gray-900 text-white h-12 px-3 flex justify-between items-center fixed top-0 inset-x-0 z-50"
    >
      <div class="flex items-center gap-3">
        <HamburgerMenuIcon class="cursor-pointer h-5 w-5" @click="store.sidebarShowLeft = true" />
        <span>{{ store.selectedDialog.title }}</span>
      </div>
      <div class="flex items-center gap-2">
        <van-icon @click="goToPay" class="cursor-pointer" name="gem-o" size="20" color="#eab308" />
        <div class="flex items-center gap-1 cursor-pointer" @click="newDialog">
          <van-icon name="add-o" size="19" />
          <span>新建</span>
        </div>
      </div>
    </div>

    <!--  警告信息，当当前对话有内容时隐藏  -->
    <div
      v-show="!hasMsg"
      ref="contentTopWarning"
      :class="[
        'fixed bg-gray-100 p-5 mt-12  transition-opacity duration-100 ease-linear',
        contentCanShow ? 'opacity-100' : 'opacity-0'
      ]"
    >
      “警告：未经授权或滥用本系统可能导致严重后果。请确保遵守所有适用法律和规定，并仅在合法和道德的范围内使用。”
    </div>

    <!--  内容区域  -->
    <div
      ref="contentRef"
      :class="[
        'flex-1 flex flex-col items-center overflow-y-auto bg-white transition-opacity duration-100 ease-linear',
        contentCanShow ? 'opacity-100' : 'opacity-0'
      ]"
    >
      <div
        v-show="!hasMsg"
        aria-label="default"
        class="max-w-full h-full flex flex-col justify-center items-center gap-6"
      >
        <div class="text-2xl logo-gradient">智慧无限，数字赋能</div>

        <div v-show="hotIssues.length > 0" class="w-full">
          <div class="flex justify-between items-center px-8">
            <span class="font-medium text-lg">热门问题</span>
            <div class="cursor-pointer" @click="refreshHotIssues">
              <van-icon name="replay" />
              <span>刷新</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-2 px-4">
            <div
              :key="title"
              v-for="title in hotIssues"
              @click="message = title"
              class="cursor-pointer bg-gray-100 hover:bg-gray-200 py-5 px-2 rounded-lg text-center"
            >
              {{ title }}
            </div>
          </div>
        </div>
      </div>
      <div v-show="hasMsg" class="w-full max-w-full pt-4 px-5 pb-10 box-border">
        <ul v-auto-animate class="flex flex-col gap-10">
          <li :key="item" v-for="(item, index) in dialogContent">
            <!-- 时间分隔（仅在跨时间段显示，全宽居中） -->
            <div v-if="showTimeDivider(index)" class="flex justify-center my-2">
              <span class="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ moment(item.time).format('MM-DD HH:mm') }}
              </span>
            </div>
            <div
              :class="['flex gap-2', item.role === 'assistant' ? 'justify-start' : 'justify-end']"
            >
              <!-- 消息内容区域 -->
              <div
                :class="[
                  'max-w-[1000px] flex-1 flex flex-col gap-1 text-[15px]',
                  item.role === 'assistant' ? 'items-start' : 'items-end'
                ]"
              >
                <div
                  class="relative select-none"
                  style="max-width: calc(100% - 15px)"
                  @contextmenu.prevent="openPopover($event, item, index)"
                  @touchstart.prevent="onTouchStart($event, item, index)"
                  @touchend="onTouchEnd"
                  @touchmove="onTouchMove"
                >
                  <Message
                    :show-cursor="item.role === 'assistant' ? false : false"
                    :text="item.content"
                    :item="item"
                  />
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
        <div class="mt-3 flex flex-col gap-3 px-3 pb-2">
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
                <div class="flex gap-1 items-center">
                  <span v-if="item.cost === 0" class="text-gray-500">免费</span>
                  <span v-else class="text-gray-500">
                    消耗 <span class="text-[#ff6e65]">{{ item.cost }}</span> 条对话次数
                  </span>

                  <a
                    v-if="item.relatedUrl"
                    target="_blank"
                    class="text-black w-5 h-5"
                    :href="item.relatedUrl"
                  >
                    <QuestionCircle16Filled class="w-5 h-5" />
                  </a>
                </div>
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
      class="bg-white p-3 fixed right-0 left-0 bottom-0"
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
            :disabled="store.replying"
          ></textarea>
        </div>
        <van-button
          id="sendMsgButton"
          v-show="message.length > 0"
          class="self-start mr-2"
          size="small"
          color="linear-gradient(to right, #ff6034, #ff6e65)"
          type="success"
          @click="() => sendMessage(message)"
        >
          <div class="flex items-center gap-1">
            <span>发送</span>
            <van-icon name="guide-o" size="18" />
          </div>
        </van-button>
      </div>

      <!--  最底部导航栏区域空缺出来  -->
      <div class="h-[50px]"></div>
    </div>

    <!-- 长按/右键 Popover -->
    <teleport to="body">
      <div v-if="showPopover" class="fixed inset-0 z-[999]" @click="closePopover" @contextmenu.prevent="closePopover">
        <div
          class="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-1 min-w-[130px] overflow-hidden"
          :style="{ top: popoverY + 'px', left: popoverX + 'px' }"
          @click.stop
        >
          <div
            v-if="popoverMsg?.role === 'assistant' && popoverIndex === lastMsg"
            @click="rewriteMsg(); closePopover()"
            class="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2.5 text-sm active:bg-gray-100 transition-colors"
          >
            <Replay class="w-3.5" /> 重写
          </div>
          <div
            v-if="popoverMsg?.role === 'assistant'"
            @click="starMsg(popoverMsg, popoverIndex); closePopover()"
            class="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2.5 text-sm active:bg-gray-100 transition-colors"
          >
            <Star v-if="!msgAlreadyStar(popoverMsg)" class="w-3.5" />
            <StarFilled v-else class="w-3.5 text-[#ff6e65]" />
            收藏
          </div>
          <div
            @click="copyMsg(popoverMsg?.content); closePopover()"
            class="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2.5 text-sm active:bg-gray-100 transition-colors"
          >
            <Copy class="w-3.5" /> 复制
          </div>
          <div
            @click="deleteMsg(popoverIndex); closePopover()"
            class="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-500 active:bg-gray-100 transition-colors border-t border-gray-100"
          >
            <Delete class="w-3.5" /> 删除
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>
<script setup lang="js">
import { computed, onMounted, ref, watch } from 'vue'
import { HamburgerMenuIcon, CaretSortIcon } from '@radix-icons/vue'
import { useChatStore } from '@/stores/chat.js'
import { useUserCenterStore } from '@/stores/user-center'
import SidebarDialog from '@/components/TabBar/AIChat/SidebarDialog.vue'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect.js'
import { sendMessage as streamSendMsg } from '@/utils/chat'
import Message from '@/components/TabBar/AIChat/MessageModule.vue'
import copy from '@/utils/copyInformation'
import { useRouter, useRoute } from 'vue-router'
import { useFloatingFunction } from '@/stores/floating-function'
import moment from 'moment'
import axios from '@/utils/axios'
import {
  QuestionCircle16Filled,
  ArrowClockwise24Regular as Replay,
  SaveCopy24Regular as Copy,
  Delete24Regular as Delete,
  Star24Regular as Star,
  Star24Filled as StarFilled,
} from '@vicons/fluent'
import { isWeixinBrowser, isAppleDevice } from '@/utils/operationEnv'
import { useChatFirstLoadedStore } from '@/stores/chat-first-loaded.js'

import { showFailToast } from 'vant'

const store = useChatStore()
const userCenterStore = useUserCenterStore()
const historyStore = useFloatingFunction()
const chatFirstLoaded = useChatFirstLoadedStore()
const router = useRouter()
const route = useRoute()

// ----------顶部栏-----------
const goToPay = () => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push('/service/pay')
}
// ----------顶部栏-----------

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
const contentCanShow = ref(false)
const contentTopWarning = ref()
const bottomFunctionRef = ref()
const calculateContentMarginBottom = () => {
  // 当前环境：微信+IOS+第一次打开(微信很奇怪。。。)
  let buffer = 0
  if (isWeixinBrowser() && isAppleDevice() && window.history.length === 1) {
    buffer = 30
  }

  const content = contentRef.value
  const marginBottom = bottomFunctionRef.value.offsetHeight + buffer + 1
  content.style.marginBottom = `${marginBottom}px`
}
const calculateFunctionMarginBottom = () => {
  // 当前环境：微信+IOS+第一次打开（这里是因为ios用户底部有个条条占了高度，所以要多出）
  let buffer = 0
  if (isWeixinBrowser() && isAppleDevice() && window.history.length === 1) {
    buffer = 30
  }
  const marginBottom = buffer
  bottomFunctionRef.value.style.marginBottom = `${marginBottom}px`
}
const calculateContentMarginTop = () => {
  const content = contentRef.value
  const marginTop = contentTopWarning.value.offsetHeight
  content.style.marginTop = `${marginTop + 48}px`
}

const calcMParginOther = () => {
  calculateContentMarginTop()
  checkMessageHeight()
  calculateFunctionMarginBottom()

  const timer = setTimeout(() => {
    // 这一步是一定要在计算好FunctionMargin之后进行的
    calculateContentMarginBottom()
    contentRef.value.scrollTop = 0
    contentCanShow.value = true
    clearTimeout(timer)
  }, 100)
}
// --------Content顶部，底部外边距自动计算-----------

// ---------内容区域热门问题--------
const hotIssues = ref([])
const refreshHotIssues = async () => {
  const result = await store.load4HotIssue()
  if (result.length === 0) return
  hotIssues.value = result
}
refreshHotIssues()
// ---------内容区域热门问题--------

// ---------内容区域对话内容---------
let dialogContent = ref([])
let lastMsg = ref(0)

const hasDialogContent = () => {
  const result = store.dialogContent.filter(
    (item) => item.uuid === store.selectedDialog.uuid && item.delta.length > 0
  )
  return result.length > 0
}
// 不得将此移动到hasDialogContent前面，因为初始值调用了它
let hasMsg = ref(true)

const showTimeDivider = (index) => {
  const curr = dialogContent.value[index]
  if (!curr?.time) return false
  if (index === 0) return true
  const prev = dialogContent.value[index - 1]
  if (!prev?.time) return true
  return moment(curr.time).diff(moment(prev.time), 'minute') >= 5
}

const setDialogContent = () => {
  const dialog = store.dialogContent.filter((item) => item.uuid === store.selectedDialog.uuid)[0]
  dialogContent.value = dialog.delta ? dialog.delta : []
  lastMsg.value = Math.max(dialogContent.value.length - 1, 0)
  requestAnimationFrame(autoScroll2Bottom)
}

const autoScroll2Bottom = () => {
  // 获取要滚动的Web元素
  const element = contentRef.value // 通过ID获取元素

  // 将滚动条自动滚动到底部
  // element.scrollTop = element.scrollHeight - element.clientHeight
  element.scrollTop = element.scrollHeight
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
    confirmButtonColor: '#ff6e65'
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

// 更改对话框内容，每当在侧边栏点击对话时调用
const changeDialogContent = () => {
  contentCanShow.value = false
  const timer = setTimeout(() => {
    hasMsg.value = hasDialogContent()
    if (hasMsg.value) setDialogContent()

    const timer2 = setTimeout(() => {
      calcMParginOther()
      clearTimeout(timer2)
    }, 50)
    clearTimeout(timer)
  }, 100)
}

// 当新增或删除对话时重新计算对话框内容
watch(store.selectedDialog, async () => {
  changeDialogContent()
})

const newDialog = async () => {
  await store.newDialog()
  store.buildDialogFromNotSplit()
}

const sendMessage = async (prompt, ownNotSendMsg = false) => {
  if (notLoginAndUsePaidLLM()) {
    UserClickTheMessageArea()
    return
  }

  // 检测是否可以发消息
  if (store.replying) return

  // 当前会话第一次发消息
  setDialogContent()
  const timer2 = setTimeout(() => {
    hasMsg.value = true

    // 内容区域顶部外边距计算，当有消息时上面警告隐藏
    requestAnimationFrame(calculateContentMarginTop)

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

    if (userCenterStore.isLogin) {
      await axios.request({
        url: '/chat/dialog/newMessage',
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        data: {
          uuid: store.selectedDialog.uuid,
          content: prompt,
          role: 'user',
          imgUrl: '',
          time
        }
      })
    }

    store.initDialog()
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
      store.replying = true
      lastMsg.value = dialogContent.value.length - 1
      autoScroll2Bottom()
    }
    const processing = () => {
      requestAnimationFrame(autoScroll2Bottom)
    }
    const after = () => {
      store.replying = false
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
    streamSendMsg(
      messages,
      store.selectedModel,
      insuficientBalance,
      before,
      processing,
      after,
      notFinished
    )
    clearTimeout(timer)
  }, 800)
}
// ---------内容区域对话内容---------

// ---------右键/长按 Popover---------
const showPopover = ref(false)
const popoverX = ref(0)
const popoverY = ref(0)
const popoverMsg = ref(null)
const popoverIndex = ref(-1)
let longPressTimer = null

const openPopover = (e, item, index) => {
  popoverMsg.value = item
  popoverIndex.value = index
  let x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  let y = e.clientY ?? e.touches?.[0]?.clientY ?? 0
  const w = 140
  const h = (item.role === 'assistant' ? (index === lastMsg.value ? 3 : 2) : 1) * 44 + 8
  if (x + w > window.innerWidth) x = window.innerWidth - w - 8
  if (y + h > window.innerHeight) y = window.innerHeight - h - 8
  popoverX.value = x
  popoverY.value = y
  showPopover.value = true
}

const closePopover = () => {
  showPopover.value = false
  popoverMsg.value = null
  popoverIndex.value = -1
}

const onTouchStart = (e, item, index) => {
  longPressTimer = setTimeout(() => {
    openPopover(e, item, index)
    longPressTimer = null
  }, 500)
}

const onTouchEnd = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const onTouchMove = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}
// ---------右键/长按 Popover---------

// ---------内容区域消息底部函数功能--------
const copyMsg = (msg) => {
  copy(msg, () => {
    // eslint-disable-next-line no-undef
    showSuccessToast('内容已复制')
  })
}

// 重写信息
const rewriteMsg = () => {
  // 将当前Vue文件中dialogContent变量中最后一项弹出
  // 将store中dialogContent变量最后一项弹出
  // 之后重新发送消息过去，只是用户不再需要生成消息元素只等待响应。
  // store.dialogContent.filter((item) => item.uuid === store.selectedDialog.uuid)[0].delta.pop()
  deleteMsg(lastMsg.value).then(() => {
    sendMessage(dialogContent.value[Math.max(lastMsg.value - 1, 0)].content, true)
  })
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

// 删除信息
const deleteMsg = async (i) => {
  // 将store中dialogContent变量指定索引的消息移除
  const time = store.dialogContent.filter((item) => item.uuid === store.selectedDialog.uuid)[0]
    .delta[i].time

  store.dialogContent
    .filter((item) => item.uuid === store.selectedDialog.uuid)[0]
    .delta.splice(i, 1)

  // 检测是否还有内容
  const timer2 = setTimeout(() => {
    hasMsg.value = hasDialogContent()
    const timer = setTimeout(() => {
      if (hasMsg.value) setDialogContent()
      else calcMParginOther()
      clearTimeout(timer)
    }, 200)
    clearTimeout(timer2)
  }, 100)

  // 登录状态下删除信息做网络请求
  if (userCenterStore.isLogin) {
    axios.request({
      url: '/chat/dialog/deleteMessage',
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      data: {
        uuid: store.selectedDialog.uuid,
        time
      }
    })
  }
}
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
  // (sendMsgButton.value as ButtonHTMLAttributes).click()
  const timer = setTimeout(() => {
    sendMsgButton.click()
    clearTimeout(timer)
  }, 500)
}
// ---------底部扩展功能-继续按钮---------

const loadLLMDataAndOther = () => {
  // 获取大语言模型列表
  store.loadLLMData(true).then(async (res) => {
    if (res.length > 0) currentSelectedLLMIsExist.value = true

    if (userCenterStore.isLogin) await store.getAllDialogNotSplit()

    // 初始化对话框
    await store.initDialog()

    hasMsg.value = hasDialogContent()
    const timer = setTimeout(() => {
      if (hasMsg.value) setDialogContent()
      calcMParginOther()
      clearTimeout(timer)
    }, 200)
  })
}
onMounted(async () => {
  const prefix = import.meta.env.VITE_TITLE_PREFIX
  document.title = `${prefix}首页`

  WhetherToDisableTheEffect(contentRef.value.children[0])

  // 页面首次加载完之后调用函数
  if (chatFirstLoaded.chatFirstLoaded) {
    loadLLMDataAndOther()
    chatFirstLoaded.chatFirstLoaded = false
  } else loadLLMDataAndOther()
})
</script>
