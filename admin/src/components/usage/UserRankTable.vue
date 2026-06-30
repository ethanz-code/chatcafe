<script setup lang="ts">
import { computed, h } from 'vue'
import { NDataTable, NPagination, NTag } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'
import type { UserUsage } from '@/service/api/core/user-service/usage'

interface Props {
  data: UserUsage[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const maxCalls = computed(() => props.data.reduce((max, u) => Math.max(max, u.calls), 1))

function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '-'
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

function rankBadge(rank: number) {
  if (rank === 1) return { bg: '#f59e0b', label: '#1' }
  if (rank === 2) return { bg: '#94a3b8', label: '#2' }
  if (rank === 3) return { bg: '#d97706', label: '#3' }
  return null
}

const columns: DataTableColumn<UserUsage>[] = [
  {
    title: '#',
    key: 'rank',
    width: 50,
    render: (_row: UserUsage, idx: number) => {
      const rank = (props.page - 1) * props.pageSize + idx + 1
      const badge = rankBadge(rank)
      if (badge) {
        return h(NTag, {
          size: 'small',
          color: { color: badge.bg, textColor: '#fff' },
          style: { borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '11px' }
        }, () => badge.label)
      }
      return h('span', { class: 'text-base_text/50 text-12px' }, rank)
    }
  },
  { title: '用户ID', key: 'userId', width: 70 },
  {
    title: '手机号',
    key: 'phoneNumber',
    width: 110,
    render: (row: UserUsage) => maskPhone(row.phoneNumber)
  },
  { title: '昵称', key: 'name', width: 90, ellipsis: { tooltip: true } },
  {
    title: '调用',
    key: 'calls',
    width: 70,
    sorter: (a: UserUsage, b: UserUsage) => a.calls - b.calls
  },
  {
    title: 'Tokens',
    key: 'totalTokens',
    width: 90,
    render: (row: UserUsage) => row.totalTokens.toLocaleString()
  },
  {
    title: '用量占比',
    key: 'usage',
    width: 110,
    render: (row: UserUsage) => {
      const pct = Math.round((row.calls / maxCalls.value) * 100)
      const barColor = pct > 60 ? '#6366f1' : pct > 30 ? '#a5b4fc' : '#c7d2fe'
      return h('div', { class: 'flex items-center gap-2' }, [
        h('div', { class: 'flex-1 h-2 bg-#f0f0f0 dark:bg-#333 rounded-1 overflow-hidden' }, [
          h('div', {
            class: 'h-full rounded-1 transition-all duration-300',
            style: { width: pct + '%', background: barColor }
          })
        ]),
        h('span', { class: 'text-10px text-base_text/50 w-7 text-right' }, pct + '%')
      ])
    }
  },
  { title: '费用', key: 'cost', width: 70 },
  {
    title: '最近使用',
    key: 'lastUsed',
    width: 130,
    render: (row: UserUsage) => row.lastUsed ? new Date(row.lastUsed).toLocaleString() : '-'
  }
]
</script>

<template>
  <div class="flex flex-col h-full">
    <NDataTable
      :columns="columns"
      :data="data"
      :bordered="false"
      :loading="loading"
      size="small"
      :scroll-x="780"
      flex-height
      class="flex-1"
      :row-class="'cursor-default hover:bg-#f5f7fa dark:hover:bg-#ffffff0a'"
    />
    <div class="flex justify-end mt-2 flex-shrink-0">
      <NPagination
        :page="page"
        :page-size="pageSize"
        :item-count="total"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="(p: number) => emit('update:page', p)"
        @update:page-size="(ps: number) => emit('update:pageSize', ps)"
      />
    </div>
  </div>
</template>
