<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useRouteStore } from '@/store/modules/route';

defineOptions({
  name: 'GlobalContent'
});

interface Props {
  showPadding?: boolean;
}

withDefaults(defineProps<Props>(), {
  showPadding: true
});

const appStore = useAppStore();
const themeStore = useThemeStore();
const routeStore = useRouteStore();

const transitionName = computed(() => (themeStore.page.animate ? themeStore.page.animateMode : ''));

const componentClass = computed(() => {
  const base = 'flex-grow bg-layout transition-300';
  if (appStore.isMobile) {
    return `${base} self-start min-w-full`;
  }
  return base;
});
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition
      :name="transitionName"
      mode="out-in"
      @before-leave="appStore.setContentXScrollable(true)"
      @after-enter="appStore.setContentXScrollable(false)"
    >
      <KeepAlive :include="routeStore.cacheRoutes">
        <component
          :is="Component"
          v-if="appStore.reloadFlag"
          :key="route.path"
          :class="[componentClass, { 'p-16px': showPadding }]"
          :style="appStore.isMobile ? { maxWidth: '1580px' } : undefined"
        />
      </KeepAlive>
    </Transition>
  </RouterView>
</template>

<style></style>
