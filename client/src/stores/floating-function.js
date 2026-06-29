import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import { useRouter } from 'vue-router'

export const useFloatingFunction = defineStore(
  'floating-function',
  () => {
    const lastPagePath = ref([])
    const router = useRouter()

    const backHome = () => {
      // 执行回到首页的操作
      router.push('/')
    }
    const backUser = () => {
      // 执行回到用户页面的操作
      router.push('/pages/user-center')
    }
    const backLastPage = () => {
      // 执行回到上一页的操作
      if (lastPagePath.value.length > 0) {
        const path = lastPagePath.value.pop()
        router.push(path)
      }
    }

    return { backHome, backUser, backLastPage, lastPagePath }
  },
  {
    persist: {
      enabled: true,
      key: 'floating-function',
      encryptionKey: 'floating-function-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-floating-function', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Iso10126
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-floating-function', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Iso10126
          })
        }
      }
    }
  }
)
