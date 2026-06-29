<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst } from 'naive-ui';
import dayjs from 'dayjs';
import {
  fetchDeleteStarDialogDetail,
  fetchGetAllStarDialogDetail,
  fetchPostDialogDetail
} from '@/service/api/core/user-service/dialog';

const message = useMessage();
const backupData = ref<Api.Core.UserService.StarDialogDetail[]>([]);
const data = ref<Api.Core.UserService.StarDialogDetail[]>([]);

const createColumns = ({
  deleteRow,
  editRow
}: {
  deleteRow: (row: Api.Core.UserService.StarDialogDetail) => void;
  editRow: (row: Api.Core.UserService.StarDialogDetail) => void;
}): DataTableColumns<Api.Core.UserService.StarDialogDetail> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 100
    },
    {
      title: '对话框UUID',
      key: 'dialogUUID',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '用户ID',
      key: 'userId',
      render(row) {
        return h(NTag, { size: 'small' }, { default: () => row.userId });
      }
    },
    {
      title: '用户消息',
      key: 'userMsg',
      ellipsis: true
    },
    {
      title: 'AI消息',
      key: 'assistantMsg',
      ellipsis: true
    },
    {
      title: '收藏时间',
      key: 'createdAt',
      sorter: (row1, row2) => {
        return dayjs(row1.createdAt).unix() - dayjs(row2.createdAt).unix();
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.createdAt).format('YYYY-MM-DD HH:mm') });
      }
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
                default: () => `确认删除对话详情数据？`
              }
            ),
            h(
              NButton,
              {
                strong: true,
                type: 'info',
                secondary: true,
                size: 'small',
                onClick: () => {
                  editRow(row);
                }
              },
              { default: () => '编辑' }
            )
          ]
        });
      }
    }
  ];
};

const show = ref(false); // 抽屉是否显示出来
const curEditing = ref<Api.Core.UserService.StarDialogDetail>(); // 当前正在编辑的配置信息

const rules = {
  data: {
    userMsg: {
      required: true,
      message: '内容不能为空哦',
      trigger: ['input', 'blur']
    },
    assistantMsg: {
      required: true,
      message: '内容不能为空哦',
      trigger: ['input', 'blur']
    }
  }
};
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    userMsg: '',
    assistantMsg: ''
  }
});
const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);
const setDrawerDefaultData = (row: Api.Core.UserService.StarDialogDetail) => {
  formValue.value.data.userMsg = row.userMsg;
  formValue.value.data.assistantMsg = row.assistantMsg;
};
const setAPieceOfDataById = (id: number, d: { userMsg: string; assistantMsg: string }) => {
  const index = data.value.findIndex(item => item.id === id);
  if (index !== -1) {
    data.value[index].userMsg = d.userMsg;
    data.value[index].assistantMsg = d.assistantMsg;
  }
};
function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async errors => {
    if (!errors) {
      // 修改当前行配置数据，做网络请求
      const p = {
        id: curEditing.value!.id,
        userMsg: formValue.value.data.userMsg,
        assistantMsg: formValue.value.data.assistantMsg
      };
      await fetchPostDialogDetail(p.id, p.userMsg, p.assistantMsg);
      setAPieceOfDataById(curEditing.value!.id, { userMsg: p.userMsg, assistantMsg: p.assistantMsg });
      message.success('修改成功');
      show.value = false;
    }
  });
}

const columns = createColumns({
  async deleteRow(row) {
    const result = await fetchDeleteStarDialogDetail(row.id);
    if (!result.error) {
      message.success('已删除一条收藏数据');
      data.value = data.value.filter(item => item.id !== row.id);
    } else {
      message.error(result.error.message);
    }
  },
  async editRow(row) {
    curEditing.value = row;
    show.value = true;
    setDrawerDefaultData(row);
  }
});

onMounted(async () => {
  const result = await fetchGetAllStarDialogDetail();
  if (!result.error) {
    data.value = result.data;
    backupData.value = result.data;
  }
});
</script>

<template>
  <div>
  <NCard title="收藏列表" size="small">
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

  <NDrawer v-model:show="show" :width="480">
    <NDrawerContent title="修改数据" closable>
      <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
      <NAlert class="mb-4" type="warning">
        修改已收藏消息，当与对话详情内容不符时在客户端无法正确匹配收藏图标。
      </NAlert>
      <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
        <NFormItem label="用户消息区域" path="data.userMsg">
          <NInput
            v-model:value="formValue.data.userMsg"
            type="textarea"
            :autosize="{
              minRows: 10
            }"
            placeholder="内容不能为空哦"
          />
        </NFormItem>
        <NFormItem label="AI消息区域" path="data.assistantMsg">
          <NInput
            v-model:value="formValue.data.assistantMsg"
            type="textarea"
            :autosize="{
              minRows: 10
            }"
            placeholder="内容不能为空哦"
          />
        </NFormItem>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
