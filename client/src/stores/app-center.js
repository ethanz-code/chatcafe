import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import axios from '@/utils/axios'

export const useAppCenterStore = defineStore(
  'app-center',
  () => {
    const allApp = ref([])

    const getAllApplication = async (force = false) => {
      const res = await axios.request({
        url: '/app-center/allApplication',
        method: 'get'
      })

      if (res.status === 200) {
        const parsedData = JSON.parse(res.data)
        if (parsedData.status === 0) {
          if (allApp.value.length === 0 || force) {
            allApp.value = parsedData.data
          }
        }
      }
    }

    return { allApp, getAllApplication }
  },
  {
    persist: {
      enabled: true,
      key: 'app-center',
      encryptionKey: 'app-center-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-app-center', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-app-center', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          })
        }
      }
    }
  }
)
