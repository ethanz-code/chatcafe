<template>
  <section class="min-h-full bg-gray-100 pb-4">
    <div class="bg-white">
      <img src="/res/service/task.png" class="w-full h-56 object-cover object-top" alt="" />
    </div>
    <div class="px-3.5 pt-3 space-y-3">
      <section class="bg-white rounded-lg p-4" aria-labelledby="check-in-heading">
        <div class="flex items-center justify-between mb-3">
          <p id="check-in-heading" class="font-bold">签到打卡</p>
          <span class="text-xs text-gray-500">连续签到 {{ continuousPunch }} 天</span>
        </div>
        <van-steps :active="punchInDaysOverviewActive" active-icon="success" active-color="#ff6e65">
          <van-step v-for="item in punchInDaysOverviewData" :key="item">
            <template v-slot:inactive-icon>
              <div class="w-full h-full flex justify-center items-center">
                <InActiveIcon class="w-5 text-[#ff9f99]" />
              </div>
            </template>
            <template v-slot:active-icon>
              <div class="w-full h-full flex justify-center items-center">
                <ActiveIcon class="w-5 text-[#ff6e65]" />
              </div>
            </template>
            <template v-slot:finish-icon>
              <div class="w-full h-full flex justify-center items-center">
                <ActiveIcon class="w-5 text-gray-400" />
              </div>
            </template>
            {{ `${item}天` }}
          </van-step>
        </van-steps>
        <van-button
          block
          class="mt-4 h-11 border-0"
          :class="punchInToday ? 'bg-gray-100 text-gray-400' : 'bg-[#ff6e65] text-white'"
          :disabled="punchInToday || punchInPending"
          :loading="punchInPending"
          loading-text="签到中"
          type="primary"
          @click="punchInDaysButtonClick"
        >
          {{ punchInToday ? `已连续签到${continuousPunch}天` : '点击签到' }}
        </van-button>
      </section>

      <section class="bg-white rounded-lg px-4" aria-label="签到规则和获取明细">
        <van-tabs v-model:active="punchInActive">
          <van-tab title="规则">
            <div class="py-4 text-sm leading-6 text-gray-700">
              <p class="font-bold mb-1.5 text-gray-900">规则描述</p>
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
            <div class="py-3">
              <van-steps direction="vertical" :active="0">
                <van-step v-for="item in punchInDaysData" :key="item">
                  <p>
                    {{
                      `【签到】${taskRewardStore.englishToChineseWeekday[moment(item.createdAt).format('dddd')]}您领取了${item.rewardDialogue}对话余额`
                    }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
                  </p>
                </van-step>
              </van-steps>
              <van-empty v-if="punchInDaysData.length === 0" description="暂无统计数据" />
            </div>
          </van-tab>
        </van-tabs>
      </section>
      <section class="bg-white rounded-lg p-4" aria-labelledby="task-list-heading">
        <p id="task-list-heading" class="font-bold mb-4">任务列表</p>
        <ul class="flex flex-col divide-y divide-gray-100">
          <li
            v-for="item in taskRewardStore.taskList"
            :key="item"
            class="grid grid-cols-[2.25rem_minmax(0,1fr)_5.5rem] items-start gap-3 py-4 first:pt-0 last:pb-0"
          >
            <div
              class="flex items-center justify-center rounded-lg w-9 h-9 bg-[#ff6e65] text-white text-sm font-bold"
            >
              <component
                v-if="item.fluentIconName && taskComponentsRemap[item.fluentIconName]"
                class="w-5 h-5 text-white"
                :is="taskComponentsRemap[item.fluentIconName]"
              ></component>
              <span v-else class="text-white text-sm font-bold">{{ item.title?.charAt(0) }}</span>
            </div>
            <div class="min-w-0 flex flex-col gap-1">
              <p class="break-words leading-5 text-gray-900">{{ item.title }}</p>
              <div class="flex flex-wrap items-center gap-x-1 text-xs leading-5 text-gray-600">
                <span v-if="item.dialogue !== 0">
                  对话余额+<span class="text-[#ff6e65] font-bold">{{ item.dialogue }}</span>
                </span>
                <span v-if="item.painting !== 0">
                  绘画余额+<span class="text-[#ff6e65] font-bold">
                    {{ item.painting }}
                  </span>
                </span>
              </div>
            </div>
            <div class="flex min-h-9 items-center justify-end">
              <van-button
                v-if="item.status === 'available reward'"
                :aria-label="`领取${item.title}奖励`"
                :disabled="isRewardPending(item)"
                :loading="isRewardPending(item)"
                loading-text="领取中"
                @click="receiveReward(item)"
                class="h-9 min-w-20 border-0 bg-[#ff6e65]"
                type="primary"
              >
                <span v-if="!isRewardPending(item)" class="inline-flex items-center gap-1">
                  <Checkmark24Filled class="w-4 h-4" />
                  领取
                </span>
              </van-button>
              <van-button
                v-if="item.status === 'finished'"
                disabled
                class="h-9 min-w-20 border-0 bg-gray-100 text-gray-400"
                type="primary"
              >
                已领取
              </van-button>
              <van-button
                v-if="item.status === 'in progress'"
                disabled
                class="h-9 min-w-20 border-gray-300 text-gray-500"
                plain
                type="default"
              >
                未完成
              </van-button>
            </div>
          </li>
        </ul>
      </section>
    </div>
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
const punchInPending = ref(false)
// 禁用打卡按钮
const disablePunchInDaysButton = () => {
  punchInToday.value = true
}
// 点击每日打卡按钮
const punchInDaysButtonClick = async () => {
  if (punchInToday.value || punchInPending.value) return
  punchInPending.value = true
  try {
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
        disablePunchInDaysButton()
        punchInDaysOverviewActive.value++
        punchInDaysData.value.unshift(parsedData.punchInDaily)
        continuousPunch.value++
        showToast(`获得：${parsedData.punchInDaily.rewardDialogue}对话余额`)
      }
    }
  } catch {
    showToast('签到失败，请稍后重试')
  } finally {
    punchInPending.value = false
  }
}
// 连续打卡数据
const punchInDaysData = ref([])
// 连续打卡天数
const continuousPunch = ref(0)

const rewardPendingTaskNames = ref(new Set())

const isRewardPending = (item) => rewardPendingTaskNames.value.has(item.name)

// 领取奖励值
const receiveReward = async (item) => {
  if (item.status !== 'available reward' || isRewardPending(item)) return
  rewardPendingTaskNames.value = new Set(rewardPendingTaskNames.value).add(item.name)
  const formData = { taskName: item.name }
  try {
    await axios.request({
      url: '/user/service/task/receiveAReward',
      method: 'post',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: formData
    })
    item.status = 'finished'
    showSuccessToast('领取成功')
    // 将status为finished的item排序到taskList的底部
    taskRewardStore.taskQuickSort()
  } catch {
    showToast('领取失败，请稍后重试')
  } finally {
    const pendingTasks = new Set(rewardPendingTaskNames.value)
    pendingTasks.delete(item.name)
    rewardPendingTaskNames.value = pendingTasks
  }
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
})
</script>
<style scoped></style>
