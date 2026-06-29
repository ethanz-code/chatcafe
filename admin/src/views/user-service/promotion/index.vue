<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllPromotion } from '@/service/api/core/user-service/promotion';
import copy from '@/utils/clipboard';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.UserService.Promotion[]>([]);

const columns: DataTableColumns<Api.Core.UserService.Promotion> = [
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
    title: '邀请人ID',
    key: 'inviteUserId',
    width: 130,
    sorter: (a, b) => a.inviteUserId - b.inviteUserId,
    render(row) {
      return h(
        NTag,
        { size: 'small', class: 'cursor-pointer', onClick: () => copy(row.inviteUserId.toString(), () => message.success('复制成功')) },
        { default: () => row.inviteUserId }
      );
    }
  },
  {
    title: '被邀请人ID',
    key: 'inviteeUserId',
    width: 130,
    render(row) {
      return h(
        NTag,
        { size: 'small', class: 'cursor-pointer', onClick: () => copy(row.inviteeUserId.toString(), () => message.success('复制成功')) },
        { default: () => row.inviteeUserId }
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
  const result = await fetchGetAllPromotion();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <NCard size="small" :bordered="true">
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="550"
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
