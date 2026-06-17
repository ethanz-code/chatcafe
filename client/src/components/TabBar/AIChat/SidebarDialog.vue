<template>
  <!--  侧边栏，左侧弹出  -->
  <van-popup
    v-model:show="store.sidebarShowLeft"
    position="left"
    transition="slider"
    class="px-3 pt-3 max-w-[300px]"
    :style="{ width: '75%', height: '100%' }"
  >
    <div class="flex flex-col h-full">
      <!--  顶部栏目  -->
      <div class="flex justify-between items-center">
        <span class="text-lg font-medium logo-gradient">爱设计</span>
        <HamburgerMenuIcon class="cursor-pointer h-5 w-5" @click="store.sidebarShowLeft = false" />
      </div>

      <!--  搜索栏  -->
      <div class="flex gap-1 items-center">
        <van-search
          v-model="searchVal"
          @search="searchDialogFallback(searchVal)"
          @clear="clearSearchDialogFallback"
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

      <div v-if="showOriginDialog" class="flex-1">
        <!--  不同时间段的会话分类  -->
        <sidebar-item
          :datas="store.allDialog.today"
          :dialog-level="store.dialogLevelTranslate['today']"
        />
        <sidebar-item
          :datas="store.allDialog.past7Days"
          :dialog-level="store.dialogLevelTranslate['past7Days']"
        />
        <sidebar-item
          :datas="store.allDialog.past30Days"
          :dialog-level="store.dialogLevelTranslate['past30Days']"
        />
        <sidebar-item
          :datas="store.allDialog.past90Days"
          :dialog-level="store.dialogLevelTranslate['past90Days']"
        />
      </div>
      <div v-else>
        <sidebar-item :datas="dialogContentFallback" :dialog-level="'搜索结果'" />
      </div>
    </div>
  </van-popup>
</template>
<script setup lang="js">
import SidebarItem from './SidebarItem.vue'
import { HamburgerMenuIcon, MagnifyingGlassIcon } from '@radix-icons/vue'
import { useChatStore } from '@/stores/chat'
import { ref } from 'vue'

const store = useChatStore()

defineEmits(['new-dialog'])

const showOriginDialog = ref(true)
const searchVal = ref('')
const dialogContentFallback = ref([])
const searchDialogFallback = (value = '') => {
  if (value === '') showOriginDialog.value = true
  else {
    showOriginDialog.value = false
    dialogContentFallback.value = []

    dialogContentFallback.value.push(
      ...store.allDialog.today.filter((item) => {
        return item.title.includes(value)
      })
    )
    dialogContentFallback.value.push(
      ...store.allDialog.past7Days.filter((item) => {
        return item.title.includes(value)
      })
    )
    dialogContentFallback.value.push(
      ...store.allDialog.past30Days.filter((item) => {
        return item.title.includes(value)
      })
    )
    dialogContentFallback.value.push(
      ...store.allDialog.past90Days.filter((item) => {
        return item.title.includes(value)
      })
    )
  }
}
const clearSearchDialogFallback = () => {
  showOriginDialog.value = true
  searchVal.value = ''
}
</script>
<style scoped>
.slider-enter-active,
.slider-leave-active {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.slider-enter-from,
.slider-leave-to {
  transform: translate3d(-100%, -50%, 0);
}
</style>
