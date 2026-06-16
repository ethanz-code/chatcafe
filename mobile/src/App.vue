<template>
  <router-view></router-view>
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
