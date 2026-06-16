<template>
  <section :class="['bg-white p-4 box-border min-h-full', isWeixinBrowser() ? 'pb-28' : 'pb-16']">
    <p class="font-medium text-lg">作品广场</p>
    <!-- 图像列表 -->
    <ImageList :forceLoadNetworkData="true" />
  </section>
</template>
<script setup lang="js">
import { onMounted } from 'vue'
import ImageList from '@/components/Modules/ImageCommunity/ImageList.vue'
import { isWeixinBrowser } from '@/utils/operationEnv'

onMounted(() => {
  const prefix = import.meta.env.VITE_TITLE_PREFIX
  document.title = `${prefix}社区`
})
</script>
