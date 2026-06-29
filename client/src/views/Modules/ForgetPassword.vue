<template>
  <section class="h-full bg-white">
    <van-form @submit="onSubmit">
      <div class="font-medium text-lg pl-7 py-4">忘记密码</div>
      <van-cell-group inset>
        <van-field
          v-model="username"
          name="账号"
          label="账号"
          placeholder="请输入手机号码"
          :error-message="usernameErrMsg"
          :rules="[
            {
              required: true,
              message: '请填写+86手机号',
              pattern: usernamePattern
            }
          ]"
        />
        <van-field
          v-model="verifyCode"
          type="number"
          name="verifyCode"
          placeholder="请输入验证码"
          maxlength="6"
        >
          <template #left-icon>
            <div class="flex items-center h-full">
              <div class="w-[86.8px] mr-2">验证码</div>
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
          v-model="newPassword"
          type="password"
          name="新密码"
          label="新密码"
          placeholder="请输入新密码"
          :rules="[
            {
              required: true,
              message: '请填写6-20位任意字母、数字组合的密码',
              pattern: passwordPattern
            }
          ]"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          name="确认密码"
          label="确认密码"
          placeholder="再次输入新密码"
          :rules="[
            { required: true, message: '两次密码必须相同', validator: validatorNewPdIsSame }
          ]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button
          round
          block
          type="primary"
          color="linear-gradient(to right, #ff6034, #ee0a24)"
          native-type="submit"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </section>
</template>
<script setup lang="js">
import { ref } from 'vue'
import axios from '@/utils/axios'
import CryptoJS from 'crypto-js'
import { showFailToast, showSuccessToast } from 'vant'
import { useFloatingFunction } from '@/stores/floating-function'
import { useRouter } from 'vue-router'
import { useUserCenterStore } from '@/stores/user-center'

const userStore = useUserCenterStore()
const router = useRouter()
const historyStore = useFloatingFunction()
const verifyCode = ref()
const username = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const usernameErrMsg = ref('')
const usernamePattern = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
const passwordPattern = /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z\d]{6,20}$/
const verifyCodePattern = /^[0-9]{6}$/
const validatorNewPdIsSame = (val) => {
  if (val !== newPassword.value) return '两次密码必须相同'
}

const inOneMinuteHasSent = ref(false)
const countDown = ref(59)
let timer = 0
const sendVerifyCode = async () => {
  if (!usernamePattern.test(username.value)) {
    // eslint-disable-next-line no-undef
    showFailToast('输入手机号')
    usernameErrMsg.value = '请填写+86 11位合法手机号'
    return
  } else {
    usernameErrMsg.value = ''
  }

  const formData = { phoneNumber: username.value }
  let res
  try {
    res = await axios.request({
      url: '/user/forgetPasswordVerifyCode',
      method: 'post',
      data: formData
    })
  } catch {
    showFailToast('网络错误')
    return
  }
  if (res.status === 200) {
    const parsed = res.data
    if (parsed.status === -1) {
      showFailToast(parsed.message)
      return
    }
  } else {
    showFailToast('网络错误')
    return
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

const onSubmit = async () => {
  // 检测验证码是否按照正确格式输入
  if (!verifyCodePattern.test(verifyCode.value)) {
    // eslint-disable-next-line no-undef
    showFailToast('验证码错误')
    return
  }

  // 将密码加密
  const encryptedPassword = CryptoJS.AES.encrypt(newPassword.value, 'ydai').toString()
  const options = { verifyCode: verifyCode.value, newPassword: encryptedPassword }
  await axios
    .request({
      url: '/user/forgetPassword',
      method: 'post',
      data: options
    })
    .then((res) => {
      if (res.status === 200) {
        const parsed = res.data
        if (parsed.status === -1) {
          showFailToast(parsed.message)
          return
        }
        // eslint-disable-next-line no-undef
        showSuccessToast('修改成功')
        const timer = setTimeout(() => {
          clearTimeout(timer)
          historyStore.lastPagePath = ['/modules/login']
          router.push('/modules/login')
          userStore.isLogin = false
        }, 1500)
      }
    })
    .catch(() => {
      showFailToast('网络错误，修改失败')
    })
}
</script>
<!-- 忘记密码：需要手机号，验证码，新密码，确认密码 -->
<!-- 对是否正在登录中状态无要求 -->
