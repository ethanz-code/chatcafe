<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import { NButton, NPopconfirm, NSpace, NTag, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst } from 'naive-ui';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { fetchDeleteDetail, fetchGetAllDetail, fetchPostDetail } from '@/service/api/core/user-service/dialog';

const { query } = useRoute();

const message = useMessage();
const backupData = ref<Api.Core.UserService.DialogDetail[]>([]);
const data = ref<Api.Core.UserService.DialogDetail[]>([]);

const createColumns = ({
  deleteRow,
  editRow
}: {
  deleteRow: (row: Api.Core.UserService.DialogDetail) => void;
  editRow: (row: Api.Core.UserService.DialogDetail) => void;
}): DataTableColumns<Api.Core.UserService.DialogDetail> => {
  return [
    {
      title: 'ID',
      key: 'id',
      width: 100
    },
    {
      title: '角色',
      key: 'role',
      render(row) {
        return h(
          NTag,
          { size: 'small', type: `${row.role === 'user' ? 'success' : 'warning'}` },
          { default: () => row.role }
        );
      }
    },
    {
      title: '内容',
      key: 'content',
      ellipsis: true
    },
    {
      title: '对话时间',
      key: 'time',
      sorter: (row1, row2) => {
        return dayjs(row1.time).unix() - dayjs(row2.time).unix();
      },
      render(row) {
        return h('span', null, { default: () => dayjs(row.time).format('YYYY-MM-DD HH:mm') });
      }
    },
    {
      title: '对话框ID',
      key: 'dialogId',
      render(row) {
        return h(NTag, { size: 'small' }, { default: () => row.dialogId });
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

const selectedValues = ref<string[] | null>(null);
const options = ref([
  {
    label: 'Go Let It Out',
    value: 'Go Let It Out'
  },
  {
    label: 'Who Feels Love?',
    value: 'Who Feels Love?'
  },
  {
    label: 'Sunday Morning Call',
    value: 'Sunday Morning Call',
    disabled: true
  },
  {
    label: 'Roll It Over',
    value: 'Roll It Over'
  }
]);
const setOptions = (obj: Api.Core.UserService.DialogDetail[]) => {
  options.value = [];
  obj.forEach(row => {
    if (!options.value.find(({ value }) => value === row.dialogId.toString())) {
      options.value.push({
        label: `对话框ID: ${row.dialogId.toString()}`,
        value: row.dialogId.toString()
      });
    }
  });
};
const filtersRef = ref();
const filtersByDialogId = (dId: number) => {
  data.value = backupData.value.filter(item => item.dialogId === dId);
};
const filtersByMultipleDialogId = (ids: number[]) => {
  data.value = backupData.value.filter(item => ids.includes(item.dialogId));
};
const clearFilters = () => {
  selectedValues.value = [];
  data.value = backupData.value;
};
watch(selectedValues, newValue => {
  if (newValue?.length) filtersByMultipleDialogId(newValue?.map(item => Number(item)) || []);
});

const show = ref(false); // 抽屉是否显示出来
const curEditing = ref<Api.Core.UserService.DialogDetail>(); // 当前正在编辑的配置信息

const rules = {
  data: {
    role: {
      required: false,
      message: '请选择角色',
      trigger: 'blur'
    },
    content: {
      required: true,
      message: '请输入对话内容',
      trigger: ['input', 'blur']
    }
  }
};
const formRef = ref<FormInst | null>(null);
const formValue = ref({
  data: {
    role: '',
    content: ''
  }
});
const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);
const setDrawerDefaultData = (row: Api.Core.UserService.DialogDetail) => {
  formValue.value.data.role = row.role;
  formValue.value.data.content = row.content;
};
const setAPieceOfDataById = (id: number, d: { role: string; content: string }) => {
  const index = data.value.findIndex(item => item.id === id);
  const indexBackup = backupData.value.findIndex(item => item.id === id);
  if (index !== -1) {
    data.value[index].content = d.content;
    data.value[index].role = d.role;
  }
  if (indexBackup !== -1) {
    backupData.value[indexBackup].content = d.content;
    backupData.value[indexBackup].role = d.role;
  }
};
function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  formRef.value?.validate(async errors => {
    if (!errors) {
      // 修改当前行配置数据，做网络请求
      const p = {
        id: curEditing.value!.id,
        role: formValue.value.data.role,
        content: formValue.value.data.content
      };
      await fetchPostDetail(p.id, p.role, p.content);
      setAPieceOfDataById(curEditing.value!.id, { role: p.role, content: p.content });
      message.success('修改成功');
      show.value = false;
    }
  });
}

const columns = createColumns({
  async deleteRow(row) {
    const result = await fetchDeleteDetail(row.id);
    if (!result.error) {
      message.success('已删除一条详情数据');
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

const drawerRoleOptions = [
  {
    label: 'user',
    value: 'user'
  },
  {
    label: 'assistant',
    value: 'assistant'
  }
];

onMounted(async () => {
  const result = await fetchGetAllDetail();
  if (!result.error) {
    data.value = result.data;
    backupData.value = result.data;
    setOptions(backupData.value);
  }
});
</script>

<template>
  <NCard title="详情数据" size="small">
    <template #header-extra>
      <NSpace>
        <NButton size="small" ref="filtersRef" :disabled="!query.dialogId" @click="filtersByDialogId(Number(query.dialogId || 0))">
          {{ `过滤对话框ID：${query.dialogId || '-'}` }}
        </NButton>
        <NPopselect v-model:value="selectedValues" multiple :options="options">
          <NButton size="small">
            {{
              Array.isArray(selectedValues) && selectedValues.length
                ? `已选对话框ID: ${selectedValues.join('、')}`
                : '选择任意过滤ID'
            }}
          </NButton>
        </NPopselect>
        <NButton size="small" @click="clearFilters">清空过滤</NButton>
      </NSpace>
    </template>
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
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="角色" path="data.role">
            <NSelect v-model:value="formValue.data.role" placeholder="选择角色" :options="drawerRoleOptions" />
          </NFormItem>
          <NFormItem label="内容区域" path="data.content">
            <NInput
              v-model:value="formValue.data.content"
              type="textarea"
              :autosize="{
                minRows: 10
              }"
              placeholder="输入对话内容"
            />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
