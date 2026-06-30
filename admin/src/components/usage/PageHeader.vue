<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-20px font-600 text-base_text m-0">{{ title }}</h2>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
