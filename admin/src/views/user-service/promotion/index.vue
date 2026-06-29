<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllPromotion } from '@/service/api/core/user-service/promotion';
import copy from '@/utils/clipboard';

const message = useMessage();
const data = ref<Api.Core.UserService.Promotion[]>([]);
const createColumns = ({
  copyInviteeId,
  copyInviteId
}: {
  copyInviteeId: (row: Api.Core.UserService.Promotion) => void;
  copyInviteId: (row: Api.Core.UserService.Promotion) => void;
}): DataTableColumns<Api.Core.UserService.Promotion> => {
  return [
    {
      title: 'ID',
      key: 'id'
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
      title: '邀请人ID',
      key: 'inviteUserId',
      defaultSortOrder: false,
      sorter: {
        compare: (a, b) => a.inviteUserId - b.inviteUserId,
        multiple: 2
      },
      render(row) {
        return h(
          NTag,
          { size: 'small', class: 'cursor-pointer', onClick: () => copyInviteId(row) },
          { default: () => row.inviteUserId }
        );
      }
    },
    {
      title: '被邀请人ID',
      key: 'inviteeUserId',
      render(row) {
        return h(
          NTag,
          { size: 'small', class: 'cursor-pointer', onClick: () => copyInviteeId(row) },
          { default: () => row.inviteeUserId }
        );
      }
    }
  ];
};
const columns = createColumns({
  copyInviteeId(row) {
    copy(row.inviteeUserId.toString(), () => message.success('复制成功'));
  },
  copyInviteId(row) {
    copy(row.inviteUserId.toString(), () => message.success('复制成功'));
  }
});

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  const result = await fetchGetAllPromotion();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NAlert type="success">您可点击复制"邀请人ID"和"被邀请人ID"到其他地方快捷查询。</NAlert>
  <NCard title="邀请日志" size="small">
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
