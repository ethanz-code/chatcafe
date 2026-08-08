import { createRouter, createWebHistory } from 'vue-router'
import Box from '@/views/TabBar/BoxView.vue'
import AIChat from '@/views/TabBar/AIChat.vue'
import AIAssistant from '@/views/TabBar/AIAssistant.vue'
import AppCenter from '@/views/TabBar/AppCenter.vue'
import UserCenter from '@/views/TabBar/UserCenter.vue'
import ImageCommunity from '@/views/TabBar/ImageCommunity.vue'
import { showFailToast } from 'vant'
import { useUserCenterStore } from '@/stores/user-center'

// 预加载 Service 子页面组件，进入个人中心后点击子项无需等待加载
const servicePageLoaders = [
  () => import('@/views/Service/Concat.vue'),
  () => import('@/views/Service/About.vue'),
  () => import('@/views/Service/FeedBack.vue'),
  () => import('@/views/Service/PayStore.vue'),
  () => import('@/views/Service/ActivationCode.vue'),
  () => import('@/views/Service/InvitePoster.vue'),
  () => import('@/views/Service/DistributionPromotion.vue'),
  () => import('@/views/Service/StarMsg.vue'),
  () => import('@/views/Service/TaskReward.vue'),
]

// 静默预加载（失败不影响导航），resolve 不等待完成
const preloadServicePages = () => {
  for (const loader of servicePageLoaders) {
    loader().catch(() => {})
  }
  return true
}

const legacyModulePaths = {
  login: '/login',
  register: '/register',
  assistant: '/assistant',
  'image-gen': '/image-gen',
  'user-profile': '/profile',
  'change-password': '/password',
  'forget-password': '/forgot-password',
  'image-community-details': '/image-details',
}

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
          component: AIChat,
          meta: { shell: 'tab', viewport: 'chat', transition: 'tab', keepAlive: true }
        },
        {
          path: 'ai-assistant',
          name: 'AIAssistant',
          component: AIAssistant,
          meta: { shell: 'tab', viewport: 'page', transition: 'tab', keepAlive: true }
        },
        {
          path: 'app-center',
          name: 'AppCenter',
          component: AppCenter,
          meta: { shell: 'tab', viewport: 'page', transition: 'tab', keepAlive: true }
        },
        {
          path: 'user-center',
          name: 'UserCenter',
          component: UserCenter,
          beforeEnter: preloadServicePages,
          meta: { shell: 'tab', viewport: 'page', transition: 'tab', keepAlive: true }
        },
        {
          path: 'image-community',
          name: 'ImageCommunity',
          component: ImageCommunity,
          meta: { shell: 'tab', viewport: 'page', transition: 'tab', keepAlive: true }
        }
      ]
    },
    {
      path: '/modules',
      component: () => import('@/views/Modules/ModulesView.vue'),
      children: [
        {
          path: '/login',
          name: 'Login',
          component: () => import('@/views/Modules/UserLogin.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false }
        },
        {
          path: '/register',
          name: 'Register',
          props: (route) => ({ inviteCode: route.query.inviteCode }),
          component: () => import('@/views/Modules/UserRegister.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false }
        },
        {
          path: '/assistant',
          name: 'Assistant',
          props: (route) => ({ id: route.query.id }),
          component: () => import('@/views/Modules/AssistantChat.vue'),
          meta: { shell: 'plain', viewport: 'chat', transition: 'push', keepAlive: false }
        },
        {
          path: '/image-gen',
          name: 'ImageGeneration',
          props: (route) => ({ type: route.query.type }),
          component: () => import('@/views/Modules/ImageGeneration.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false }
        },
        {
          path: '/profile',
          name: 'UserProfile',
          component: () => import('@/views/Modules/UserProfile.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '个人资料', backTo: '/pages/user-center' }
        },
        {
          path: '/password',
          name: 'ChangePassword',
          component: () => import('@/views/Modules/ChangePassword.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '修改密码', backTo: '/profile' }
        },
        {
          path: '/forgot-password',
          name: 'ForgetPassword',
          component: () => import('@/views/Modules/ForgetPassword.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '找回密码', backTo: '/profile' }
        },
        {
          path: '/image-details',
          name: 'ImageCommunityDetails',
          component: () => import('@/views/Modules/ImageCommunityDetails.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false }
        }
      ]
    },
    {
      path: '/s',
      name: 'Service',
      component: () => import('@/views/Modules/ModulesView.vue'),
      children: [
        {
          path: 'not-found',
          name: 'NotFound',
          component: () => import('@/views/Service/NotFound.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '404', backTo: '/pages/user-center' }
        },
        {
          path: 'concat',
          name: 'Concat',
          component: () => import('@/views/Service/Concat.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '联系客服', backTo: '/pages/user-center' }
        },
        {
          path: 'about',
          name: 'About',
          component: () => import('@/views/Service/About.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '关于我们', backTo: '/pages/user-center' }
        },
        {
          path: 'feedback',
          name: 'Feedback',
          component: () => import('@/views/Service/FeedBack.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '意见反馈', backTo: '/pages/user-center' }
        },
        {
          path: 'pay',
          name: 'Pay',
          component: () => import('@/views/Service/PayStore.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '充值中心', backTo: '/pages/user-center' }
        },
        {
          path: 'code',
          name: 'ActivationCode',
          component: () => import('@/views/Service/ActivationCode.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '卡密兑换', backTo: '/pages/user-center' }
        },
        {
          path: 'poster',
          name: 'InvitePoster',
          component: () => import('@/views/Service/InvitePoster.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '邀请海报', backTo: '/pages/user-center' }
        },
        {
          path: 'promote',
          name: 'DistributionPromotion',
          component: () => import('@/views/Service/DistributionPromotion.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '分销推广', backTo: '/pages/user-center' }
        },
        {
          path: 'star',
          name: 'StarMsg',
          component: () => import('@/views/Service/StarMsg.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '我的收藏', backTo: '/pages/user-center' }
        },
        {
          path: 'task',
          name: 'TaskReward',
          component: () => import('@/views/Service/TaskReward.vue'),
          meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false, subpageShell: true, title: '任务奖励', backTo: '/pages/user-center' }
        }
      ]
    },
    {
      path: '/modules/:legacyPath(.*)*',
      redirect: (to) => {
        const legacyPath = Array.isArray(to.params.legacyPath)
          ? to.params.legacyPath.join('/')
          : to.params.legacyPath

        return {
          path: legacyModulePaths[legacyPath] || '/login',
          query: to.query,
          hash: to.hash,
        }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/Service/NotFound.vue'),
      meta: { shell: 'plain', viewport: 'page', transition: 'push', keepAlive: false }
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

// 各页面标题映射（与路由 name 对应）
const pageTitleMap = {
  AIChat: '首页',
  AIAssistant: '助理',
  AppCenter: '应用中心',
  UserCenter: '用户中心',
  ImageCommunity: '社区',
  Login: '登录',
  Register: '注册',
  Assistant: '助理-聊天',
  ImageGeneration: '图片生成',
  UserProfile: '个人资料',
  ChangePassword: '修改密码',
  ForgetPassword: '忘记密码',
  ImageCommunityDetails: '作品详情',
  NotFound: '404',
  Concat: '联系客服',
  About: '关于我们',
  Feedback: '意见反馈',
  Pay: '充值中心',
  ActivationCode: '卡密兑换',
  InvitePoster: '邀请海报',
  DistributionPromotion: '分销推广',
  StarMsg: '我的收藏',
  TaskReward: '任务奖励',
}

router.beforeEach((to, from, next) => {
  // 如果用户访问的是chat页面则直接跳转到首页，因为实际上/pages/ai-chat/alias让我设置了别名。
  if (isPass(to.path, '/pages/ai-chat') || isPass(to.path, '/pages')) next({ path: '/' })
  // 如果用户访问的是/modules并没有具体项则直接跳转到/login
  else if (isPass(to.path, '/modules')) next({ path: '/login', replace: false })
  else {
    // 需要登录的页面，未登录则重定向到登录页
    if (authRequiredRoutes.includes(to.name)) {
      const userStore = useUserCenterStore()
      const token = localStorage.getItem('token')
      if (!userStore.isLogin || !token) {
        showFailToast('请先登录')
        next({ path: '/login', replace: false })
        return
      }
    }
    next()
  }
})

// 统一设置页面标题：页面名 - ChatCafe
router.afterEach((to) => {
  const brand = 'ChatCafe'
  const title = pageTitleMap[to.name] || ''
  document.title = title ? `${title} - ${brand}` : brand
})

export default router
