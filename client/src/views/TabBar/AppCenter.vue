<template>
  <section ref="content" class="flex min-h-full flex-col p-3 box-border">
    <div class="flex-1 min-h-0 pb-16">
      <div class="text-xl font-medium text-gray-900">全部应用</div>

      <div v-if="loading" class="flex justify-center py-16">
        <van-loading size="24">加载中...</van-loading>
      </div>

      <div
        v-else-if="store.allApp.length === 0"
        class="flex flex-col items-center justify-center mt-16 text-gray-400"
      >
        <van-icon name="apps-o" size="64" />
        <p class="mt-4 text-sm">暂无应用</p>
      </div>

      <div
        v-else
        class="mt-2 grid grid-cols-2 sm:grid-cols-none sm:flex sm:flex-row sm:flex-wrap sm:place-content-start sm:items-start gap-3"
      >
        <button
          v-for="i in store.allApp"
          :key="i"
          type="button"
          @click="clickApp(i)"
          class="max-w-[280px] flex flex-col gap-2 bg-white rounded-lg p-2.5 shadow-sm cursor-pointer border-0 text-left"
        >
          <div class="relative">
            <SkeletonImage
              v-if="i.imgUrl"
              :src="i.imgUrl"
              :alt="i.title"
              custom-class="w-full h-[120px] rounded-md"
              rounded="rounded-md"
            />
            <div v-else class="w-full h-[120px] rounded-md bg-gradient-to-br from-[#ffa08e] to-[#ff6e65] flex items-center justify-center text-white text-2xl font-bold">
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
        </button>
      </div>
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useAppCenterStore } from '@/stores/app-center.js'
import { WhetherToDisableTheEffect } from '@/utils/fixedRubberBandEffect'
import SkeletonImage from '@/components/Common/SkeletonImage.vue'
import { onUnmounted } from 'vue'
import { useFloatingFunction } from '@/stores/floating-function'
import { useRoute, useRouter } from 'vue-router'

const store = useAppCenterStore()
const historyStore = useFloatingFunction()
const route = useRoute()
const router = useRouter()
const content = ref()
const loading = ref(true)
let timer = 0

const clickApp = (item) => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push({
    path: item.path,
    query: item.query
  })
}

onMounted(() => {
  timer = setTimeout(() => {
    WhetherToDisableTheEffect(content.value)
  }, 1000)

  store.getAllApplication(true).finally(() => {
    loading.value = false
  })
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>
