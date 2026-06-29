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
    const llm = ref([])
    const selectedModel = ref('')

    const loadLLMData = async (force = false) => {
      let result = llm.value
      if (llm.value.length === 0 || force) {
        result = await axios.get('/chat/llmList')

        if (result.status === 200) llm.value = (result.data)
        if (force && llm.value.filter((item) => item.model === selectedModel.value).length === 0) {
          selectedModel.value = llm.value.length > 0 ? llm.value[0].model : 'none'
        }
      }

      return llm.value
    }

    const allDialogNotSplit = ref([])
    const getAllDialogNotSplit = async () => {
      const result = await axios.get('/chat/dialog/getAllDialog', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
      if (result.status === 200) {
        const data = (result.data)
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
    const selectedDialog = ref({ title: '', uuid: '' })
    const dialogContent = ref([])

    const buildDialogFromNotSplit = () => {
      if (allDialogNotSplit.value.length === 0) return
      const select = allDialogNotSplit.value[0]
      selectedDialog.value.title = select.title
      selectedDialog.value.uuid = select.uuid

      dialogContent.value = []
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

    const newDialog = async () => {
      replying.value = false

      const userCenterStore = useUserCenterStore()
      if (userCenterStore.isLogin) {
        const result = await axios.post('/chat/dialog/newDialog', {
          title: '新的对话',
        }, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
        if (result.status === 200) {
          const data = (result.data)
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
        const time = moment().toISOString()
        allDialogNotSplit.value.unshift({
          createdAt: time,
          updatedAt: time,
          title: '新的对话',
          uuid: uuidv4(),
          url: '',
          delta: []
        })
      }
    }
    const deleteDialog = () => {
      const userCenterStore = useUserCenterStore()
      allDialogNotSplit.value = allDialogNotSplit.value.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )
      dialogContent.value = dialogContent.value.filter(
        (item) => item.uuid !== selectedDialog.value.uuid
      )

      if (userCenterStore.isLogin) {
        axios.post('/chat/dialog/deleteDialog', {
          uuid: selectedDialog.value.uuid
        }, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
      }

      const timer = setTimeout(async () => {
        if (allDialogNotSplit.value.length === 0) {
          await newDialog()
        } else {
          selectedDialog.value.title = allDialogNotSplit.value[0].title
          selectedDialog.value.uuid = allDialogNotSplit.value[0].uuid
        }
        clearTimeout(timer)
      }, 300)
    }
    const editDialog = (title) => {
      const userCenterStore = useUserCenterStore()
      allDialogNotSplit.value.forEach((item) => {
        if (item.uuid === selectedDialog.value.uuid) {
          item.title = title
        }
      })
      selectedDialog.value.title = title
      if (userCenterStore.isLogin) {
        axios.request({
          url: '/chat/dialog/editDialog',
          method: 'post',
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          data: {
            uuid: selectedDialog.value.uuid,
            title
          }
        })
      }
    }
    const syncDialogImg = () => {}

    const initDialog = async () => {
      if (allDialogNotSplit.value.length === 0) {
        const userCenterStore = useUserCenterStore()
        if (
          selectedDialog.value.title === '' &&
          selectedDialog.value.uuid === '' &&
          !userCenterStore.isLogin
        ) {
          await newDialog()
        }
        buildDialogFromNotSplit()
      }
    }

    const afterLoginProcess = async (clearLocalData = true) => {
      if (clearLocalData) {
        selectedDialog.value.title = ''
        selectedDialog.value.uuid = ''
        dialogContent.value = []
        allDialogNotSplit.value = []
      }
    }

    const hotIssue = ref([])

    const load4HotIssue = async (force = false) => {
      if (hotIssue.value.length === 0 || force) {
        let result = await axios.get('/chat/hotIssues')
        if (result.status === 200) hotIssue.value = (result.data)
      }

      if (hotIssue.value.length === 0) return []

      const count = Math.min(4, hotIssue.value.length)
      const indices = new Set()
      while (indices.size < count) {
        indices.add(Math.floor(Math.random() * hotIssue.value.length))
      }

      return [...indices].map((i) => hotIssue.value[i])
    }

    const replying = ref(false)
    const sidebarShowLeft = ref(false)

    return {
      llm,
      selectedModel,
      loadLLMData,
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
      buildDialogFromNotSplit,
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
