<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { NSpin } from 'naive-ui'
import { useThemeStore } from '@/store/modules/theme'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, CanvasRenderer])

import type { DailyTrend } from '@/service/api/core/user-service/usage'

const props = defineProps<{
  data: DailyTrend[]
  loading?: boolean
}>()

const themeStore = useThemeStore()
const chartEl = ref<HTMLElement | null>(null)
const chartInst = shallowRef<echarts.ECharts | null>(null)

const chartColors = computed(() => themeStore.darkMode
  ? {
    text: '#e0e0e0',
    secondary: '#888',
    border: '#333',
    splitLine: '#333',
    tooltipBg: 'rgba(30,30,30,0.95)',
    tooltipBorder: '#444'
  }
  : {
    text: '#333',
    secondary: '#999',
    border: '#eee',
    splitLine: '#f0f0f0',
    tooltipBg: 'rgba(255,255,255,0.95)',
    tooltipBorder: '#eee'
  })

function renderChart() {
  const inst = chartInst.value
  if (!inst) return
  const trends = props.data
  const c = chartColors.value
  inst.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: c.text, fontSize: 12 },
      formatter: (params: any[]) => {
        if (!params?.length) return ''
        const date = params[0].axisValue
        let html = `<div style="font-weight:600;font-size:13px;margin-bottom:4px;color:${c.text}">${date}</div>`
        params.forEach((p: any) => {
          html += `<div style="display:flex;justify-content:space-between;gap:24px;color:${c.text}">${p.marker} ${p.seriesName} <b>${Number(p.value).toLocaleString()}</b></div>`
        })
        return html
      }
    },
    legend: {
      data: ['调用次数', 'Tokens (K)'],
      bottom: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 4,
      textStyle: { fontSize: 12, color: c.text }
    },
    grid: { left: 50, right: 50, bottom: 50, top: 20 },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, height: 20, bottom: 22, borderColor: c.border }
    ],
    xAxis: {
      type: 'category',
      data: trends.map((t) => t.date.slice(5)),
      axisLabel: { fontSize: 11, color: c.secondary },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '调用次数',
        nameTextStyle: { fontSize: 11, color: c.secondary },
        axisLabel: { fontSize: 11, color: c.secondary },
        splitLine: { lineStyle: { color: c.splitLine, type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Tokens (千)',
        nameTextStyle: { fontSize: 11, color: c.secondary },
        axisLabel: { fontSize: 11, color: c.secondary },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '调用次数',
        type: 'bar',
        data: trends.map((t) => t.calls),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: '#a5b4fc' }
          ]),
          borderRadius: [2, 2, 0, 0]
        },
        barMaxWidth: 24
      },
      {
        name: 'Tokens (K)',
        type: 'line',
        yAxisIndex: 1,
        data: trends.map((t) => Math.round(t.tokens / 1000)),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#f97316', width: 2 },
        itemStyle: { color: '#f97316' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(249,115,22,0.15)' },
            { offset: 1, color: 'rgba(249,115,22,0)' }
          ])
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

watch(() => props.data, () => renderChart())
watch(() => themeStore.darkMode, () => renderChart())

onBeforeUnmount(() => {
  ro?.disconnect()
  chartInst.value?.dispose()
})
</script>

<template>
  <div class="relative h-full">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/40 z-10">
      <NSpin size="small" />
    </div>
    <div ref="chartEl" style="width: 100%; height: 100%" />
  </div>
</template>
