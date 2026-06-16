<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex gap-1">
    <p class="font-bold">{{ text }}</p>
    <p v-if="required || false" class="relative text-red-500">
      <span class="absolute top-0 -right-1">*</span>
    </p>
  </div>
</template>
<script setup lang="js">
defineProps(['text', 'required'])
</script>
