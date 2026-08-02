<template>
  <section class="bg-white h-full flex flex-col items-center justify-center px-8">
    <div class="text-6xl font-bold text-[#ff6e65] mb-4">{{ isNotFound ? '404' : '🙈' }}</div>
    <div class="text-lg text-gray-800 mb-2">{{ isNotFound ? '页面未找到' : '该功能还未开启' }}</div>
    <div class="text-sm text-gray-500 text-center leading-relaxed mb-8">
      {{
        isNotFound
          ? '您访问的页面不存在或已被移除，请检查网址是否正确。'
          : '该功能正在筹备中，敬请期待。'
      }}
    </div>
    <van-button
      type="primary"
      round
      color="linear-gradient(to right, #ff6034, #ff6e65)"
      @click="$router.push('/')"
    >
      返回首页
    </van-button>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isNotFound = computed(() => route.name === 'NotFound' && route.path !== '/service/not-found')
</script>
