<template>
  <van-popup
    v-model:show="store.sidebarShowLeft"
    position="left"
    teleport=".app-shell"
    transition="slider"
    class="chat-sidebar-popup px-3 pt-3"
    :style="{ width: '75%', height: '100%' }"
    overlay-class="chat-sidebar-overlay"
  >
    <div class="flex flex-col h-full">
      <div class="flex justify-between items-center">
        <span class="text-lg font-medium logo-gradient">ChatCafe</span>
        <HamburgerMenuIcon class="cursor-pointer h-5 w-5" @click="store.sidebarShowLeft = false" />
      </div>

      <div class="flex gap-1 items-center">
        <van-search
          v-model="searchVal"
          @search="onSearch"
          @clear="onClearSearch"
          class="flex-1"
          maxlength="15"
        >
          <template #left-icon>
            <div class="h-full flex items-center justify-center">
              <MagnifyingGlassIcon class="w-5 h-5 text-gray-500 font-bold" />
            </div>
          </template>
        </van-search>
        <van-icon
          @click="$emit('new-dialog')"
          name="plus"
          class="cursor-pointer bg-gray-100 text-gray-500 font-bold p-2.5 rounded-lg"
        />
      </div>

      <div class="flex-1 overflow-y-auto">
        <sidebar-item :datas="displayList" :dialog-level="searchVal ? '搜索结果' : '对话'" />
      </div>
    </div>
  </van-popup>
</template>
<script setup lang="js">
import SidebarItem from './SidebarItem.vue'
import { HamburgerMenuIcon, MagnifyingGlassIcon } from '@radix-icons/vue'
import { useChatStore } from '@/stores/chat'
import { computed, ref } from 'vue'

const store = useChatStore()

defineEmits(['new-dialog'])

const searchVal = ref('')
const displayList = computed(() => {
  if (!searchVal.value) return store.allDialogNotSplit
  return store.allDialogNotSplit.filter((item) => item.title.includes(searchVal.value))
})
const onSearch = () => {}
const onClearSearch = () => {
  searchVal.value = ''
}
</script>
<style>
.app-shell .chat-sidebar-overlay {
  position: absolute;
  inset: 0;
}

.app-shell .chat-sidebar-popup {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(75%, 300px) !important;
  max-width: 100%;
  height: 100% !important;
  transform: translate3d(0, 0, 0);
  overflow: hidden;
}

.slider-enter-active,
.slider-leave-active {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-shell .chat-sidebar-popup.slider-enter-from,
.app-shell .chat-sidebar-popup.slider-leave-to {
  transform: translate3d(-100%, 0, 0);
}

@media (prefers-reduced-motion: reduce) {
  .slider-enter-active,
  .slider-leave-active {
    transition-duration: 1ms;
  }
}
</style>
