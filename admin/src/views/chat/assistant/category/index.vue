<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import type { DataTableColumns, FormInst } from 'naive-ui';
import dayjs from 'dayjs';
import { fetchGetAllCategory, fetchPostCategory } from '@/service/api/core/chat/assistant/category';
import { PageHeader } from '@/components/usage';

const message = useMessage();
const loading = ref(true);
const data = ref<Api.Core.Chat.Assistant.Category[]>([]);

function editRow(row: Api.Core.Chat.Assistant.Category) {
  formValue.value.data = { name: row.name, id: row.id };
  show.value = true;
}

const columns: DataTableColumns<Api.Core.Chat.Assistant.Category> = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '分类名称', key: 'name', width: 200 },
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
      return h(NButton, { quaternary: true, type: 'primary', size: 'small', onClick: () => editRow(row) }, { default: () => '编辑' });
    }
  }
];

const page = ref(1);
const pageSize = ref(10);
const pageCount = computed(() => Math.ceil(data.value.length / pageSize.value));
const filtersDataByPage = computed(() =>
  data.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const show = ref(false);
const formRef = ref<FormInst | null>(null);
const formValue = ref({ data: { id: 0, name: '' } });
const rules = {
  data: {
    name: { required: true, message: '分类名称不能为空', trigger: ['input', 'blur'] }
  }
};

async function handleValidateClick(e: MouseEvent) {
  e.preventDefault();
  try {
    await formRef.value?.validate();
    const index = data.value.findIndex(item => item.id === formValue.value.data.id);
    if (index !== -1) {
      data.value[index].name = formValue.value.data.name;
      data.value[index].updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    await fetchPostCategory(formValue.value.data.id, formValue.value.data.name);
    message.success('修改成功');
    show.value = false;
  } catch {
    message.error('处理失败');
  }
}

onMounted(async () => {
  loading.value = true;
  const result = await fetchGetAllCategory();
  if (!result.error) data.value = result.data;
  else message.error(result.error.message);
  loading.value = false;
});
</script>

<template>
  <div>
    <PageHeader title="助手分类" />
    <NCard size="small" :bordered="true">
      <template #header><span class="text-15px font-600">分类列表</span></template>
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

    <NDrawer v-model:show="show" placement="bottom" :height="260">
      <NDrawerContent title="修改数据" closable>
        <template #footer><NButton type="primary" @click="handleValidateClick">确认</NButton></template>
        <NForm ref="formRef" inline :label-width="80" :model="formValue" :rules="rules" size="medium">
          <NFormItem label="分类名称" path="data.name">
            <NInput v-model:value="formValue.data.name" placeholder="输入自定义分类名称" />
          </NFormItem>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>
