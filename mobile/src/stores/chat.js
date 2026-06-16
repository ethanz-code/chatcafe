import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import axios from '@/utils/axios'
import { useUserCenterStore } from '@/stores/user-center'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

export const useChatStore = defineStore(
  'chat',
  () => {
    // cost > 0 消耗 {cost}  条对话次数
    // cost = 0 免费
    const llm = ref([
      // { model: 'GPT-3.5', cost: 1, imgUrl: '/llm-logo/openai-gpt-3.5.png' },
      // { model: 'GPT-4', cost: 30, imgUrl: '/llm-logo/openai-gpt-4.0.png' }
    ])
    const selectedModel = ref('')

    const loadLLMData = async (force = false) => {
      let result = llm.value
      // 当开启force时，会强制重新获取数据
      if (llm.value.length === 0 || force) {
        result = await axios.get('/chat/llmList')

        if (result.status === 200) llm.value = JSON.parse(result.data)
        // 如果是强制重新获取数据并且选择模型在现有列表中可以找到将不会重新选择默认模型，这样会影响用户体验
        if (force && llm.value.filter((item) => item.model === selectedModel.value).length === 0) {
          selectedModel.value = llm.value.length > 0 ? llm.value[0].model : 'none'
        }
      }

      return llm.value
    }

    // f267f002-af9c-4b39-bdd7-959beb3d6ea4
    // 7c8dd1d9-19ab-4082-9391-7753f9a98567
    // 55b43438-51a5-4d24-870d-0bea2055af24
    // 9d054d2a-5c22-45c5-94c6-39b0e59d615b
    // 397a9aba-a329-4cf8-a763-8fd6f355edaa
    // 487bee81-19e2-401c-86c1-892e9cf643d0
    // b43f14ed-0318-4b08-9096-88724805efd7

    // 45f94d89-05ef-4832-8e3b-e7a19694d315
    // 271460cf-a6fc-4701-9ae7-399a5f698e75
    // 2eb2c050-1f34-45bf-a327-f2ce60c2bbd4

    const dialogLevelTranslate = ref({
      today: '今天',
      past7Days: '过去 7 天',
      past30Days: '过去 30 天',
      past90Days: '过去 90 天'
    })

    // 今天、 过去 7 天、 过去 30 天、 过去 90 天
    // 拿到后端对话数据未按照时间段拆分的数据，每次用户访问Chat页面都进行一次计算。有一个最重要的参数time。
    const allDialogNotSplit = ref([])
    const getAllDialogNotSplit = async () => {
      const result = await axios.get('/chat/dialog/getAllDialog', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
      if (result.status === 200) {
        const data = JSON.parse(result.data)
        if (data.status === 0) {
          allDialogNotSplit.value = data.data.map((item) => {
            return {
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              title: item.title,
              uuid: item.uuid,
              url: item.imgUrl,
              delta: item.delta
            }
          })

          if (allDialogNotSplit.value.length === 0) {
            await newDialog()
          }
        }
      }
    }
    const allDialog = ref({
      today: [],
      past7Days: [],
      past30Days: [],
      past90Days: []
    })
    const selectedDialog = ref({ title: '', uuid: '' })
    const dialogContent = ref([])

    const processAllDialogNotSplit = () => {
      allDialog.value.today = []
      allDialog.value.past7Days = []
      allDialog.value.past30Days = []
      allDialog.value.past90Days = []

      allDialogNotSplit.value.forEach((item) => {
        const day = moment(moment().toISOString()).diff(moment(item.updatedAt), 'days')
        if (day === 0) allDialog.value.today.push(item)
        if (day > 0 && day < 7) allDialog.value.past7Days.push(item)
        if (day >= 7 && day < 30) allDialog.value.past30Days.push(item)
        if (day >= 30 && day < 90) allDialog.value.past90Days.push(item)
      })

      if (allDialogNotSplit.value.length !== 0) {
        const select = allDialogNotSplit.value[0]
        selectedDialog.value.title = select.title
        selectedDialog.value.uuid = select.uuid

        // 循环遍历allDialogNotSplit
        for (let i = 0; i < allDialogNotSplit.value.length; i++) {
          dialogContent.value.unshift({
            uuid: allDialogNotSplit.value[i].uuid,
            delta: allDialogNotSplit.value[i].delta.map((item) => {
              return {
                ...item,
                func_available: true,
                collapse: item.role === 'user' ? false : true
              }
            })
          })
        }
      }
    }

    // 没有任何对话数据，先新建一个对话
    const newDialog = async () => {
      const imgUrl = llm.value.filter((item) => item.model === selectedModel.value)[0].imgUrl
      replying.value = false

      const userCenterStore = useUserCenterStore()
      if (userCenterStore.isLogin) {
        const formData = new FormData()
        formData.append('title', '新的对话')
        formData.append('imgUrl', imgUrl)
        const result = await axios.post('/chat/dialog/newDialog', formData, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'multipart/form-data'
          }
        })
        if (result.status === 200) {
          const data = JSON.parse(result.data)
          if (data.status === 0) {
            allDialogNotSplit.value.unshift({
              createdAt: data.data.createdAt,
              updatedAt: data.data.updatedAt,
              title: data.data.title,
              uuid: data.data.uuid,
              url: data.data.imgUrl,
              delta: data.data.delta
            })
          }
        }
      } else {
        // 从本地新建对话
        const time = moment().toISOString()
        allDialogNotSplit.value.unshift({
          createdAt: time,
          updatedAt: time,
          title: '新的对话',
          uuid: uuidv4(),
          url: llm.value.filter((item) => item.model === selectedModel.value)[0].imgUrl,
          delta: []
        })
      }
    }
    const deleteDialog = () => {
      const userCenterStore = useUserCenterStore()
      // 从本地删除对话，通过selectedDialog判断需要删除哪个
      // 1. 对话副本
      // 2. 实际对话
      // 3. 对话内容
      allDialogNotSplit.value = allDialogNotSplit.value.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )
      allDialog.value.today = allDialog.value.today.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )
      allDialog.value.past7Days = allDialog.value.past7Days.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )
      allDialog.value.past30Days = allDialog.value.past30Days.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )
      allDialog.value.past90Days = allDialog.value.past90Days.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )
      dialogContent.value = dialogContent.value.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )

      // 判断是否登录状态，如果登录状态，则删除数据库中对应的Dialog
      if (userCenterStore.isLogin) {
        const reqOptions = new FormData()
        reqOptions.append('uuid', selectedDialog.value.uuid)
        axios.post('/chat/dialog/deleteDialog', reqOptions, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
      }

      const timer = setTimeout(async () => {
        if (allDialogNotSplit.value.length === 0) {
          await newDialog()
          processAllDialogNotSplit()
        } else {
          selectedDialog.value.title = allDialogNotSplit.value[0].title
          selectedDialog.value.uuid = allDialogNotSplit.value[0].uuid
        }
        clearTimeout(timer)
      }, 300)
    }
    const editDialog = (title) => {
      const userCenterStore = useUserCenterStore()
      // 从本地删除对话，通过selectedDialog判断需要删除哪个
      // 1. 对话副本
      // 2. 实际对话
      // 3. 已选对话标题
      allDialogNotSplit.value.map((item) => {
        if (item.uuid === selectedDialog.value.uuid) {
          item.title = title
        }
      })
      allDialog.value.today.map((item) => {
        if (item.uuid === selectedDialog.value.uuid) {
          item.title = title
        }
      })
      allDialog.value.past7Days.map((item) => {
        if (item.uuid === selectedDialog.value.uuid) {
          item.title = title
        }
      })
      allDialog.value.past30Days.map((item) => {
        if (item.uuid === selectedDialog.value.uuid) {
          item.title = title
        }
      })
      allDialog.value.past90Days.map((item) => {
        if (item.uuid === selectedDialog.value.uuid) {
          item.title = title
        }
      })
      selectedDialog.value.title = title
      if (userCenterStore.isLogin) {
        // 从后端删除对话
        const formData = new FormData()
        formData.append('uuid', selectedDialog.value.uuid)
        formData.append('title', title)
        axios.request({
          url: '/chat/dialog/editDialog',
          method: 'post',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          data: formData
        })
      }
    }
    const syncDialogImg = () => {
      // allDialogNotSplit的
      // allDialog的
      const dialogNotSplit = allDialogNotSplit.value.filter(
        (item) => item.uuid === selectedDialog.value.uuid
      )[0]
      const dialogToday = allDialog.value.today.filter(
        (item) => item.uuid === selectedDialog.value.uuid
      )[0]
      const dialogPast7Days = allDialog.value.past7Days.filter(
        (item) => item.uuid === selectedDialog.value.uuid
      )[0]
      const dialogPast30Days = allDialog.value.past30Days.filter(
        (item) => item.uuid === selectedDialog.value.uuid
      )[0]
      const dialogPast90Days = allDialog.value.past90Days.filter(
        (item) => item.uuid === selectedDialog.value.uuid
      )[0]

      const imgUrl = llm.value.filter((item) => item.model === selectedModel.value)[0].imgUrl

      dialogNotSplit.url = imgUrl
      if (dialogToday) dialogToday.url = imgUrl
      if (dialogPast7Days) dialogPast7Days.url = imgUrl
      if (dialogPast30Days) dialogPast30Days.url = imgUrl
      if (dialogPast90Days) dialogPast90Days.url = imgUrl

      // 本地更新完之后请求网络接口，更新数据库中的值
      const userCenterStore = useUserCenterStore()
      const options = new FormData()
      options.append('uuid', selectedDialog.value.uuid)
      options.append('imgUrl', modifiedImgUrl)
      if (userCenterStore.isLogin)
        axios.request({
          url: '/chat/dialog/syncDialogImg',
          method: 'post',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          data: options
        })
    }

    // 只有当allDialog无数据且当前没选择任何对话时才会调用新建一个默认对话
    const initDialog = async () => {
      if (
        allDialog.value.today.length === 0 &&
        allDialog.value.past7Days.length === 0 &&
        allDialog.value.past30Days.length === 0 &&
        allDialog.value.past90Days.length === 0
      ) {
        const userCenterStore = useUserCenterStore()
        if (
          selectedDialog.value.title === '' &&
          selectedDialog.value.uuid === '' &&
          !userCenterStore.isLogin
        ) {
          await newDialog()
        }

        processAllDialogNotSplit()
      }
    }

    // 登录后 一律从服务器拿数据
    const afterLoginProcess = async (clearLocalData = true) => {
      // 清理数据
      if (clearLocalData) {
        selectedDialog.value.title = ''
        selectedDialog.value.uuid = ''
        dialogContent.value = []

        allDialogNotSplit.value = []
      }

      allDialog.value.today = []
      allDialog.value.past7Days = []
      allDialog.value.past30Days = []
      allDialog.value.past90Days = []
    }

    const hotIssue = ref([])

    const load4HotIssue = async (force = false) => {
      if (hotIssue.value.length === 0 || force) {
        let result = await axios.get('/chat/hotIssues')
        if (result.status === 200) hotIssue.value = JSON.parse(result.data)
      }

      const result = []
      const index = []
      // 写一个for循环随机获取索引
      for (let i = 0; i < 4; i++) {
        let randomIndex = Math.floor(Math.random() * hotIssue.value.length)
        if (!index.includes(randomIndex)) {
          index.push(randomIndex)
          result.push(hotIssue.value[randomIndex])
        }
      }
      return result
    }

    const replying = ref(false)
    const sidebarShowLeft = ref(false)

    return {
      llm,
      selectedModel,
      loadLLMData,
      dialogLevelTranslate,
      allDialog,
      selectedDialog,
      hotIssue,
      load4HotIssue,
      dialogContent,
      replying,
      sidebarShowLeft,
      allDialogNotSplit,
      getAllDialogNotSplit,
      afterLoginProcess,
      initDialog,
      processAllDialogNotSplit,
      newDialog,
      deleteDialog,
      editDialog,
      syncDialogImg
    }
  },
  {
    persist: {
      enabled: true,
      key: 'chat',
      encryptionKey: 'chat-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-chat', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.AnsiX923
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-chat', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.AnsiX923
          })
        }
      }
    }
  }
)
