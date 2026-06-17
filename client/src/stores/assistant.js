import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import axios from '@/utils/axios'

export const useAssistantStore = defineStore(
  'assistant',
  () => {
    const categoryData = ref([])
    const getAssistantCategory = async (force = false) => {
      if (categoryData.value.length === 0 || force) {
        const result = await axios.request({
          url: '/assistant/getAll',
          method: 'get'
        })

        const parsed = JSON.parse(result.data)
        categoryData.value = parsed.data
      }
      return categoryData
    }

    return { categoryData, getAssistantCategory }
  },
  {
    persist: {
      enabled: false,
      key: 'assistant',
      encryptionKey: 'assistant-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-assistant', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Iso97971
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-assistant', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Iso97971
          })
        }
      }
    }
  }
)
