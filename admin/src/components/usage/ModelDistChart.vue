<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useThemeStore } from '@/store/modules/theme'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

import type { ModelUsage } from '@/service/api/core/user-service/usage'

const props = defineProps<{
  data: ModelUsage[]
}>()

const themeStore = useThemeStore()
const chartEl = ref<HTMLElement | null>(null)
const chartInst = shallowRef<echarts.ECharts | null>(null)

const barColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']

const chartColors = computed(() => themeStore.darkMode
  ? { text: '#e0e0e0', secondary: '#888', tooltipBg: 'rgba(30,30,30,0.95)', border: '#333' }
  : { text: '#333', secondary: '#999', tooltipBg: 'rgba(255,255,255,0.95)', border: '#eee' }
)

function renderChart() {
  const inst = chartInst.value
  if (!inst) return
  const c = chartColors.value
  const sorted = [...props.data].sort((a, b) => b.calls - a.calls)
  inst.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: c.tooltipBg,
      borderColor: c.border,
      formatter: (params: any[]) => {
        if (!params?.length) return ''
        const row = sorted[params[0].dataIndex]
        return `
          <div style="font-weight:600;margin-bottom:4px;color:${c.text}">${row.model}</div>
          <div style="color:${c.text}">调用次数: <b>${row.calls.toLocaleString()}</b></div>
          <div style="color:${c.text}">Tokens: <b>${row.totalTokens.toLocaleString()}</b></div>
          <div style="color:${c.text}">费用: <b>${row.cost}</b></div>
        `
      }
    },
    grid: { left: 110, right: 20, top: 10, bottom: 10 },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: c.secondary },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: sorted.map((m) => (m.model.length > 14 ? m.model.slice(0, 14) + '..' : m.model)),
      axisLabel: { fontSize: 11, color: c.secondary },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((m, i) => ({
          value: m.calls,
          itemStyle: { color: barColors[i % barColors.length], borderRadius: [0, 4, 4, 0] }
        })),
        barMaxWidth: 20,
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => p.value.toLocaleString(),
          fontSize: 11,
          color: c.secondary
        }
      }
    ]
  }, true)
}

function initChart() {
  if (!chartEl.value) return
  if (chartInst.value) chartInst.value.dispose()
  const ro = new ResizeObserver(() => {
    chartInst.value?.resize()
  })
  ro.observe(chartEl.value)
  const inst = echarts.init(chartEl.value)
  chartInst.value = inst
  renderChart()
  return ro
}

let ro: ResizeObserver | null = null

onMounted(() => { ro = initChart() || null })
watch(() => props.data, renderChart)
watch(() => themeStore.darkMode, renderChart)
onBeforeUnmount(() => {
  ro?.disconnect()
  chartInst.value?.dispose()
})
</script>

<template>
  <div ref="chartEl" style="width: 100%; height: 100%" />
</template>
