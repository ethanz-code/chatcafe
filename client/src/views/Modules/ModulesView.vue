<template>
  <RouterView></RouterView>
  <!-- 返回主页 -->
  <van-floating-bubble
    v-model:offset="offset"
    class="shadow-lg"
    style="z-index: 20"
    axis="xy"
    magnetic="x"
    :gap="10"
    @click="floatButtonCollpase"
  >
    <template #default>
      <van-icon :name="floatIcon" size="26" :class="floatButtonClass" />
    </template>
  </van-floating-bubble>

  <div ref="floatPanel" :class="['fixed w-12 rounded-full overflow-hidden']">
    <div
      style="background: linear-gradient(to top, #ff6034, #ee0a24); transform: translateY(128px)"
      :class="[
        'pt-4 pb-12 rounded-full flex flex-col gap-2 items-center justify-center transition-all duration-300',
        isCollpase ? 'opacity-100' : 'opacity-0'
      ]"
    >
      <van-icon
        @click="backControl('home')"
        class="cursor-pointer"
        size="26"
        color="#fff"
        name="wap-home"
      />
      <van-icon
        @click="backControl('user')"
        class="cursor-pointer"
        size="26"
        color="#fff"
        name="user"
      />
      <van-icon
        @click="backControl('last')"
        class="cursor-pointer"
        size="26"
        color="#fff"
        name="revoke"
      />
    </div>
  </div>
</template>
<script setup lang="js">
import { onMounted } from 'vue'
import { watch } from 'vue'
import { ref } from 'vue'
import { useFloatingFunction } from '@/stores/floating-function'
import { useRoute } from 'vue-router'

const store = useFloatingFunction()
const route = useRoute()

const hideFloatButton = (arrEle) => {
  // 遍历arrEle数组元素，将内部所有元素设置为隐藏
  for (let i = 0; i < arrEle.length; i++) {
    arrEle[i].style.display = 'none'
  }
}
const backControl = (command) => {
  floatButtonCollpase()
  const timer = setTimeout(() => {
    switch (command) {
      case 'home':
        store.backHome()
        break
      case 'user':
        store.backUser()
        break
      case 'last':
        store.backLastPage()
        break
    }
    clearTimeout(timer)
  }, 350)
}

const floatIcon = ref('arrow-up')
const floatButtonClass = ref('mb-0.5')
const floatPanel = ref()

const isCollpase = ref(false)

// 获取视口宽度高度
const getViewport = () => {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight

  return { width, height }
}
const view = getViewport()
const isAssistantBuffer = route.name === 'Assistant' ? view.height * 0.1 : 0
const isImageGenerationBuffer = route.name === 'ImageGeneration' ? view.height * 0.1 : 0
const offset = ref({
  x: view.width - 10 - 48,
  y: view.height - 10 - 48 - isAssistantBuffer - isImageGenerationBuffer
})
const floatButtonCollpase = () => {
  // 切换浮动按钮的图标
  floatIcon.value = floatIcon.value === 'arrow-up' ? 'arrow-down' : 'arrow-up'
  floatButtonClass.value = floatButtonClass.value === 'mb-0.5' ? 'mt-0.5' : 'mb-0.5'

  isCollpase.value = !isCollpase.value
  const obj = floatPanel.value.children[0]
  obj.style.transform = isCollpase.value ? 'translateY(0px)' : 'translateY(128px)'
}

// 让浮动功能面板牢牢与偏移值绑定
const calculateFloatPanelPos = (newValue) => {
  floatPanel.value.style.left = newValue.x + 'px'
  floatPanel.value.style.top = newValue.y - 115 + 'px'
}
watch(offset, async (newValue) => calculateFloatPanelPos(newValue))

onMounted(() => {
  calculateFloatPanelPos(offset.value)

  // 如果当前页面是登录、注册或忘记密码，则隐藏浮动按钮
  if (route.name === 'Login' || route.name === 'Register') {
    hideFloatButton([document.querySelector('.van-floating-bubble'), floatPanel.value])
  }
})
</script>
