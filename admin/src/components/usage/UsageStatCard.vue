<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'
import { NCard } from 'naive-ui'
import SvgIcon from '@/components/custom/svg-icon.vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, GridComponent, CanvasRenderer])

interface Props {
  label: string
  value: number
  icon: string
  iconBg?: string
  iconColor?: string
  trend?: number
  trendLabel?: string
  sparklineData?: number[]
  formatter?: (n: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 0,
  trendLabel: 'vs 昨日',
  iconBg: 'bg-#e8f3ff',
  iconColor: 'text-#2080f0',
  formatter: (n: number) => {
    if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
    if (n >= 10000) return (n / 10000).toFixed(1) + '万'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toLocaleString()
  }
})

const sparklineEl = ref<HTMLElement | null>(null)
const chartInst = shallowRef<echarts.ECharts | null>(null)
const timerId = ref<ReturnType<typeof setTimeout>>()

function initSparkline() {
  if (!sparklineEl.value || !props.sparklineData?.length) return
  const inst = echarts.init(sparklineEl.value)
  chartInst.value = inst
  const isUp = props.trend >= 0
  const color = isUp ? '#67C23A' : '#F56C6C'
  inst.setOption({
    grid: { left: 0, right: 0, top: 1, bottom: 0 },
    xAxis: { show: false, data: props.sparklineData },
    yAxis: { show: false },
    series: [{
      type: 'line',
      data: props.sparklineData,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 1.5, color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: isUp ? 'rgba(103,194,58,0.2)' : 'rgba(245,108,108,0.2)' },
          { offset: 1, color: isUp ? 'rgba(103,194,58,0)' : 'rgba(245,108,108,0)' }
        ])
      }
    }]
  }, true)
}

onMounted(() => {
  timerId.value = setTimeout(initSparkline, 100)
})

onBeforeUnmount(() => {
  clearTimeout(timerId.value)
  chartInst.value?.dispose()
})
</script>

<template>
  <NCard
    size="small"
    :bordered="true"
    class="stat-card"
    :content-style="{ padding: '8px 10px' }"
    :title="`${label}: ${value.toLocaleString()}`"
  >
    <div class="flex items-center gap-8px">
      <div
        class="flex-shrink-0 w-28px h-28px flex-center rd-6px"
        :class="[iconBg, iconColor]"
      >
        <SvgIcon :icon="icon" class="text-14px" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-#999 text-11px leading-tight truncate">{{ label }}</div>
        <div class="text-17px font-700 text-#333 leading-tight mt-1px truncate">{{ formatter(value) }}</div>
      </div>
    </div>
    <div v-if="trend !== 0" class="flex items-center gap-2px mt-4px">
      <div
        class="inline-block text-11px"
        :class="trend > 0 ? 'i-carbon:caret-up text-#67C23A' : 'i-carbon:caret-down text-#F56C6C'"
      />
      <span class="text-10px font-500" :class="trend > 0 ? 'text-#67C23A' : 'text-#F56C6C'">
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
      </span>
      <span class="text-#999 text-10px ml-1">{{ trendLabel }}</span>
    </div>
    <div v-if="sparklineData?.length" ref="sparklineEl" class="h-20px mt-2px" />
  </NCard>
</template>

<style scoped>
.stat-card {
  transition: box-shadow 0.2s ease;
}
.stat-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
