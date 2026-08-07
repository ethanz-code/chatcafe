<template>
  <section class="flex flex-col h-full min-h-0">
    <div class="flex-1 bg-[var(--app-bg)] flex flex-col min-h-0">
      <!--  搜索栏  -->
      <form class="bg-white shrink-0 z-10" action="/">
        <van-search
          v-model="searchValue"
          show-action
          placeholder="请输入搜索关键词"
          @search="onSearch"
          @cancel="onCancel"
          @clear="onCancel"
          class="ml-2"
        />
      </form>

      <!-- Content is contained by the shell instead of the browser viewport. -->
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <!--  侧边栏  -->
        <van-sidebar
          v-model="active"
          @change="onSidebarChange"
          class="h-full w-1/3 shrink-0 bg-[#f7f8fa]"
        >
          <van-sidebar-item title="所有" />
          <van-sidebar-item
            :key="item.name"
            v-for="item in store.categoryData"
            :title="item.name"
          />
        </van-sidebar>

        <!--  内容区域  -->
        <div class="flex-1 min-w-0 p-3 h-full overflow-y-auto box-border">
          <div
            v-if="assistants.length !== 0"
            class="flex flex-col sm:flex-row sm:flex-wrap sm:place-content-start sm:items-start gap-2.5"
          >
            <button
              :key="item"
              v-for="item in assistants"
              type="button"
              @click="enterAssistantChat(item)"
              class="bg-white p-3 rounded-md flex gap-3 items-center cursor-pointer min-h-16 box-border border-0 text-left w-full"
            >
              <SkeletonImage
                v-if="item.imgUrl"
                :src="item.imgUrl"
                :alt="item.name"
                custom-class="w-10 h-10 rounded-md shrink-0"
                rounded="rounded-md"
              />
              <div v-else class="w-10 h-10 rounded-md bg-gradient-to-br from-[#ffa08e] to-[#ff6e65] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {{ item.name?.charAt(0) || 'A' }}
              </div>
              <div class="flex flex-col gap-0.5 overflow-hidden">
                <span class="w-full font-medium truncate">{{ item.name }}</span>
                <span class="w-full text-xs truncate text-gray-500">{{ item.description }}</span>
              </div>
            </button>
          </div>
          <div v-else>
            <!-- 搜索提示 -->
            <van-empty image="search" description="无法查询到任何助理" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useAssistantStore } from '@/stores/assistant.js'
import { watch } from 'vue'
import SkeletonImage from '@/components/Common/SkeletonImage.vue'
import { useFloatingFunction } from '@/stores/floating-function'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/axios'

const route = useRoute()
const router = useRouter()
const historyStore = useFloatingFunction()

const searchValue = ref('')
const active = ref(0)
const store = useAssistantStore()
const assistants = ref([])

const getAssistants = () => {
  const arr = store.categoryData.map((item) => item.assistants)
  const combinedArr = []
  arr.forEach((item) => combinedArr.push(...item))

  // 判断输入框内没有任何内容时表示过滤权限只由侧边栏决定
  if (searchValue.value === '') {
    const index = active.value - 1

    // 小于0表示用户选择的是第一个，第一个是所有，这个时候让所有助理显示出来
    if (index < 0) return combinedArr
    return store.categoryData[index].assistants
  } else {
    // 用户输入了内容，这个时候根据输入的内容去匹配
    const includesArr = combinedArr.filter((item) => item.name.includes(searchValue.value))

    // 如果选择的标签不是“所有”，那么将根据索引拿到分类id，之后过滤includesArr中所有分类id相同的item
    if (active.value !== 0) {
      const index = active.value - 1
      const categoryId = store.categoryData[index].id
      return includesArr.filter((item) => item.categoryId === categoryId)
    }

    return includesArr
  }
}

// 切换侧边分类时：
const onSidebarChange = () => {
  assistants.value = getAssistants()
}
// 输入内容点击完成或回车后
const onSearch = (val) => {
  if (val.length > 0) {
    // 为了能查询到数据将标签切换到“所有”一栏
    active.value = 0
    assistants.value = getAssistants()

    // 请求第一次搜索助理的接口
    axios.request({
      url: '/user/firstSearchAssistant',
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
  }
}
// 取消输入内容后，
const onCancel = () => {
  assistants.value = getAssistants()
}
// 监听输入值是否为空
watch(searchValue, async (newVal) => {
  if (newVal.length === 0) onCancel()
})

// 点击item后切换到实际助理聊天页面
const enterAssistantChat = (item) => {
  historyStore.lastPagePath.push(route.fullPath)
  router.push({
    path: '/modules/assistant',
    query: {
      id: item.id
    }
  })
}

onMounted(() => {
  store.getAssistantCategory().then(() => {
    assistants.value = getAssistants()
  })
})
</script>
