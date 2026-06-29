<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import type { DataTableColumns, FormInst } from 'naive-ui';
import { NButton, useMessage } from 'naive-ui';
import dayjs from 'dayjs';
import {
  fetchCreateHotIssue,
  fetchDeleteHotIssue,
  fetchGetAllHotIssues
} from '@/service/api/core/chat/language/hotIssues';
import { PageHeader } from '@/components/usage';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.Chat.Language.HotIssues[]>([]);

async function deleteRow(row: Api.Core.Chat.Language.HotIssues) {
  const result = await fetchDeleteHotIssue(row.id);
  if (!result.error) {
    message.success('删除成功');
    data.value = data.value.filter(item => item.id !== row.id);
  } else message.error(result.error.message);
}

const columns: DataTableColumns<Api.Core.Chat.Language.HotIssues> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '描述', key: 'description', width: 250 },
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
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render(row) {
      return h(NButton, { quaternary: true, type: 'error', size: 'small', onClick: () => deleteRow(row) }, { default: () => '删除' });
    }
  }
];

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const formRef = ref<FormInst | null>(null);
const formValue = ref({ data: { description: '' } });
const rules = {
  data: {
    description: { required: true, message: '描述词不能为空', trigger: ['input', 'blur'] }
  }
};

async function newHotIssue() {
  try {
    await formRef.value?.validate();
    const res = await fetchCreateHotIssue(formValue.value.data.description);
    data.value.unshift({
      id: res.data.id,
      description: formValue.value.data.description,
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    });
    formValue.value.data.description = '';
    message.success('新增成功');
  } catch {
    message.error('新增失败');
  }
}

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetAllHotIssues();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="热门问题" />
    <div class="flex flex-col gap-4">
      <NCard size="small" :bordered="true">
        <template #header><span class="text-15px font-600">快捷功能</span></template>
        <NForm ref="formRef" inline :label-width="100" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="问题描述词" path="data.description">
            <NInput v-model:value="formValue.data.description" placeholder="输入需要创建的问题描述" class="w-300px" />
          </NFormItem>
          <NFormItem>
            <NButton type="primary" @click="newHotIssue">新增热门问题</NButton>
          </NFormItem>
        </NForm>
      </NCard>
      <NCard size="small" :bordered="true">
        <template #header><span class="text-15px font-600">主页热门问题推荐</span></template>
        <NDataTable
          :columns="columns"
          :data="filtersDataByPage"
          :loading="loading"
          :bordered="false"
          :scroll-x="650"
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
  </div>
</template>
