<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NImage, NSpace, NTag, NTooltip, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllList } from '@/service/api/core/image';
import copy from '@/utils/clipboard';

const message = useMessage();
const data = ref<Api.Core.Image.List[]>([]);
const prefix = import.meta.env.VITE_BACKEND_ADDRESS;
const statusMaps: Record<string, 'error' | 'success'> = {
  绘画失败: 'error',
  绘画完成: 'success'
};
const createColumns = (): DataTableColumns<Api.Core.Image.List> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
    },
    {
      title: '图像',
      key: 'imgUrl',
      render(row) {
        return h(NImage, {
          width: '55',
          fallbackSrc: 'https://s21.ax1x.com/2024/05/16/pknHqPA.png',
          src: prefix + row.imgUrl
        });
      }
    },
    {
      title: '模型',
      key: 'model'
    },
    {
      title: '时间',
      key: 'time',
      defaultSortOrder: false,
      sorter: {
        compare: (row1, row2) => {
          return dayjs(row1.time).unix() - dayjs(row2.time).unix();
        },
        multiple: 1
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.time).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '状态',
      key: 'status',
      render(row) {
        return h(
          NTag,
          {
            size: 'small',
            type: statusMaps[row.status],
            bordered: false
          },
          () => row.status
        );
      }
    },
    {
      title: '提示词',
      key: 'prompt',
      ellipsis: true,
      render(row) {
        return h(NTooltip, null, {
          trigger: () =>
            h(
              'span',
              {
                size: 'small',
                class: 'cursor-pointer',
                onClick: () => {
                  copy(row.prompt);
                  message.success('复制成功');
                }
              },
              { default: () => `${row.prompt.split('】')[1].substring(0, 10)}...` }
            ),
          default: () => '点击复制提示词'
        });
      }
    },
    {
      title: '用户名',
      key: 'username'
    }
  ];
};
const columns = createColumns();

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  const result = await fetchGetAllList();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="累计生成图像列表" size="small">
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
