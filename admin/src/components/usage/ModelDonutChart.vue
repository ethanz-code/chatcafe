<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useThemeStore } from '@/store/modules/theme'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

import type { ModelUsage } from '@/service/api/core/user-service/usage'

const props = defineProps<{
  data: ModelUsage[]
}>()

const themeStore = useThemeStore()
const chartEl = ref<HTMLElement | null>(null)
const chartInst = shallowRef<echarts.ECharts | null>(null)

const totalTokens = computed(() => props.data.reduce((s, m) => s + m.totalTokens, 0))

const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308']

const chartColors = computed(() => themeStore.darkMode
  ? { text: '#e0e0e0', secondary: '#888', tooltipBg: 'rgba(30,30,30,0.95)', border: '#333' }
  : { text: '#333', secondary: '#666', tooltipBg: 'rgba(255,255,255,0.95)', border: '#fff' }
)

function renderChart() {
  const inst = chartInst.value
  if (!inst) return
  const c = chartColors.value
  const sorted = [...props.data].sort((a, b) => b.totalTokens - a.totalTokens)
  inst.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: c.tooltipBg,
      borderColor: c.border,
      formatter: (p: any) => `<span style="color:${c.text}">${p.name}<br/>Tokens: <b>${Number(p.value).toLocaleString()}</b> (${p.percent}%)</span>`
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { fontSize: 11, color: c.secondary },
      formatter: (name: string) => {
        const item = sorted.find((m) => m.model === name)
        const pct = item ? ((item.totalTokens / totalTokens.value) * 100).toFixed(1) : '0'
        return `${name}  ${pct}%`
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: c.border, borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: sorted.map((m, i) => ({
          value: m.totalTokens,
          name: m.model,
          itemStyle: { color: colors[i % colors.length] }
        }))
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
watch(() => themeStore.darkMode, () => renderChart())
onBeforeUnmount(() => {
  ro?.disconnect()
  chartInst.value?.dispose()
})
</script>

<template>
  <div ref="chartEl" style="width: 100%; height: 100%" />
</template>
