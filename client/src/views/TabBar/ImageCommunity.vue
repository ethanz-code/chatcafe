<template>
  <section :class="['bg-white p-4 box-border min-h-full', isWeixinBrowser() ? 'pb-28' : 'pb-16']">
    <p class="font-medium text-lg">作品广场</p>
    <div class="flex flex-col items-center justify-center mt-20 text-gray-400">
      <van-icon name="underway-o" size="64" />
      <p class="mt-4 text-sm">作品广场功能正在建设中，敬请期待</p>
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted } from 'vue'
import { isWeixinBrowser } from '@/utils/operationEnv'

onMounted(() => {
  const prefix = import.meta.env.VITE_TITLE_PREFIX
  document.title = `${prefix}社区`
})
</script>
