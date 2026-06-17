import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useChatStore } from '@/stores/chat'
import { useUserCenterStore } from '@/stores/user-center'
import axios from './axios'
import moment from 'moment'

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
      const msgOptions = new FormData()
      msgOptions.append('uuid', store.selectedDialog.uuid)
      msgOptions.append('time', msgList[msgLength].time)
      await axios.request({
        url: '/chat/dialog/deleteMessage',
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        data: msgOptions
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

        // 检测是否登录状态，登录后直接将响应消息存到数据库
        if (userStore.isLogin) {
          const msgOptions = new FormData()
          msgOptions.append('uuid', store.selectedDialog.uuid)
          msgOptions.append('content', msgList[msgLength].content)
          msgOptions.append('role', 'assistant')
          msgOptions.append('imgUrl', msgList[msgLength].imgUrl)
          msgOptions.append('time', time)
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
            // console.log('未完成')
            notFinished()
          } else if (backupData.finish_reason === 'stop') {
            // console.log('完成')
          }
          // onclose()
          return
        }
        // 校验event.data值是否规范
        if (event.data === null || event.data === undefined || event.data.length === 0) return
        const parsed = JSON.parse(event.data)

        // 检测余额是否充足
        if (parsed.status && parsed.status === -1) {
          execOnClose = false
          accepted = true
          insufficientBalance()
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
          // console.log(respString)
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
        // console.log('结束2')
        if (execOnClose) onclose()
      }
    })
  }

  const chatOption = new FormData()
  chatOption.append('model', model)
  chatOption.append('loadDbData', userStore.isLogin && !assistantDialogContent)
  if (userStore.isLogin && !assistantDialogContent)
    chatOption.append('uuid', store.selectedDialog.uuid)
  else {
    chatOption.append('messages', JSON.stringify(messages))
    if (assistantDialogContent) {
      chatOption.append('isAssistant', true)
      chatOption.append('assistantId', assistantId)
    }
  }
  sse(`${baseUrl}/chat/completions`, localStorage.getItem('token'), chatOption)
}
