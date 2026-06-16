import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'

export const useImageCommunityStore = defineStore(
  'image-community',
  () => {
    const allGzData = ref([])
    const detailData = ref()
    return {
      allGzData,
      detailData
    }
  },
  {
    persist: {
      enabled: true,
      key: 'image-community',
      encryptionKey: 'image-community-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-image-community', {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Iso10126
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-image-community', {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.Iso10126
          })
        }
      }
    }
  }
)
