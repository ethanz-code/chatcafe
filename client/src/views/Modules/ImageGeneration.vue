<template>
  <section class="flex flex-col h-full bg-white items-center justify-center px-8">
    <div class="text-center">
      <div class="text-6xl mb-6">🎨</div>
      <div class="text-xl font-bold text-gray-800 mb-3">AI 绘画功能暂未开放</div>
      <div class="text-sm text-gray-500 leading-relaxed">
        该功能正在筹备中，敬请期待。<br>
        当前仅支持 AI 对话功能。
      </div>
      <van-button
        class="mt-8"
        type="primary"
        round
        color="linear-gradient(to right, #ff6034, #ff6e65)"
        @click="router.push('/')"
      >
        去聊天
      </van-button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
