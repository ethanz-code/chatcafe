<template>
  <section class="h-full bg-white flex flex-col items-center justify-center px-8">
    <div class="text-6xl font-bold text-[#ff6e65] mb-4">🙈</div>
    <div class="text-lg text-gray-800 mb-2">页面出了点问题</div>
    <div class="text-sm text-gray-500 text-center leading-relaxed mb-8">
      抱歉，页面加载时遇到了异常。请刷新重试。
    </div>
    <van-button type="primary" round color="linear-gradient(to right, #ff6034, #ff6e65)" @click="reload">
      刷新页面
    </van-button>
  </section>
</template>

<script setup>
const reload = () => {
  window.location.reload()
}
</script>
