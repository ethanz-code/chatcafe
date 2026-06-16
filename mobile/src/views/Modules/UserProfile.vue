<template>
  <div class="pt-3.5">
    <van-form class="flex flex-col gap-1.5">
      <van-cell-group inset>
        <div class="flex justify-center py-4">
          <div @click="clickAvatar" class="relative cursor-pointer rounded-full">
            <img
              v-lazy="userAvatar"
              class="w-20 h-20 rounded-full shadow-md border-2 border-solid border-black"
            />
            <AddCircle20Filled class="absolute -right-2 bottom-1 w-6 h-6" />
          </div>
        </div>
        <van-field
          v-model="username"
          name="昵称"
          label="昵称"
          right-icon="arrow"
          readonly
          placeholder="用户名"
          @click="openModifyPopup"
        />
        <van-field
          v-model="store.userId"
          @click="
            copyInformation(store.userId, () => {
              showSuccessToast('复制成功')
            })
          "
          name="用户ID"
          label="用户ID"
          right-icon="arrow"
          readonly
          placeholder="用户ID"
        />
        <van-field
          v-model="phoneNumber"
          name="手机号"
          label="手机号"
          readonly
          placeholder="手机号"
        />
        <van-field
          v-model="createdTime"
          name="注册时间"
          label="注册时间"
          readonly
          placeholder="注册时间"
        />
      </van-cell-group>
      <van-cell-group inset>
        <van-field
          @click="loginPasswordShow = true"
          name="登录密码"
          label="登录密码"
          right-icon="arrow"
          readonly
        />
      </van-cell-group>
      <van-cell-group inset>
        <div @click="logout" class="cursor-pointer px-[10px] py-3 text-center">退出登录</div>
      </van-cell-group>
    </van-form>
  </div>
  <!-- 圆角弹窗（居中）-- 昵称修改 -->
  <van-popup
    v-model:show="modifyNameShow"
    :style="{ width: '85%', height: '30%', borderRadius: '12px' }"
  >
    <template #default>
      <div class="flex h-full flex-col pb-3 box-border">
        <!-- 标题部分 -->
        <div class="mx-5 mt-5 relative items-center">
          <p class="text-[16px] font-medium text-center text-gray-600">修改昵称</p>
          <van-icon
            class="absolute right-0 top-0"
            @click="modifyNameShow = false"
            name="cross"
            size="22"
            color="#c8c9cc"
          />
        </div>
        <!-- 内容 -->
        <div class="mx-5 flex-1 flex items-center overflow-y-auto">
          <van-cell-group class="w-full" inset>
            <van-field v-model="modifyedName" placeholder="请输入昵称" />
            <div></div>
          </van-cell-group>
        </div>
        <div class="mx-5 mt-3 grid grid-cols-1 md:grid-cols-none md:flex">
          <van-button @click="modifyName" round color="linear-gradient(to right, #ff6034, #ee0a24)">
            确定
          </van-button>
        </div>
      </div>
    </template>
  </van-popup>
  <!-- 动作面板 -- 登录密码 -->
  <van-action-sheet
    v-model:show="loginPasswordShow"
    :actions="loginPasswordActions"
    cancel-text="取消"
    close-on-click-action
  />
  <div class="cropper">
    <!-- 这里可以放一个input，用来选择图片，也可以放一个按钮，点击后弹出选择图片的弹窗 -->
    <H5Cropper ref="h5Cropper" :option="option" @getblobData="getblobData" />
  </div>
</template>
<script setup lang="js">
import { computed, ref } from 'vue'
import { useUserCenterStore } from '@/stores/user-center'
import moment from 'moment'
import copyInformation from '@/utils/copyInformation'
import { showFailToast, showLoadingToast, showSuccessToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import axios from '@/utils/axios'
import { AddCircle20Filled } from '@vicons/fluent'
import { useFloatingFunction } from '@/stores/floating-function'
import H5Cropper from 'vue-cropper-h5'
import 'vue-cropper-h5/dist/style.css'
import { autoClear } from '@/utils/clearLocalStorage'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const route = useRoute()
const router = useRouter()
const store = useUserCenterStore()
const historyStore = useFloatingFunction()
// 如果用户名为空直接返回处理过的手机号，否则返回用户名
const username = computed(() => {
  if (store.name === '' || store.name === null) return store.getProcessPhoneNumber()
  else return store.name
})
// 获取手机号
const phoneNumber = computed(() => store.getProcessPhoneNumber())
const createdTime = ref(moment(store.createdTime).format('YYYY-MM-DD HH:mm:ss'))
const userAvatar = computed(() => {
  if (store.avatar) return store.avatar
  else return '/res/avatar.png'
})
const logout = () => {
  // console.log('退出登录')
  store.reset()
  showSuccessToast({
    message: '已退出登录',
    duration: 1000
  })
  // 清理本地存储
  autoClear()
  chatStore.afterLoginProcess()
  const timer = setTimeout(() => {
    clearTimeout(timer)
    router.push('/pages/user-center')
  }, 1000)
}
// 修改用户昵称
const modifyNameShow = ref(false)
const modifyedName = ref('')
const openModifyPopup = () => {
  modifyNameShow.value = true
  modifyedName.value = store.name
}
const modifyName = () => {
  if (modifyedName.value === '') {
    // eslint-disable-next-line no-undef
    showFailToast('昵称不能为空')
    return
  }

  modifyNameShow.value = false
  store.name = modifyedName.value

  const formData = new FormData()
  formData.append('name', modifyedName.value)
  axios
    .request({
      url: '/user/modifyName',
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: formData
    })
    .then((res) => {
      if (res.status === 200) {
        // eslint-disable-next-line no-undef
        showToast('操作成功')
      }
    })
}

// 登录密码
const loginPasswordShow = ref(false)
const changePassword = () => {
  // console.log('修改密码')
  historyStore.lastPagePath.push(route.fullPath)
  const timer = setTimeout(() => {
    clearTimeout(timer)
    router.push('/modules/change-password')
  }, 300)
}
const forgetPassword = () => {
  // console.log('忘记密码')
  historyStore.lastPagePath.push(route.fullPath)
  const timer = setTimeout(() => {
    clearTimeout(timer)
    router.push('/modules/forget-password')
  }, 300)
}
const loginPasswordActions = [
  { name: '修改密码', callback: changePassword },
  { name: '忘记密码', callback: forgetPassword }
]

const h5Cropper = ref()
const option = ref({})
const clickAvatar = () => {
  // 点击H5Cropper里的上传文件，不再像文档里通过图片覆盖来执行点击
  document.querySelector('input.upbtn').click()
}
// 获取裁剪后的文件，它本身也有base64、blob格式文件的事件回调，非常方便
async function getblobData(blob) {
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 300
  })

  // console.log(blob)
  const formData = new FormData()
  formData.append('blob', blob)
  await axios
    .request({
      url: '/user/uploadAvatar',
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: formData
    })
    .then((res) => {
      if (res.status === 200) {
        const parsedData = JSON.parse(res.data)
        if (parsedData.status === 0) {
          store.avatar = parsedData.avatarUrl
          // showSuccessToast('上传成功')
          location.reload()
        }
      }
    })
}

onMounted(() => {
  // 判断用户是否已经登录成功
  if (!store.isLogin) router.push('/pages/user-center')
})
</script>
<style>
.cropper {
  width: 0;
  height: 0;
  line-height: 80px;
  position: absolute;
  top: 0;
  left: 0;
}

div.btndiv {
  position: fixed;
  bottom: 15vh;
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
}
</style>
