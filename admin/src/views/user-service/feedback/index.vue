<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllFeedback, fetchProcessFeedback } from '@/service/api/core/user-service/feedback';
import { PageHeader } from '@/components/usage';
import copy from '@/utils/clipboard';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.UserService.Feedback[]>([]);

const feedbackType: Record<string, 'warning' | 'info' | 'error'> = {
  故障: 'warning',
  建议: 'info',
  投诉: 'error'
};

async function processedRow(row: Api.Core.UserService.Feedback) {
  const result = await fetchProcessFeedback(row.id);
  if (!result.error) {
    message.success('已处理该反馈');
    data.value = data.value.filter(item => item.id !== row.id);
  } else {
    message.error(result.error.message);
  }
}

const columns: DataTableColumns<Api.Core.UserService.Feedback> = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 170,
    sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    render(row) {
      return h('span', null, { default: () => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') });
    }
  },
  {
    title: '内容',
    key: 'content',
    width: 300,
    ellipsis: { tooltip: true }
  },
  {
    title: '反馈类型',
    key: 'type',
    width: 100,
    render(row) {
      return h(NTag, { size: 'small', type: feedbackType[row.type] || 'default' }, { default: () => row.type });
    }
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 150,
    render(row) {
      return h(
        NTag,
        { size: 'small', class: 'cursor-pointer', onClick: () => copy(row.contact, () => message.success('复制成功')) },
        { default: () => row.contact }
      );
    }
  },
  { title: '用户ID', key: 'userId', width: 100 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(NPopconfirm,
        { onPositiveClick: () => processedRow(row) },
        {
          trigger: () => h(NButton, { size: 'small', quaternary: true, type: 'primary' }, { default: () => '处理反馈' }),
          default: () => '确认后即代表您已处理该反馈。'
        }
      );
    }
  }
];

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetAllFeedback();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="意见反馈" />
    <NCard size="small" :bordered="true">
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="1000"
      />
      <div class="flex justify-end pt-3">
        <NPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </NCard>
  </div>
</template>
