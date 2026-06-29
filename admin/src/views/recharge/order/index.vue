<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllOrders } from '@/service/api/core/recharge/order';

const data = ref<Api.Core.Recharge.Order[]>([]);
const createColumns = (): DataTableColumns<Api.Core.Recharge.Order> => {
  return [
    {
      title: 'ID',
      key: 'id'
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
      title: '订单号',
      key: 'orderNo',
      ellipsis: {
        tooltip: true
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
            type: row.status === '未付款' ? 'default' : 'success'
          },
          {
            default: () => row.status
          }
        );
      }
    },
    {
      title: '商品ID',
      key: 'goodsId'
    },
    {
      title: '用户ID',
      key: 'userId'
    }
  ];
};

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const columns = createColumns();

onMounted(async () => {
  const result = await fetchGetAllOrders();
  if (!result.error) {
    data.value = result.data;
  }
});
</script>

<template>
  <NCard title="订单列表" size="small">
    <NDataTable :columns="columns" :data="filtersDataByPage" :pagination="false" :bordered="false" />
    <div class="flex justify-end pt-12px">
      <NPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="pageCount"
        show-size-picker
        :page-sizes="[5, 10, 20, 30, 999]"
      />
    </div>
  </NCard>
</template>
