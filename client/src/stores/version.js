import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useVersionStore = defineStore(
  'version',
  () => {
    const version = ref('')
    return {
      version
    }
  },
  {
    persist: {
      enabled: true,
      key: 'version',
      storage: localStorage
    }
  }
)
