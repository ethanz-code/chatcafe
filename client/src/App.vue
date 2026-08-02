<template>
  <div
    class="mx-auto w-full h-svh max-w-[var(--app-content-width)] bg-[#f5f5f5]"
    style="transform: translateZ(0); overflow: hidden"
  >
    <router-view></router-view>
  </div>
  <div ref="deleteLS">
    <van-button v-if="isDebug" id="draggable" class="fixed left-0 top-20 shadow-lg" type="danger"
      >dev如遇问题需点我清除数据</van-button
    >
  </div>
</template>
<script setup lang="js">
import { onMounted } from 'vue'
import { ref } from 'vue'

const isDebug = ref(false)
const deleteLS = ref()

onMounted(() => {
  if (isDebug.value) {
    deleteLS.value.addEventListener('click', () => {
      localStorage.clear()
    })
  }
})
</script>
