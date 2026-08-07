<template>
  <div class="skeleton-image" :class="[rounded, customClass]">
    <div
      v-if="!loaded"
      class="skeleton-image__shimmer"
      aria-hidden="true"
    ></div>
    <img
      v-if="hasSrc"
      v-lazy="src"
      class="skeleton-image__img"
      :class="{ 'skeleton-image__img--show': loaded }"
      :alt="alt"
      @load="loaded = true"
      @error="loaded = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  rounded: {
    type: String,
    default: '',
  },
  customClass: {
    type: String,
    default: '',
  },
})

const loaded = ref(false)
const hasSrc = computed(() => Boolean(props.src))

watch(
  () => props.src,
  () => {
    loaded.value = false
  }
)
</script>

<style scoped>
.skeleton-image {
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}

.skeleton-image__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #f3f4f6 25%,
    #e9ebef 37%,
    #f3f4f6 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.skeleton-image__img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 300ms ease;
}

.skeleton-image__img--show {
  opacity: 1;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-image__shimmer {
    animation: none;
  }
  .skeleton-image__img {
    transition: none;
  }
}
</style>
