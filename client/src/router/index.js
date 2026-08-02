import { createRouter, createWebHistory } from 'vue-router'
import Box from '@/views/TabBar/BoxView.vue'
import AIChat from '@/views/TabBar/AIChat.vue'
import AIAssistant from '@/views/TabBar/AIAssistant.vue'
import AppCenter from '@/views/TabBar/AppCenter.vue'
import UserCenter from '@/views/TabBar/UserCenter.vue'
import ImageCommunity from '@/views/TabBar/ImageCommunity.vue'
import { showFailToast } from 'vant'
import { useUserCenterStore } from '@/stores/user-center'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/pages',
      component: Box,
      children: [
        {
          path: 'ai-chat',
          name: 'AIChat',
          alias: '/',
          component: AIChat
        },
        {
          path: 'ai-assistant',
          name: 'AIAssistant',
          component: AIAssistant
        },
        {
          path: 'app-center',
          name: 'AppCenter',
          component: AppCenter
        },
        {
          path: 'user-center',
          name: 'UserCenter',
          component: UserCenter
        },
        {
          path: 'image-community',
          name: 'ImageCommunity',
          component: ImageCommunity
        }
      ]
    },
    {
      path: '/modules',
      component: () => import('@/views/Modules/ModulesView.vue'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/Modules/UserLogin.vue')
        },
        {
          path: 'register',
          name: 'Register',
          props: (route) => ({ inviteCode: route.query.inviteCode }),
          component: () => import('@/views/Modules/UserRegister.vue')
        },
        {
          path: 'assistant',
          name: 'Assistant',
          props: (route) => ({ id: route.query.id }),
          component: () => import('@/views/Modules/AssistantChat.vue')
        },
        {
          path: 'image-gen',
          name: 'ImageGeneration',
          props: (route) => ({ type: route.query.type }),
          component: () => import('@/views/Modules/ImageGeneration.vue')
        },
        {
          path: 'user-profile',
          name: 'UserProfile',
          component: () => import('@/views/Modules/UserProfile.vue')
        },
        {
          path: 'change-password',
          name: 'ChangePassword',
          component: () => import('@/views/Modules/ChangePassword.vue')
        },
        {
          path: 'forget-password',
          name: 'ForgetPassword',
          component: () => import('@/views/Modules/ForgetPassword.vue')
        },
        {
          path: 'image-community-details',
          name: 'ImageCommunityDetails',
          component: () => import('@/views/Modules/ImageCommunityDetails.vue')
        }
      ]
    },
    {
      path: '/service',
      name: 'Service',
      component: () => import('@/views/Modules/ModulesView.vue'),
      children: [
        {
          path: 'not-found',
          name: 'NotFound',
          component: () => import('@/views/Service/NotFound.vue')
        },
        {
          path: 'concat',
          name: 'Concat',
          component: () => import('@/views/Service/Concat.vue')
        },
        {
          path: 'about',
          name: 'About',
          component: () => import('@/views/Service/About.vue')
        },
        {
          path: 'feedback',
          name: 'Feedback',
          component: () => import('@/views/Service/FeedBack.vue')
        },
        {
          path: 'pay',
          name: 'Pay',
          component: () => import('@/views/Service/PayStore.vue')
        },
        {
          path: 'activationCode',
          name: 'ActivationCode',
          component: () => import('@/views/Service/ActivationCode.vue')
        },
        {
          path: 'invitePoster',
          name: 'InvitePoster',
          component: () => import('@/views/Service/InvitePoster.vue')
        },
        {
          path: 'distributionPromotion',
          name: 'DistributionPromotion',
          component: () => import('@/views/Service/DistributionPromotion.vue')
        },
        {
          path: 'star-msg',
          name: 'StarMsg',
          component: () => import('@/views/Service/StarMsg.vue')
        },
        {
          path: 'task-reward',
          name: 'TaskReward',
          component: () => import('@/views/Service/TaskReward.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/Service/NotFound.vue')
    }
  ]
})

// 检测路径和名称在加/和不加/的情况下是否匹配，有一种匹配的情况则返回true
const isPass = (path, name) => {
  const flag = true
  let canModifyName = true
  while (flag) {
    if (path === name) return true
    if (canModifyName) {
      if (name.endsWith('/')) name = name.slice(0, -1)
      else name = name + '/'

      canModifyName = false
    } else break
  }

  return false
}

// 需要登录才能访问的路由
const authRequiredRoutes = [
  'UserCenter',
  'UserProfile',
  'ChangePassword',
  'Pay',
  'ActivationCode',
  'InvitePoster',
  'DistributionPromotion',
  'StarMsg',
  'TaskReward',
]

router.beforeEach((to, from, next) => {
  // 如果用户访问的是chat页面则直接跳转到首页，因为实际上/pages/ai-chat/alias让我设置了别名。
  if (isPass(to.path, '/pages/ai-chat') || isPass(to.path, '/pages')) next({ path: '/' })
  // 如果用户访问的是/modules并没有具体项则直接跳转到/modules/login
  else if (isPass(to.path, '/modules')) next({ path: '/modules/login' })
  else {
    // 需要登录的页面，未登录则重定向到登录页
    if (authRequiredRoutes.includes(to.name)) {
      const userStore = useUserCenterStore()
      const token = localStorage.getItem('token')
      if (!userStore.isLogin || !token) {
        showFailToast('请先登录')
        next({ path: '/modules/login' })
        return
      }
    }
    next()
  }
})

export default router
