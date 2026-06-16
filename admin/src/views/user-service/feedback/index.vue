<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllFeedback, fetchProcessFeedback } from '@/service/api/core/user-service/feedback';
import copy from '@/utils/clipboard';

const message = useMessage();
const data = ref<Api.Core.UserService.Feedback[]>([]);
const feedbackType: Record<string, 'warning' | 'info' | 'error'> = {
  故障: 'warning',
  建议: 'info',
  投诉: 'error'
};
const createColumns = ({
  processedRow,
  copyContact
}: {
  processedRow: (row: Api.Core.UserService.Feedback) => void;
  copyContact: (row: Api.Core.UserService.Feedback) => void;
}): DataTableColumns<Api.Core.UserService.Feedback> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
    },
    {
      title: '创建时间',
      key: 'creadtedAt',
      sorter: (row1, row2) => {
        return dayjs(row1.createdAt).unix() - dayjs(row2.createdAt).unix();
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '内容',
      key: 'content',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '反馈类型',
      key: 'type',
      render(row) {
        return h(NTag, { size: 'small', type: feedbackType[row.type] }, { default: () => row.type });
      }
    },
    {
      title: '联系方式',
      key: 'contact',
      render(row) {
        return h(
          NTag,
          { size: 'small', class: 'cursor-pointer', onClick: () => copyContact(row) },
          { default: () => row.contact }
        );
      }
    },
    {
      title: '用户ID',
      key: 'userId'
    },
    {
      title: '',
      key: 'actions',
      render(row) {
        return h(NSpace, null, {
          default: () => [
            h(
              NPopconfirm,
              {
                onPositiveClick: () => processedRow(row)
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      strong: true,
                      type: 'primary',
                      secondary: true,
                      size: 'small'
                    },
                    { default: () => '处理反馈' }
                  ),
                default: () => '点击”确认“之后即代表您已处理该反馈。'
              }
            )
          ]
        });
      }
    }
  ];
};
const columns = createColumns({
  async processedRow(row) {
    const result = await fetchProcessFeedback(row.id);
    if (!result.error) {
      message.success('您已处理该反馈');
      data.value = data.value.filter(item => item.id !== row.id);
    } else {
      message.error(result.error.message);
    }
  },
  copyContact(row) {
    copy(row.contact, () => message.success('复制成功'));
  }
});

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  const result = await fetchGetAllFeedback();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="意见列表" size="small">
      <NDataTable :columns="columns" :data="filtersDataByPage" :pagination="false" :bordered="false" />
      <div class="w-full flex justify-end p-3 pb-0 pr-0">
        <NPagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          show-size-picker
          :page-sizes="[5, 10, 20, 30, 999]"
        />
      </div>
    </NCard>
  </NSpace>
</template>
