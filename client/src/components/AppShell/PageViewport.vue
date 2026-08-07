<template>
  <section
    :class="[
      'page-viewport',
      `page-viewport--${mode}`,
      { 'page-viewport--content-scroll': scrollable }
    ]"
  >
    <div class="page-viewport__scroll">
      <slot name="content" />
    </div>
    <div v-if="mode === 'chat'" class="page-viewport__composer">
      <slot name="composer" />
    </div>
  </section>
</template>

<script setup>
defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['page', 'chat'].includes(value),
  },
  scrollable: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
.page-viewport {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.page-viewport--chat {
  flex-direction: column;
}

.page-viewport__scroll {
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: hidden;
  overscroll-behavior-x: none;
  overscroll-behavior-y: none;
}

.page-viewport--content-scroll .page-viewport__scroll {
  overflow-y: auto;
}

.page-viewport__composer {
  flex: 0 0 auto;
}
</style>
