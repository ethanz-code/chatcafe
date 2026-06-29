import { ref } from 'vue'
import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'

export const useUserCenterStore = defineStore(
  'user-center',
  () => {
    const phoneNumber = ref('13812345678')
    const getProcessPhoneNumber = () => {
      // 将一段手机号的中间四位改为*号并返回
      return phoneNumber.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }

    const vip = ref(false)
    const userId = ref(10001)
    const name = ref('')

    const dialogueBalance = ref(0)
    const paintingBalance = ref(0)

    const isLogin = ref(false)

    const avatar = ref('/res/avatar.png')
    const createdTime = ref('')

    const inviteCode = ref('')

    const reset = () => {
      dialogueBalance.value = 0
      paintingBalance.value = 0
      isLogin.value = false
    }

    return {
      phoneNumber,
      getProcessPhoneNumber,
      vip,
      userId,
      name,
      dialogueBalance,
      paintingBalance,
      isLogin,
      avatar,
      createdTime,
      inviteCode,
      reset
    }
  },
  {
    persist: {
      enabled: true,
      key: 'user-center',
      encryptionKey: 'user-center-store',
      storage: localStorage,
      customEncryption: {
        encrypt(state) {
          return CryptoJS.AES.encrypt(JSON.stringify(state), 'ydai-user-center', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
          })
        },
        decrypt(encryptedState) {
          return CryptoJS.AES.decrypt(encryptedState, 'ydai-user-center', {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
          })
        }
      }
    }
  }
)
