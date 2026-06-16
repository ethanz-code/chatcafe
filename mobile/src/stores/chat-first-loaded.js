import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'

export const useChatFirstLoadedStore = defineStore(
  'chatFirstLoaded',
  () => {
    const chatFirstLoaded = ref(true)
    return {
      chatFirstLoaded
    }
  },
  {
    persist: {
      enabled: false,
      key: 'chatFirstLoaded',
      encryptionKey: 'chat-first-loaded-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-chat-first-loaded', {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.AnsiX923
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-chat-first-loaded', {
            mode: CryptoJS.mode.CFB,
            padding: CryptoJS.pad.AnsiX923
          })
        }
      }
    }
  }
)
