import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useChatStore } from '@/stores/chat'
import { useUserCenterStore } from '@/stores/user-center'
import axios from './axios'
import moment from 'moment'

function generateTitle(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= 30) return cleaned
  const cut = cleaned.slice(0, 30)
  const lastSpace = cut.lastIndexOf(' ')
  return lastSpace > 10 ? cut.slice(0, lastSpace) + '...' : cut + '...'
}

export const sendMessage = async (
  messages,
  model,
  insufficientBalance,
  before = () => {},
  processing = () => {},
  after = () => {},
  notFinished = () => {},
  assistantDialogContent = null,
  assistantId = null
) => {
  const store = useChatStore()
  const userStore = useUserCenterStore()
  const baseUrl = import.meta.env.VITE_BASE_URL

  let msgList
  if (assistantDialogContent) msgList = assistantDialogContent.value
  else
    msgList = store.dialogContent.filter((val) => val.uuid === store.selectedDialog.uuid)[0].delta

  const msgLength = msgList.length
  msgList.push({
    role: 'assistant',
    content: '',
    func_available: false,
    imgUrl: '',
    time: '',
    collapse: true
  })

  store.syncDialogImg()
  requestAnimationFrame(before)

  // ------------------------------------
  let respString = ''
  const controller = new AbortController()
  class FatalError extends Error {}

  // 撤销消息
  const popMsg = async () => {
    // 登录状态下删除信息做网络请求
    if (userStore.isLogin) {
      await axios.request({
        url: '/chat/dialog/deleteMessage',
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        data: {
          uuid: store.selectedDialog.uuid,
          time: msgList[msgLength].time
        }
      })
    }
    msgList.pop()
  }

  // 四十秒未成功连接自动断开
  let accepted = false
  const abort = () => {
    controller.abort()
    popMsg()
    // eslint-disable-next-line no-undef
    showFailToast('请求超时')
    after()
    throw new FatalError('timeout')
  }
  const timer = setTimeout(() => {
    clearTimeout(timer)
    if (!accepted) abort()
  }, 40000)
  let loadFrameTimer = 0

  const sse = (path, bearer, postData, headers = {}) => {
    const onclose = () => {
      clearTimeout(loadFrameTimer)
      const time = moment().toISOString()
      msgList[msgLength].func_available = true
      msgList[msgLength].time = time

      // 修改当前对话更新时间(当assistantDialogContent为空时)
      if (!assistantDialogContent) {
        const targetNotSplit = store.allDialogNotSplit.filter(
          (val) => val.uuid === store.selectedDialog.uuid
        )[0]
        targetNotSplit.updatedAt = time

        // 首次对话自动生成标题
        if (msgList.length === 2 && store.selectedDialog.title === '新的对话') {
          const title = generateTitle(msgList[0].content)
          store.selectedDialog.title = title
          targetNotSplit.title = title
          store.editDialog(title)
        }

        // 检测是否登录状态，登录后直接将响应消息存到数据库
        if (userStore.isLogin) {
          const msgOptions = {
            uuid: store.selectedDialog.uuid,
            content: msgList[msgLength].content,
            role: 'assistant',
            imgUrl: msgList[msgLength].imgUrl,
            time
          }
          axios.request({
            url: '/chat/dialog/newMessage',
            method: 'post',
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            data: msgOptions
          })
        }
      }

      after()
    }

    let execOnClose = true
    let backupData = {}
    fetchEventSource(path, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: 'Bearer ' + bearer || '',
        ...headers
      },
      body: postData,
      async onmessage(event) {
        // 表示整体结束
        if (event.data === '[DONE]') {
          // 检测回答内容是否真正完成，因为token限制结束不算
          if (backupData.finish_reason === null || backupData.finish_reason === 'length') {
            notFinished()
          } else if (backupData.finish_reason === 'stop') {
          }
          // onclose()
          return
        }
        // 校验event.data值是否规范
        if (event.data === null || event.data === undefined || event.data.length === 0) return
        const parsed = JSON.parse(event.data)

        // 检测错误（余额不足 / API Key 未配置等）
        if (parsed.status && parsed.status === -1) {
          execOnClose = false
          accepted = true
          insufficientBalance(parsed.error || '')
          popMsg()
          after()
          return
        }

        const data = parsed.choices[0]

        if (!data) return
        if (data.delta && data.delta.content) {
          accepted = true
          clearTimeout(loadFrameTimer)
          respString += data.delta.content
          msgList[msgLength].content = respString
          processing()

          loadFrameTimer = setTimeout(abort, 20000)
        }

        backupData = data
      },
      async onerror(err) {
        if (err instanceof FatalError) {
          abort()
        }
      },
      async onclose() {
        if (execOnClose) onclose()
      }
    })
  }

  const chatOption = JSON.stringify({
    model,
    loadDbData: String(userStore.isLogin && !assistantDialogContent),
    ...(userStore.isLogin && !assistantDialogContent
      ? { uuid: store.selectedDialog.uuid }
      : {
          messages: JSON.stringify(messages),
          ...(assistantDialogContent ? { isAssistant: String(true), assistantId: String(assistantId) } : {})
        })
  })
  sse(`${baseUrl}/chat/completions`, localStorage.getItem('token'), chatOption, { 'Content-Type': 'application/json' })
}
