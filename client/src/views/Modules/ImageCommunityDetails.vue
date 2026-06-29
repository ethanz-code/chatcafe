<template>
  <section class="min-h-full bg-white">
    <van-nav-bar title="作品详情" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="flex flex-col items-center justify-center mt-20 text-gray-400">
      <van-icon name="underway-o" size="64" />
      <p class="mt-4 text-sm">作品广场功能正在建设中，敬请期待</p>
    </div>
  </section>
</template>
<script setup lang="js">
import { useFloatingFunction } from '@/stores/floating-function'

const historyStore = useFloatingFunction()
const onClickLeft = () => historyStore.backLastPage()
</script>
