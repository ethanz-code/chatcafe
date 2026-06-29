<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NCard, NSelect, NSpin, NGrid, NGi, useMessage } from 'naive-ui'
import {
  fetchUsageOverview,
  fetchUsageByModel,
  fetchUsageByUser,
  fetchUsageTrends,
  type UsageOverview,
  type ModelUsage,
  type UserUsage,
  type DailyTrend
} from '@/service/api/core/user-service/usage'
import {
  UsageStatCard,
  UsageTrendChart,
  ModelDistChart,
  ModelDonutChart,
  UserRankTable,
  PageHeader
} from '@/components/usage'

const loading = ref(true)
const userLoading = ref(false)
const message = useMessage()

const overview = ref<UsageOverview>({
  total: { calls: 0, tokens: 0, promptTokens: 0, completionTokens: 0, cost: 0 },
  today: { calls: 0, tokens: 0, cost: 0, activeUsers: 0 },
  week: { calls: 0, tokens: 0, cost: 0 },
  month: { calls: 0, tokens: 0, cost: 0 }
})

const modelData = ref<ModelUsage[]>([])
const userData = ref<UserUsage[]>([])
const userTotal = ref(0)
const userPage = ref(1)
const userPageSize = ref(20)
const trendsData = ref<DailyTrend[]>([])
const trendDays = ref(30)

async function loadOverview() {
  const res = await fetchUsageOverview()
  if (!res.error) overview.value = res.data
}

async function loadModelData() {
  const res = await fetchUsageByModel(30)
  if (!res.error) modelData.value = res.data
}

async function loadUserData() {
  userLoading.value = true
  const res = await fetchUsageByUser(30, userPage.value, userPageSize.value)
  if (!res.error) {
    userData.value = res.data.list
    userTotal.value = res.data.total
  }
  userLoading.value = false
}

async function loadTrends() {
  const res = await fetchUsageTrends(trendDays.value)
  if (!res.error) trendsData.value = res.data
}

function onTrendDaysChange(val: number) {
  trendDays.value = val
  loadTrends()
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([loadOverview(), loadModelData(), loadUserData(), loadTrends()])
  } catch (e) {
    message.error('数据加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <PageHeader title="使用量统计">
      <template #actions>
        <NSelect
          :value="trendDays"
          :options="[
            { label: '近7天', value: 7 },
            { label: '近30天', value: 30 },
            { label: '近90天', value: 90 }
          ]"
          size="small"
          style="width: 120px"
          @update:value="onTrendDaysChange"
        />
      </template>
    </PageHeader>

    <NSpin :show="loading">
      <!-- 核心指标：今日 / 累计 -->
      <NGrid :cols="8" :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="今日调用"
            :value="overview.today.calls"
            icon="carbon:phone-incoming"
            icon-bg="bg-#e8f3ff"
            icon-color="text-#2080f0"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="今日活跃"
            :value="overview.today.activeUsers"
            icon="carbon:user-multiple"
            icon-bg="bg-#f0f9eb"
            icon-color="text-#67c23a"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="今日 Tokens"
            :value="overview.today.tokens"
            icon="carbon:data-volume"
            icon-bg="bg-#fdf6ec"
            icon-color="text-#e6a23c"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="累计调用"
            :value="overview.total.calls"
            icon="carbon:accumulator"
            icon-bg="bg-#fef0f0"
            icon-color="text-#f56c6c"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="累计 Tokens"
            :value="overview.total.tokens"
            icon="carbon:chart-bar"
            icon-bg="bg-#f4ecfb"
            icon-color="text-#9c27b0"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="累计费用"
            :value="overview.total.cost"
            icon="carbon:wallet"
            icon-bg="bg-#fff7e6"
            icon-color="text-#fa8c16"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="本周调用"
            :value="overview.week.calls"
            icon="carbon:calendar"
            icon-bg="bg-#e6f7ff"
            icon-color="text-#13c2c2"
          />
        </NGi>
        <NGi :span="4" :md="2" :l="1" :xl="1">
          <UsageStatCard
            label="本月调用"
            :value="overview.month.calls"
            icon="carbon:calendar--heat-map"
            icon-bg="bg-#fff0f6"
            icon-color="text-#eb2f96"
          />
        </NGi>
      </NGrid>

      <!-- 趋势 + 模型分布 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
        <NCard size="small" :bordered="true" class="lg:col-span-2" :content-style="{ padding: '12px 14px' }">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-14px font-600 text-#333">用量趋势</span>
              <span class="text-12px text-#999">近 {{ trendDays }} 天</span>
            </div>
          </template>
          <div class="h-360px">
            <UsageTrendChart :data="trendsData" :loading="loading" />
          </div>
        </NCard>

        <NCard size="small" :bordered="true" :content-style="{ padding: '12px 14px' }">
          <template #header>
            <span class="text-14px font-600 text-#333">模型 Token 占比</span>
          </template>
          <div class="h-360px">
            <ModelDonutChart :data="modelData" />
          </div>
        </NCard>
      </div>

      <!-- 模型分布柱状图 + 用户排行 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
        <NCard size="small" :bordered="true" :content-style="{ padding: '12px 14px' }">
          <template #header>
            <span class="text-14px font-600 text-#333">模型调用次数 Top</span>
          </template>
          <div class="h-360px">
            <ModelDistChart :data="modelData" />
          </div>
        </NCard>

        <NCard size="small" :bordered="true" class="lg:col-span-2" :content-style="{ padding: '12px 14px' }">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-14px font-600 text-#333">用户用量排行</span>
              <span class="text-12px text-#999">近 30 天</span>
            </div>
          </template>
          <UserRankTable
            :data="userData"
            :total="userTotal"
            :page="userPage"
            :page-size="userPageSize"
            :loading="userLoading"
            @update:page="(p: number) => { userPage = p; loadUserData() }"
            @update:page-size="(ps: number) => { userPageSize = ps; loadUserData() }"
          />
        </NCard>
      </div>
    </NSpin>
  </div>
</template>
