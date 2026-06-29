<script setup lang="ts">
defineOptions({
  name: 'GlobalLogo'
});

interface Props {
  showTitle?: boolean;
  inverted?: boolean;
}

withDefaults(defineProps<Props>(), {
  showTitle: true,
  inverted: false
});
</script>

<template>
  <div v-bind="$attrs">
    <RouterLink v-show="showTitle" to="/" class="w-full flex-center nowrap-hidden">
      <h2
        class="pl-8px text-22px transition duration-300 ease-in-out"
        :class="[inverted ? 'text-white' : 'text-#333']"
        style="font-family: 'Playwrite DE Grund', cursive; white-space: nowrap;"
      >
        ChatCafe Admin
      </h2>
    </RouterLink>
    <RouterLink v-show="!showTitle" to="/" class="w-full flex-center">
      <h2 class="text-22px" :class="[inverted ? 'text-white' : 'text-#333']" style="font-family: 'Playwrite DE Grund', cursive;">
        CFA
      </h2>
    </RouterLink>
  </div>
</template>

<style scoped></style>
