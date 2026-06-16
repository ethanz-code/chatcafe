<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllPunchInDaily } from '@/service/api/core/user-service/punchInDaily';
import copy from '@/utils/clipboard';

const message = useMessage();
const data = ref<Api.Core.UserService.PunchInDaily[]>([]);
const createColumns = ({
  copyUserId
}: {
  copyUserId: (row: Api.Core.UserService.PunchInDaily) => void;
}): DataTableColumns<Api.Core.UserService.PunchInDaily> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 80
    },
    {
      title: '创建时间',
      key: 'creadtedAt',
      defaultSortOrder: false,
      sorter: {
        compare: (row1, row2) => {
          return dayjs(row1.createdAt).unix() - dayjs(row2.createdAt).unix();
        },
        multiple: 1
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '奖励对话次数',
      key: 'rewardDialogue',
      width: 200,
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.rewardDialogue - b.rewardDialogue,
        multiple: 2
      },
      render(row) {
        return h('span', { class: 'text-primary font-medium' }, { default: () => row.rewardDialogue });
      }
    },
    {
      title: '用户ID',
      key: 'userId',
      render(row) {
        return h(
          NTag,
          { size: 'small', class: 'cursor-pointer', onClick: () => copyUserId(row) },
          { default: () => row.userId }
        );
      }
    }
  ];
};
const columns = createColumns({
  copyUserId(row) {
    copy(row.userId.toString(), () => message.success('复制成功'));
  }
});

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  const result = await fetchGetAllPunchInDaily();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NSpace vertical :size="12">
    <NCard title="打卡日志" size="small">
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
