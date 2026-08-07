<template>
  <RouterView v-slot="{ Component, route }">
    <PageViewport :mode="route.meta.viewport ?? 'page'" :scrollable="!route.meta.subpageShell">
      <template #content>
        <SubpageShell v-if="route.meta.subpageShell" :title="route.meta.title">
          <component :is="Component" />
        </SubpageShell>
        <component v-else :is="Component" />
      </template>
    </PageViewport>
  </RouterView>
</template>

<script setup>
import PageViewport from '@/components/AppShell/PageViewport.vue'
import SubpageShell from '@/components/AppShell/SubpageShell.vue'
</script>
