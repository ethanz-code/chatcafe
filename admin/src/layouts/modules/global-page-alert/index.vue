<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const banner = computed(() => route.meta?.alertBanner);

const styleMap: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(82, 196, 26, 0.12)', color: '#389e0d' },
  info: { bg: 'rgba(32, 128, 240, 0.10)', color: '#096dd9' },
  warning: { bg: 'rgba(250, 173, 20, 0.12)', color: '#d48806' },
  error: { bg: 'rgba(245, 34, 45, 0.12)', color: '#cf1322' }
};

const style = computed(() => {
  const type = banner.value?.type ?? 'info';
  return styleMap[type] || styleMap.info;
});
</script>

<template>
  <div
    v-if="banner"
    class="flex items-center text-14px"
    :style="{ background: style.bg, color: style.color }"
  >
    <span
      class="flex-1"
      style="padding: 0 16px; line-height: 36px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
    >{{ banner.message }}</span>
  </div>
</template>
