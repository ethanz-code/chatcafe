<template>
  <section class="min-h-full bg-gray-100">
    <div>
      <img src="/res/service/task.png" class="w-full h-56 object-cover object-top" alt="" />
    </div>
    <div class="relative h-44">
      <div
        class="h-52 px-4 bg-white rounded-lg overflow-y-scroll absolute -top-10 left-3.5 right-3.5"
      >
        <van-tabs v-model:active="punchInActive">
          <van-tab title="总览">
            <div class="mt-4">
              <p class="font-bold">签到打卡</p>
              <van-steps
                :active="punchInDaysOverviewActive"
                active-icon="success"
                active-color="#ff564d"
              >
                <van-step v-for="item in punchInDaysOverviewData" :key="item">
                  <template v-slot:inactive-icon>
                    <div class="w-full h-full flex justify-center items-center">
                      <InActiveIcon class="w-5 text-[#ff9f99]" />
                    </div>
                  </template>
                  <template v-slot:active-icon>
                    <div class="w-full h-full flex justify-center items-center">
                      <ActiveIcon class="w-5 text-[#ff564d]" />
                    </div>
                  </template>
                  <template v-slot:finish-icon>
                    <div class="w-full h-full flex justify-center items-center">
                      <ActiveIcon class="w-5 text-[#ff564d]" />
                    </div>
                  </template>
                  {{ `${item}天` }}
                </van-step>
              </van-steps>
              <div
                @click="punchInDaysButtonClick"
                :class="[
                  'cursor-pointer text-center py-3 rounded-md',
                  punchInToday ? 'bg-gray-100 text-gray-400' : 'bg-[#ff564d] text-white'
                ]"
              >
                {{ `${punchInToday ? `已连续签到${continuousPunch}天` : '点击签到'}` }}
              </div>
            </div>
          </van-tab>
          <van-tab title="规则">
            <div class="mt-4">
              <p class="font-bold mb-1.5">规则描述</p>
              <p class="indent-4">
                每日签到可获得<span class="text-[#ff6e65] font-bold">10</span> ~
                <span class="text-[#ff6e65] font-bold">30</span
                >次对话余额，连续签到有概率获得较高的对话余额。您也可以可在“<span class="font-bold"
                  >获取明细</span
                >”标签页内看到签到记录。
              </p>
            </div>
          </van-tab>
          <van-tab title="获取明细">
            <van-steps direction="vertical" :active="0">
              <van-step v-for="item in punchInDaysData" :key="item">
                <p>
                  {{
                    `【签到】${taskRewardStore.englishToChineseWeekday[moment(item.createdAt).format('dddd')]}您领取了${item.rewardDialogue}对话余额`
                  }}
                </p>
                <p>{{ moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</p>
              </van-step>
            </van-steps>
            <van-empty v-if="punchInDaysData.length === 0" description="暂无统计数据" />
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <div class="mx-3.5 p-4 bg-white rounded-lg overflow-hidden">
      <p class="font-bold mb-3">任务列表</p>
      <ul class="flex flex-col gap-6">
        <li
          v-for="item in taskRewardStore.taskList"
          :key="item"
          class="flex items-center justify-between"
        >
          <div class="mr-3">
            <div
              class="task_list_icon flex items-center justify-center rounded-lg w-9 h-9 text-white"
            >
              <!-- <van-icon class-prefix="iconfont-ydai" :name="item.icon" size="28" /> -->
              <!-- <component v-if="item.component" class="w-7 h-7" :is="item.component"></component> -->
              <component
                v-if="item.fluentIconName"
                class="w-7 h-7"
                :is="taskComponentsRemap[item.fluentIconName]"
              ></component>
            </div>
          </div>
          <div class="w-full flex flex-col justify-start">
            <p>{{ item.title }}</p>
            <div class="flex items-center text-xs text-gray-600">
              <div v-if="item.dialogue !== 0">
                对话余额+<span class="text-[#ff6e65] font-bold">{{ item.dialogue }}</span>
              </div>
              <div v-if="item.dialogue !== 0 && item.painting !== 0">,&nbsp;</div>
              <div v-if="item.painting !== 0">
                绘画余额+<span class="text-[#ff6e65] font-bold">
                  {{ item.painting }}
                </span>
              </div>
            </div>
          </div>
          <div class="w-24 h-full flex items-start justify-end">
            <van-button
              v-if="item.status === 'available reward'"
              @click="receiveReward(item)"
              class="w-14 h-6 bg-[#ff564d]"
              round
              type="primary"
            >
              <Checkmark24Filled class="w-5 h-5" />
            </van-button>
            <van-button
              v-if="item.status === 'finished'"
              class="w-14 h-6 bg-gray-100 text-gray-400 border-0"
              round
              type="primary"
            >
              1/1
            </van-button>
            <van-button
              v-if="item.status === 'in progress'"
              class="w-14 h-6 border-[#ff564d]"
              plain
              round
              type="primary"
            >
              0/1
            </van-button>
          </div>
        </li>
      </ul>
    </div>
    <div class="h-4"></div>
  </section>
</template>
<script setup lang="js">
import { onMounted, ref } from 'vue'
import {
  PresenceAvailable16Filled as ActiveIcon,
  QuestionCircle24Filled as InActiveIcon,
  Checkmark24Filled,
  Camera24Filled as TaskUpload,
  PersonEdit24Filled as TaskEdit,
  SearchVisual24Filled as TaskSearch,
  Save24Filled as TaskDownload,
  Apps24Filled as TaskPublish,
  ThumbLike24Filled as TaskThumbUp,
  Premium24Filled as TaskPremium
} from '@vicons/fluent'
import axios from '@/utils/axios'
import moment from 'moment'
import { showSuccessToast, showToast } from 'vant'
import { useTaskRewardStore } from '@/stores/task-reward'

const taskRewardStore = useTaskRewardStore()

const taskComponentsRemap = {
  Camera24Filled: TaskUpload,
  PersonEdit24Filled: TaskEdit,
  SearchVisual24Filled: TaskSearch,
  Save24Filled: TaskDownload,
  Apps24Filled: TaskPublish,
  ThumbLike24Filled: TaskThumbUp,
  Premium24Filled: TaskPremium
}

// 打卡任务顶部标签分栏
const punchInActive = ref(0)
// 打卡标签总览活跃程度
const punchInDaysOverviewActive = ref(-1)
// 打卡标签总览数据
const punchInDaysOverviewData = ref([])
// 计算打卡总览数据
const punchInDaysOverview = () => {
  const continous = continuousPunch.value
  // 中位数第三个就是当前连续签到的天数，如果大于2(continous)，后面叠加
  const medium = continous > 2 ? continous : -1
  const days = []
  if (medium === -1) {
    for (let i = 1; i <= 5; i++) {
      days.push(i)
    }
    punchInDaysOverviewActive.value = continous - 1
  } else {
    for (let i = 0; i < 5; i++) {
      days.push(medium - 2 + i)
    }
    punchInDaysOverviewActive.value = 3 - 1
  }

  punchInDaysOverviewData.value = days
}
// 今日已打卡
const punchInToday = ref(false)
// 禁用打卡按钮
const disablePunchInDaysButton = () => {
  punchInToday.value = true
}
// 点击每日打卡按钮
const punchInDaysButtonClick = async () => {
  if (punchInToday.value) return
  disablePunchInDaysButton()
  punchInDaysOverviewActive.value++
  const response = await axios.request({
    url: '/user/service/task/punchDaily',
    method: 'get',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  if (response.status === 200) {
    const parsedData = response.data
    if (parsedData.status === 0) {
      punchInDaysData.value.unshift(parsedData.punchInDaily)
      continuousPunch.value++
      showToast(`获得：${parsedData.punchInDaily.rewardDialogue}对话余额`)
    }
  }
}
// 连续打卡数据
const punchInDaysData = ref([])
// 连续打卡天数
const continuousPunch = ref(0)

// 领取奖励值
const receiveReward = (item) => {
  // if (item.status !== 'available reward') return
  const formData = { taskName: item.name }
  axios
    .request({
      url: '/user/service/task/receiveAReward',
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: formData
    })
    .then(() => {
      item.status = 'finished'
      showSuccessToast('领取成功')
      // 将status为finished的item排序到taskList的底部
      taskRewardStore.taskQuickSort()
    })
}

onMounted(async () => {
  // 获取每日打卡数据
  const punchInDaysRes = await taskRewardStore.checkIfYouCanPunchIn()
  if (punchInDaysRes.status && punchInDaysRes.status === -1) return
  punchInDaysData.value = punchInDaysRes.data.punchInDaily
  continuousPunch.value = punchInDaysRes.data.continuousPunch

  // 如果有数据检测第一条是否与当前时间相差不到1天
  if (!punchInDaysRes.canPunchIn) disablePunchInDaysButton()
  punchInDaysOverview()

  // 获取任务列表数据
  await taskRewardStore.getNetworkTaskList()
  // // finished
  // const timer = setTimeout(() => {
  //   // taskRewardStore.taskList[3].status === 'finished'  // 这样写无效，不能通过数组索引到去修改
  //   taskRewardStore.taskList.forEach((item, index) => {
  //     // 这样可以
  //     if (index === 2) item.status = 'finished'
  //   })

  //   clearTimeout(timer)
  // }, 3000)
})
</script>
<style scoped>
.task_list_icon {
  background-image: linear-gradient(135deg, #fdd819 10%, #e80505 100%);
}
</style>
