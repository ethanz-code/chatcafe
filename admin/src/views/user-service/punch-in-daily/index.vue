<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllPunchInDaily } from '@/service/api/core/user-service/punchInDaily';
import { PageHeader } from '@/components/usage';
import copy from '@/utils/clipboard';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.UserService.PunchInDaily[]>([]);

const columns: DataTableColumns<Api.Core.UserService.PunchInDaily> = [
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
    title: '奖励对话次数',
    key: 'rewardDialogue',
    width: 130,
    sorter: (a, b) => a.rewardDialogue - b.rewardDialogue,
    render(row) {
      return h('span', { class: 'text-#6366f1 font-600' }, { default: () => row.rewardDialogue });
    }
  },
  {
    title: '用户ID',
    key: 'userId',
    width: 130,
    render(row) {
      return h(
        NTag,
        { size: 'small', class: 'cursor-pointer', onClick: () => copy(row.userId.toString(), () => message.success('复制成功')) },
        { default: () => row.userId }
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
  const result = await fetchGetAllPunchInDaily();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="每日打卡" />
    <NCard size="small" :bordered="true">
      <NDataTable
        :columns="columns"
        :data="filtersDataByPage"
        :loading="loading"
        :bordered="false"
        :scroll-x="620"
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
