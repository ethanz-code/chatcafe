import { showFailToast } from 'vant'
import { useUserCenterStore } from '@/stores/user-center'
import { autoClear } from '@/utils/clearLocalStorage'
import router from '@/router'

let redirecting = false

export default function handleUnauthorized() {
  if (redirecting) return
  redirecting = true
  autoClear()
  useUserCenterStore().reset()
  showFailToast('登录已过期，请重新登录')
  router.push('/login').finally(() => {
    redirecting = false
  })
}
