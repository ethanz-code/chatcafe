<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteDialog, fetchGetAllDialog } from '@/service/api/core/user-service/dialog';
import { useRouterPush } from '@/hooks/common/router';

const { routerPush } = useRouterPush();
const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.UserService.Dialog[]>([]);

function jumpToDetail(row: Api.Core.UserService.Dialog) {
  routerPush({ name: 'user-service_dialog_dialog-detail', query: { dialogId: row.id } });
  message.info(`跳转至对话详情，筛选对话ID: ${row.id}`);
}

async function deleteRow(row: Api.Core.UserService.Dialog) {
  const result = await fetchDeleteDialog(row.id);
  if (!result.error) {
    message.success('已删除对话数据');
    data.value = data.value.filter(item => item.id !== row.id);
  } else {
    message.error(result.error.message);
  }
}

const columns: DataTableColumns<Api.Core.UserService.Dialog> = [
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
    title: '标题',
    key: 'title',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '唯一标识',
    key: 'uuid',
    width: 200,
    ellipsis: { tooltip: true }
  },
  { title: '用户ID', key: 'userId', width: 100 },
  {
    title: '操作',
    key: 'actions',
    width: 90,
    fixed: 'right',
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NButton,
            { size: 'small', quaternary: true, type: 'primary', onClick: () => jumpToDetail(row) },
            { default: () => '详情' }
          ),
          h(NPopconfirm,
            { onPositiveClick: () => deleteRow(row) },
            {
              trigger: () => h(NButton, { size: 'small', quaternary: true, type: 'error' }, { default: () => '删除' }),
              default: () => `确认删除对话"${row.title}"？`
            }
          )
        ]
      });
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
  const result = await fetchGetAllDialog();
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
        :scroll-x="900"
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
