<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NImage, NSpace } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllCommunity } from '@/service/api/core/image';

const data = ref<Api.Core.Image.Community[]>([]);
const prefix = import.meta.env.VITE_BACKEND_ADDRESS;
const createColumns = (): DataTableColumns<Api.Core.Image.Community> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      defaultSortOrder: false,
      sorter: {
        compare: (row1, row2) => {
          return dayjs(row1.updatedAt).unix() - dayjs(row2.updatedAt).unix();
        },
        multiple: 1
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '图像',
      key: 'imgUrl',
      render(row) {
        return h(NImage, {
          width: '55',
          src: prefix + row.imgUrl
        });
      }
    },
    {
      title: '用户名',
      key: 'username',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '浏览量',
      key: 'pageView'
    },
    {
      title: '点赞',
      key: 'likes'
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
  const result = await fetchGetAllCommunity();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="公开图像" size="small">
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
