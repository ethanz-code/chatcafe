<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllOrders } from '@/service/api/core/recharge/order';
import { PageHeader } from '@/components/usage';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.Recharge.Order[]>([]);

const columns: DataTableColumns<Api.Core.Recharge.Order> = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 170,
    sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
    render(row) {
      return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
    }
  },
  {
    title: '订单号',
    key: 'orderNo',
    width: 180,
    ellipsis: { tooltip: true }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      return h(NTag, { size: 'small', type: row.status === '未付款' ? 'default' : 'success' }, { default: () => row.status });
    }
  },
  { title: '商品ID', key: 'goodsId', width: 100 },
  { title: '用户ID', key: 'userId', width: 100 }
];

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetAllOrders();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="订单管理" />
    <NCard size="small" :bordered="true">
      <template #header><span class="text-15px font-600">订单列表</span></template>
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="800"
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
