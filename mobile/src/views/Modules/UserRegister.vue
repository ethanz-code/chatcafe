<template>
  <section ref="content" class="h-full bg-white">
    <van-nav-bar title="注 册" left-arrow @click-left="onClickLeft" />
    <van-form class="mt-6 mx-3" @submit="register">
      <van-cell-group class="font-mono" inset>
        <van-field
          v-model="username"
          name="账号"
          placeholder="请输入手机号"
          :error-message="usernameErrMsg"
          :rules="[
            { required: true, message: '请填写+86 11位合法手机号', pattern: usernamePattern }
          ]"
        >
          <template #left-icon>
            <Phone24Regular class="w-6 h-6" />
          </template>
        </van-field>

        <van-field
          v-model="verifyCode"
          type="number"
          name="verifyCode"
          placeholder="请输入验证码"
          maxlength="6"
        >
          <template #left-icon>
            <div class="flex items-center h-full">
              <ShieldTask24Regular class="w-6 h-6" />
            </div>
          </template>
          <template #right-icon>
            <van-button
              @click="sendVerifyCode"
              size="small"
              plain
              :disabled="inOneMinuteHasSent"
              type="primary"
            >
              {{ inOneMinuteHasSent ? `${countDown}s 后重新发送` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>

        <van-field
          v-model="password"
          type="password"
          name="密码"
          left-icon="shield-o"
          placeholder="请输入登录密码（6-20位字母数字组合密码）"
          :rules="[
            {
              required: true,
              message: '请填写6-20位任意字母、数字组合的密码',
              pattern: passwordPattern
            }
          ]"
        >
          <template #left-icon>
            <LockOpen24Regular class="w-6 h-6" />
          </template>
        </van-field>
      </van-cell-group>
      <div class="flex flex-col items-center gap-3 mx-4 mt-6">
        <van-button
          class="shadow-md"
          color="linear-gradient(to right, #ff6034, #ee0a24)"
          round
          block
          type="primary"
          native-type="submit"
        >
          立即注册
        </van-button>

        <p>
          * 注册代表您同意<a
            href="https://aigc-yassine.notion.site/3e8f1814e8e6430aa771128cd9a1c220?pvs=4"
            target="_blank"
            class="cursor-pointer text-[#ff6034]"
            >《爱设计用户协议》</a
          >
        </p>
      </div>
    </van-form>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserCenterStore } from '@/stores/user-center'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect'
import { onUnmounted } from 'vue'
import { Phone24Regular, LockOpen24Regular, ShieldTask24Regular } from '@vicons/fluent'
import { showFailToast, showSuccessToast } from 'vant'
import axios from '@/utils/axios'
import CryptoJS from 'crypto-js'
import { useFloatingFunction } from '@/stores/floating-function'

const props = defineProps(['inviteCode'])
const historyStore = useFloatingFunction()
const router = useRouter()
const userStore = useUserCenterStore()
const content = ref('')

const onClickLeft = () => {
  historyStore.lastPagePath = []
  router.push('/pages/user-center')
}
const username = ref('')
const password = ref('')
const verifyCode = ref()
// 账号（手机号）和密码的匹配正则
const usernamePattern = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
const passwordPattern = /^(?=.*\d)(?=.*[A-z])[\da-zA-Z]{6,20}$/
const verifyCodePattern = /^[0-9]{6}$/
const inOneMinuteHasSent = ref(false)
const usernameErrMsg = ref('')
let timer = 0,
  countDown = ref(59)
const sendVerifyCode = async () => {
  if (!usernamePattern.test(username.value)) {
    showFailToast('输入手机号')
    usernameErrMsg.value = '请填写+86 11位合法手机号'
    return
  } else {
    usernameErrMsg.value = ''
  }

  // 将手机号请求给后端，让后端做短信发送
  const options = new FormData()
  options.append('phoneNumber', username.value)
  const result = await axios.request({
    url: '/user/registerVerifyCode',
    method: 'post',
    data: options
  })
  if (result.status === 200) {
    const parsedData = JSON.parse(result.data)
    if (parsedData.status === -1) {
      showFailToast(parsedData.message)
      return
    }
  }
  inOneMinuteHasSent.value = true
  timer = setInterval(() => {
    if (inOneMinuteHasSent.value && countDown.value > 1) {
      countDown.value--
    } else {
      clearInterval(timer)
      inOneMinuteHasSent.value = false
      countDown.value = 59
    }
  }, 1000)
}
const register = () => {
  // 检测验证码是否按照正确格式输入
  if (!verifyCodePattern.test(verifyCode.value)) {
    showFailToast('请输入验证码')
    return
  }

  // 将密码加密
  const encryptedPassword = CryptoJS.AES.encrypt(password.value, 'ydai').toString()
  const options = new FormData()
  options.append('verifyCode', verifyCode.value)
  options.append('password', encryptedPassword)
  if (props.inviteCode) options.append('inviteCode', props.inviteCode)
  axios
    .request({
      url: '/user/register',
      method: 'post',
      data: options
    })
    .then((res) => {
      if (res.status === 200) {
        const parsedData = JSON.parse(res.data)
        if (parsedData.status === 0) {
          // 注册成功
          // eslint-disable-next-line no-undef
          showSuccessToast('注册成功')

          // 1s后跳转到登录页面
          const timer = setTimeout(() => {
            clearTimeout(timer)
            historyStore.backLastPage()
          }, 1500)
        } else if (parsedData.status === -1) {
          showFailToast(parsedData.message)
        }
      }
    })
}

onMounted(() => {
  WhetherToDisableTheEffect(content.value)

  // 判断用户是否已经登录成功
  if (userStore.isLogin) {
    // 检测到url中携带inviteCode，提示用户已登录
    if (props.inviteCode) showSuccessToast('已登录')
    router.push('/pages/user-center')
  }
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>
