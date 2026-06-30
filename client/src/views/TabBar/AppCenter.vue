<template>
  <section ref="content" class="flex flex-col p-3 box-border h-full">
    <div class="flex-1 pb-16">
      <div class="text-xl font-medium logo-gradient">全部应用</div>
      <div
        class="mt-2 grid grid-cols-2 sm:grid-cols-none sm:flex sm:flex-row sm:flex-wrap sm:place-content-start sm:items-start gap-3"
      >
        <div
          v-for="i in store.allApp"
          :key="i"
          @click="clickApp(i)"
          class="max-w-[280px] flex flex-col gap-2 bg-white rounded-lg p-2.5 shadow-sm cursor-pointer"
        >
          <div class="relative">
            <img
              v-if="i.imgUrl"
              v-lazy="i.imgUrl"
              class="w-full rounded-md object-center object-cover max-h-[150px]"
            />
            <div v-else class="w-full h-[120px] rounded-md bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {{ i.name?.charAt(0) || 'A' }}
            </div>
            <div v-if="i.free" class="absolute right-1 top-1">
              <van-tag type="primary">免费</van-tag>
            </div>
          </div>
          <div class="flex flex-col w-full items-center gap-2">
            <span class="font-medium text-center">{{ i.title }}</span>
            <span class="text-gray-500 text-xs truncate w-full">{{ i.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useAppCenterStore } from '@/stores/app-center.js'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect'
import { onUnmounted } from 'vue'
import { useFloatingFunction } from '@/stores/floating-function'
import { useRoute, useRouter } from 'vue-router'

const store = useAppCenterStore()
const historyStore = useFloatingFunction()
const route = useRoute()
const router = useRouter()
const content = ref()
let timer = 0

const clickApp = (item) => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push({
    path: item.path,
    query: item.query
  })
}

onMounted(() => {
  const prefix = import.meta.env.VITE_TITLE_PREFIX
  document.title = `${prefix}应用中心`
  timer = setTimeout(() => {
    WhetherToDisableTheEffect(content.value)
  }, 1000)

  store.getAllApplication(true)
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>
<style scoped>
.logo-gradient {
  background-image: linear-gradient(135deg, #ff6034 0%, #ff6e65 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
