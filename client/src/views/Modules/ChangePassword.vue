<template>
  <section class="h-full bg-white">
    <van-form @submit="onSubmit">
      <div class="font-medium text-lg pl-7 py-4">修改登录密码</div>
      <van-cell-group inset>
        <van-field
          v-model="rawPassword"
          name="原密码"
          label="原密码"
          placeholder="请输入原来的密码"
          type="password"
          :rules="[
            {
              required: true,
              message: '请填写6-20位任意字母、数字组合的密码',
              pattern: passwordPattern
            }
          ]"
        />
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
          color="linear-gradient(to right, #ff6034, #ff6e65)"
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
const rawPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordPattern = /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z\d]{6,20}$/
const validatorNewPdIsSame = (val) => {
  if (val !== newPassword.value) return '两次密码必须相同'
}
const onSubmit = () => {
  // 将密码加密
  const encryptedOriginPassword = CryptoJS.AES.encrypt(rawPassword.value, 'ydai').toString()
  const encryptedPassword = CryptoJS.AES.encrypt(newPassword.value, 'ydai').toString()
  const formData = { originPassword: encryptedOriginPassword, newPassword: encryptedPassword }
  axios
    .request({
      url: '/user/changePassword',
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      data: formData
    })
    .then((res) => {
      if (res.status === 200) {
        const parsedData = res.data
        if (parsedData.status === 0) {
          // eslint-disable-next-line no-undef
          showSuccessToast('修改成功')
          const timer = setTimeout(() => {
            clearTimeout(timer)
            historyStore.lastPagePath = ['/modules/login']
            router.push('/modules/login')
            userStore.isLogin = false
          }, 1500)
        } else if (parsedData.status === -1) {
          showFailToast(parsedData.message)
        }
      }
    })
    .catch(() => {
      showFailToast('网络错误，修改失败')
    })
}
</script>
<!-- 修改密码的方法：
原始密码，新密码，确认密码
-->
