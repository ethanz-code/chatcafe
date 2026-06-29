<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import {
  NCard,
  NDataTable,
  NGrid,
  NGi,
  NPagination,
  NSelect,
  NSpin,
  NStatistic
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import * as echarts from 'echarts/core';
import {
  fetchUsageOverview,
  fetchUsageByModel,
  fetchUsageByUser,
  fetchUsageTrends,
  type UsageOverview,
  type ModelUsage,
  type UserUsage,
  type DailyTrend
} from '@/service/api/core/user-service/usage';

const loading = ref(true);

const overview = ref<UsageOverview>({
  total: { calls: 0, tokens: 0, promptTokens: 0, completionTokens: 0, cost: 0 },
  today: { calls: 0, tokens: 0, cost: 0, activeUsers: 0 },
  week: { calls: 0, tokens: 0, cost: 0 },
  month: { calls: 0, tokens: 0, cost: 0 }
});

const modelData = ref<ModelUsage[]>([]);
const userData = ref<UserUsage[]>([]);
const userTotal = ref(0);
const userPage = ref(1);
const userPageSize = ref(20);
const trendsData = ref<DailyTrend[]>([]);
const trendDays = ref(30);

// Chart - standalone echarts
const chartEl = ref<HTMLElement | null>(null);
const chartInst = shallowRef<echarts.ECharts | null>(null);

function initChart() {
  if (!chartEl.value) return;
  if (chartInst.value) chartInst.value.dispose();
  const inst = echarts.init(chartEl.value);
  chartInst.value = inst;
  renderChart();
}

function renderChart() {
  const inst = chartInst.value;
  if (!inst) return;
  const trends = trendsData.value;
  if (trends.length === 0) {
    inst.setOption({
      tooltip: { trigger: 'axis' as const },
      legend: { data: ['调用次数', 'Tokens (K)'] },
      grid: { left: 50, right: 50, bottom: 30 },
      xAxis: { type: 'category' as const, data: [] },
      yAxis: [
        { type: 'value' as const, name: '调用次数' },
        { type: 'value' as const, name: 'Tokens (千)' }
      ],
      series: [
        { name: '调用次数', type: 'bar', data: [], itemStyle: { color: '#5470c6' } },
        { name: 'Tokens (K)', type: 'line', yAxisIndex: 1, data: [], smooth: true }
      ]
    }, true);
    return;
  }
  inst.setOption({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['调用次数', 'Tokens (K)'] },
    grid: { left: 50, right: 50, bottom: 30 },
    xAxis: { type: 'category' as const, data: trends.map((t) => t.date.slice(5)) },
    yAxis: [
      { type: 'value' as const, name: '调用次数' },
      { type: 'value' as const, name: 'Tokens (千)' }
    ],
    series: [
      { name: '调用次数', type: 'bar', data: trends.map((t) => t.calls), itemStyle: { color: '#5470c6' } },
      { name: 'Tokens (K)', type: 'line', yAxisIndex: 1, data: trends.map((t) => Math.round(t.tokens / 1000)), smooth: true }
    ]
  }, true);
}

watch(trendsData, () => renderChart());

const modelColumns: DataTableColumns<ModelUsage> = [
  { title: '模型', key: 'model', width: 160 },
  { title: '调用次数', key: 'calls', width: 100, sorter: (a, b) => a.calls - b.calls },
  { title: '总 Tokens', key: 'totalTokens', width: 120, sorter: (a, b) => a.totalTokens - b.totalTokens,
    render: (row) => row.totalTokens.toLocaleString() },
  { title: 'Prompt Tokens', key: 'promptTokens', width: 130, render: (row) => row.promptTokens.toLocaleString() },
  { title: 'Completion Tokens', key: 'completionTokens', width: 140, render: (row) => row.completionTokens.toLocaleString() },
  { title: '费用 (次数)', key: 'cost', width: 100, sorter: (a, b) => a.cost - b.cost }
];

const userColumns: DataTableColumns<UserUsage> = [
  { title: '用户ID', key: 'userId', width: 80 },
  { title: '手机号', key: 'phoneNumber', width: 130 },
  { title: '昵称', key: 'name', width: 120, ellipsis: { tooltip: true } },
  { title: '调用次数', key: 'calls', width: 100, sorter: (a, b) => a.calls - b.calls },
  { title: 'Tokens', key: 'totalTokens', width: 110, render: (row) => row.totalTokens.toLocaleString() },
  { title: '费用', key: 'cost', width: 80 },
  { title: '最近使用', key: 'lastUsed', width: 160, render: (row) => new Date(row.lastUsed).toLocaleString() }
];

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

async function loadOverview() {
  const res = await fetchUsageOverview();
  if (!res.error) overview.value = res.data;
}

async function loadModelData() {
  const res = await fetchUsageByModel(30);
  if (!res.error) modelData.value = res.data;
}

async function loadUserData() {
  const res = await fetchUsageByUser(30, userPage.value, userPageSize.value);
  if (!res.error) {
    userData.value = res.data.list;
    userTotal.value = res.data.total;
  }
}

async function loadTrends() {
  const res = await fetchUsageTrends(trendDays.value);
  if (!res.error) trendsData.value = res.data;
}

function onTrendDaysChange(val: number) {
  trendDays.value = val;
  loadTrends();
}

function onUserPageChange(page: number) {
  userPage.value = page;
  loadUserData();
}

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([loadOverview(), loadModelData(), loadUserData(), loadTrends()]);
    // wait for DOM, then init chart with real data
    requestAnimationFrame(() => {
      initChart();
    });
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  chartInst.value?.dispose();
});
</script>

<template>
  <NSpin :show="loading">
    <div class="flex flex-col gap-4">
      <NGrid :cols="4" :x-gap="12">
        <NGi>
          <NCard size="small">
            <NStatistic label="今日调用">{{ formatNum(overview.today.calls) }}</NStatistic>
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small">
            <NStatistic label="今日活跃用户">{{ overview.today.activeUsers }}</NStatistic>
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small">
            <NStatistic label="今日 Tokens">{{ formatNum(overview.today.tokens) }}</NStatistic>
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small">
            <NStatistic label="累计调用">{{ formatNum(overview.total.calls) }}</NStatistic>
          </NCard>
        </NGi>
      </NGrid>

      <NGrid :cols="4" :x-gap="12">
        <NGi>
          <NCard size="small">
            <NStatistic label="本周调用">{{ formatNum(overview.week.calls) }}</NStatistic>
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small">
            <NStatistic label="本月调用">{{ formatNum(overview.month.calls) }}</NStatistic>
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small">
            <NStatistic label="累计 Tokens">{{ formatNum(overview.total.tokens) }}</NStatistic>
          </NCard>
        </NGi>
        <NGi>
          <NCard size="small">
            <NStatistic label="累计费用">{{ overview.total.cost }} 次</NStatistic>
          </NCard>
        </NGi>
      </NGrid>

      <NCard size="small" title="每日用量趋势">
        <template #header-extra>
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
        <div ref="chartEl" style="width: 100%; height: 350px"></div>
      </NCard>

      <NCard size="small" title="模型用量分布 (近30天)">
        <NDataTable
          :columns="modelColumns"
          :data="modelData"
          :bordered="false"
          :pagination="false"
          size="small"
        />
      </NCard>

      <NCard size="small" title="用户用量排行 (近30天)">
        <NDataTable
          :columns="userColumns"
          :data="userData"
          :bordered="false"
          :pagination="false"
          size="small"
        />
        <div class="flex justify-end mt-3">
          <NPagination
            :page="userPage"
            :page-size="userPageSize"
            :item-count="userTotal"
            show-size-picker
            :page-sizes="[10, 20, 50]"
            @update:page="onUserPageChange"
            @update:page-size="(ps: number) => { userPageSize = ps; loadUserData(); }"
          />
        </div>
      </NCard>
    </div>
  </NSpin>
</template>
