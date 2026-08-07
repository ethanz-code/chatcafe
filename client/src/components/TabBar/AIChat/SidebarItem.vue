<template>
  <!--  不同时间段的会话分类  -->
  <div :class="['flex flex-col gap-2 mb-4']">
    <!--  分类信息  -->
    <div class="flex pl-1.5 cursor-pointer">
      <div
        class="flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-900"
        @click="hideOrShow"
      >
        <span>{{ dialogLevel }}</span>
        <div
          v-if="datas.length > 1"
          class="rounded-full bg-gray-100 px-1.5"
          style="font-size: 12px"
        >
          {{ datas.length }}
        </div>

        <van-icon v-if="sidebarDialogShow" name="arrow-down" class="p-1" size="12" />
        <van-icon v-else name="arrow-up" class="p-1" size="12" />
      </div>
    </div>

    <div ref="dialogItems" class="flex flex-col gap-2">
      <div
        v-for="(item, index) in [...(sidebarDialogShow ? datas : [])]"
        :key="item.uuid"
        :class="[
          'py-1.5 px-2 rounded-md flex justify-between group',
          isSelected(item) ? 'bg-gray-200' : 'hover:bg-gray-100'
        ]"
        @click="selectDialog(item)"
      >
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ffa08e] to-[#ff6e65] flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
            AI
          </div>
          <span v-if="!curNodeEdit(index)">{{ item.title }}</span>
          <van-field v-else v-model="editText" class="bg-gray-100 h-8 py-0" center />
        </div>
        <div ref="functionArea" class="opacity-0 group-hover:opacity-100 flex items-center gap-2">
          <van-icon
            v-show="!curNodeEdit(index)"
            @click="editDialogTitle(index)"
            class="cursor-pointer"
            name="edit"
          />
          <van-icon
            v-show="!curNodeEdit(index)"
            @click="store.deleteDialog()"
            class="cursor-pointer"
            name="delete-o"
          />
          <van-icon
            v-show="curNodeEdit(index)"
            @click="savedDialog(index)"
            class="cursor-pointer"
            name="certificate"
            size="24"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="js">
import autoAnimate from '@formkit/auto-animate'
import { onMounted, ref } from 'vue'
import { useChatStore } from '@/stores/chat.js'

const store = useChatStore()

const dialogItems = ref()
const sidebarDialogShow = ref(true)

defineProps(['dialogLevel', 'datas'])

const isSelected = (data) => {
  const { title, uuid } = data
  const result = store.selectedDialog.title === title && store.selectedDialog.uuid === uuid

  return result
}

const selectDialog = (item) => {
  store.selectedDialog.title = item.title
  store.selectedDialog.uuid = item.uuid
}

const hideOrShow = () => {
  sidebarDialogShow.value = !sidebarDialogShow.value
}

const isEditting = ref([])
const editText = ref('')
const curNodeEdit = (i) => {
  return isEditting.value.includes(i)
}
const editDialogTitle = (i) => {
  isEditting.value.push(i)
  editText.value = store.selectedDialog.title
}
const savedDialog = (i) => {
  isEditting.value.pop(i)
  store.editDialog(editText.value)
}

onMounted(() => {
  autoAnimate(dialogItems.value)
})
</script>
