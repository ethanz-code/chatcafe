import axios from './axios'
import { autoClear } from './clearLocalStorage'
import { useVersionStore } from '@/stores/version'

// 引入版本号概念，每次检测版本号是否与网络最新版本号相同，不同时清空本地存储
export const versionDiff = async () => {
  const versionStore = useVersionStore()

  // 获取数据库中版本号，
  const response = await axios.request({
    url: '/user/service/about/getVersion',
    method: 'get'
  })
  if (response.status === 200) {
    const parsedData = JSON.parse(response.data)
    if (parsedData.status === 0 && parsedData.data.value !== versionStore.version) {
      versionStore.version = parsedData.data.value
      autoClear()
      window.location.reload()
    }
  }
}
