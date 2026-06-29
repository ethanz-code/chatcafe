<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTooltip, useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchDeleteDialog, fetchGetAllDialog } from '@/service/api/core/user-service/dialog';
import { useRouterPush } from '@/hooks/common/router';

const { routerPush } = useRouterPush();

const message = useMessage();
const data = ref<Api.Core.UserService.Dialog[]>([]);
const createColumns = ({
  jumpToDetail,
  deleteRow
}: {
  jumpToDetail: (row: Api.Core.UserService.Dialog) => void;
  deleteRow: (row: Api.Core.UserService.Dialog) => void;
}): DataTableColumns<Api.Core.UserService.Dialog> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 100,
      render(row) {
        return h(NTooltip, null, {
          trigger: () =>
            h(
              'span',
              { class: 'underline underline-primary text-primary cursor-pointer', onClick: () => jumpToDetail(row) },
              { default: () => row.id }
            ),
          default: () => `点击跳转至”对话详情“，筛选对话ID: ${row.id}`
        });
      }
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      sorter: (row1, row2) => {
        return dayjs(row1.updatedAt).unix() - dayjs(row2.updatedAt).unix();
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '标题',
      key: 'title'
    },
    {
      title: '唯一标识',
      key: 'uuid',
      width: 200,
      ellipsis: {
        tooltip: true
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
                style: 'max-width: 300px',
                onPositiveClick: () => deleteRow(row)
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      strong: true,
                      type: 'error',
                      secondary: true,
                      size: 'small'
                    },
                    { default: () => '删除' }
                  ),
                default: () => `确认删除对话数据？标题：${row.title}`
              }
            )
          ]
        });
      }
    }
  ];
};
const columns = createColumns({
  async deleteRow(row) {
    const result = await fetchDeleteDialog(row.id);
    if (!result.error) {
      message.success('已删除对话数据');
      data.value = data.value.filter(item => item.id !== row.id);
    } else {
      message.error(result.error.message);
    }
  },
  jumpToDetail(row) {
    routerPush({
      name: 'user-service_dialog_dialog-detail',
      query: {
        dialogId: row.id
      }
    });
    message.info(`跳转至”对话详情“，新增快捷操作 -> 筛选对话ID: ${row.id}`);
  }
});

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

onMounted(async () => {
  const result = await fetchGetAllDialog();
  if (!result.error) data.value = result.data;
});
</script>

<template>
  <NAlert type="info">用户新建的所有对话框在这里都可以看到。</NAlert>
  <NCard title="对话框列表" size="small">
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
