<template>
  <section ref="content" class="h-full bg-white flex flex-col gap-16 relative">
    <div class="h-1/3 relative">
      <img v-lazy="'/res/静谧的湖畔.png'" class="w-full h-full object-cover object-center" />
      <div class="custom-shape-divider-bottom-1711077015">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            class="shape-fill"
          ></path>
        </svg>
      </div>
    </div>
    <div class="px-3">
      <van-form @submit="login">
        <van-cell-group class="font-mono" inset>
          <van-field
            v-model="username"
            name="账号"
            label="账号"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请填写+86 11位合法手机号', pattern: usernamePattern }
            ]"
          />
          <van-field
            v-model="password"
            type="password"
            name="密码"
            label="密码"
            placeholder="请输入密码"
            :rules="[
              {
                required: true,
                message: '请填写6-20位任意字母、数字组合的密码',
                pattern: passwordPattern
              }
            ]"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button
            color="linear-gradient(to right, #ff6034, #ee0a24)"
            round
            block
            type="primary"
            native-type="submit"
          >
            登 录
          </van-button>
        </div>
        <div style="margin: 16px; margin-top: 8px" @click="register">
          <van-button plain block round type="default">注 册</van-button>
        </div>
      </van-form>
    </div>

    <!-- 忘记密码 -->
    <div
      @click="forgetPassword"
      class="text-gray-500 text-center absolute bottom-4 w-full cursor-pointer"
    >
      忘记密码？
    </div>
  </section>
</template>
<script setup lang="js">
import { useUserCenterStore } from '@/stores/user-center'
import { useChatStore } from '@/stores/chat'
import { useAssistantStore } from '@/stores/assistant'
import { useFloatingFunction } from '@/stores/floating-function'
import { ref } from 'vue'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect'
import { onMounted } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/utils/axios'
import CryptoJS from 'crypto-js'
import { useChatFirstLoadedStore } from '@/stores/chat-first-loaded'

const chatFirstLoaded = useChatFirstLoadedStore()
const userStore = useUserCenterStore()
const chatStore = useChatStore()
const assistantStore = useAssistantStore()
const historyStore = useFloatingFunction()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const content = ref('')

// 账号（手机号）和密码的匹配正则
const usernamePattern = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
const passwordPattern = /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z\d]{6,20}$/

const login = async () => {
  axios
    .post(
      '/user/login',
      {
        phoneNumber: username.value,
        password: CryptoJS.AES.encrypt(password.value, 'ydai').toString()
      }
    )
    .then((result) => {
      result = (result.data)
      if (result.status && result.status === -1) {
        showFailToast('登录失败')
      } else {
        // 将用户相关信息存起来
        userStore.phoneNumber = result.data.phoneNumber
        userStore.isLogin = true
        userStore.vip = result.data.vip
        userStore.userId = result.data.id
        userStore.name = result.data.name
        userStore.avatar = result.data.avatar
        userStore.dialogueBalance = result.data.dialogueBalance
        userStore.paintingBalance = result.data.paintingBalance
        userStore.createdTime = result.data.createdAt
        userStore.inviteCode = result.data.inviteCode

        // 将聊天首次加载设置为true，防止出现空的情况
        chatFirstLoaded.chatFirstLoaded = true

        // 聊天页面热门问题重新请求
        chatStore.load4HotIssue(true)

        // 重新请求所有专业助理
        assistantStore.getAssistantCategory(true)

        showSuccessToast({
          message: '登录成功',
          duration: 1000
        })
        // 存储token数据
        localStorage.setItem('token', result.data.token)

        // 清除未登录时的所有聊天信息(需要token授权)
        chatStore.afterLoginProcess()

        // 跳转到首页
        const timer = setTimeout(() => {
          router.push('/')
          historyStore.lastPagePath = []
          clearTimeout(timer)
        }, 1000)
      }
    })
    .catch(() => {
      showFailToast('网络错误，登录失败')
    })
}

const register = () => {
  // console.log('register')
  historyStore.lastPagePath.push(route.fullPath)
  router.push('/modules/register')
}

const forgetPassword = () => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push('/modules/forget-password')
}

onMounted(() => {
  WhetherToDisableTheEffect(content.value)

  // 判断用户是否已经登录成功
  if (userStore.isLogin) router.push('/pages/user-center')
})
</script>
<style scoped>
.header {
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' %3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1' gradientTransform='rotate(28,0.5,0.5)'%3E%3Cstop offset='0' stop-color='%23FF1D57'/%3E%3Cstop offset='1' stop-color='%23FF6E65'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='16' height='16' patternUnits='userSpaceOnUse'%3E%3Ccircle fill='%23ffffff' cx='8' cy='8' r='8'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)' fill-opacity='0.03'/%3E%3C/svg%3E");
  background-attachment: fixed;
}
.custom-shape-divider-bottom-1711077015 {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  transform: rotate(180deg);
}

.custom-shape-divider-bottom-1711077015 svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 126px;
}

.custom-shape-divider-bottom-1711077015 .shape-fill {
  fill: #ffffff;
}

/** For mobile devices **/
@media (max-width: 767px) {
  .custom-shape-divider-bottom-1711077015 svg {
    width: calc(121% + 1.3px);
    height: 56px;
  }
}
</style>
